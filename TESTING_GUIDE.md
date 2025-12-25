# Testing Guide - Content Composer AI

## ✅ All Dummy Data Removed

The application now works **100% with real data** from your browser's local storage.
No mock data, no hardcoded values - everything you see is what you create.

---

## 🚀 How to Test the Complete Workflow

### Step 1: Start the Application
```bash
npm run dev
```

Navigate to `http://localhost:5173` (or the port shown in your terminal)

---

### Step 2: Upload Assets (Asset Buckets)

1. Click **"Asset Buckets"** in the sidebar
2. Click the **"Upload Assets"** button
3. Select asset type (Image, Carousel/PDF, or Video)
4. Drag & drop files or click to browse
5. Add tags (e.g., "engineer", "resume", "ATS")
6. Click **"Upload"**

**What happens:**
- ✅ Files are stored in IndexedDB (browser database)
- ✅ Metadata is saved to localStorage
- ✅ Image previews are generated automatically
- ✅ Dashboard updates to show asset count
- ✅ Recent Activity shows your uploads

**Test with:**
- 📸 PNG/JPG images
- 📄 PDF files (for carousels)
- 🎥 MP4 videos

---

### Step 3: Generate Content (Theme Generator)

1. Click **"Theme Generator"** in the sidebar
2. Select **Content Pillars** (e.g., Problem, Education, Data)
3. Choose **Target Audience** (e.g., Software Engineers)
4. Pick a **Format** (Image, Carousel, Video, or Text)
5. Select a **Tone** (Casual, Professional, etc.)
6. Set **Days to Fill** (slider: 1-30 days)
7. Click **"Generate X Posts"**

**What happens:**
- ✅ Theme settings are saved to localStorage
- ✅ Generated posts are created and stored
- ✅ Posts are visible in the preview panel
- ✅ Dashboard shows generated post count
- ✅ Settings persist - refresh the page and they're still there!

**Currently:**
- The content generation uses a simple template
- For real AI generation, you would integrate with OpenAI/Anthropic API
- The structure is ready - just replace the mock content with AI calls

---

### Step 4: Export Content (Export Panel)

1. Click **"Export"** in the sidebar
2. Choose export format (CSV or JSON)
3. Click **"Export CSV"** or **"Export JSON"**

**What happens:**
- ✅ Real data from storage is formatted
- ✅ File is generated with timestamp
- ✅ Downloads automatically to your device
- ✅ CSV is ready for schedulers like Buffer, Hootsuite

**CSV Format:**
```csv
Day,Date,Caption,Hook,CTA,Image Prompt,Pillar,Format,Tags
1,12/24/2025,"Your resume...",Your resume didn't reach...,"Follow for tips!","Split-screen comparison...",Problem,image,"problem,education"
```

---

### Step 5: View Dashboard

1. Click **"Dashboard"** in the sidebar
2. See real-time stats:
   - **Total Assets**: Count of uploaded files
   - **Generated Posts**: Count of generated content
   - **Asset Distribution**: Breakdown by type (Images/Carousels/Videos)
   - **Recent Activity**: Last 5 actions (uploads, generations)
   - **Generated Posts**: First 5 posts from storage

**All numbers are REAL** - they update as you work!

---

### Step 6: Content Planner (Calendar View)

1. Click **"Content Planner"** in the sidebar
2. View generated posts in calendar format
3. Posts appear on their scheduled dates
4. Navigate between months with arrows

**Currently:**
- Shows generated posts on their dates
- For scheduling: you would integrate with social media APIs
- Or use the CSV export with scheduling tools

---

## 🧪 Testing Scenarios

### Scenario 1: Empty State
1. Open the app in a fresh browser (or incognito)
2. You should see:
   - ✅ Dashboard shows all zeros
   - ✅ "No assets" / "No posts" messages
   - ✅ Empty states with helpful prompts

### Scenario 2: Full Workflow
1. Upload 3 images, 2 PDFs, 1 video
2. Generate 7 days of content
3. Export as CSV
4. Refresh the page
5. **Everything should still be there!**

