// Popup script - Main logic for the extension popup

let currentPosts = [];
let isScheduling = false;

// DOM Elements
const daysAheadInput = document.getElementById('daysAhead');
const delayBetweenInput = document.getElementById('delayBetween');
const refreshBtn = document.getElementById('refreshBtn');
const scheduleBtn = document.getElementById('scheduleBtn');
const postsListEl = document.getElementById('postsList');
const statusLogEl = document.getElementById('statusLog');
const progressBarEl = document.getElementById('progressBar');
const progressFillEl = document.getElementById('progressFill');
const progressTextEl = document.getElementById('progressText');

// Stats elements
const totalPostsEl = document.getElementById('totalPosts');
const pendingPostsEl = document.getElementById('pendingPosts');
const scheduledPostsEl = document.getElementById('scheduledPosts');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadPosts();
  attachEventListeners();
});

/**
 * Load saved settings from chrome.storage
 */
function loadSettings() {
  chrome.storage.sync.get(['daysAhead', 'delayBetween'], (result) => {
    if (result.daysAhead) daysAheadInput.value = result.daysAhead;
    if (result.delayBetween) delayBetweenInput.value = result.delayBetween;
  });
}

/**
 * Save settings to chrome.storage
 */
function saveSettings() {
  chrome.storage.sync.set({
    daysAhead: parseInt(daysAheadInput.value),
    delayBetween: parseInt(delayBetweenInput.value)
  });
}

/**
 * Attach event listeners
 */
function attachEventListeners() {
  refreshBtn.addEventListener('click', () => {
    saveSettings();
    loadPosts();
  });

  scheduleBtn.addEventListener('click', startScheduling);

  daysAheadInput.addEventListener('change', saveSettings);
  delayBetweenInput.addEventListener('change', saveSettings);
}

/**
 * Load posts from storage
 */
async function loadPosts() {
  addStatusMessage('Loading posts...', 'info');

  try {
    // Get data from the web app's page (not extension's localStorage)
    const data = await getDataFromWebApp();

    if (!data) {
      addStatusMessage('Could not access web app data. Make sure you have the web app open in another tab.', 'error');
      currentPosts = [];
      renderPostsList();
      return;
    }

    // Parse the data
    const generatedPosts = data.generatedPosts || [];
    const scheduledPosts = data.scheduledPosts || [];

    console.log('[Popup] Loaded from web app:');
    console.log('- Generated posts:', generatedPosts.length);
    console.log('- Scheduled posts:', scheduledPosts.length);

    // Filter posts to schedule
    const daysAhead = parseInt(daysAheadInput.value);
    currentPosts = filterPostsToSchedule(generatedPosts, scheduledPosts, daysAhead);

    // Update stats
    const stats = calculateStats(scheduledPosts, currentPosts);
    totalPostsEl.textContent = stats.total;
    pendingPostsEl.textContent = stats.pending;
    scheduledPostsEl.textContent = stats.linkedinScheduled;

    // Render posts list
    renderPostsList();

    addStatusMessage(`Loaded ${currentPosts.length} posts to schedule`, 'success');
  } catch (error) {
    console.error('[Popup] Error loading posts:', error);
    addStatusMessage(`Error: ${error.message}`, 'error');
  }
}

/**
 * Get data from the web app's localStorage via content script
 */
async function getDataFromWebApp() {
  // Try to find a tab with the web app
  const tabs = await chrome.tabs.query({});

  console.log('[Popup] Searching for web app tab...');
  console.log('[Popup] All open tabs:', tabs.map(t => ({ id: t.id, url: t.url, title: t.title })));

  // Look for localhost or your web app URL
  const webAppTab = tabs.find(tab =>
    tab.url && (
      tab.url.includes('localhost') ||
      tab.url.includes('127.0.0.1') ||
      tab.url.includes('lovable.app') ||
      tab.url.includes('lovable.dev') ||
      tab.url.includes('gptengineer.app') ||
      tab.url.includes('content-composer')
    )
  );

  if (!webAppTab) {
    console.error('[Popup] Web app tab not found!');
    console.error('[Popup] Looked for URLs containing: localhost, 127.0.0.1, lovable.app, lovable.dev, gptengineer.app, content-composer');
    console.error('[Popup] Available tab URLs:', tabs.map(t => t.url));

    addStatusMessage('⚠️ Cannot find web app tab', 'error');
    addStatusMessage('Please check the console for tab URLs', 'info');
    addStatusMessage('The extension is looking for: localhost, lovable.app, etc.', 'info');

    return null;
  }

  console.log('[Popup] ✓ Found web app tab:', webAppTab.url);

  // Inject script to read localStorage
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: webAppTab.id },
      func: () => {
        return {
          generatedPosts: JSON.parse(localStorage.getItem('content-composer-generated-posts') || '[]'),
          scheduledPosts: JSON.parse(localStorage.getItem('content-composer-scheduled-posts') || '[]')
        };
      }
    });

    return results[0].result;
  } catch (error) {
    console.error('[Popup] Error reading from web app:', error);
    return null;
  }
}

