<div align="center">
  <img src="photos/app-icon.jpg" alt="Velinya Logo" width="120" height="120" style="border-radius: 20%;" />

  # Velinya
  
  **Your notes, todos, and daily habits, beautifully organized — everywhere you go.**

  [![React](https://img.shields.io/badge/React-19-blue.svg?style=flat-square&logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-6-blue.svg?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-8-purple.svg?style=flat-square&logo=vite)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4.svg?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
  [![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28.svg?style=flat-square&logo=firebase)](https://firebase.google.com/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-5a0fc8.svg?style=flat-square)](https://web.dev/progressive-web-apps/)
</div>

---

Velinya is a premium, beautifully crafted **personal productivity application**. Engineered as a Progressive Web App (PWA), it seamlessly blends note-taking, calendar-based task management, and daily habit tracking into one fluid, responsive experience. Built heavily around the elegant **Wise Design System**, it feels native on both desktop and mobile.

## ✨ Features

- 📝 **Rich Note Organization:** Categorize your thoughts, ideas, and work seamlessly into custom folders.
- 📅 **Calendar-Based Todos:** View and manage your tasks on a dynamic calendar grid, with prioritized badges and status indicators.
- 📈 **Daily Habit Tracking:** Track recurring daily tasks with an infinite grid. Automatically generates completion trend analytics using **Recharts**.
- 🌙 **Dark/Light Mode:** First-class support for system, dark, and light themes with highly curated color palettes.
- ⚡ **Offline-Ready:** Built with Firestore persistent caching and Service Workers to ensure your data is always accessible, even on the subway.
- 📱 **PWA Native:** Installable on iOS, Android, macOS, and Windows.

---

## 🛠 Tech Stack

Velinya leverages the bleeding edge of the modern web ecosystem for maximum performance and developer experience.

- **Frontend Core:** React 19, TypeScript 6, Vite 8
- **Styling:** Tailwind CSS v4, `shadcn/ui` primitives, and custom `Wise` tokens.
- **Data & Auth:** Firebase Auth (Google OAuth), Firebase Firestore (NoSQL).
- **State Management:** `@tanstack/react-query` v5 for robust async data fetching and optimistic mutations.
- **Analytics Visualization:** `recharts` for habit tracking trend graphs.
- **Icons:** `lucide-react`

---

## 🚀 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) (or Node.js/npm)
- A Firebase Project (with Firestore and Authentication enabled)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/velinya.git
   cd velinya
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   Create a `.env` file in the root of the project and populate it with your Firebase project credentials:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   VITE_FIREBASE_MEASUREMENT_ID="your-measurement-id"
   ```

4. **Start the development server**
   ```bash
   bun run dev
   ```

5. **Build for production**
   ```bash
   bun run build
   ```
   *Note: Velinya uses explicit chunk splitting (via Rolldown/Vite) to ensure lightning-fast loads for `firebase` and `recharts` vendors.*

---

## 🏗 Architecture & Data Model

Velinya scopes all data cleanly to the authenticated user using Firebase Auth.

```text
users/{email}/
  ├── folders/{folderName}/           # Custom folders
  │     └── notes/{noteId}/           # Individual notes
  ├── todos/{month}/                  # Partitioned by month
  │     └── items/{todoId}/           # Todo entries
  └── dailyFolders/{folderId}/        # Habit tracking categories
        └── dailyTasks/{taskId}/      # Habit tracking entries
```

### The "Wise" Design System
The app features a custom CSS design system layered over Tailwind (`src/index.css`). It utilizes soft canvas backgrounds (`#e8ebe6`), stark ink typography, and a signature primary lime green (`--wise-green`) to highlight interactive elements, keeping the UI looking clean and incredibly modern.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! 
If you find a bug or have an idea for a feature, please feel free to check the [issues page](../../issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

<div align="center">
  <i>Built with ❤️ for productivity.</i>
</div>
