// Background Service Worker - Handles extension lifecycle and coordination

console.log('[Background] LinkedIn Auto Scheduler service worker started');

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('[Background] Extension installed:', details.reason);

  if (details.reason === 'install') {
    // Set default settings
    chrome.storage.sync.set({
      daysAhead: 7,
      delayBetween: 10
    }, () => {
      console.log('[Background] Default settings saved');
    });

    // Open welcome page or instructions
    chrome.tabs.create({
      url: 'https://www.linkedin.com/feed/'
    });
  }
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Background] Received message:', request);

  if (request.action === 'getStatus') {
    sendResponse({ status: 'ready' });
    return false;
  }

  // Add more message handlers as needed

  return false;
});

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  console.log('[Background] Extension icon clicked on tab:', tab.id);

  // Check if we're on LinkedIn
  if (tab.url && tab.url.includes('linkedin.com')) {
    // Open popup (this is default behavior, just logging)
    console.log('[Background] On LinkedIn, popup will open');
  } else {
    // Not on LinkedIn, redirect
    chrome.tabs.update(tab.id, {
      url: 'https://www.linkedin.com/feed/'
    });
  }
});

// Handle alarm for scheduled tasks (future feature)
chrome.alarms.onAlarm.addListener((alarm) => {
  console.log('[Background] Alarm triggered:', alarm.name);

  if (alarm.name === 'dailyScheduleCheck') {
    // Future: Check for posts to schedule automatically
    console.log('[Background] Running daily schedule check...');
  }
});

// Set up daily alarm (optional - for future automation)
chrome.alarms.create('dailyScheduleCheck', {
  delayInMinutes: 1,
  periodInMinutes: 1440 // 24 hours
});

console.log('[Background] Service worker initialized');