/**
 * Filter posts to schedule
 */
function filterPostsToSchedule(generatedPosts, scheduledPosts, daysAhead) {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  console.log('[Popup] Filtering posts:');
  console.log('- Date range:', now.toISOString(), 'to', futureDate.toISOString());

  // Create a map of postId -> scheduledPost
  const scheduledMap = new Map();
  scheduledPosts.forEach(sp => {
    scheduledMap.set(sp.postId, sp);
  });

  const postsToSchedule = [];

  generatedPosts.forEach(post => {
    const scheduledInfo = scheduledMap.get(post.id);

    if (!scheduledInfo) {
      console.log(`[Post ${post.id}] No scheduled info, skipping`);
      return;
    }

    const schedDate = new Date(scheduledInfo.scheduledDate);
    const inRange = schedDate >= now && schedDate <= futureDate;
    const notScheduled = scheduledInfo.status !== 'linkedin_scheduled';

    console.log(`[Post ${post.id}] Date: ${schedDate.toISOString()}, InRange: ${inRange}, NotScheduled: ${notScheduled}, Status: ${scheduledInfo.status}`);

    if (inRange && notScheduled) {
      postsToSchedule.push({
        ...post,
        scheduledPost: scheduledInfo,
        scheduledDate: scheduledInfo.scheduledDate
      });
    }
  });

  // Sort by scheduled date
  postsToSchedule.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  console.log('[Popup] Posts to schedule:', postsToSchedule.length);
  return postsToSchedule;
}

/**
 * Calculate statistics
 */
function calculateStats(scheduledPosts, postsToSchedule) {
  return {
    total: scheduledPosts.length,
    pending: scheduledPosts.filter(sp =>
      sp.status === 'draft' || sp.status === 'scheduled'
    ).length,
    linkedinScheduled: scheduledPosts.filter(sp =>
      sp.status === 'linkedin_scheduled'
    ).length,
    nextBatch: postsToSchedule.length
  };
}

/**
 * Render the posts list
 */
