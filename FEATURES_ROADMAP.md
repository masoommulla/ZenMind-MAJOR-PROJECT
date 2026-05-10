# 🧘 ZenMind — Feature Roadmap & Innovation Blueprint

> This document tracks all planned features to be implemented one by one.
> **Last updated:** 2026-05-10 — Feature 1 (Wellness Resource Hub) completed.  
> Each feature is described in full detail including admin + user side, tech stack notes, and priority tier.

---

## Status Legend
- `🟢 READY` — Fully specced, ready to implement next
- `🟡 PLANNED` — Designed but awaiting turn in queue  
- `⚪ IDEA` — Brainstormed, needs refinement before build

---

## Feature Priority Tiers

| Tier | Label | Meaning |
|------|-------|---------|
| P0 | Critical / Flagship | Core differentiator, implement immediately |
| P1 | High Value | Adds significant unique value |
| P2 | Enhancement | Improves UX/engagement |
| P3 | Nice-to-have | Future polish |

---

---

# 🟢 FEATURE 1 — Wellness Resource Hub
**Priority:** P0 · **Status:** READY TO IMPLEMENT

## Overview
A curated media library where the **Admin uploads wellness resources** (videos, audio, images, links) and **users consume them** in a beautiful, filterable card-based UI — all within the ZenMind platform. No external redirects for media; everything plays in-app.

This is a **major differentiator** from traditional therapy booking apps that only list therapists. ZenMind becomes an active wellness content platform.

---

## 🔧 Admin Side — Resource Management (in AdminDashboard > Content Management tab)

### New Sub-Tab: "Resources"
Add a new sub-tab button alongside the existing `Approval Queue`, `Live Stories`, `Site Stats` tabs inside `ContentManagement`.

### Admin Upload Form
When admin clicks **"+ Add Resource"**, a slide-in panel or modal opens with the following fields:

| Field | Type | Notes |
|-------|------|-------|
| **Title** | Text input | Required. E.g. "5-Minute Breathing Exercise" |
| **Description** | Textarea | Short description shown on the card |
| **Resource Type** | Dropdown | `video` / `audio` / `image` / `link` |
| **Upload or URL** | Conditional (see below) | Depends on type selected |
| **Tags / Category** | Multi-select or checkboxes | E.g. Anxiety, Sleep, Stress, Mindfulness, Motivation |
| **Thumbnail** | Image upload | Only for `link` type; auto-fetched for YouTube |

### Conditional Input Logic (Upload vs URL)
- **Video**: Admin can either:
  - Upload a video file from local storage (`.mp4`, `.webm`, `.mov`)
  - OR paste a **YouTube URL** — system auto-fetches thumbnail and stores embed URL
- **Audio**: Admin can either:
  - Upload an audio file (`.mp3`, `.wav`, `.ogg`)
  - OR paste a URL to an external audio stream
- **Image**: Upload an image file (`.jpg`, `.png`, `.gif`, `.webp`)
- **Link**: Paste any URL (article, website, etc.) + manual thumbnail upload

### Admin Resource List View
Below the Add form, show all existing resources in a compact table/list:
- Columns: Thumbnail · Title · Type Badge · Date Added · Views count · Actions
- Actions: Edit · Delete
- Sorting: Newest first by default

### Sample Seed Data (to be pre-loaded by developer)
The following resources will be pre-loaded so the user dashboard is not empty:

