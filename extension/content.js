// Content Script - Runs on LinkedIn pages and handles post scheduling

console.log('[Content Script] LinkedIn Auto Scheduler loaded');

/**
 * LinkedIn Scheduler class - Updated with EXACT selectors
 */
class LinkedInScheduler {
  constructor() {
    this.isScheduling = false;
  }

  async schedulePost(caption, scheduledDate, file = null) {
    console.log('[LinkedIn Scheduler] Starting post scheduling...');
    console.log('Caption:', caption.substring(0, 100));
    console.log('Scheduled Date:', scheduledDate);
    console.log('Has File:', !!file);

    try {
      // Step 1: Click "Start a post"
      await this.clickStartPost();
      await this.sleep(2000);

      // Step 2: Upload file FIRST (before typing text)
      if (file) {
        await this.uploadFile(file);
        await this.sleep(3000);
      }

      // Step 3: Fill caption AFTER upload
      await this.fillCaption(caption);
      await this.sleep(1000);

      // Step 4: Click schedule button
      await this.clickScheduleButton();
      await this.sleep(1500);

      // Step 5: Set date/time
      await this.setScheduleDateTime(scheduledDate);
      await this.sleep(1000);

      // Step 6: Confirm
      await this.confirmSchedule();
      await this.sleep(2000);

      console.log('[LinkedIn Scheduler] ✅ Post scheduled successfully!');
      return { success: true };

    } catch (error) {
      console.error('[LinkedIn Scheduler] ❌ Error:', error);
      throw error;
    }
  }

  async clickStartPost() {
    console.log('[Step 1] Clicking "Start a post"...');

    // Find by text content since it has no aria-label
    let button = null;
    const buttons = document.querySelectorAll('button.artdeco-button');
    for (const btn of buttons) {
      if (btn.textContent.includes('Start a post')) {
        button = btn;
        break;
      }
    }

    if (!button) {
      throw new Error('Could not find "Start a post" button');
    }

    button.click();
    console.log('[Step 1] ✓ Clicked');
  }