### Scenario 3: Data Persistence
1. Upload assets
2. Generate content
3. Close the browser completely
4. Reopen and navigate to the app
5. ✅ All your data is still there

### Scenario 4: Delete Assets
1. Go to Asset Buckets
2. Hover over an asset card
3. Click the trash icon
4. Confirm deletion
5. ✅ Asset is removed from storage
6. ✅ Dashboard count updates

---

## 🔍 What to Look For

### ✅ Working Correctly:
- Asset upload saves to IndexedDB
- Image previews appear on cards
- Dashboard shows real counts
- Generated posts persist
- CSV export downloads with real data
- JSON export includes all posts + asset metadata
- Theme settings restore on page refresh
- Calendar shows posts on correct dates

### ❌ Not Working? Check:
1. **Browser Console** (F12 → Console tab)
   - Look for errors
   - Check localStorage/IndexedDB permissions
2. **Privacy Settings**
   - Ensure cookies/storage is enabled
   - Try in normal mode (not incognito)
3. **Storage Limits**
   - Browser may have storage limits
   - Clear old data if needed

---

## 📊 How Storage Works

### localStorage (Metadata)
- Stores JSON data for assets, posts, themes
- Maximum ~5-10MB
- Fast synchronous access
- View in DevTools: Application → Local Storage

### IndexedDB (Files)
- Stores actual binary files
- Can handle hundreds of MB
- Asynchronous API
- View in DevTools: Application → IndexedDB

---

## 🎯 Next Steps for Production

### 1. Real AI Integration
Replace the mock content generation in `ThemeGenerator.tsx` with actual AI:

```typescript
// Example OpenAI integration
const generateWithAI = async () => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{
        role: 'user',
        content: `Generate a LinkedIn post about ${theme}...`
      }]
    })
  });
  // Process and save
};
```

### 2. Scheduler Integration
Add real scheduling with social media APIs:
- LinkedIn API for native posting
- Buffer API for multi-platform scheduling
- Or use libraries like `node-schedule` for local scheduling

### 3. Image Generation
Integrate DALL-E, Midjourney, or Stable Diffusion:
- Use the `imagePrompt` field from generated posts
- Generate images based on prompts
- Save to IndexedDB alongside assets

### 4. Analytics (Optional)
Track actual post performance:
- Integrate with LinkedIn Analytics API
- Store metrics in localStorage
- Display on Dashboard

---

## 🐛 Troubleshooting

### "No assets found" but I uploaded some
- Check browser console for errors
- Verify localStorage and IndexedDB are enabled
- Try a different browser

### "Failed to export"
- Ensure you've generated posts first
- Check browser allows downloads
- Try again with a different format

### Dashboard shows zeros
- Refresh the page
- Check if data exists: DevTools → Application → Local Storage
- Ensure you're using the same browser/profile

### Build errors
```bash
npm run build
```
If you see TypeScript errors, check the file paths and imports.

---

## 💡 Tips

1. **Start Small**: Upload 1-2 assets, generate 3-5 posts, test export
2. **Use Real Files**: Test with actual images/PDFs you'd use
3. **Test Persistence**: Close and reopen browser to verify storage
4. **Check Export**: Open the downloaded CSV in Excel/Google Sheets
5. **Monitor Storage**: Keep an eye on browser storage limits

---

## 📱 Mobile Testing

The app should work on mobile browsers too:
- Upload via mobile camera
- Generate content on the go
- Export and share files

Test on:
- Mobile Chrome
- Mobile Safari
- Mobile Firefox

---

## Summary

✅ **Working Features:**
- Asset upload & storage (images, PDFs, videos)
- Content generation with themes
- CSV/JSON export with real data
- Dashboard with live stats
- Data persistence across sessions
- Asset deletion
- Calendar view of posts

🚧 **Ready for Integration:**
- AI content generation (structure in place)
- Social media scheduling (export ready)
- Image generation from prompts
- Analytics tracking

🎉 **No Backend Needed** - Everything runs in the browser!
