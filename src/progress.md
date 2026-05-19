# BlogSpace — Project Progress & Context Document

> This document is written so any AI assistant can read it and immediately understand
> the full project — what it is, what's built, what's left, and the exact tech stack.
> Last updated: May 2026

---

## 🧠 Project Overview

**BlogSpace** is a full-stack blogging platform built with React + Appwrite.
It allows users to write, publish, and read blog posts with rich text formatting.
It has a full authentication system, admin dashboard, file storage, and contact system.

**Live status:** Running on localhost — deployment in progress
**Goal:** Production-grade blogging platform for portfolio / academic submission

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v6 |
| Backend / Auth / DB | Appwrite Cloud (Singapore region) |
| File Storage | Appwrite Storage |
| Rich Text Editor | TipTap (with extensions) |
| State Management | React Context (AuthContext) |
| Icons | react-icons (FaUser, FaCog etc.) |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── Navbar.jsx           ✅ Responsive, slide-in drawer, all links working
│   ├── Footer.jsx           ✅ Done
│   ├── PostCard.jsx         ✅ White card, hover shadow, author, readTime
│   ├── PostGrid.jsx         ✅ Resolves imageId → URL for Appwrite posts
│   ├── ProtectedRoute.jsx   ✅ Uses AuthContext (no prop drilling)
│   ├── ScrollToTop.jsx      ✅ Done
│   └── RichTextEditor.jsx   ✅ TipTap editor with full toolbar
│
├── context/
│   └── AuthContext.jsx      ✅ Provides user, isLoggedIn, login(), logout()
│
├── lib/
│   ├── appwrite.js          ✅ Client, all service exports, all IDs from .env
│   ├── authService.js       ✅ signup(), login(), logout(), getCurrentUser()
│   └── postService.js       ✅ All CRUD for posts, drafts, images
│
├── pages/
│   ├── Home.jsx             ✅ Hero, Latest Posts, Features, About, Feedback, Contact CTA
│   ├── Login.jsx            ✅ Appwrite auth, error messages
│   ├── Signup.jsx           ✅ Appwrite auth + saves to profiles collection
│   ├── ForgotPassword.jsx   ✅ Real Appwrite recovery email
│   ├── ResetPassword.jsx    ✅ Handles userId+secret token from email link
│   ├── ExplorePosts.jsx     ✅ Search, filter by category, navigate to /post/:id
│   ├── PostDetail.jsx       ✅ Renders rich HTML, related posts, copy link
│   ├── WritePost.jsx        ✅ TipTap editor, image upload, publish/draft
│   ├── MyPosts.jsx          ✅ User's posts from Appwrite, edit/delete
│   ├── Drafts.jsx           ✅ User's drafts from Appwrite, continue/delete
│   ├── ProfilePage.jsx      ✅ Appwrite account prefs, bio/location/website
│   ├── Settings.jsx         ✅ Theme, font size, accent colour (UI only)
│   ├── AccountPages.jsx     ✅ EditProfile, ChangePassword (real Appwrite), DeleteAccount
│   ├── AdminDashboard.jsx   ✅ Overview, Posts, Drafts, Users, Messages, Analytics
│   ├── Contact.jsx          ✅ Saves messages to Appwrite messages collection
│   ├── CategoryPages.jsx    ✅ Tech and Lifestyle pages with article grids
│   ├── NotFound.jsx         ✅ 404 with countdown redirect
│   └── [other pages]        ✅ Done
│
├── utils/
│   ├── utils.js             ✅ wordCount, formatDate, getInitials, safeLocalGet
│   └── theme.js             ✅ CATEGORY_COLORS, CATEGORIES array
│
├── App.jsx                  ✅ AuthProvider, all routes, SEED_POSTS, refreshPosts()
├── main.jsx                 ✅ Entry point
└── index.css                ✅ Tailwind import
```

---

## 🗄️ Appwrite Collections

### Database: `blogspace-db`

| Collection | Purpose | Key Attributes |
|------------|---------|---------------|
| `posts` | Published blog posts | title, content (HTML), category, author, userId, excerpt, imageId, readTime |
| `drafts` | Unpublished drafts | same as posts |
| `messages` | Contact form submissions | name, email, phone, subject, message, userId |
| `profiles` | User profiles (created on signup) | name, email, userId, bio |

### Storage Bucket: `post-images`
- Stores cover images uploaded by users
- Permissions: Any → Read, Users → Create/Read/Update/Delete

---

## 🔐 Environment Variables (.env)

```
VITE_APPWRITE_PROJECT_ID=
VITE_APPWRITE_DATABASE_ID=
VITE_APPWRITE_POSTS_ID=
VITE_APPWRITE_DRAFTS_ID=
VITE_APPWRITE_BUCKET_ID=
VITE_APPWRITE_MESSAGES_ID=
VITE_APPWRITE_PROFILES_ID=
VITE_ADMIN_EMAIL=admin@blogspace.com
VITE_ADMIN_PIN_HASH=240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
```

> Note: VITE_ADMIN_PIN_HASH is SHA-256 of "admin123"
> Appwrite endpoint: https://sgp.cloud.appwrite.io/v1 (Singapore region)

---

## ✅ Completed Features

### Authentication
- [x] Signup with name, email, password
- [x] Password strength bar (8 chars, number, special char, uppercase)
- [x] Login with real Appwrite credential verification
- [x] Logout (deletes Appwrite session)
- [x] Forgot Password — sends real Appwrite recovery email
- [x] Reset Password page — handles userId+secret token from email
- [x] Change Password — uses account.updatePassword(newPw, oldPw)
- [x] Remember me on login
- [x] Session persists on page refresh (Appwrite cookie session)
- [x] Duplicate email check on signup

### Posts
- [x] Create post with TipTap rich text editor
- [x] Full toolbar: Bold, Italic, Underline, Strike, H1/H2/H3, Lists, Blockquote, Code block, Alignment, Links, Images, Undo/Redo
- [x] Cover image upload to Appwrite Storage
- [x] Edit existing post
- [x] Delete post with confirmation
- [x] Save as draft
- [x] Publish draft (moves draft → post)
- [x] Word count + estimated read time
- [x] Posts stored as HTML in Appwrite

### Reading / Browsing
- [x] Home page with latest posts grid
- [x] Explore Posts with search + category filter
- [x] Individual post detail page at /post/:id
- [x] Rich HTML content rendered beautifully in PostDetail
- [x] Related posts sidebar
- [x] Copy post link button
- [x] Seed posts (14 default posts) merged with real user posts
- [x] Images show correctly for both Appwrite posts and seed posts

### Admin Dashboard (route: /admin)
- [x] Hashed PIN login (SHA-256) with lockout after 3 failed attempts
- [x] Session-based — expires when browser tab closes
- [x] Overview tab: stats cards, recent posts, category chart
- [x] Posts tab: all posts from all users, edit/delete
- [x] Drafts tab: all drafts, edit/delete
- [x] Users tab: all registered users with post count and join date
- [x] Messages tab: all contact form submissions, expand/delete, reply via email
- [x] Analytics tab: publish rate, avg word count, monthly bar chart, category distribution

### Profile & Settings
- [x] Profile page: bio, location, website saved to Appwrite preferences
- [x] Edit profile name (updates Appwrite account)
- [x] Settings: theme toggle, font size, accent colour (UI-only, no backend)
- [x] Delete account (clears session + localStorage)

### UI / UX
- [x] Responsive Navbar with slide-in mobile drawer
- [x] All navbar links working via navigate() — no dummy links
- [x] User name + email shown in navbar dropdown and mobile drawer
- [x] Grouped sections in mobile drawer (Navigation, Content, Account)
- [x] 404 Not Found page with 10-second countdown redirect
- [x] Page titles on all 15+ pages (document.title)
- [x] Loading spinners on all data fetch operations
- [x] Toast notifications (success/error) on write/publish/save
- [x] Confirm before delete on all destructive actions
- [x] Scroll to top on route change
- [x] Scrollspy on home page sections
- [x] PostCard hover shadow effect
- [x] README.md with setup instructions

### Bug Fixes Applied (May 2026)
- [x] `postService.js` — added `Query.limit(100)` to `getAllPosts()` and `getAllDrafts()` — fixes Appwrite 25-doc cap
- [x] `MyPosts.jsx` — excerpt and wordCount now strip HTML before display
- [x] `Drafts.jsx` — content preview already had HTML strip (was pre-fixed)

---

## ❌ Not Yet Built (Remaining Features)

### High Priority
- [ ] **Comments** — let users comment on posts. Needs new Appwrite `comments` collection
  - Attributes: `postId`, `userId`, `authorName`, `content`, `$createdAt`
  - UI: comment form + list below PostDetail
  - ⚠️ Create collection in Appwrite Console first, then code

- [ ] **Likes / Hearts** — add likes count to posts
  - Add `likes` integer attribute to `posts` collection in Appwrite
  - One click to like, one to unlike
  - Show count on PostCard and PostDetail

### Medium Priority
- [ ] **Pagination** — `getAllPosts()` now fetches up to 100 but needs proper pagination for scale
  - Use `Query.limit(25)` + `Query.offset()` or cursor-based
  - Add Prev / Next buttons on ExplorePosts

- [ ] **Dark Mode** — toggle and class logic already works in Settings.jsx
  - Needs one line in `index.css`: `@variant dark (&:where(.dark, .dark *))`
  - Then add `dark:` Tailwind classes across all 15 pages + 5 components
  - Estimated time: 3–4 hours
  - **Deferred until after deployment**

- [ ] **Bookmarks / Save Posts** — users save posts to read later
  - New `bookmarks` Appwrite collection: `userId`, `postId`
  - Bookmark icon on PostCard and PostDetail

- [ ] **Public Author Profile** — `/author/:userId` page
  - Show author bio + all their posts
  - Link from PostDetail author name

- [ ] **Profile Picture Upload** — replace initials avatar with real photo
  - Store in Appwrite Storage bucket
  - Show in navbar dropdown, PostDetail, PostCard

### Low Priority / Polish
- [ ] **Tags / Hashtags** — `tags` array on post document
- [ ] **PropTypes** — add to PostCard, PostGrid, ProtectedRoute
- [ ] **Error Boundary** — wrap pages to prevent blank screen on crash
- [ ] **Search improvements** — switch to Appwrite `Query.search()` server-side
- [ ] **Feedback form** — separate from Contact, with 1–5 star rating
- [ ] **Reading Progress Bar** — thin bar at top of PostDetail tracking scroll
- [ ] **Post View Counter** — increment views on PostDetail open

---

## 🐛 Known Issues

| Issue | Location | Status |
|-------|----------|--------|
| ~~Posts cap at 25~~ | ~~postService.js~~ | ✅ Fixed — Query.limit(100) added |
| ~~HTML tags in draft preview~~ | ~~Drafts.jsx~~ | ✅ Already fixed |
| ~~HTML tags in my posts preview~~ | ~~MyPosts.jsx~~ | ✅ Fixed — excerpt + wordCount strip HTML |
| Dark mode has no effect | index.css + all pages | 🔄 Deferred — needs Tailwind v4 config + dark: classes |
| Notifications / Compact Mode | Settings.jsx | UI-only — no implementation yet |
| Appwrite CORS on deploy | Appwrite Console | ⚠️ Must add Vercel URL to Web Platforms before deploy |

---

## 🚀 Deployment Checklist (Vercel) ← CURRENT FOCUS

### Step 1 — Pre-deploy checks ← DO THIS NOW
- [ ] Test all auth flows on localhost (signup, login, forgot password, reset)
- [ ] Test post create / edit / delete end-to-end
- [ ] Test admin dashboard PIN login at `/admin`
- [ ] Confirm `npm run build` completes with no errors

### Step 2 — Environment Variables
- [ ] Create `.env.production` in project root with all `VITE_` variables (copy from `.env`)
- [ ] Double-check Appwrite endpoint is `https://sgp.cloud.appwrite.io/v1`
- [ ] Confirm `.env` and `.env.production` are both in `.gitignore` — never commit API keys

