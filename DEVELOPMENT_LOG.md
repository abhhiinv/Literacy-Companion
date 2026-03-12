# Literacy Companion - Project Development Log

**Date:** March 12, 2026  
**Project Goal:** Support SDG 4.6 (Adult Literacy) through AI-powered interactive stories.

---

## 🏗️ 1. Architecture Overview
The application is a **Modern React PWA** (Progressive Web App) integrated with Google's AI and Firebase ecosystem.

-   **Frontend:** React 19 (TypeScript) + Vite 8
-   **Styling:** Bootstrap 5 + React-Bootstrap + React Icons
-   **AI Engine:** Gemini 1.5 Flash (Google Generative AI SDK)
-   **Backend:** Firebase (Authentication & Firestore)
-   **Offline Support:** Service Workers (Vite PWA) + Firestore Offline Persistence

---

## 🚀 2. Features Implemented

### 📖 Adaptive Story Engine (`src/services/gemini.ts`)
-   Generates short, adult-appropriate stories based on user level (**Beginner, Intermediate, Advanced**).
-   Dynamically creates a **3-question comprehension quiz** for every story.
-   Outputs strictly structured JSON for reliable UI rendering.

### 🎧 Interactive Reader (`src/pages/Learning.tsx`)
-   **Text-to-Speech (TTS):** Integrated Web Speech API for narrating the whole story or individual words.
-   **Word-Level Interaction:** Users can click any word to hear its pronunciation and see a visual highlight.
-   **Quiz UI:** Interactive multiple-choice quiz with immediate feedback (Correct/Incorrect indicators).

### 👤 User Progress & Auth (`src/context/AuthContext.tsx`)
-   **Authentication:** Supports Email/Password and Google Sign-in.
-   **Streak Tracking:** Logic to track and update daily learning streaks in Firestore.
-   **Persistence:** Automatically saves user reading levels and last active timestamps.
-   **Safety:** Implemented a 10-second auth timeout and error handling to prevent "white screen" hangs.

### 📱 PWA & Performance
-   Configured `vite-plugin-pwa` for offline installation.
-   Optimized Firestore with `persistentLocalCache` for low-connectivity environments.

---

## 🛠️ 3. Configuration & Security

### Environment Variables (`.env`)
The project is configured with the following keys (managed locally and excluded from Git):
-   `VITE_FIREBASE_*`: Full Firebase Web SDK configuration.
-   `VITE_GEMINI_API_KEY`: Google AI Studio key for Gemini 1.5 Flash.

### Git & Source Control
-   Initialized Git repository.
-   Configured a robust `.gitignore` to protect `.env`, `node_modules`, and build artifacts.
-   Set remote to: `https://github.com/abhhiinv/Literacy-Companion.git`

---

## 🐛 4. Fixes & Troubleshooting Applied
-   **Firebase Deprecation:** Updated Firestore initialization to the modern `localCache` API.
-   **Auth Syntax Error:** Fixed `User` import issues by using `import type { User }`.
-   **White Screen Mitigation:** Added global loading spinners and `try-catch-finally` blocks in the Auth Provider.
-   **Gemini 404 Errors:** Optimized model identifiers and prompt structure for better reliability with the Gemini 1.5 API.

---

## 📋 5. How to Continue
1.  **Start Dev Server:** `npm run dev`
2.  **Firebase Rules:** Ensure Firestore rules allow `read/write` on `/users/{userId}`.
3.  **Deployment:** The app is ready for Firebase Hosting or Vercel deployment.

---
*Built to empower adults through literacy. Supporting UN SDG 4.6.*
