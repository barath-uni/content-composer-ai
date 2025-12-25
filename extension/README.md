# LinkedIn Auto Scheduler - Chrome Extension

Automatically schedule LinkedIn posts from Content Composer AI.

## 🎯 Features

- **Read Scheduled Posts**: Automatically reads posts from your Content Composer AI web app
- **Batch Scheduling**: Schedule multiple posts at once with configurable delays
- **Smart Status Management**: Marks posts as `linkedin_scheduled` to prevent duplicates
- **Date Range Control**: Schedule posts for the next 5-30 days (configurable)
- **File Upload Support**: Automatically uploads images and PDFs from IndexedDB
- **Progress Tracking**: Real-time progress bar and status logs
- **Safe Operation**: Only schedules posts, never posts immediately

## 📋 Installation

### Step 1: Create Extension Icons

Before loading the extension, you need to create icon files:

1. Navigate to `extension/icons/`
2. Create three PNG files:
   - `icon16.png` (16x16 pixels)
   - `icon48.png` (48x48 pixels)
   - `icon128.png` (128x128 pixels)

You can use any image editor or online tool. See `extension/icons/ICONS_README.md` for details.

**Quick Option**: Use a solid color square for testing:
- Background: #0A66C2 (LinkedIn blue)
- Add "LI" text in white

### Step 2: Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right corner)
3. Click **"Load unpacked"**
4. Select the `extension` folder from this project
5. The extension should now appear in your extensions list

## 🚀 Usage

### Setup Phase

1. **Use Content Composer AI Web App**:
   - Upload your Excel file with content
   - Accept/reject posts
   - Schedule posts using the scheduler

2. **Verify Data**:
   - Open Chrome DevTools (F12)
   - Go to Application → Local Storage
   - Verify these keys exist:
     - `content-composer-generated-posts`
     - `content-composer-scheduled-posts`
   - Go to Application → IndexedDB → ContentComposerDB
   - Verify files are stored in the `files` store

### Scheduling Posts