### Step 3 — Appwrite Console Setup ⚠️ CRITICAL
- [ ] Go to Appwrite Console → your project → Settings → Platforms
- [ ] Add your Vercel URL as a Web Platform (e.g. `https://blogspace.vercel.app`)
  - Without this step, Appwrite blocks all requests from live URL (CORS error)
- [ ] Verify Storage bucket permissions: Any → Read, Users → Create/Read/Update/Delete
- [ ] Verify all collection permissions are correct

### Step 4 — Deploy to Vercel
```bash
# Option A — Vercel CLI
npm install -g vercel
vercel

# Option B — GitHub (recommended)
# Push to GitHub → go to vercel.com → Import repo → Deploy
```
- [ ] Add all `VITE_` environment variables in Vercel dashboard → Settings → Environment Variables
- [ ] Set build command: `npm run build`
- [ ] Set output directory: `dist`

### Step 5 — Post-Deploy Checks
- [ ] Open live URL — home page loads correctly
- [ ] Login / Signup works on live site
- [ ] Create a test post — image upload works
- [ ] Admin dashboard accessible at `/admin`
- [ ] No CORS errors in browser console
- [ ] Test on mobile browser

---

## 📊 Overall Completion

| Category | Done | Total | % |
|----------|------|-------|---|
| Authentication | 10 | 10 | ✅ 100% |
| Post CRUD | 8 | 8 | ✅ 100% |
| Rich Text Editor | 1 | 1 | ✅ 100% |
| Image Upload | 1 | 1 | ✅ 100% |
| Admin Dashboard | 6 | 6 | ✅ 100% |
| Profile & Settings | 4 | 6 | 🔄 67% |
| UI / Responsiveness | 12 | 12 | ✅ 100% |
| Bug Fixes | 3 | 3 | ✅ 100% |
| Comments & Likes | 0 | 2 | ❌ 0% |
| Pagination | 0 | 1 | ❌ 0% |
| Deployment | 0 | 1 | ❌ 0% |
| **TOTAL** | **45** | **51** | **🔄 88%** |

