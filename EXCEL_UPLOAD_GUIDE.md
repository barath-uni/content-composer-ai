# Excel Upload & Batch Scheduling Guide

## 🎯 Quick Start

### **Your Simplified Workflow:**

```
1. Upload Excel → Posts loaded
2. Upload assets → Assets matched
3. Click "Schedule Ready Posts" → All scheduled in one click
4. Done! 🎉
```

---

## 📊 Excel File Format

### **Required Column Headers (Tab-Separated):**

```
Day	Content Pillar	Topic	LinkedIn Post (Formatted)	Creative Type	CTA
```

### **Example Row:**

```
1	Problem	Why your resume gets auto-rejected	Your resume never reached a human...	Text + bold hook graphic	Link in comments
```

---

## 🔧 How It Works

### **1. Excel Upload**

**What happens:**
- Parses your Excel/CSV file
- Converts to GeneratedPost objects
- Maps Creative Type to format:
  - "Text + graphic" → `image`
  - "PDF/Carousel" → `carousel`
  - "Video" → `video`
  - Anything else → `text`
- Extracts hook from first line of LinkedIn Post
- Creates tags from Content Pillar and Topic

**Where:** Theme Generator → "Upload from Excel" tab

---

### **2. Asset Matching**

**Automatic matching:**
1. **By Tags (Preferred):**
   - Post tagged "resume" → Asset tagged "resume"
   - Post tagged "problem" → Asset tagged "problem"

2. **Fallback (Random):**
   - If no tag match, picks first unused asset of same type
   - Image post → Any image
   - Carousel post → Any PDF
   - Video post → Any video

**Example:**
- You have 3 images tagged: `resume`, `ux`, `tech`
- Post 1 (Content Pillar: "Problem", Topic: "resume rejection") → Matches `resume` image
- Post 2 (Content Pillar: "Education", Topic: "UX mistakes") → Matches `ux` image
- Post 3 (no matching tags) → Gets `tech` image (first unused)

---

### **3. Content Status Dashboard**

**Shows:**
- ✅ **Ready Posts**: Have matching assets, can be scheduled
- ⏳ **Waiting Posts**: Missing assets
- 📅 **Scheduled Posts**: Already scheduled
- ✅ **Published Posts**: Live on LinkedIn (future)

**Breakdown by type:**
- 6 Images ready
- 3 Carousels ready
- 0 Videos (need uploads)
- 2 Text posts ready

**Action:** Click "Schedule {N} Ready Posts" → Opens batch scheduler

---

### **4. Batch Scheduling**

**Configuration Options:**

| Setting | Options | Default |
|---------|---------|---------|
| Start Date | Any future date | Tomorrow |
| Post Time | HH:MM format | 09:00 AM |
| Posts Per Day | 1, 2, or 3 | 1 |
| Interval | Daily, Custom (X days) | Daily |
| Skip Weekends | Yes / No | No |

**Examples:**

**Daily posting:**
```
Start: Dec 26, 2025
Time: 9:00 AM
Posts/Day: 1
Interval: Daily

Result:
- Post 1: Dec 26, 9:00 AM
- Post 2: Dec 27, 9:00 AM
- Post 3: Dec 28, 9:00 AM
...
```

**Multiple posts per day:**
```
Start: Dec 26, 2025
Time: 9:00 AM
Posts/Day: 2
Interval: Daily

Result:
- Post 1: Dec 26, 9:00 AM
- Post 2: Dec 26, 1:00 PM (4 hours later)
- Post 3: Dec 27, 9:00 AM
- Post 4: Dec 27, 1:00 PM
...
```

**Weekdays only:**
```
Start: Dec 26, 2025 (Thursday)
Time: 9:00 AM
Posts/Day: 1
Skip Weekends: Yes

Result:
- Post 1: Dec 26 (Thu), 9:00 AM
- Post 2: Dec 27 (Fri), 9:00 AM
- Post 3: Dec 30 (Mon), 9:00 AM ← Skipped Sat/Sun
- Post 4: Dec 31 (Tue), 9:00 AM
...
```

