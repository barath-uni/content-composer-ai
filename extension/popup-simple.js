// Simple popup - Just shows content for easy copy/paste

let currentPosts = [];

// DOM Elements
const daysAheadInput = document.getElementById('daysAhead');
const refreshBtn = document.getElementById('refreshBtn');
const postsListEl = document.getElementById('postsList');
const statusEl = document.getElementById('status');
const totalPostsEl = document.getElementById('totalPosts');
const pendingPostsEl = document.getElementById('pendingPosts');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadPosts();
  refreshBtn.addEventListener('click', loadPosts);
  daysAheadInput.addEventListener('change', loadPosts);
});

/**
 * Load posts from web app
 */
async function loadPosts() {
  showStatus('Loading...', 'info');

  try {
    const data = await getDataFromWebApp();

    if (!data) {
      showStatus('⚠️ Please open your Content Composer web app', 'error');
      renderEmptyState();
      return;
    }

    const generatedPosts = data.generatedPosts || [];
    const scheduledPosts = data.scheduledPosts || [];

    const daysAhead = parseInt(daysAheadInput.value);
    currentPosts = filterPostsToSchedule(generatedPosts, scheduledPosts, daysAhead);

    // Update stats
    totalPostsEl.textContent = scheduledPosts.length;
    pendingPostsEl.textContent = currentPosts.length;

    // Render posts
    renderPosts();

    hideStatus();

  } catch (error) {
    console.error('[Popup] Error:', error);
    showStatus(`Error: ${error.message}`, 'error');
  }
}

/**
 * Get data from web app
 */
async function getDataFromWebApp() {
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
    return null;
  }

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

  const scheduledMap = new Map();
  scheduledPosts.forEach(sp => {
    scheduledMap.set(sp.postId, sp);
  });

  const postsToSchedule = [];

  generatedPosts.forEach(post => {
    const scheduledInfo = scheduledMap.get(post.id);

    if (!scheduledInfo) return;

    const schedDate = new Date(scheduledInfo.scheduledDate);
    const inRange = schedDate >= now && schedDate <= futureDate;
    const notScheduled = scheduledInfo.status !== 'linkedin_scheduled';

    if (inRange && notScheduled) {
      postsToSchedule.push({
        ...post,
        scheduledPost: scheduledInfo,
        scheduledDate: scheduledInfo.scheduledDate
      });
    }
  });

  postsToSchedule.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

  return postsToSchedule;
}

/**
 * Render posts
 */
function renderPosts() {
  if (currentPosts.length === 0) {
    renderEmptyState();
    return;
  }

  const html = currentPosts.map((post, index) => {
    const date = new Date(post.scheduledDate);
    const dateStr = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    return `
      <div class="post-card" data-post-id="${post.id}">
        <div class="post-header">
          <div>
            <div class="post-date">${dateStr} @ ${timeStr}</div>
            <div class="post-meta">
              ${post.pillar}
              <span class="post-format">${post.format}</span>
            </div>
          </div>
        </div>

        <div class="post-content">
          <div class="post-caption">${escapeHtml(post.caption)}</div>
        </div>

        <div class="post-actions">
          <button class="btn-action btn-copy" onclick="copyContent('${post.id}')">
            📋 Copy Caption
          </button>
          ${post.assetId ? `
            <button class="btn-action btn-download" onclick="downloadAsset('${post.assetId}', '${post.format}')">
              📥 Download ${post.format === 'image' ? 'Image' : post.format === 'carousel' ? 'PDF' : 'File'}
            </button>
          ` : `
            <button class="btn-action btn-download" disabled>
              No file
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');

  postsListEl.innerHTML = html;
}

/**
 * Render empty state
 */
function renderEmptyState() {
  postsListEl.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">📭</div>
      <div class="empty-state-text">No posts to schedule</div>
      <div class="empty-state-hint">Try increasing the days ahead or check your Content Composer</div>
    </div>
  `;
}

/**
 * Copy content to clipboard
 */
window.copyContent = async function(postId) {
  const post = currentPosts.find(p => p.id === postId);
  if (!post) return;

  try {
    await navigator.clipboard.writeText(post.caption);

    // Visual feedback
    const button = document.querySelector(`[data-post-id="${postId}"] .btn-copy`);
    const originalText = button.innerHTML;
    button.innerHTML = '✓ Copied!';
    button.classList.add('copied');

    setTimeout(() => {
      button.innerHTML = originalText;
      button.classList.remove('copied');
    }, 2000);

    showStatus('✓ Caption copied to clipboard!', 'success');
    setTimeout(hideStatus, 2000);

  } catch (error) {
    showStatus('Failed to copy', 'error');
  }
};

/**
 * Download asset from IndexedDB
 */
window.downloadAsset = async function(assetId, format) {
  showStatus('Downloading file...', 'info');

  try {
    const file = await getFileFromWebApp(assetId);

    if (!file) {
      showStatus('File not found in storage', 'error');
      return;
    }

    // Create download link
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showStatus(`✓ Downloaded ${file.name}`, 'success');
    setTimeout(hideStatus, 2000);

  } catch (error) {
    console.error('[Popup] Download error:', error);
    showStatus('Failed to download file', 'error');
  }
};

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
    throw new Error('Web app tab not found');
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId: webAppTab.id },
    func: async (fileId) => {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('ContentComposerDB', 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

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
    return null;
  }

  const uint8Array = new Uint8Array(fileInfo.data);
  const blob = new Blob([uint8Array], { type: fileInfo.type });
  const file = new File([blob], fileInfo.name, { type: fileInfo.type });

  return file;
}

/**
 * Show status message
 */
function showStatus(message, type = 'info') {
  statusEl.textContent = message;
  statusEl.className = `status ${type}`;
  statusEl.classList.remove('hidden');
}

/**
 * Hide status message
 */
function hideStatus() {
  statusEl.classList.add('hidden');
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
