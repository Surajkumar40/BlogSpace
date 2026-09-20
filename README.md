# BlogSpace

[![CI](https://github.com/Surajkumar40/BlogSpace/actions/workflows/ci.yml/badge.svg)](https://github.com/Surajkumar40/BlogSpace/actions/workflows/ci.yml)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)
![Appwrite](https://img.shields.io/badge/Backend-Appwrite-f02e65?logo=appwrite&logoColor=white)

A full-stack blogging platform. Readers can browse and search stories without an account; writers sign up to draft, publish and manage posts with a rich-text editor; admins get a dashboard for moderation and analytics.

**Live demo:** https://blog-space-red.vercel.app

<!-- Add a screenshot or a short demo GIF here, e.g.  ![BlogSpace demo](docs/demo.gif) -->

## Features

**For readers**
- Browse the home page, explore all posts, and read full articles with no sign-up
- Search and filter by category
- Reading-progress bar and related posts on every article

**For writers** (signed in)
- Rich-text editor built on Tiptap: headings, lists, links, highlights, alignment, images and a live character count
- Draft-and-publish workflow: save drafts, edit them later, publish when ready
- Cover-image upload to Appwrite Storage
- Profile page with avatar upload, edit profile, change password
- Personalisation: theme, font size and accent colour

**For admins**
- Dashboard with post, draft, user and message overviews and simple analytics
- Moderation: delete posts, drafts and contact messages
- Access is controlled by an Appwrite **user label** (see [Admin access](#admin-access))

**Accounts & platform**
- Email/password sign-up and login, password recovery by email, protected routes
- Contact form that stores messages in the database (and reports failures to the visitor)
- Responsive layout, 404 page, route-level code splitting

## Tech stack

| Layer | Technology |
| --- | --- |
| UI | React 19, React Router 7, Tailwind CSS 4, React Icons |
| Editor | Tiptap 3 |
| Backend (BaaS) | Appwrite: Auth, Databases, Storage |
| Build & tooling | Vite 8, ESLint 9 |
| Testing | Vitest, React Testing Library, user-event |
| CI / hosting | GitHub Actions, Vercel |

## Architecture

```
Browser (React SPA on Vercel)
   │  Appwrite Web SDK
   ▼
Appwrite Cloud
   ├─ Auth       email/password sessions, user labels (roles)
   ├─ Databases  posts · drafts · messages · profiles
   └─ Storage    cover images and avatars
```

There is no custom server. Authorisation is enforced by **Appwrite collection permissions**, and the UI mirrors those rules (for example the admin page checks the `admin` label).

## Getting started

Requires Node.js 20.19 or newer.

```bash
git clone https://github.com/Surajkumar40/BlogSpace.git
cd BlogSpace
npm install
cp .env.example .env     # then fill in your Appwrite IDs (see below)
npm run dev              # http://localhost:5173
```

### Appwrite setup

1. Create an Appwrite project and add a **Web platform** for `localhost` and your deployed domain.
2. Create one database with four collections and a storage bucket:

| Collection | Attributes (all strings unless noted) |
| --- | --- |
| `posts` | `title`, `content` (large text), `category`, `author`, `userId`, `excerpt`, `imageId`, `readTime` |
| `drafts` | same as `posts` |
| `messages` | `name`, `email`, `phone`, `subject`, `message`, `userId` |
| `profiles` | `name`, `email`, `userId`, `bio` |

3. Put the project, database, collection and bucket IDs in `.env` (the variable names are listed in [`.env.example`](.env.example)).
4. Set collection permissions. Recommended:

| Collection | Create | Read | Update / Delete |
| --- | --- | --- | --- |
| `posts` | Users | **Any** (so guests can read) | Document security (author) + `label:admin` |
| `drafts` | Users | Document security (author) + `label:admin` | Document security (author) + `label:admin` |
| `messages` | Any (contact form) | `label:admin` only | `label:admin` only |
| `profiles` | Users | `label:admin` (+ document security for the owner) | Document security (owner) + `label:admin` |
| Storage bucket | Users | Any | File security (owner) + `label:admin` |

If `posts` is not readable by guests, the app still works: signed-out visitors see the built-in sample posts instead of real ones.

### Admin access

Admin access is granted by a **label**, not by a password or PIN in the browser.

1. Appwrite Console → **Auth → Users** → open your user → **Labels** → add `admin`.
2. Sign out and back in. The **Admin dashboard** now opens for that user.
3. Make sure the collection permissions above include `label:admin`. That is what actually protects the data; the label check in the UI is only a convenience.

> Anything in a `VITE_*` variable is bundled into the public JavaScript, so it must never hold a secret. That is why the older PIN-based admin gate was removed.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint (zero errors expected) |
| `npm test` | Run the unit and component tests once |
| `npm run test:watch` | Tests in watch mode |

## Testing

Tests cover the shared helpers, the admin role check, the protected-route redirect, the post card, the contact form (validation, success and failure paths), admin access control (non-admins never trigger admin data requests), and app-level routing for signed-out visitors (public browsing, redirect to login, 404). CI runs lint, tests and the build on every push and pull request.

## Performance

Pages are loaded on demand with `React.lazy`, and the editor only downloads when someone opens the write page.

| | Before | After |
| --- | --- | --- |
| Main JavaScript bundle | 913 kB (267 kB gzip) | 365 kB (112 kB gzip) |
| Editor (Tiptap) | inside the main bundle | separate 124 kB gzip chunk, loaded on `/write-post` only |

## Project structure

```
src/
  components/   Navbar, Footer, PostCard, PostGrid, RichTextEditor, ProtectedRoute …
  context/      AuthContext (session + avatar)
  lib/          appwrite.js (client), authService.js, postService.js
  pages/        route-level pages (Home, ExplorePosts, PostDetail, WritePost, AdminDashboard …)
  utils/        helpers (text, dates, roles, theme)
  test/         Vitest setup
```

## Known limitations

- **Delete account** disables the account (Appwrite's browser SDK cannot hard-delete a user). Published posts stay up; an admin can remove them.
- Roles are a single `admin` label; there is no editor/moderator role yet.
- The sample posts shown next to real ones are placeholders defined in `src/App.jsx`.
- Tests use mocked Appwrite calls; there are no end-to-end browser tests yet.

## Roadmap

- Comments and likes
- Migrate to TypeScript
- End-to-end tests (Playwright)
- Pagination for large post lists

## Author

Built by **Suraj Kumar**: [GitHub](https://github.com/Surajkumar40) · [LinkedIn](https://www.linkedin.com/in/suraj-kumar-16069726b/)
