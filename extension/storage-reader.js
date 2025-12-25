// Storage Reader - Reads data from Content Composer AI's localStorage and IndexedDB

const STORAGE_KEYS = {
  GENERATED_POSTS: 'content-composer-generated-posts',
  SCHEDULED_POSTS: 'content-composer-scheduled-posts',
  ASSETS: 'content-composer-assets'
};

const DB_CONFIG = {
  name: 'ContentComposerDB',
  version: 1,
  stores: {
    files: 'files'
  }
};

class StorageReader {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize IndexedDB connection
   */
  async initDB() {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

      request.onerror = () => {
        console.error('Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(DB_CONFIG.stores.files)) {
          db.createObjectStore(DB_CONFIG.stores.files, { keyPath: 'id' });
        }
      };
    });
  }

  /**
   * Read data from localStorage
   */
  getFromLocalStorage(key, defaultValue = []) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return defaultValue;
    }
  }

  /**
   * Write data to localStorage
   */
  setToLocalStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  }

  /**
   * Get all generated posts
   */
  getGeneratedPosts() {
    return this.getFromLocalStorage(STORAGE_KEYS.GENERATED_POSTS, []);
  }

  /**
   * Get all scheduled posts
   */
  getScheduledPosts() {
    return this.getFromLocalStorage(STORAGE_KEYS.SCHEDULED_POSTS, []);
  }

  /**
   * Update scheduled posts
   */
  updateScheduledPosts(posts) {
    return this.setToLocalStorage(STORAGE_KEYS.SCHEDULED_POSTS, posts);
  }

  /**
   * Get posts for the next N days that are not yet linkedin_scheduled
   */
  getPostsToSchedule(daysAhead = 7) {
    const generatedPosts = this.getGeneratedPosts();
    const scheduledPosts = this.getScheduledPosts();

    console.log('[StorageReader] DEBUG INFO:');
    console.log('- Generated posts:', generatedPosts.length);
    console.log('- Scheduled posts:', scheduledPosts.length);
    console.log('- Days ahead:', daysAhead);
    console.log('- Raw generated posts:', generatedPosts);
    console.log('- Raw scheduled posts:', scheduledPosts);

    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    console.log('- Date range:', now.toISOString(), 'to', futureDate.toISOString());

    // Create a map of postId -> scheduledPost
    const scheduledMap = new Map();
    scheduledPosts.forEach(sp => {
      scheduledMap.set(sp.postId, sp);
    });

    // Filter posts that:
    // 1. Are within the next N days
    // 2. Are not already linkedin_scheduled
    const postsToSchedule = [];

    generatedPosts.forEach(post => {
      const scheduledInfo = scheduledMap.get(post.id);

      console.log(`[Post ${post.id}] Scheduled info:`, scheduledInfo);

      if (!scheduledInfo) {
        console.log(`[Post ${post.id}] SKIPPED - No scheduled info`);
        return; // Skip if not scheduled at all
      }

      const schedDate = new Date(scheduledInfo.scheduledDate);
      console.log(`[Post ${post.id}] Scheduled date:`, schedDate.toISOString());
      console.log(`[Post ${post.id}] Status:`, scheduledInfo.status);
      console.log(`[Post ${post.id}] In range?`, schedDate >= now && schedDate <= futureDate);

      // Check if within date range and not already linkedin_scheduled
      if (schedDate >= now &&
          schedDate <= futureDate &&
          scheduledInfo.status !== 'linkedin_scheduled') {
        console.log(`[Post ${post.id}] INCLUDED in schedule list`);
        postsToSchedule.push({
          ...post,
          scheduledPost: scheduledInfo,
          scheduledDate: scheduledInfo.scheduledDate
        });
      } else {
        console.log(`[Post ${post.id}] SKIPPED - Outside range or already scheduled`);
      }
    });

    // Sort by scheduled date (earliest first)
    postsToSchedule.sort((a, b) =>
      new Date(a.scheduledDate) - new Date(b.scheduledDate)
    );

    console.log('[StorageReader] Final posts to schedule:', postsToSchedule.length);
    console.log('[StorageReader] Posts:', postsToSchedule);

    return postsToSchedule;
  }

  /**
   * Mark a post as linkedin_scheduled
   */
  markAsLinkedInScheduled(scheduledPostId) {
    const scheduledPosts = this.getScheduledPosts();
    const index = scheduledPosts.findIndex(sp => sp.id === scheduledPostId);

    if (index === -1) {
      console.error('Scheduled post not found:', scheduledPostId);
      return false;
    }

    scheduledPosts[index].status = 'linkedin_scheduled';
    return this.updateScheduledPosts(scheduledPosts);
  }

  /**
   * Get file from IndexedDB
   */
  async getFile(fileId) {
    try {
      const db = await this.initDB();
      const transaction = db.transaction([DB_CONFIG.stores.files], 'readonly');
      const store = transaction.objectStore(DB_CONFIG.stores.files);

      return new Promise((resolve, reject) => {
        const request = store.get(fileId);

        request.onsuccess = () => {
          const result = request.result;
          resolve(result?.file || null);
        };

        request.onerror = () => {
          console.error('Error getting file:', request.error);
          reject(request.error);
        };
      });
    } catch (error) {
      console.error('Error in getFile:', error);
      return null;
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    const scheduledPosts = this.getScheduledPosts();
    const postsToSchedule = this.getPostsToSchedule(30); // Next 30 days

    const stats = {
      total: scheduledPosts.length,
      pending: scheduledPosts.filter(sp =>
        sp.status === 'draft' || sp.status === 'scheduled'
      ).length,
      linkedinScheduled: scheduledPosts.filter(sp =>
        sp.status === 'linkedin_scheduled'
      ).length,
      published: scheduledPosts.filter(sp =>
        sp.status === 'published'
      ).length,
      nextBatch: postsToSchedule.length
    };

    return stats;
  }
}

// Export singleton instance
const storageReader = new StorageReader();
