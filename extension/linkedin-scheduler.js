// LinkedIn Scheduler - Core automation logic for scheduling posts on LinkedIn

class LinkedInScheduler {
  constructor() {
    this.isScheduling = false;
    this.currentStep = '';
  }

  /**
   * Main function to schedule a post
   */
  async schedulePost(caption, scheduledDate, file = null) {
    console.log('[LinkedIn Scheduler] Starting post scheduling...');
    console.log('Caption:', caption.substring(0, 100));
    console.log('Scheduled Date:', scheduledDate);
    console.log('Has File:', !!file);

    try {
      // Step 1: Click "Start a post" button
      await this.clickStartPost();
      await this.sleep(1500);

      // Step 2: Fill in the caption
      await this.fillCaption(caption);
      await this.sleep(1000);

      // Step 3: Upload file if exists
      if (file) {
        await this.uploadFile(file);
        await this.sleep(2000);
      }

      // Step 4: Click the schedule button
      await this.clickScheduleButton();
      await this.sleep(1000);

      // Step 5: Set the schedule date/time
      await this.setScheduleDateTime(scheduledDate);
      await this.sleep(1000);

      // Step 6: Confirm scheduling
      await this.confirmSchedule();
      await this.sleep(2000);

      console.log('[LinkedIn Scheduler] Post scheduled successfully!');
      return { success: true };

    } catch (error) {
      console.error('[LinkedIn Scheduler] Error:', error);
      throw error;
    }
  }

  /**
   * Click "Start a post" button
   */
  async clickStartPost() {
    console.log('[Step 1] Clicking "Start a post"...');

    const selectors = [
      'button[aria-label*="Start a post"]',
      'button.share-box-feed-entry__trigger',
      '[data-control-name="share_box_click"]',
      '.share-box-feed-entry__trigger'
    ];

    const button = await this.findElement(selectors);

    if (!button) {
      throw new Error('Could not find "Start a post" button');
    }

    button.click();
    console.log('[Step 1] Clicked "Start a post" button');
  }

  /**
   * Fill in the caption
   */
  async fillCaption(caption) {
    console.log('[Step 2] Filling caption...');

    const selectors = [
      '.ql-editor[contenteditable="true"]',
      'div[contenteditable="true"][role="textbox"]',
      '.share-creation-state__text-editor',
      '[data-placeholder*="share"]'
    ];

    const editor = await this.findElement(selectors, 5000);

    if (!editor) {
      throw new Error('Could not find caption editor');
    }

    // Focus the editor
    editor.focus();

    // Clear any existing content
    editor.innerHTML = '';

    // Insert the caption
    // Use innerText to preserve newlines
    const lines = caption.split('\n');
    lines.forEach((line, index) => {
      const p = document.createElement('p');
      p.textContent = line || '\u200B'; // Zero-width space for empty lines
      editor.appendChild(p);
    });

    // Trigger input event to notify LinkedIn
    editor.dispatchEvent(new Event('input', { bubbles: true }));

    console.log('[Step 2] Caption filled');
  }

  /**
   * Upload file (image/PDF)
   */
  async uploadFile(file) {
    console.log('[Step 3] Uploading file...');

    // Find the file input
    const fileInput = await this.findElement([
      'input[type="file"]',
      'input[accept*="image"]',
      'input[accept*="pdf"]'
    ], 5000);

    if (!fileInput) {
      throw new Error('Could not find file upload input');
    }

    // Create a DataTransfer to simulate file selection
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    // Trigger change event
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

    console.log('[Step 3] File uploaded');
  }

  /**
   * Click the schedule button (clock icon)
   */
  async clickScheduleButton() {
    console.log('[Step 4] Clicking schedule button...');

    const selectors = [
      'button[aria-label*="Schedule"]',
      '[data-test-id="share-box-schedule-button"]',
      'button.share-actions__primary-action[aria-label*="clock"]',
      'button[aria-label*="clock"]'
    ];

    const button = await this.findElement(selectors, 5000);

    if (!button) {
      throw new Error('Could not find schedule button');
    }

    button.click();
    console.log('[Step 4] Clicked schedule button');
  }

  /**
   * Set schedule date and time
   */
  async setScheduleDateTime(scheduledDate) {
    console.log('[Step 5] Setting schedule date/time...');

    const date = new Date(scheduledDate);

    // LinkedIn's schedule UI typically has:
    // - Date picker
    // - Time picker (hour/minute dropdowns)

    // Find date input
    const dateInput = await this.findElement([
      'input[type="date"]',
      'input[aria-label*="date"]',
      '[data-test-id="schedule-date-input"]'
    ], 5000);

    if (dateInput) {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dateInput.value = dateStr;
      dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    // Find time inputs (hour and minute)
    const timeInput = await this.findElement([
      'input[type="time"]',
      'input[aria-label*="time"]',
      '[data-test-id="schedule-time-input"]'
    ], 5000);

    if (timeInput) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      timeInput.value = timeStr;
      timeInput.dispatchEvent(new Event('input', { bubbles: true }));
      timeInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    console.log('[Step 5] Schedule date/time set');
  }

  /**
   * Confirm scheduling
   */
  async confirmSchedule() {
    console.log('[Step 6] Confirming schedule...');

    const selectors = [
      'button[data-test-id="share-box-post-button"]',
      'button[aria-label*="Schedule"]',
      'button.share-actions__primary-action',
      'button:contains("Schedule")'
    ];

    const button = await this.findElement(selectors, 5000);

    if (!button) {
      throw new Error('Could not find schedule confirmation button');
    }

    button.click();
    console.log('[Step 6] Schedule confirmed!');
  }

  /**
   * Find element with multiple selectors and retry logic
   */
  async findElement(selectors, timeout = 3000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) {
          console.log(`Found element with selector: ${selector}`);
          return element;
        }
      }

      // Wait a bit before retrying
      await this.sleep(200);
    }

    console.error('Could not find element with selectors:', selectors);
    return null;
  }

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for element to be removed (for loading states)
   */
  async waitForElementRemoved(selector, timeout = 5000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (!element) {
        return true;
      }
      await this.sleep(200);
    }

    return false;
  }
}

// Export for use in content script
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LinkedInScheduler;
}
