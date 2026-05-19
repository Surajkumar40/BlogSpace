# BlogSpace

A modern blogging platform built with React and Tailwind CSS.

## Features
- Write, edit, and delete blog posts
- Save posts as drafts and publish later
- Explore all posts with search and category filter
- User authentication (signup / login / forgot password)
- Profile page with editable bio, location, and website
- Settings page with theme, font size, and accent colour
- Admin dashboard with post analytics and management
- Responsive design — works on mobile and desktop
- 404 Not Found page with auto-redirect

## Tech Stack
- React 18 + Vite
- React Router v6
- Tailwind CSS v4
- localStorage for data persistence

## Setup

npm install
npm run dev

## Known Limitations
- No backend — all data stored in browser localStorage
- Admin credentials are demo-only (not production-safe)
- Data resets if browser storage is cleared

## Pages
| Route | Description |
|-------|-------------|
| `/` | Home with latest posts |
| `/explore-posts` | Search and filter all posts |
| `/write-post` | Create or edit a post |
| `/myposts` | Your published posts |
| `/drafts` | Your saved drafts |
| `/profile` | Your public profile |
| `/settings` | Appearance and preferences |
| `/admin` | Admin dashboard |
| `/contact` | Contact form |