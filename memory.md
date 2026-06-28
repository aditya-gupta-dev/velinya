# Velinya — Project Memory

> **What is this file?**
> This is a knowledge-transfer document. It tells a new agent (or a returning one with no context) everything it needs to know to work on this project confidently.

---

## 1. What Velinya Is

Velinya is a **personal notes & todos PWA** (Progressive Web App). It is the owner's (Aditya's) personal productivity app.

- **Notes** are organized into **folders** (like "Work", "Ideas", etc.).
- **Todos** are organized by **month** and displayed on a **calendar grid**. Each day cell shows pending/completed status. Clicking a day opens a modal with that day's todos.
- The app uses **Google Sign-In** for authentication and **Firebase Firestore** as the backend database. All data is scoped per-user via their email.
- It is designed to be installed as a PWA on phones and desktops.

The tagline is: *"Your notes & todos, beautifully organized — everywhere you go."*

---

## 2. Tech Stack

| Layer           | Technology                                                           |
| --------------- | -------------------------------------------------------------------- |
| Framework       | **React 19** + **TypeScript 6**                                      |
| Build Tool      | **Vite 8** (with `@tailwindcss/vite` plugin)                         |
| Styling         | **Tailwind CSS v4** + custom design system ("Wise Design System")    |
| UI Components   | **shadcn/ui** (Dialog, Select, Input, Textarea, Avatar, Dropdown)    |
| Routing         | **react-router-dom v6** (BrowserRouter)                              |
| Server State    | **@tanstack/react-query v5** (queries + mutations)                   |
| Auth            | **Firebase Auth** (Google sign-in popup)                             |
| Database        | **Firebase Firestore** (NoSQL, per-user document collections)        |
| PWA             | **vite-plugin-pwa** (autoUpdate service worker, manifest, icons)     |
| Package Manager | **bun** (bun.lock present), also has `package-lock.json` for npm     |
| Font            | Manrope (display/headings), Inter (body/sans)                        |

---

## 3. Project Structure

```
velinya/
├── public/                     # Static assets (app-icon.jpg, pwa/ icons & screenshots)
├── src/
│   ├── App.tsx                 # Route definitions, ProtectedRoute, PublicRoute
│   ├── App.css                 # (minimal, mostly unused — index.css is the real stylesheet)
│   ├── index.css               # 🎨 Full design system: tokens, dark/light themes, utilities, animations
│   ├── main.tsx                # React entry point
│   ├── components/
│   │   ├── AddFolderDialog.tsx # Modal dialog for creating a new folder
│   │   ├── theme-provider.tsx  # Dark/light/system theme context
│   │   └── ui/                 # shadcn/ui primitives (button, card, dialog, dropdown, input, select, sheet, textarea, avatar)
│   ├── contexts/
│   │   └── AuthContext.tsx     # Firebase Auth provider (user, loading, signInWithGoogle, logout)
│   ├── hooks/
│   │   └── useFirestore.ts     # React Query hooks wrapping all Firestore operations
│   ├── layouts/
│   │   └── AppLayout.tsx       # Authenticated shell: header (mode switcher, avatar), FAB, <Outlet/>
│   ├── lib/
│   │   ├── firebase.ts         # Firebase app init, auth, Firestore instances (config via env vars)
│   │   ├── firestore.ts        # Raw Firestore CRUD functions (folders, notes, todos)
│   │   └── utils.ts            # cn() helper (clsx + tailwind-merge)
│   └── pages/
│       ├── LandingPage.tsx     # Public landing: app icon, title, Google sign-in button
│       ├── NotesPage.tsx       # Folder sidebar (desktop) / dropdown (mobile) + note cards grid
│       ├── NoteFormPage.tsx    # Create/edit note form (folder picker, title, description textarea)
│       ├── TodosPage.tsx       # Calendar grid + day-view modal + complete-todo modal
│       └── TodoFormPage.tsx    # Create new todo form (date, priority, title, description)
├── firebase.json               # Firebase hosting config
├── vite.config.ts              # Vite config with PWA manifest, tailwind plugin, path alias
├── components.json             # shadcn/ui config
└── package.json
```

---

## 4. Design System (the "Wise" tokens)

The design system is defined in `src/index.css`. Key color tokens:

- **`wise-green`** (`#9fe870`) — Primary brand color. Used for selected states, buttons, FAB.
- **`wise-green-hover`** (`#cdffad`) — Hover state for green elements.
- **`canvas`** / **`canvas-soft`** — Surface colors (white/light gray in light mode, dark grays in dark).
- **`ink`** / **`body`** / **`mute`** — Text hierarchy (primary → secondary → tertiary).
- **`negative`** — Red, for delete/error/pending-todo states.
- **`warning`** — Yellow, for medium-priority badges.

Themes are toggled via a `.dark` / `.light` class on the root, managed by `theme-provider.tsx` and persisted in `localStorage` under key `vite-ui-theme`.

---

## 5. Firestore Data Model

All data lives under `users/{email}/...`:

```
users/{email}/
├── folders/{folderName}/           # Folder doc (field: name)
│   └── notes/{noteId}/             # Note doc (title, description, folder, created_at, updated_at)
└── todos/{month}/                  # Month doc (field: month as string "1"-"12")
    └── items/{todoId}/             # Todo doc (title, description, deadline, is_completed, results, priority, created_at, updated_at)
```

- Folder IDs = the folder name itself (via `setDoc` with name as doc ID).
- Notes are auto-ID'd (`addDoc`).
- Todos are partitioned by month number (1–12). The month doc is created on first todo via `setDoc` with merge.

---

## 6. Routing

