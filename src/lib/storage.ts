// Local storage utilities for managing app data

import type { Asset, GeneratedPost, ScheduledPost, ContentTheme, AppState } from "@/types";
import { STORAGE_KEYS } from "@/types";

/**
 * Generic localStorage wrapper with type safety and error handling
 */
class LocalStorageService {
  private isAvailable(): boolean {
    try {
      const test = "__storage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  get<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) {
      console.warn("localStorage is not available");
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  set<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) {
      console.warn("localStorage is not available");
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      return false;
    }
  }

  remove(key: string): void {
    if (!this.isAvailable()) return;

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (${key}):`, error);
    }
  }

  clear(): void {
    if (!this.isAvailable()) return;

    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }
}

export const storage = new LocalStorageService();

/**
 * Asset storage operations
 */
export const assetStorage = {
  getAll(): Asset[] {
    return storage.get<Asset[]>(STORAGE_KEYS.ASSETS, []);
  },

  save(assets: Asset[]): boolean {
    return storage.set(STORAGE_KEYS.ASSETS, assets);
  },

  add(asset: Asset): boolean {
    const assets = this.getAll();
    assets.unshift(asset); // Add to beginning
    return this.save(assets);
  },

  update(id: string, updates: Partial<Asset>): boolean {
    const assets = this.getAll();
    const index = assets.findIndex((a) => a.id === id);
    if (index === -1) return false;

    assets[index] = { ...assets[index], ...updates };
    return this.save(assets);
  },

  delete(id: string): boolean {
    const assets = this.getAll();
    const filtered = assets.filter((a) => a.id !== id);
    return this.save(filtered);
  },

  findById(id: string): Asset | undefined {
    return this.getAll().find((a) => a.id === id);
  },

  findByType(type: Asset["type"]): Asset[] {
    return this.getAll().filter((a) => a.type === type);
  },

  search(query: string): Asset[] {
    const lowerQuery = query.toLowerCase();
    return this.getAll().filter(
      (asset) =>
        asset.name.toLowerCase().includes(lowerQuery) ||
        asset.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    );
  },
};

/**
 * Generated posts storage operations
 */
export const postsStorage = {
  getAll(): GeneratedPost[] {
    return storage.get<GeneratedPost[]>(STORAGE_KEYS.GENERATED_POSTS, []);
  },

  save(posts: GeneratedPost[]): boolean {
    return storage.set(STORAGE_KEYS.GENERATED_POSTS, posts);
  },

  add(post: GeneratedPost): boolean {
    const posts = this.getAll();
    posts.push(post);
    return this.save(posts);
  },

  addBatch(newPosts: GeneratedPost[]): boolean {
    const posts = this.getAll();
    return this.save([...posts, ...newPosts]);
  },

  update(id: string, updates: Partial<GeneratedPost>): boolean {
    const posts = this.getAll();
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return false;

    posts[index] = { ...posts[index], ...updates };
    return this.save(posts);
  },

  delete(id: string): boolean {
    const posts = this.getAll();
    const filtered = posts.filter((p) => p.id !== id);
    return this.save(filtered);
  },

  clear(): boolean {
    return this.save([]);
  },
};

/**
 * Scheduled posts storage operations
 */
export const scheduledPostsStorage = {
  getAll(): ScheduledPost[] {
    return storage.get<ScheduledPost[]>(STORAGE_KEYS.SCHEDULED_POSTS, []);
  },

  save(posts: ScheduledPost[]): boolean {
    return storage.set(STORAGE_KEYS.SCHEDULED_POSTS, posts);
  },

  add(post: ScheduledPost): boolean {
    const posts = this.getAll();
    posts.push(post);
    return this.save(posts);
  },

  update(id: string, updates: Partial<ScheduledPost>): boolean {
    const posts = this.getAll();
    const index = posts.findIndex((p) => p.id === id);
    if (index === -1) return false;

    posts[index] = { ...posts[index], ...updates };
    return this.save(posts);
  },

  delete(id: string): boolean {
    const posts = this.getAll();
    const filtered = posts.filter((p) => p.id !== id);
    return this.save(filtered);
  },
};

/**
 * Content theme storage
 */
export const themeStorage = {
  get(): ContentTheme | null {
    return storage.get<ContentTheme | null>(STORAGE_KEYS.LAST_THEME, null);
  },

  save(theme: ContentTheme): boolean {
    return storage.set(STORAGE_KEYS.LAST_THEME, theme);
  },

  clear(): void {
    storage.remove(STORAGE_KEYS.LAST_THEME);
  },
};

/**
 * Full app state operations (for backup/restore)
 */
export const appStateStorage = {
  export(): AppState {
    return {
      assets: assetStorage.getAll(),
      generatedPosts: postsStorage.getAll(),
      scheduledPosts: scheduledPostsStorage.getAll(),
      lastTheme: themeStorage.get() || undefined,
    };
  },

  import(state: AppState): boolean {
    try {
      assetStorage.save(state.assets || []);
      postsStorage.save(state.generatedPosts || []);
      scheduledPostsStorage.save(state.scheduledPosts || []);
      if (state.lastTheme) {
        themeStorage.save(state.lastTheme);
      }
      return true;
    } catch (error) {
      console.error("Error importing app state:", error);
      return false;
    }
  },

  clear(): void {
    storage.remove(STORAGE_KEYS.ASSETS);
    storage.remove(STORAGE_KEYS.GENERATED_POSTS);
    storage.remove(STORAGE_KEYS.SCHEDULED_POSTS);
    storage.remove(STORAGE_KEYS.LAST_THEME);
  },
};