1. **Navigate to LinkedIn**:
   - Open [LinkedIn](https://www.linkedin.com/feed/)
   - Make sure you're logged in

2. **Open Extension**:
   - Click the extension icon in Chrome toolbar
   - The popup will show your posts to schedule

3. **Configure Settings**:
   - **Days to schedule**: How many days ahead to schedule (1-30)
   - **Delay between posts**: Seconds to wait between each post (5-60)

4. **Review Posts**:
   - The extension shows all posts pending scheduling
   - Each post displays:
     - Scheduled date/time
     - Hook (title)
     - Format and pillar
     - Current status

5. **Schedule Posts**:
   - Click **"Schedule All"** button
   - The extension will:
     - Open LinkedIn's post composer
     - Fill in the caption
     - Upload the asset (if any)
     - Click the schedule button
     - Set the date/time
     - Confirm scheduling
     - Mark the post as `linkedin_scheduled`
   - Watch the progress bar and status log
   - Wait for completion

6. **Verify**:
   - Go to LinkedIn → Me → Scheduled posts
   - Verify all posts are scheduled correctly

## 🔧 Settings

### Days Ahead
- **Default**: 7 days
- **Range**: 1-30 days
- Controls how far into the future to schedule posts

### Delay Between Posts
- **Default**: 10 seconds
- **Range**: 5-60 seconds
- Delay between scheduling each post to avoid rate limiting

## 📊 Status Types

- **draft**: Post created but not yet scheduled in web app
- **scheduled**: Post scheduled in web app, pending LinkedIn scheduling
- **linkedin_scheduled**: Post successfully scheduled on LinkedIn (managed by extension only)
- **published**: Post has been published

## 🛡️ Safety Features

1. **Read-Only Web App**: The extension never modifies web app data directly
2. **Extension-Only Status**: Only the extension sets `linkedin_scheduled` status
3. **No Immediate Posting**: Extension ONLY schedules, never posts immediately
4. **Rate Limiting**: Configurable delays between posts
5. **Progress Tracking**: Real-time visibility into scheduling process
6. **Error Handling**: Graceful error handling with status messages

## 🐛 Troubleshooting

### Extension doesn't load
- Verify all files exist in the `extension` folder
- Check that icon files exist in `extension/icons/`
- Reload the extension in `chrome://extensions/`

### No posts showing
- Verify you're using the Content Composer AI web app on the same browser
- Check localStorage in DevTools
- Make sure posts are scheduled (not just created)
- Adjust "Days ahead" setting

### Scheduling fails
- Make sure you're on LinkedIn's feed page
- Check that you're logged into LinkedIn
- Open DevTools console to see detailed error messages
- Try manually creating a post to verify LinkedIn's UI hasn't changed

### File upload not working
- Verify files exist in IndexedDB
- Check browser console for errors
- Try scheduling posts without files first

### "Could not find element" errors
LinkedIn's UI changes frequently. If you see these errors:
1. Open an issue with the error message
2. Inspect LinkedIn's DOM to find new selectors
3. Update selectors in `linkedin-scheduler.js` or `content.js`

## 🔍 Development

### File Structure

```
extension/
├── manifest.json           # Extension configuration
├── popup.html              # Extension popup UI
├── popup.js                # Popup logic
├── styles.css              # Popup styles
├── storage-reader.js       # localStorage/IndexedDB reader
├── linkedin-scheduler.js   # Core scheduling automation
├── content.js              # Content script injected into LinkedIn
├── background.js           # Service worker
├── icons/                  # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md               # This file
```

### Key Components

1. **storage-reader.js**: Reads from Content Composer's localStorage and IndexedDB
2. **popup.js**: Manages UI, settings, and coordinates scheduling
3. **content.js**: Injected into LinkedIn pages, handles DOM manipulation
4. **linkedin-scheduler.js**: Core automation logic for LinkedIn's UI
5. **background.js**: Service worker for lifecycle management

### Debugging

1. **Popup Debug**:
   - Right-click extension icon → "Inspect popup"
   - Console logs from `popup.js` appear here

2. **Content Script Debug**:
   - Open LinkedIn page
   - Open DevTools (F12)
   - Console logs from `content.js` appear here

3. **Background Script Debug**:
   - Go to `chrome://extensions/`
   - Click "Inspect views: service worker"
   - Console logs from `background.js` appear here

### Updating Selectors

If LinkedIn changes their UI, update selectors in `content.js`:

```javascript
// Find current selectors by inspecting LinkedIn's DOM
const selectors = [
  'new-selector-1',
  'new-selector-2',
  'fallback-selector'
];
```

## 📝 Workflow Summary

1. **Content Composer Web App** → Create & schedule posts
2. **Chrome Extension** → Read posts from localStorage/IndexedDB
3. **LinkedIn** → Extension automates scheduling on LinkedIn
4. **Extension** → Marks posts as `linkedin_scheduled`
5. **Done** → Posts are scheduled on LinkedIn ✅

## 🎉 Success Indicators

- ✅ All posts show "linkedin_scheduled" status in web app
- ✅ Posts appear in LinkedIn's "Scheduled posts" section
- ✅ Progress bar reaches 100%
- ✅ Status log shows "All posts scheduled successfully!"

## ⚠️ Important Notes

1. **One-way sync**: Extension → LinkedIn (no sync back to web app)
2. **Manual verification**: Always verify posts in LinkedIn's scheduled section
3. **LinkedIn limits**: LinkedIn may have rate limits, keep delays reasonable
4. **UI changes**: LinkedIn's UI changes frequently, selectors may need updates
5. **Browser storage**: Uses same browser as web app (must be same Chrome profile)

## 🔮 Future Enhancements

- Automatic daily scheduling (cron-like)
- Multi-account support
- Post preview before scheduling
- Error retry logic
- Bulk editing of scheduled times
- Analytics and reporting

## 🤝 Support

If you encounter issues:
1. Check the Troubleshooting section
2. Open browser console for detailed errors
3. Check LinkedIn's DOM for UI changes
4. Create an issue with error logs

---

**Happy Scheduling! 🚀**
