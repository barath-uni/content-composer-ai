# Debugging Guide - Schedule & Formatting Issues

## Current Issues
1. **LinkedIn formatting lost** - Text has no line breaks
2. **Schedule button not working** - Posts don't appear in Content Calendar

## How to Debug

### Step 1: Inspect localStorage (3 Methods)

#### Method A: Debug Tool (Easiest)
1. Open your browser to: `http://localhost:8081/debug.html`
2. Click the buttons to see your stored data
3. Look for `content-composer-scheduled-posts` - this should have your scheduled posts

#### Method B: Browser DevTools
1. Press **F12** (or Cmd+Option+I on Mac)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Local Storage** → `http://localhost:8081`
4. Look for these keys:
   - `content-composer-generated-posts` - your uploaded posts
   - `content-composer-scheduled-posts` - posts you clicked Schedule on
   - `content-composer-assets` - your uploaded images/PDFs/videos

#### Method C: Console Commands
1. Press **F12** to open DevTools
2. Go to **Console** tab
3. Type these commands:

```javascript
// See all generated posts
JSON.parse(localStorage.getItem('content-composer-generated-posts'))

// See all scheduled posts
JSON.parse(localStorage.getItem('content-composer-scheduled-posts'))

// See all assets
JSON.parse(localStorage.getItem('content-composer-assets'))
```

---

### Step 2: Check Console Logs

I've added extensive logging. When you:

#### Upload CSV File:
Look for these logs in Console:
```
Detected delimiter: comma (or tab)
Parsed headers: [...]
Parsed X rows
Original text: [your post text]
Has actual newlines: true/false
Has escaped newlines: true/false
Formatted text: [result]
```

#### Click Accept/Reject:
```
Post accepted! (toast message)
```

#### Click Schedule:
```
=== SCHEDULE BUTTON CLICKED ===
Post being scheduled: {...}
Schedule Date: 2024-12-26
Schedule Time: 09:00
Scheduled DateTime: ...
Scheduled Post Object: {...}
About to call scheduledPostsStorage.add()...
After scheduledPostsStorage.add() - checking localStorage...
Raw localStorage data: [...]
Parsed scheduled posts: [...]
Total scheduled posts in storage: X
Calling onScheduled callback...
Closing dialog...
=== SCHEDULE COMPLETE ===
```

#### After Scheduling (Calendar Loading):
```
=== POSTS-SCHEDULED EVENT RECEIVED ===
Reloading schedule from storage...
=== LOADING SCHEDULE ===
Generated posts from storage: X
Scheduled posts from storage: X
Scheduled posts data: [...]
Post excel-post-xxx: schedInfo = {...} dateKey = 2024-12-26T09:00:00.000Z
Final schedule map: {...}
Total date keys: X
=== SCHEDULE LOADED ===
```

---

### Step 3: Test the Workflow

1. **Upload your CSV** with comma-separated values
2. **Open Console** (F12 → Console tab)
3. **Check formatting logs** - does the text have newlines?
4. **Click Accept** on a post
5. **Click Schedule** on that post
6. **Watch the console** - does it show "=== SCHEDULE BUTTON CLICKED ==="?
7. **Check if data was saved** - does it show "Total scheduled posts in storage: 1"?
8. **Go to Content Planner** tab
9. **Check console** - does it show "=== POSTS-SCHEDULED EVENT RECEIVED ==="?
10. **Check localStorage** - use one of the methods above

---

## What to Look For

### LinkedIn Formatting Issue

In the console, check:
```
Original text: Your resume never reached a human.That's the real rejection...
Has actual newlines: false
Has escaped newlines: false
```

This tells us if your CSV has newlines or not.

**Possible causes:**
- CSV export didn't preserve newlines
- Excel exported as `\n` literal text instead of actual newlines
- Text field has spaces where newlines should be

### Schedule Button Issue

Check localStorage for `content-composer-scheduled-posts`:

**If it's empty or null:**
- The `scheduledPostsStorage.add()` call failed
- Check console for errors

**If it has data but calendar is empty:**
- Event system not firing
- Calendar date key mismatch
- Console should show "=== POSTS-SCHEDULED EVENT RECEIVED ===" when you go to Content Planner

**If dateKey doesn't match:**
- Schedule uses ISO format: `2024-12-26T09:00:00.000Z`
- Calendar expects format: `2024-12-26`
- This would cause posts not to show up!

---

## Quick Checks

Run these in Console to verify:

```javascript
// 1. Check if posts exist
const posts = JSON.parse(localStorage.getItem('content-composer-generated-posts'));
console.log('Total posts:', posts?.length);

// 2. Check if any are scheduled
const scheduled = JSON.parse(localStorage.getItem('content-composer-scheduled-posts'));
console.log('Total scheduled:', scheduled?.length);
console.log('Scheduled data:', scheduled);

// 3. Check assets
const assets = JSON.parse(localStorage.getItem('content-composer-assets'));
console.log('Total assets:', assets?.length);

// 4. Trigger calendar refresh manually
window.dispatchEvent(new CustomEvent('posts-scheduled'));
```

---

## Expected Behavior

### Working LinkedIn Formatting
Original CSV should have actual newlines:
```
Your resume never reached a human.

That's the real rejection.

Most applications hit ATS filters...
```

Console should show:
```
Has actual newlines: true
Formatted text: [with proper line breaks]
```

### Working Schedule Button
After clicking Schedule:
```
Raw localStorage data: [{"id":"scheduled-123","postId":"excel-post-456",...}]
Total scheduled posts in storage: 1
```

Calendar should immediately update and show the post on the selected date.

---

## Still Not Working?

Share these from Console:
1. Full output from uploading CSV
2. Full output from clicking Schedule
3. Full output from opening Content Planner
4. Screenshot of localStorage data (`content-composer-scheduled-posts`)