```
1. Title: "Box Breathing for Instant Calm"
   Type: video
   URL: https://www.youtube.com/watch?v=tEmt1Znux58
   Tags: Anxiety, Breathing, Stress

2. Title: "10-Minute Body Scan Meditation"
   Type: audio  
   URL: https://www.youtube.com/watch?v=u4gZgnmkskw
   Tags: Mindfulness, Sleep, Relaxation

3. Title: "The Science of Happiness — TED Talk"
   Type: link
   URL: https://www.ted.com/talks/dan_gilbert_the_surprising_science_of_happiness
   Thumbnail: [ted.com thumbnail]
   Tags: Motivation, Happiness

4. Title: "Morning Sunlight & Mental Health"
   Type: image
   Tags: Wellness, Lifestyle
   
5. Title: "Sleep Hygiene Guide"
   Type: link
   URL: https://www.sleepfoundation.org/sleep-hygiene
   Tags: Sleep

6. Title: "Progressive Muscle Relaxation"
   Type: audio
   URL: https://www.youtube.com/watch?v=1nZEdqcGvsE
   Tags: Anxiety, Relaxation

7. Title: "Gratitude Journaling — Why It Works"
   Type: video
   URL: https://www.youtube.com/watch?v=WPPPFqsECz0
   Tags: Motivation, Mindfulness

8. Title: "Understanding Panic Attacks"
   Type: link
   URL: https://www.mind.org.uk/information-support/types-of-mental-health-problems/anxiety-and-panic-attacks/panic-attacks/
   Tags: Anxiety

9. Title: "Calm Your Mind — Lo-fi Music"
   Type: audio
   URL: https://www.youtube.com/watch?v=jfKfPfyJRdk
   Tags: Focus, Relaxation, Sleep

10. Title: "Affirmations for Self-Worth"
    Type: video
    URL: https://www.youtube.com/watch?v=iRoI2vxOoqU
    Tags: Self-Esteem, Motivation
```

---

## 👤 User Side — Resource Hub Dashboard Tab

### New Nav Tab: "Resources" (with 📚 or 🎯 icon)
Add a new tab `resources` to the `NAV_ITEMS` list in `Dashboard.tsx`.

### Page Layout
The Resources page has a **compact fixed header** (minimal height ~56–64px) with filters, and the remaining space is used entirely for the resource cards grid.

```
┌──────────────────────────────────────────────────────────────┐
│  📚 Resource Hub           [Type ▼]  [Sort ▼]   [🔍 Search] │  ← Fixed header, ~56px
├──────────────────────────────────────────────────────────────┤
│  ⭐ My Favourites  (sub-section, collapsible or separate row) │  ← Sub-header strip
├──────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐             │
│  │ card   │  │ card   │  │ card   │  │ card   │             │  ← Scrollable card grid
│  └────────┘  └────────┘  └────────┘  └────────┘             │
│  ...                                                          │
└──────────────────────────────────────────────────────────────┘
```

### Filter Bar (Fixed Header)
Three filter controls, inline, compact:

1. **Type Filter** — Dropdown:  
   `All Types` / `🎬 Video` / `🎵 Audio` / `🖼️ Image` / `🔗 Link`

2. **Sort Filter** — Dropdown:  
   `Most Recent` / `Oldest First` / `Most Viewed`

3. **Search** — Optional small search input (filters by title)

### Sub-Header: "⭐ My Favourites"
- A **horizontally scrollable strip** or a **toggle section** just below the filter bar
- Shows only resources the user has heart-marked
- Each favourite card has the same card design as the main grid
- Empty state: "No favourites yet — tap ❤️ on any resource to save it here"

### Resource Cards (Main Grid)
Each card displays:
- **Thumbnail** (full-width top section of card)
  - YouTube videos → show exact YouTube thumbnail (`https://img.youtube.com/vi/{VIDEO_ID}/maxresdefault.jpg`)
  - Uploaded videos → show a video preview frame or a green gradient placeholder
  - Audio → show a waveform/music icon illustration
  - Image → show the image itself
  - Link → show the uploaded thumbnail or a domain favicon
- **Type Badge** — small coloured pill in corner (🎬 Video / 🎵 Audio / 🖼️ Image / 🔗 Link)
- **Title** — bold, 2-line max, truncated
- **Description** — 2-line excerpt, muted text
- **Category Tags** — coloured pills (Anxiety, Sleep, etc.)
- **❤️ Favourite Button** — heart icon, top-right of card, toggles saved state (persisted to DB per user)
- **▶ Play / Open Button** — action CTA at card bottom