---

## 📋 Recommended Order to Finish the Project

```
✅ 1. Fix known bugs (done)
🚀 2. Deploy to Vercel ← YOU ARE HERE (30 min)
3. Add Comments feature (2–3 hrs)
4. Add Likes feature (1 hr)
5. Dark Mode — Tailwind v4 config + dark: classes (3–4 hrs)
6. Pagination (1 hr)
```

**Estimated time to 100% + deployed: ~7–9 hours of focused work**

---

## 💡 Context for AI Assistants

If you are an AI reading this document to help with the project:

1. **Always use Appwrite** — do NOT suggest localStorage for any new features. All data goes to Appwrite.
2. **Appwrite region is Singapore** — endpoint is `https://sgp.cloud.appwrite.io/v1`
3. **Auth uses AuthContext** — never prop-drill isLoggedIn. Use `const { user, isLoggedIn } = useAuth()`
4. **Appwrite post IDs are `$id`** — not `id`. Always use `post.$id || post.id` to handle both Appwrite and seed posts.
5. **Content is HTML** — posts saved by TipTap are HTML strings. Use `dangerouslySetInnerHTML` to render. Use `.replace(/<[^>]*>/g, " ")` for plain text previews.
6. **Image URLs** — use `getImageUrl(fileId)` from postService.js. The URL pattern is `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileId}/view?project=${PROJECT_ID}`
7. **Navigation** — always use `navigate()` from react-router, NOT `NavLink` inside dropdowns/drawers.
8. **New collections** — when adding features like comments or likes, always ask user to create the Appwrite collection first with the right attributes and permissions before writing code.
9. **Seed posts** — 14 hardcoded posts in App.jsx (SEED_POSTS array). These merge with Appwrite posts in allPosts state. Seed posts use `id` field, Appwrite posts use `$id`.
10. **Admin PIN** — hashed with SHA-256 using crypto.subtle. Default PIN is "admin123", hash is `240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9`
11. **Tailwind v4 dark mode** — requires `@variant dark (&:where(.dark, .dark *));` in index.css before dark: classes work. Not yet implemented.
12. **HTML stripping** — always use `.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()` for content previews, not just the first replace.

---

## 💡 Quick Reference

| What | Where |
|------|-------|
| Appwrite Console | https://cloud.appwrite.io |
| Appwrite Endpoint | https://sgp.cloud.appwrite.io/v1 |
| Admin PIN | admin123 (SHA-256 hashed in .env) |
| Dev server | `npm run dev` |
| Build | `npm run build` |
| Preview build | `npm run preview` |