**Custom interval:**
```
Start: Dec 26, 2025
Time: 9:00 AM
Interval: Custom (2 days)

Result:
- Post 1: Dec 26
- Post 2: Dec 28 (2 days later)
- Post 3: Dec 30 (2 days later)
...
```

---

## 📋 Complete Workflow Example

### **Step 1: Prepare Your Excel**

Save as `.csv` or `.xlsx` with this format:

```csv
Day	Content Pillar	Topic	LinkedIn Post (Formatted)	Creative Type	CTA
1	Problem	Resume auto-reject	Your resume never reached...	Text + graphic	Link in comments
2	Education	5 resume mistakes	5 resume mistakes costing...	PDF/Carousel	Last slide CTA
3	Data	Generic vs tailored	I ran an experiment...	Data stat graphic	Link in comments
```

**Tips:**
- Use Tab (`\t`) to separate columns
- Keep LinkedIn formatting in "LinkedIn Post (Formatted)" column
- Be specific with Creative Type for better matching

---

### **Step 2: Upload Excel**

1. Go to **Theme Generator**
2. Click **"Upload from Excel"** tab
3. Click **"Choose File"**
4. Select your `.csv` or `.xlsx` file
5. System parses and shows posts immediately

**You'll see:**
```
✅ Uploaded 30 posts! 6 ready to schedule, 24 waiting for assets.
```

---

### **Step 3: Upload Assets**

1. Go to **Asset Buckets**
2. Upload your images/PDFs/videos
3. **Tag them** (important for matching!):
   - `resume`, `ux`, `tech`, `problem`, `education`, etc.
4. System auto-matches to posts

---

### **Step 4: Check Status**

1. Go to **Dashboard**
2. See **Content Status** widget:
   ```
   ✅ 6 posts ready (have assets)
   ⏳ 24 posts waiting (need assets)
   ```
3. Click **"Schedule 6 Ready Posts"**

---

### **Step 5: Batch Schedule**

**Scheduler opens:**
1. **Start Date:** Tomorrow (Dec 26)
2. **Post Time:** 9:00 AM
3. **Posts Per Day:** 1
4. **Interval:** Daily
5. **Skip Weekends:** No

**Preview shows:**
```
Day 1: Resume rejection → Dec 26, 9:00 AM
Day 2: 5 mistakes → Dec 27, 9:00 AM
Day 3: Data experiment → Dec 28, 9:00 AM
...
```

6. Click **"Schedule All Posts"**

**Result:**
```
✅ Scheduled 6 posts!
```

---

### **Step 6: View Calendar**

1. Go to **Content Planner**
2. See all scheduled posts in calendar view
3. Posts show on their scheduled dates

---

### **Step 7: Upload More Assets**

**Tomorrow, you upload 3 more images:**

1. Go to **Asset Buckets**
2. Upload 3 images
3. Tag them
4. Go to **Dashboard**

**Status updates:**
```
✅ 3 more posts ready! (now 9 total)
⏳ 21 posts waiting
```

5. Click **"Schedule 3 Ready Posts"**
6. Scheduler opens with next 3 posts
7. Starts from Dec 29 (continues from last schedule)
8. Click **"Schedule All Posts"**

---

## 🎯 Key Features

### **1. Zero Manual Clicking for Scheduling**
- Upload Excel → One click batch schedule
- No need to pick dates/times individually
- Configurable interval (1/day, 2/day, custom)

### **2. Smart Asset Matching**
- Tag-based matching (preferred)
- Random fallback within same type
- Shows what's ready vs waiting

### **3. Incremental Workflow**
- Upload 6 images today → Schedule 6 posts
- Upload 3 more tomorrow → Schedule 3 more
- No need to do everything at once