### In-App Media Player
When user clicks Play/Open:
- **Video (uploaded file)**: Opens a modal with an HTML5 `<video>` player. Controls: play/pause, seek, volume, fullscreen. Never redirects to external page.
- **Video (YouTube URL)**: Opens a modal with a YouTube `<iframe>` embed (using `youtube-nocookie.com` for privacy). Looks exactly like watching YouTube but inside the app.
- **Audio (uploaded file)**: Opens a bottom sheet or modal with an HTML5 `<audio>` player styled beautifully (waveform animation, play/pause, seek bar, time display).
- **Audio (YouTube URL)**: Opens a YouTube embed in audio mode (or show iframe for the audio/music video).
- **Image**: Opens a lightbox/fullscreen image viewer with zoom capability.
- **Link**: Opens in a **new browser tab** (external links are the only exception — they can't be embedded safely).

### View Count Tracking
Every time a user opens a resource (play/open action), increment a `views` counter in the DB.

---

## 🗄️ Backend — API Endpoints Needed

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/resources` | Fetch all resources (user-facing, paginated) |
| POST | `/admin/resources` | Create new resource (admin only) |
| PUT | `/admin/resources/:id` | Edit resource (admin only) |
| DELETE | `/admin/resources/:id` | Delete resource (admin only) |
| POST | `/resources/:id/view` | Increment view count |
| POST | `/resources/:id/favourite` | Toggle user favourite |
| GET | `/resources/favourites` | Get current user's favourited resources |

## 🗃️ MongoDB Schema — Resource

```js
{
  _id: ObjectId,
  title: String,             // required
  description: String,
  type: String,              // 'video' | 'audio' | 'image' | 'link'
  sourceType: String,        // 'upload' | 'youtube' | 'url'
  url: String,               // YouTube URL or external URL
  fileData: String,          // base64 for uploaded files (or use GridFS/S3)
  fileMime: String,          // e.g. 'video/mp4', 'audio/mp3'
  thumbnailData: String,     // base64 thumbnail (for uploaded/link types)
  thumbnailMime: String,
  youtubeVideoId: String,    // extracted from YouTube URL
  tags: [String],            // e.g. ['Anxiety', 'Sleep']
  views: Number,             // default 0
  createdAt: Date,
  updatedAt: Date,
}
```

```js
// UserFavourites (embedded in user doc or separate collection)
{
  userId: ObjectId,
  resourceIds: [ObjectId],
}
```

---

## 🎨 Design Notes
- Cards: rounded-3xl, subtle shadow, hover scale-[1.02] transition
- YouTube thumbnails: aspect-ratio 16/9, object-fit cover, same visual as YouTube browse
- Type badges: color-coded — Video: green, Audio: purple, Image: blue, Link: orange
- Player modal: dark overlay, glassmorphism modal, centered, max-w-3xl
- Favourites heart: filled red when active, outline when not
- Card grid: responsive — 1 col mobile, 2 col tablet, 3-4 col desktop
- Header: sticky, backdrop blur, minimal padding, total height ≤ 64px

---

---

# 🟡 FEATURE 2 — Smart Mood Journal & AI Insights
**Priority:** P1 · **Status:** PLANNED

## Overview
A private journaling space where users write daily entries, and Zeni AI automatically:
- Detects emotional tone (positive/neutral/negative)
- Tags entries with mood keywords
- Shows a monthly emotional heatmap calendar
- Gives weekly AI-generated insight summaries like "This week you mentioned 'work stress' 4 times — here's what might help"

## Admin Side
- View anonymized aggregate mood trends (no individual entries visible)
- Can see platform-wide mood distribution chart

## User Side
- Private journal tab in Dashboard
- Rich text editor (minimal, clean)
- Mood selector using an **icon library** (e.g. Lucide React icons or a dedicated React emoji picker library like `emoji-mart`) — avoid raw Unicode mobile-style emoji characters in UI components
- AI Insights card: weekly summary + suggestions
- Monthly heatmap: green = positive, red = negative, grey = no entry
- Export journal as PDF

## Why It's Unique
Traditional apps don't offer AI journaling. This makes ZenMind an active daily companion, not just a booking tool.

---

# 🟡 FEATURE 3 — Guided Wellness Programs (Courses)
**Priority:** P1 · **Status:** PLANNED

## Overview
Admin creates multi-day structured wellness programs (e.g. "7-Day Anxiety Relief", "14-Day Sleep Reset"). Users can enroll and follow a day-by-day plan.

## Admin Side
- Create programs with name, duration, description, cover image
- Add daily "modules" to each program: each module = a resource (video/audio/text) + a short task/reflection prompt
- Publish/unpublish programs

## User Side
- Programs tab or section in Resource Hub
- Enroll button → tracks progress (Day 1/7 complete)
- Daily unlock: each day's module unlocks after 24h (or admin can allow all-access)
- Progress bar per program
- Certificate of completion (simple PDF/badge)

## Why It's Unique
Structured self-help programs are found in apps like Headspace/Calm but NOT in therapy booking platforms. ZenMind bridges the gap.

---

# 🟡 FEATURE 4 — Peer Support Circles (Group Chat Rooms)
**Priority:** P1 · **Status:** PLANNED

## Overview
Moderated group spaces organized by topic (Anxiety Support, Teen Stress, Grief & Loss, etc.) where users can text-chat with peers in real-time.

## Admin Side
- Create/manage circles (name, description, topic category, max members)
- Assign a Moderator (can be a therapist on the platform)
- View chat logs, ban/mute users

## User Side
- Discover circles in a "Community" section
- Join up to 3 circles
- Real-time group chat (WebSocket, similar to existing UserChat)
- Anonymous posting option
- React to messages with emojis
- Report a message

## Why It's Unique
Most therapy apps are 1-on-1. Group peer support adds community layer and keeps users coming back daily.

---

# 🟡 FEATURE 5 — Therapist-Curated Reading Lists
**Priority:** P1 · **Status:** PLANNED

## Overview
Each therapist on the platform can curate their own "Reading List" or "Resource Collection" — a set of recommended resources (from the Resource Hub, or external book links) that users can browse per therapist.

## Admin Side
- Enable/disable this feature per therapist

## Therapist Side
- New section in TherapistDashboard: "My Resource Picks"
- Add resources from the main Resource Hub OR paste external book/article URLs
- Write a short note on why they recommend it

## User Side
- On each therapist's profile card in Therapy Hub: "📚 Dr. X's Picks" button
- Opens a side panel with the therapist's curated list
- Can favourite individual picks

## Why It's Unique
Humanizes therapists beyond just "available slots". Users build trust before booking.

---

# 🟡 FEATURE 6 — Wellness Goal Tracker
**Priority:** P1 · **Status:** PLANNED

## Overview
Users set personal wellness goals (e.g. "Meditate 10 mins daily", "Journal 3x a week", "Exercise 30 mins") and track them with check-ins, streaks, and visual progress.

## Admin Side
- Can suggest default goal templates that appear when user sets up goals

## User Side
- Goals tab or card in Dashboard
- Create goal: name, type (daily/weekly), target count, icon/emoji
- Daily check-in button: "Mark done today"
- Streak counter (fire emoji 🔥 for consistency)
- Weekly progress ring chart
- Nudge notifications (browser push or in-app): "Don't break your streak!"

## Why It's Unique
Gamification of mental wellness habits. Keeps users engaged between therapy sessions.

---

# 🟡 FEATURE 7 — AI Crisis Detector & Safe Response
**Priority:** P0 (safety-critical) · **Status:** PLANNED

## Overview
When a user types specific keywords in Zeni AI chat that indicate a mental health crisis (self-harm, suicide ideation, extreme distress), the system:
1. Pauses normal AI flow
2. Shows a calm, non-alarmist crisis support card
3. Provides: Vandrevala Helpline (1860-2662-345), iCall, NIMHANS numbers
4. Offers: "Talk to a therapist now (emergency slot)"
5. Logs the event (anonymized) for admin awareness

## Admin Side
- Dashboard widget: Crisis Alerts count for the week (anonymized)
- Can edit the crisis resource list (helpline numbers, links)

## User Side
- Seamless — appears naturally in chat flow, not jarring
- "You are not alone. Here are people who can help right now." tone

## Why It's Unique
Moral and legal responsibility. No other small-scale therapy platform does this properly. Makes ZenMind genuinely safe.

---

# 🟡 FEATURE 8 — Session Preparation & Post-Session Toolkit
**Priority:** P2 · **Status:** PLANNED

## Overview
Before each booked therapy session, ZenMind sends the user a "Preparation Guide":
- 3 reflection prompts to think about
- A breathing exercise (Resource Hub link)
- "What do you want to get out of today's session?"

After session, a "How did it go?" check-in:
- Mood rating slider
- Key takeaways text box (private)
- Resource suggestions based on session topic

## Admin Side
- Can customize preparation prompts per therapist specialty
- View anonymized aggregate post-session mood data

## Why It's Unique
No booking platform guides users on HOW to use therapy. This maximizes session ROI for users.

---

# 🟡 FEATURE 9 — Wellness Store (Digital Downloads)
**Priority:** P2 · **Status:** PLANNED

## Overview
A lightweight "store" where admin uploads free or premium wellness resources as downloadable assets:
- Guided meditation scripts (PDF)
- Printable journal templates
- Affirmation card packs (PDF/image)
- Sleep story audio files

Free items: instant download.  
Premium items: unlock after X sessions booked OR via small one-time payment (Razorpay).

## Admin Side
- Upload assets, set price (Rs.0 for free or Rs.X for premium)
- Track downloads per item

## User Side
- Store tab or section
- Free: Download button
- Premium: Pay or Unlock button
- My Downloads: library of purchased/downloaded items

## Why It's Unique
Monetization model beyond therapy commissions. Adds self-service wellness value.

---

# 🟡 FEATURE 10 — Anonymous Therapist Match Quiz
**Priority:** P2 · **Status:** PLANNED

## Overview
A 5-question onboarding quiz (displayed the first time user opens Therapy Hub) that recommends the best-matched therapist based on:
- Primary concern (anxiety / depression / relationships / etc.)
- Preferred session style (talk-therapy / CBT / mindfulness-based)
- Gender preference for therapist
- Language preference
- Session frequency goal

Shows "Your Top 3 Matches" with match % score.

## Admin Side
- Set quiz question answers per therapist profile
- Configure matching weights

## Why It's Unique
Dating-app-style matching for therapy. Dramatically reduces decision paralysis in Therapy Hub. Highly viral/shareable.

---

---

## Implementation Queue

| # | Feature | Priority | Status | Notes |
|---|---------|----------|--------|-------|
| 1 | **Wellness Resource Hub** | P0 | ✅ DONE (2026-05-10) | Admin upload form + YouTube thumbnail + user card grid + in-app player + favourites |
| 2 | Smart Mood Journal & AI Insights | P1 | PLANNED | After Feature 1 |
| 3 | Guided Wellness Programs | P1 | PLANNED | Depends on Resource Hub |
| 4 | Peer Support Circles | P1 | PLANNED | WebSocket infrastructure needed |
| 5 | Therapist-Curated Reading Lists | P1 | PLANNED | Depends on Resource Hub |
| 6 | Wellness Goal Tracker | P1 | PLANNED | — |
| 7 | AI Crisis Detector | P0 | PLANNED | Safety-critical, needs care |
| 8 | Session Preparation Toolkit | P2 | PLANNED | After core features |
| 9 | Wellness Store | P2 | PLANNED | Needs payment integration |
| 10 | Anonymous Therapist Match Quiz | P2 | PLANNED | — |

---

## Notes for Developer
- When a feature is built, update its Status to DONE and add completion date.
- Keep all implementation details in this file so future builds stay consistent.
- Each feature should be implemented as isolated components and added to Dashboard/AdminDashboard via the existing tab navigation pattern.
- Always maintain dark mode support.
- Always use the existing ZenMind color system: #0d5d3a primary green, #0a2617 dark text, #f7fbf8 light bg.
