# How to Reload the Extension After Updates

## Quick Steps:

1. Open `chrome://extensions/` in Chrome
2. Find "LinkedIn Auto Scheduler"
3. Click the **Reload** button (circular arrow icon)
4. Done!

## Testing:

1. Make sure your Content Composer AI web app is open in a tab (localhost or lovable.app)
2. Navigate to any page (doesn't need to be LinkedIn for loading posts)
3. Click the extension icon
4. Click "Refresh" button
5. You should now see your scheduled posts!

## Debugging:

If posts still don't show:

1. Right-click the extension icon → "Inspect popup"
2. Check the Console tab for errors
3. Look for messages like:
   - `[Popup] Found web app tab: <url>`
   - `[Popup] Loaded from web app: X posts`
   - `[Popup] Posts to schedule: X`

## What Changed:

- Extension now reads from the **web app's localStorage** (not its own)
- Uses `chrome.scripting.executeScript` to inject code into web app tab
- Searches for tabs containing: localhost, 127.0.0.1, lovable.app, or content-composer
- Properly filters posts by date range and status