### **4. Configurable Scheduling**
- Daily, every 2 days, weekdays only
- 1-3 posts per day
- Custom start date/time
- Optimal time suggestions

---

## 📝 Excel Creative Type Mapping

| Your Creative Type | Maps To | Requires |
|-------------------|---------|----------|
| "Text + graphic" | `image` | Uploaded image |
| "Text + bold hook graphic" | `image` | Uploaded image |
| "Data stat graphic" | `image` | Uploaded image |
| "PDF/Carousel" | `carousel` | Uploaded PDF |
| "Carousel: mistakes vs fixes" | `carousel` | Uploaded PDF |
| "Video" | `video` | Uploaded video |
| "Founder story text" | `text` | Nothing (text-only) |
| Anything else | `text` | Nothing |

---

## 🚀 Pro Tips

### **1. Tag Your Assets Well**
```
Good tags: "resume", "ux", "problem", "education", "data"
Bad tags: "image1", "file2"
```
Better tags = better auto-matching

---

### **2. Use Content Pillar as Tags**
Your Excel has "Content Pillar" column. System automatically tags posts with it.
Tag assets with same names for perfect matches.

**Example:**
- Excel: Content Pillar = "Problem"
- Asset: Tagged "problem"
- ✅ Perfect match!

---

### **3. Upload in Batches**
Don't need to upload all 30 assets at once:
- Week 1: Upload 6 images → Schedule 6 posts
- Week 2: Upload 6 more → Schedule 6 more
- Etc.

---

### **4. Review Before Scheduling**
Batch scheduler shows preview of first 5 posts.
Check dates/times look correct before clicking "Schedule All Posts".

---

### **5. Edit After Upload**
All uploaded posts are editable:
1. Go to Theme Generator → "Upload from Excel" tab
2. Click "Edit" on any post
3. Modify caption, hook, CTA, linked asset
4. Save changes

---

## ❓ FAQ

### **Q: Can I use .xlsx or only .csv?**
A: Both work! The parser handles .csv, .xlsx, .xls, .tsv

### **Q: What if my Creative Type doesn't match the examples?**
A: System looks for keywords:
- Contains "carousel" or "pdf" or "slide" → carousel
- Contains "video" → video
- Contains "graphic" or "image" → image
- Otherwise → text

### **Q: What if I have more posts than assets?**
A: Only posts with matching assets become "ready". Others wait.
- 30 posts, 6 images → 6 ready, 24 waiting
- Upload 3 more images → 9 ready, 21 waiting

### **Q: Can I schedule posts without uploading Excel?**
A: Yes! Use "Generate with AI" tab or manually create posts.

### **Q: What happens if I upload twice?**
A: New upload **replaces** previous posts. If you want to add more:
1. Don't re-upload Excel
2. Just upload more assets
3. System auto-matches to waiting posts

### **Q: Can I change scheduling after clicking "Schedule All"?**
A: Yes, go to Content Planner and edit individual posts.

### **Q: Does it actually post to LinkedIn?**
A: Not yet. For now:
- Option A: Export CSV → Upload to Buffer/Hootsuite
- Option B: Copy post → Paste to LinkedIn
- Option C: (Future) Puppeteer auto-poster

---

## 🎉 Summary

**What you wanted:**
> "I don't have patience to click buttons. I want to upload Excel, upload assets, click ONE button, and everything gets scheduled."

**What you got:**
✅ Upload Excel → All posts loaded instantly
✅ Upload assets → Auto-matched by tags
✅ Click "Schedule Ready Posts" → Batch scheduler opens
✅ Click "Schedule All Posts" → All scheduled with your chosen interval
✅ Dashboard shows what's ready vs waiting
✅ Upload more assets anytime → Schedule more posts with one click

**Total clicks: 3-4**
1. Upload Excel
2. Upload assets
3. "Schedule Ready Posts"
4. "Schedule All Posts"

**vs old way: 30+ clicks** (one per post)

---

**Built and ready to use!** 🚀