function renderPostsList() {
  if (currentPosts.length === 0) {
    postsListEl.innerHTML = '<div class="empty-state">No posts to schedule</div>';
    scheduleBtn.disabled = true;
    return;
  }

  scheduleBtn.disabled = false;

  const html = currentPosts.map(post => {
    const date = new Date(post.scheduledDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    return `
      <div class="post-item" data-post-id="${post.id}">
        <div class="post-date">${formattedDate}</div>
        <div class="post-hook">${post.hook}</div>
        <div class="post-meta">
          ${post.format} • ${post.pillar}
          <span class="post-status pending">${post.scheduledPost.status}</span>
        </div>
      </div>
    `;
  }).join('');

  postsListEl.innerHTML = html;
}

/**
 * Add status message to log
 */
function addStatusMessage(message, type = 'info') {
  const messageEl = document.createElement('p');
  messageEl.className = `status-message ${type}`;
  messageEl.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

  statusLogEl.appendChild(messageEl);
  statusLogEl.scrollTop = statusLogEl.scrollHeight;

  // Keep only last 20 messages
  while (statusLogEl.children.length > 20) {
    statusLogEl.removeChild(statusLogEl.firstChild);
  }
}

/**
 * Update progress bar
 */
function updateProgress(current, total) {
  const percentage = Math.round((current / total) * 100);
  progressFillEl.style.width = `${percentage}%`;
  progressTextEl.textContent = `${current}/${total} posts scheduled (${percentage}%)`;
}

/**
 * Start the scheduling process
 */
async function startScheduling() {
  if (isScheduling) {
    addStatusMessage('Scheduling already in progress', 'error');
    return;
  }

  if (currentPosts.length === 0) {
    addStatusMessage('No posts to schedule', 'error');
    return;
  }

  // Check if we're on LinkedIn
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab.url || !tab.url.includes('linkedin.com')) {
    addStatusMessage('❌ NOT ON LINKEDIN!', 'error');
    addStatusMessage('Steps to schedule:', 'info');
    addStatusMessage('1. Open LinkedIn.com in this tab', 'info');
    addStatusMessage('2. Navigate to your feed', 'info');
    addStatusMessage('3. Come back and click "Schedule All"', 'info');

    // Offer to open LinkedIn
    if (confirm('Would you like to open LinkedIn now?\n\nClick OK to open LinkedIn in the current tab.')) {
      await chrome.tabs.update(tab.id, { url: 'https://www.linkedin.com/feed/' });
      addStatusMessage('✓ Opening LinkedIn... Please wait for the page to load, then click "Schedule All" again.', 'success');
    }
    return;
  }

  // Verify content script is loaded
  addStatusMessage('Verifying LinkedIn connection...', 'info');

  let contentScriptReady = false;
  try {
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
    if (response && response.status === 'ready') {
      contentScriptReady = true;
      addStatusMessage('✓ LinkedIn connection verified', 'success');
    }
  } catch (error) {
    console.log('[Popup] Content script not responding, will try to inject manually');
  }

  // If content script not loaded, try to inject it manually
  if (!contentScriptReady) {
    addStatusMessage('Content script not loaded, injecting...', 'info');

    try {
      // Inject content.js manually
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      });

      // Wait a moment for it to initialize
      await sleep(1000);

      // Try ping again
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
      if (response && response.status === 'ready') {
        addStatusMessage('✓ Content script injected successfully!', 'success');
        contentScriptReady = true;
      }
    } catch (injectError) {
      console.error('[Popup] Failed to inject content script:', injectError);
      addStatusMessage('❌ Failed to load extension on LinkedIn page', 'error');
      addStatusMessage('Try refreshing LinkedIn page manually and try again', 'error');
      return;
    }
  }

  if (!contentScriptReady) {
    addStatusMessage('❌ Cannot establish connection to LinkedIn page', 'error');
    return;
  }

  isScheduling = true;
  scheduleBtn.disabled = true;
  refreshBtn.disabled = true;
  progressBarEl.classList.remove('hidden');

  addStatusMessage('Starting scheduling process...', 'info');
  addStatusMessage(`Will schedule ${currentPosts.length} posts`, 'info');

  const delaySeconds = parseInt(delayBetweenInput.value);

  try {
    for (let i = 0; i < currentPosts.length; i++) {
      const post = currentPosts[i];

      addStatusMessage(`Scheduling post ${i + 1}/${currentPosts.length}: ${post.hook.substring(0, 50)}...`, 'info');

      // Get file from web app's IndexedDB if assetId exists
      let fileData = null;
      if (post.assetId) {
        fileData = await getFileFromWebApp(post.assetId);
        console.log('[Popup] Retrieved file:', fileData ? fileData.name : 'none');
      }

      // Send message to content script to schedule the post
      await schedulePost(tab.id, post, fileData);

      // Mark as linkedin_scheduled in the web app's localStorage
      await markAsLinkedInScheduled(post.scheduledPost.id);

      addStatusMessage(`✓ Post ${i + 1} scheduled successfully`, 'success');

      // Update progress
      updateProgress(i + 1, currentPosts.length);

      // Wait before next post (except for the last one)
      if (i < currentPosts.length - 1) {
        addStatusMessage(`Waiting ${delaySeconds} seconds before next post...`, 'info');
        await sleep(delaySeconds * 1000);
      }
    }

    addStatusMessage('🎉 All posts scheduled successfully!', 'success');

    // Reload posts to update the list
    setTimeout(() => {
      loadPosts();
    }, 2000);

  } catch (error) {
    addStatusMessage(`❌ Error: ${error.message}`, 'error');
    console.error('Scheduling error:', error);
  } finally {
    isScheduling = false;
    scheduleBtn.disabled = false;
    refreshBtn.disabled = false;

    // Hide progress bar after a delay
    setTimeout(() => {
      progressBarEl.classList.add('hidden');
    }, 3000);
  }
}