| Path                        | Component      | Auth     | Description                    |
| --------------------------- | -------------- | -------- | ------------------------------ |
| `/`                         | LandingPage    | Public   | Sign-in page                   |
| `/notes`                    | NotesPage      | Private  | Folder list + notes grid       |
| `/notes/new`                | NoteFormPage   | Private  | Create a new note              |
| `/notes/:folderId/:noteId`  | NoteFormPage   | Private  | Edit an existing note          |
| `/todos`                    | TodosPage      | Private  | Calendar grid + day modals     |
| `/todos/new`                | TodoFormPage   | Private  | Create a new todo              |
| `*`                         | Navigate       | Private  | Catch-all → redirects to notes |

When a logged-in user hits `/`, they are redirected to their **last visited page** (stored in `localStorage` key `lastPage`), defaulting to `/notes`.

---

## 7. localStorage Keys (Session Persistence)

These keys persist UI state across browser sessions:

| Key                 | Where Written                | Where Read                   | Purpose                                                  |
| ------------------- | ---------------------------- | ---------------------------- | -------------------------------------------------------- |
| `vite-ui-theme`     | `theme-provider.tsx`         | `theme-provider.tsx`         | Stores dark/light/system theme preference                |
| `lastPage`          | `AppLayout.tsx` (useEffect)  | `App.tsx` (PublicRoute)      | Remembers `/notes` or `/todos` — last active section     |
| `lastViewedFolder`  | `NotesPage.tsx` (useEffect)  | `NotesPage.tsx` (useState)   | Remembers which folder was last viewed in notes list     |
| `lastUploadFolder`  | `NoteFormPage.tsx` (onSave)  | `NoteFormPage.tsx` (useEffect) | Remembers which folder was last used when creating a note |

---

## 8. React Query Configuration

- **`staleTime: Infinity`** — Data is never considered stale automatically. Only manual `invalidateQueries` after mutations triggers refetches.
- **`gcTime: 30 minutes`** — Cached data is garbage collected after 30 minutes of being unused.
- All queries are keyed with `[entity, email, ...params]` (e.g., `["notes", email, folderId]`).
- All mutations call `invalidateQueries` on success to refresh the relevant lists.

---

## 9. Key UX Patterns

- **Mode Switcher**: A dropdown in the header toggles between Notes and Todos mode. The current mode determines the FAB action.
- **FAB (Floating Action Button)**: Bottom-right circle showing the app icon. Navigates to `/notes/new` or `/todos/new`. Fades out on scroll, reappears after 300ms of scroll idle.
- **Desktop vs Mobile**: Notes page has a sidebar folder list on desktop (`hidden md:flex`) and a `<Select>` dropdown on mobile (`md:hidden`).
- **Calendar Grid**: Todos are displayed as a month calendar. Each day cell is color-coded: neutral (no todos), green (all done), red border (pending).
- **Complete Todo Flow**: Checking a pending todo opens a dialog asking for optional "results" text, then marks it complete.

---

## 10. Change Log — What's Been Done

### Session: 2026-06-18 — State Persistence + Overflow Bug Fix

**Features added:**

1. **`lastPage` persistence** (`App.tsx` + `AppLayout.tsx`)
   - `AppLayout.tsx`: Added `useEffect` that writes `localStorage.setItem("lastPage", ...)` whenever `currentMode` changes between notes/todos.
   - `App.tsx`: In `PublicRoute`, changed the hardcoded `<Navigate to="/notes">` to read `localStorage.getItem("lastPage") || "/notes"` so returning users land on their last section.

2. **`lastViewedFolder` persistence** (`NotesPage.tsx`)
   - `selectedFolder` state initializer now reads from `localStorage.getItem("lastViewedFolder")` instead of starting as `null`.
   - Added `useEffect` that writes the current `folderId` to `localStorage` whenever it changes.
   - Imported `useEffect` (was only `useState` before).

3. **`lastUploadFolder` persistence** (`NoteFormPage.tsx`)
   - When creating a new note and no folder is pre-selected, the `useEffect` now checks `localStorage.getItem("lastUploadFolder")` first, validating it still exists in the folders list before using it.
   - On save (`handleSave`), the selected folder is written to `localStorage.setItem("lastUploadFolder", selectedFolder)`.

**Bug fix:**

4. **Textarea overflow fix** (`NoteFormPage.tsx` + `TodoFormPage.tsx`)
   - The `<Textarea>` component's base class includes `field-sizing-content` which makes it grow infinitely with content. When a note had a very long description, it overflowed the dark background container.
   - Fixed by adding `overflow-y-auto [field-sizing:fixed]` to the Textarea className in both `NoteFormPage.tsx` and `TodoFormPage.tsx`. This constrains the textarea to its `flex-1` allocation and makes it scroll internally.

---

## 11. Known Patterns & Gotchas for Future Agents

- **Environment variables**: Firebase config is loaded from `VITE_FIREBASE_*` env vars. These must be present in a `.env` file (not checked into git).
- **Folder ID = folder name**: The folder document ID IS the folder name (e.g., doc path is `folders/Work`). This means folder names must be unique.
- **No delete UI for folders**: The `deleteFolder` function exists in `firestore.ts` but there is no UI button for it currently.
- **Todos have no edit/delete UI**: `updateTodo` and `deleteTodo` exist in the hooks but the TodosPage only supports viewing and completing, not editing or deleting.
- **shadcn/ui Textarea has `field-sizing-content`**: This CSS property makes textareas auto-grow. If you want a fixed-height scrollable textarea, you MUST override it with `[field-sizing:fixed]`.
- **Query invalidation is manual**: Since `staleTime` is `Infinity`, data won't refetch unless you explicitly `invalidateQueries`. If you add new mutations, remember to invalidate.
- **No offline support**: Despite being a PWA, there's no offline data caching. The service worker only caches static assets.
