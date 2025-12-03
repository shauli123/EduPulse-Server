# EduPulse Implementation Plan

## Goal Description
Build "EduPulse", a comprehensive, Hebrew-language personalized learning platform featuring an adaptive learning engine, AI tutor (Gemini), gamification, and teacher tools. The system will be a full-stack web application.

## Architecture

### Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion (for animations), Lucide React (icons).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ORM).
- **AI**: Google Gemini API (via Google AI Studio SDK).
- **Authentication**: JWT (JSON Web Tokens) with bcrypt for password hashing.
- **Language**: TypeScript (for both frontend and backend to ensure type safety).

### Structure
```
/EduPulse
  /client (Frontend)
    /src
      /components (Reusable UI)
      /pages (Views)
      /services (API calls)
      /hooks (State/Logic)
      /context (Global State)
  /server (Backend)
    /src
      /models (DB Schemas)
      /routes (API Endpoints)
      /controllers (Logic)
      /services (AI, Auth helper)
      /middleware (Auth, Error handling)
```

## Proposed Changes

### Backend
1.  **Setup**: Initialize `server` directory with `package.json`, `tsconfig.json`.
2.  **Database**: Connect to MongoDB.
3.  **Models**:
    -   `User`: Profile, role (student/teacher), XP, level, streak, history.
    -   `Course`: Subjects, topics, lessons.
    -   `Quiz`: Generated quizzes, questions, answers.
    -   `Progress`: Tracking user progress per topic.
4.  **Gemini Service**: A dedicated service to handle prompts for:
    -   Diagnostic assessment.
    -   Content explanation.
    -   Quiz generation.
    -   Summarization.
5.  **Routes**:
    -   `/api/auth`: Login, Register.
    -   `/api/ai`: Chat, Generate Quiz, Explain.
    -   `/api/user`: Profile, Stats, Leaderboard.
    -   `/api/courses`: CRUD for content.

### Frontend
1.  **Setup**: Initialize `client` with Vite + React + TS.
2.  **Styling**: Configure Tailwind with a "Premium" theme (gradients, glassmorphism) and RTL support.
3.  **State Management**: Use `Zustand` for simple global state (User, Theme, Notifications).
4.  **Pages**:
    -   `Dashboard`: Overview of progress, daily tasks.
    -   `PulseChat`: The AI tutor interface.
    -   `Learn`: Course library and lesson viewer.
    -   `Compete`: Leaderboards and challenges.
    -   `Profile`: User stats and settings.
    -   `Teacher`: Class management (if user is teacher).

## Verification Plan
-   **Manual Verification**:
    -   Register a new user.
    -   Test the "Pulse Assistant" with a Hebrew query.
    -   Generate a quiz and verify it makes sense.
    -   Check if XP updates after completing a task.
-   **Automated Tests**:
    -   Basic API endpoint tests (using a script).