/**
 * Schedule a single post
 */
async function schedulePost(tabId, post, file) {
  // Convert File to transferable format
  let fileData = null;
  if (file) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const byteArray = Array.from(uint8Array);

    fileData = {
      name: file.name,
      type: file.type,
      size: file.size,
      data: byteArray
    };
  }

  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      {
        action: 'schedulePost',
        post: {
          caption: post.caption,
          scheduledDate: post.scheduledDate
        },
        fileData: fileData
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response && response.success) {
          resolve(response);
        } else {
          reject(new Error(response?.error || 'Unknown error'));
        }
      }
    );
  });
}

/**
 * Get file from web app's IndexedDB
 */
async function getFileFromWebApp(assetId) {
  const tabs = await chrome.tabs.query({});
  const webAppTab = tabs.find(tab =>
    tab.url && (
      tab.url.includes('localhost') ||
      tab.url.includes('127.0.0.1') ||
      tab.url.includes('lovable.app') ||
      tab.url.includes('lovable.dev') ||
      tab.url.includes('gptengineer.app') ||
      tab.url.includes('content-composer')
    )
  );

  if (!webAppTab) {
    console.error('[Popup] Cannot get file - web app tab not found');
    return null;
  }

  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: webAppTab.id },
      func: async (fileId) => {
        // Open IndexedDB in web app's context
        const db = await new Promise((resolve, reject) => {
          const request = indexedDB.open('ContentComposerDB', 1);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve(request.result);
        });

        // Get file from object store
        const file = await new Promise((resolve, reject) => {
          const transaction = db.transaction(['files'], 'readonly');
          const store = transaction.objectStore('files');
          const request = store.get(fileId);

          request.onsuccess = () => {
            const result = request.result;
            resolve(result?.file || null);
          };
          request.onerror = () => reject(request.error);
        });

        if (!file) {
          return null;
        }

        // Convert File to serializable object with blob data
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const byteArray = Array.from(uint8Array);

        return {
          name: file.name,
          type: file.type,
          size: file.size,
          data: byteArray
        };
      },
      args: [assetId]
    });

    const fileInfo = results[0].result;
    if (!fileInfo) {
      console.log('[Popup] File not found in IndexedDB:', assetId);
      return null;
    }

    // Reconstruct File object from byte array
    const uint8Array = new Uint8Array(fileInfo.data);
    const blob = new Blob([uint8Array], { type: fileInfo.type });
    const file = new File([blob], fileInfo.name, { type: fileInfo.type });

    console.log('[Popup] ✓ Retrieved file from IndexedDB:', fileInfo.name, fileInfo.size, 'bytes');
    return file;

  } catch (error) {
    console.error('[Popup] Error getting file from IndexedDB:', error);
    return null;
  }
}

/**
 * Mark a post as linkedin_scheduled in the web app's localStorage
 */
async function markAsLinkedInScheduled(scheduledPostId) {
  const tabs = await chrome.tabs.query({});
  const webAppTab = tabs.find(tab =>
    tab.url && (
      tab.url.includes('localhost') ||
      tab.url.includes('127.0.0.1') ||
      tab.url.includes('lovable.app') ||
      tab.url.includes('content-composer')
    )
  );

  if (!webAppTab) {
    console.error('[Popup] Cannot mark as scheduled - web app tab not found');
    return false;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: webAppTab.id },
      func: (postId) => {
        const scheduledPosts = JSON.parse(localStorage.getItem('content-composer-scheduled-posts') || '[]');
        const index = scheduledPosts.findIndex(sp => sp.id === postId);

        if (index !== -1) {
          scheduledPosts[index].status = 'linkedin_scheduled';
          localStorage.setItem('content-composer-scheduled-posts', JSON.stringify(scheduledPosts));
          console.log('[Extension] Marked post as linkedin_scheduled:', postId);
          return true;
        }
        return false;
      },
      args: [scheduledPostId]
    });

    return true;
  } catch (error) {
    console.error('[Popup] Error marking post as scheduled:', error);
    return false;
  }
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