  async fillCaption(caption) {
    console.log('[Step 2] Filling caption...');

    const editor = await this.findElement([
      'div.ql-editor[contenteditable="true"]',
      'div[data-placeholder*="What do you want to talk about"]'
    ], 5000);

    if (!editor) {
      throw new Error('Could not find caption editor');
    }

    editor.focus();
    editor.innerHTML = '';

    const lines = caption.split('\n');
    lines.forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line || '\u200B';
      editor.appendChild(p);
    });

    editor.dispatchEvent(new Event('input', { bubbles: true }));
    console.log('[Step 2] ✓ Caption filled');
  }

  async uploadFile(file) {
    console.log('[Step 3] Uploading file...');

    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (isImage) {
      // Click "Add media" button
      const svgIcon = document.querySelector('svg[data-test-icon="image-medium"]');
      if (!svgIcon) {
        throw new Error('Could not find image icon');
      }
      const btn = svgIcon.closest('button');
      if (!btn) {
        throw new Error('Could not find Add media button');
      }
      btn.click();
      console.log('[Step 3] Clicked "Add media"');

    } else if (isPDF) {
      // Click "More" (+) button first
      const addIcon = document.querySelector('svg[data-test-icon="add-medium"]');
      if (!addIcon) {
        throw new Error('Could not find + icon');
      }
      const moreBtn = addIcon.closest('button');
      if (!moreBtn) {
        throw new Error('Could not find More button');
      }
      moreBtn.click();
      await this.sleep(500);
      console.log('[Step 3] Clicked "More"');

      // Click "Add a document" button
      const docIcon = document.querySelector('svg[data-test-icon="sticky-note-medium"]');
      if (!docIcon) {
        throw new Error('Could not find document icon');
      }
      const docBtn = docIcon.closest('button');
      if (!docBtn) {
        throw new Error('Could not find Add document button');
      }
      docBtn.click();
      console.log('[Step 3] Clicked "Add a document"');
    }

    await this.sleep(500);

    // Find file input and upload
    const fileInput = await this.findElement([
      'input[type="file"]'
    ], 5000);

    if (!fileInput) {
      throw new Error('Could not find file input');
    }

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

    console.log('[Step 3] ✓ File uploaded, waiting for preview...');

    // Wait for file to upload and preview to appear
    await this.sleep(2000);

    // Click "Next" button to go back to editor
    console.log('[Step 3] Looking for "Next" button...');
    const nextButton = await this.findElement([
      'button[aria-label="Next"]',
      'button.share-box-footer__primary-btn'
    ], 5000);

    if (!nextButton) {
      // Try finding by text content
      const buttons = document.querySelectorAll('button.artdeco-button--primary');
      let found = false;
      for (const btn of buttons) {
        if (btn.textContent.trim() === 'Next') {
          btn.click();
          console.log('[Step 3] ✓ Clicked "Next" (by text)');
          found = true;
          break;
        }
      }
      if (!found) {
        console.warn('[Step 3] Could not find "Next" button, continuing anyway...');
      }
    } else {
      nextButton.click();
      console.log('[Step 3] ✓ Clicked "Next"');
    }

    // Wait for editor to appear
    await this.sleep(1000);
  }

  async clickScheduleButton() {
    console.log('[Step 4] Clicking schedule button...');

    // Find by clock icon
    const clockIcon = document.querySelector('svg[data-test-icon="clock-medium"]');
    if (!clockIcon) {
      throw new Error('Could not find clock icon');
    }

    const button = clockIcon.closest('button');
    if (!button) {
      throw new Error('Could not find schedule button');
    }

    button.click();
    console.log('[Step 4] ✓ Clicked schedule');
  }

  async setScheduleDateTime(scheduledDate) {
    console.log('[Step 5] Setting date/time...');

    await this.sleep(1000);
    const date = new Date(scheduledDate);

    // Date input: id="share-post__scheduled-date" placeholder="mm/dd/yyyy"
    const dateInput = await this.findElement([
      'input#share-post__scheduled-date',
      'input[name="artdeco-date"]',
      'input[placeholder="mm/dd/yyyy"]'
    ], 5000);

    if (!dateInput) {
      throw new Error('Could not find date input');
    }

    // Format as mm/dd/yyyy
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const dateStr = `${month}/${day}/${year}`;

    dateInput.focus();
    dateInput.value = dateStr;
    dateInput.dispatchEvent(new Event('input', { bubbles: true }));
    dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    dateInput.dispatchEvent(new Event('blur', { bubbles: true }));
    console.log('[Step 5] ✓ Date:', dateStr);

    await this.sleep(500);

    // Time input: id="share-post__scheduled-time"
    const timeInput = await this.findElement([
      'input#share-post__scheduled-time',
      'input[name="timepicker"]',
      'input.artdeco-typeahead__input[aria-label="Time"]'
    ], 5000);

    if (!timeInput) {
      throw new Error('Could not find time input');
    }

    // Format as "9:00 AM" or "2:30 PM"
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const timeStr = `${hours}:${minutes} ${ampm}`;

    timeInput.focus();
    timeInput.value = timeStr;
    timeInput.dispatchEvent(new Event('input', { bubbles: true }));
    timeInput.dispatchEvent(new Event('change', { bubbles: true }));
    timeInput.dispatchEvent(new Event('blur', { bubbles: true }));
    console.log('[Step 5] ✓ Time:', timeStr);

    await this.sleep(500);
  }

  async confirmSchedule() {
    console.log('[Step 6] Confirming...');

    // First click "Next" button
    const nextButton = await this.findElement([
      'button[aria-label="Next"]',
      'button#ember384',
      'button.share-box-footer__primary-btn'
    ], 5000);

    if (!nextButton) {
      // Try to find by text
      const buttons = document.querySelectorAll('button.artdeco-button--primary');
      for (const btn of buttons) {
        if (btn.textContent.trim() === 'Next') {
          btn.click();
          console.log('[Step 6] ✓ Clicked "Next"');
          await this.sleep(1000);
          break;
        }
      }
    } else {
      nextButton.click();
      console.log('[Step 6] ✓ Clicked "Next"');
      await this.sleep(1000);
    }

    // Then click "Schedule" button
    const scheduleButton = await this.findElement([
      'button.share-actions__primary-action',
      'button#ember418'
    ], 5000);

    if (!scheduleButton) {
      // Try to find by text "Schedule"
      const buttons = document.querySelectorAll('button.artdeco-button--primary');
      for (const btn of buttons) {
        if (btn.textContent.includes('Schedule')) {
          btn.click();
          console.log('[Step 6] ✓ Clicked "Schedule"');
          return;
        }
      }
      throw new Error('Could not find "Schedule" button');
    }

    scheduleButton.click();
    console.log('[Step 6] ✓ Clicked "Schedule"');
  }

  async findElement(selectors, timeout = 3000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element && element.offsetParent !== null) {
          return element;
        }
      }
      await this.sleep(200);
    }

    return null;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Initialize scheduler
const scheduler = new LinkedInScheduler();

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[Content Script] Message:', request.action);

  if (request.action === 'ping') {
    sendResponse({ status: 'ready' });
    return false;
  }

  if (request.action === 'schedulePost') {
    handleSchedulePost(request, sendResponse);
    return true;
  }

  return false;
});

async function handleSchedulePost(request, sendResponse) {
  try {
    const { post, fileData } = request;
    console.log('[Content Script] Scheduling:', post);

    // Convert fileData to File object if present
    let file = null;
    if (fileData && fileData.data) {
      const uint8Array = new Uint8Array(fileData.data);
      const blob = new Blob([uint8Array], { type: fileData.type });
      file = new File([blob], fileData.name, { type: fileData.type });
      console.log('[Content Script] ✓ File reconstructed:', file.name, file.size, 'bytes');
    }

    // Schedule
    const result = await scheduler.schedulePost(post.caption, post.scheduledDate, file);

    console.log('[Content Script] ✅ Success');
    sendResponse({ success: true, result });

  } catch (error) {
    console.error('[Content Script] ❌ Error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

console.log('[Content Script] Ready to schedule posts');
