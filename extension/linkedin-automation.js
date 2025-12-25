// LinkedIn Automation - Updated with EXACT selectors from current LinkedIn UI
// This will be injected into content.js

class LinkedInScheduler {
  constructor() {
    this.isScheduling = false;
    this.currentStep = '';
  }

  async schedulePost(caption, scheduledDate, file = null) {
    console.log('[LinkedIn Scheduler] Starting post scheduling...');
    console.log('Caption:', caption.substring(0, 100));
    console.log('Scheduled Date:', scheduledDate);
    console.log('Has File:', !!file);

    try {
      // Step 1: Click "Start a post" button
      await this.clickStartPost();
      await this.sleep(2000);

      // Step 2: Upload file FIRST if it exists (before typing)
      if (file) {
        await this.uploadFile(file);
        await this.sleep(3000); // Wait for upload
      }

      // Step 3: Fill in the caption AFTER uploading
      await this.fillCaption(caption);
      await this.sleep(1000);

      // Step 4: Click the schedule button (clock icon)
      await this.clickScheduleButton();
      await this.sleep(1500);

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

  async clickStartPost() {
    console.log('[Step 1] Clicking "Start a post"...');

    // Find button by text content "Start a post"
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
    console.log('[Step 1] ✓ Clicked "Start a post" button');
  }

  async fillCaption(caption) {
    console.log('[Step 2] Filling caption...');

    // Exact selector from your HTML: div.ql-editor[contenteditable="true"]
    const editor = await this.findElement([
      'div.ql-editor[contenteditable="true"]',
      'div[data-placeholder*="What do you want to talk about"]',
      'div.ql-editor'
    ], 5000);

    if (!editor) {
      throw new Error('Could not find caption editor');
    }

    // Focus and clear
    editor.focus();
    editor.innerHTML = '';

    // Insert caption with proper formatting
    const lines = caption.split('\n');
    lines.forEach((line) => {
      const p = document.createElement('p');
      p.textContent = line || '\u200B'; // Zero-width space for empty lines
      editor.appendChild(p);
    });

    // Trigger input event
    editor.dispatchEvent(new Event('input', { bubbles: true }));
    editor.dispatchEvent(new Event('change', { bubbles: true }));

    console.log('[Step 2] ✓ Caption filled');
  }

  async uploadFile(file) {
    console.log('[Step 3] Uploading file...');
    console.log('File type:', file.type);

    const isPDF = file.type === 'application/pdf';
    const isImage = file.type.startsWith('image/');

    if (isImage) {
      // Click "Add media" button
      const mediaButton = await this.findElement([
        'button[aria-label="Add media"]',
        'button svg[data-test-icon="image-medium"]',
        'button .share-promoted-detour-button__icon-container svg use[href="#image-medium"]'
      ], 5000);

      if (!mediaButton) {
        // Try to find parent button of image icon
        const svgIcon = document.querySelector('svg[data-test-icon="image-medium"]');
        if (svgIcon) {
          const btn = svgIcon.closest('button');
          if (btn) {
            btn.click();
          }
        } else {
          throw new Error('Could not find "Add media" button');
        }
      } else {
        mediaButton.click();
      }

      console.log('[Step 3] Clicked "Add media" button');

    } else if (isPDF) {
      // First click "More" (+) button to expand
      console.log('[Step 3] Expanding options for PDF...');

      const moreButton = await this.findElement([
        'button[aria-label="More"]',
        'button svg[data-test-icon="add-medium"]'
      ], 5000);

      if (!moreButton) {
        const svgIcon = document.querySelector('svg[data-test-icon="add-medium"]');
        if (svgIcon) {
          const btn = svgIcon.closest('button');
          if (btn) {
            btn.click();
            await this.sleep(500);
          }
        } else {
          throw new Error('Could not find "More" (+) button');
        }
      } else {
        moreButton.click();
        await this.sleep(500);
      }

      // Now click "Add a document" button
      const docButton = await this.findElement([
        'button[aria-label="Add a document"]',
        'button svg[data-test-icon="sticky-note-medium"]'
      ], 5000);

      if (!docButton) {
        const svgIcon = document.querySelector('svg[data-test-icon="sticky-note-medium"]');
        if (svgIcon) {
          const btn = svgIcon.closest('button');
          if (btn) {
            btn.click();
          }
        } else {
          throw new Error('Could not find "Add a document" button');
        }
      } else {
        docButton.click();
      }

      console.log('[Step 3] Clicked "Add a document" button');
    }

    // Wait for file input to appear
    await this.sleep(500);

    // Find and use the file input
    const fileInput = await this.findElement([
      'input[type="file"]',
      'input[accept*="image"]',
      'input[accept*="pdf"]'
    ], 5000);

    if (!fileInput) {
      throw new Error('Could not find file upload input');
    }

    // Upload the file
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event('change', { bubbles: true }));

    console.log('[Step 3] ✓ File uploaded');
  }

  async clickScheduleButton() {
    console.log('[Step 4] Clicking schedule button...');

    // Exact selector: button[aria-label="Schedule post"] with clock icon
    const button = await this.findElement([
      'button[aria-label="Schedule post"]',
      'button.share-actions__scheduled-post-btn',
      'button svg[data-test-icon="clock-medium"]'
    ], 5000);

    if (!button) {
      // Try to find by clock icon
      const clockIcon = document.querySelector('svg[data-test-icon="clock-medium"]');
      if (clockIcon) {
        const btn = clockIcon.closest('button');
        if (btn) {
          btn.click();
          console.log('[Step 4] ✓ Clicked schedule button (via icon)');
          return;
        }
      }
      throw new Error('Could not find schedule button');
    }

    button.click();
    console.log('[Step 4] ✓ Clicked schedule button');
  }

  async setScheduleDateTime(scheduledDate) {
    console.log('[Step 5] Setting schedule date/time...');

    const date = new Date(scheduledDate);
    console.log('[Step 5] Target date:', date.toISOString());

    // Wait for schedule dialog to open
    await this.sleep(1000);

    // Find date input
    const dateInput = await this.findElement([
      'input[type="date"]',
      'input[aria-label*="Date"]',
      'input[placeholder*="date"]'
    ], 5000);

    if (dateInput) {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      dateInput.value = dateStr;
      dateInput.dispatchEvent(new Event('input', { bubbles: true }));
      dateInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Step 5] ✓ Date set:', dateStr);
    } else {
      console.warn('[Step 5] Could not find date input');
    }

    // Find time input
    const timeInput = await this.findElement([
      'input[type="time"]',
      'input[aria-label*="Time"]',
      'input[placeholder*="time"]'
    ], 5000);

    if (timeInput) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${minutes}`;

      timeInput.value = timeStr;
      timeInput.dispatchEvent(new Event('input', { bubbles: true }));
      timeInput.dispatchEvent(new Event('change', { bubbles: true }));
      console.log('[Step 5] ✓ Time set:', timeStr);
    } else {
      console.warn('[Step 5] Could not find time input');
    }

    console.log('[Step 5] ✓ Schedule date/time set');
  }

  async confirmSchedule() {
    console.log('[Step 6] Confirming schedule...');

    // Find the final "Schedule" or "Done" button
    const button = await this.findElement([
      'button[aria-label*="Schedule"]',
      'button[type="submit"]',
      'button.artdeco-button--primary'
    ], 5000);

    if (!button) {
      // Try to find button with text "Schedule"
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        if (btn.textContent.includes('Schedule') && btn.classList.contains('artdeco-button--primary')) {
          btn.click();
          console.log('[Step 6] ✓ Schedule confirmed (via text)');
          return;
        }
      }
      throw new Error('Could not find schedule confirmation button');
    }

    button.click();
    console.log('[Step 6] ✓ Schedule confirmed!');
  }

  async findElement(selectors, timeout = 3000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      for (const selector of selectors) {
        try {
          const element = document.querySelector(selector);
          if (element && element.offsetParent !== null) { // Check if visible
            console.log(`✓ Found element: ${selector}`);
            return element;
          }
        } catch (e) {
          // Invalid selector, skip
        }
      }

      await this.sleep(200);
    }

    console.error('❌ Could not find element with selectors:', selectors);
    return null;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

console.log('[LinkedIn Automation] Scheduler class loaded');
