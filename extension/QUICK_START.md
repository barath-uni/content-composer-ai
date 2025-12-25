# Quick Start Guide - LinkedIn Auto Scheduler

## ⚡ TL;DR

1. **Reload the extension** (chrome://extensions/ → Click reload)
2. **Open LinkedIn.com** in a new tab → Go to feed
3. **Click extension icon** → Click "Schedule All"
4. **Done!** Posts will be scheduled automatically

---

## 📋 Detailed Steps

### Step 1: Prepare Your Content
1. Use Content Composer AI web app (localhost/lovable.app)
2. Upload Excel, generate posts, accept them
3. Schedule the posts using the scheduler
4. Verify posts appear in Content Planner

### Step 2: Reload Extension (After Code Changes)
1. Open `chrome://extensions/`
2. Find "LinkedIn Auto Scheduler"
3. Click **Reload** button (🔄)

### Step 3: Open LinkedIn
1. **IMPORTANT**: Open https://www.linkedin.com/feed/ in a tab
2. Wait for page to fully load
3. Make sure you're logged in

### Step 4: Use Extension
1. Click the extension icon
2. Review settings:
   - Days to schedule: 3-7 (how far ahead)
   - Delay: 10-30 seconds (between posts)
3. Click "Refresh" to load posts from web app
4. You should see your posts listed
5. Click "Schedule All"
6. Extension will:
   - Verify you're on LinkedIn
   - Check content script is loaded
   - Schedule each post automatically
   - Show progress bar
7. Watch the magic happen! ✨

---

## ❌ Common Errors & Fixes

### Error: "Could not establish connection. Receiving end does not exist."

**Cause**: You're not on LinkedIn, or the content script isn't loaded.

**Fix**:
1. Make sure current tab is LinkedIn.com
2. Refresh the LinkedIn page
3. Click "Schedule All" again

**OR** let the extension do it:
- Click "Schedule All"
- Extension will detect you're not on LinkedIn
- Click "OK" to open LinkedIn automatically
- Wait for page to load
- Click "Schedule All" again

### Error: "Could not access web app data"

**Cause**: Content Composer web app isn't open.

**Fix**:
1. Open your web app in another tab (localhost or lovable.app)
2. Make sure posts are scheduled
3. Go back to extension and click "Refresh"

### Error: "No posts to schedule"

**Possible causes**:
1. Posts are outside the date range
   - **Fix**: Increase "Days to schedule" to 7 or more
2. Posts already marked as `linkedin_scheduled`
   - **Fix**: Check localStorage, those posts are done!
3. Posts not actually scheduled in web app
   - **Fix**: Use web app's scheduler first

---

## 🔍 Debugging

### Check Extension Console
1. Right-click extension icon
2. Click "Inspect popup"
3. Check Console tab for logs:
   ```
   [Popup] Found web app tab: <url>
   [Popup] Loaded from web app: 4 posts
   [Popup] Posts to schedule: 4
   ```

### Check Content Script Console
1. Open LinkedIn page
2. Press F12 (DevTools)
3. Check Console tab for:
   ```
   [Content Script] LinkedIn Auto Scheduler loaded
   [Content Script] Ready to schedule posts
   ```

### Check Web App Data
1. Open web app
2. Press F12 → Application tab
3. Local Storage → Check:
   - `content-composer-generated-posts`
   - `content-composer-scheduled-posts`
4. IndexedDB → ContentComposerDB → files

---

## ✅ Success Indicators

- ✅ Extension shows post count > 0
- ✅ Posts listed with dates and hooks
- ✅ "Schedule All" button is enabled
- ✅ Clicking button shows progress bar
- ✅ Status log shows "Post X scheduled successfully"
- ✅ Posts appear in LinkedIn's scheduled section

---

## 🎯 Pro Tips

1. **Keep web app tab open** while using extension
2. **Use delays of 10+ seconds** to avoid rate limiting
3. **Test with 1-2 posts** first before batch scheduling
4. **Check LinkedIn's scheduled posts** after completion
5. **Extension must be on LinkedIn page** to schedule
6. **Refresh extension** after changing date range

---

## 🚨 Important Notes

⚠️ **Must be on LinkedIn.com** when clicking "Schedule All"
⚠️ **Content script auto-loads** when you open LinkedIn
⚠️ **Refresh LinkedIn page** if content script fails to load
⚠️ **Keep web app open** in another tab
⚠️ **Extension only schedules** - never posts immediately

---

## 📞 Still Having Issues?

1. Check both consoles (popup + content script)
2. Verify all prerequisites are met
3. Try with a fresh LinkedIn tab
4. Reload extension
5. Check error messages in status log
