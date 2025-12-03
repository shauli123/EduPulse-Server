# EduPulse Development Instructions

The project has been initialized with a full-stack MERN architecture (MongoDB, Express, React, Node.js).
Below are the instructions to run the project and continue development.

## 🚀 How to Run the Project

### Prerequisites
- Node.js installed
- Supabase

### 1. Start the Backend
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5000`.

### 2. Start the Frontend
```bash
cd client
npm run dev
```
The frontend will start on `http://localhost:5173`.

---

## 📂 Project Structure & Next Steps

### Backend (`/server`)
**Current State:**
- Auth System (Login/Register/JWT) ✅
- Database Models (User, Course, Progress) ✅
- Gemini AI Integration Service ✅
- Basic Gamification Logic ✅

**Next Steps to Implement:**
1.  **Quiz Generation Logic**:
    -   Go to `src/controllers/aiController.ts`.
    -   Enhance `createQuiz` to save the generated quiz to the database (create a `Quiz` model first).
2.  **Course Content Seeding**:
    -   Create a script to seed the database with initial courses/lessons (Math, Science, etc.).
    -   Use `src/models/Course.ts`.
3.  **Adaptive Engine**:
    -   In `src/controllers/courseController.ts`, update `updateProgress` to analyze performance and suggest the next lesson difficulty.

### Frontend (`/client`)
**Current State:**
- Authentication Pages (Login/Register) ✅
- Core Layout (Sidebar, Responsive) ✅
- Dashboard (Basic View) ✅
- Auth Context & API Service ✅

**Next Steps to Implement:**
1.  **Course Library Page**:
    -   Create `src/pages/Learn.tsx`.
    -   Fetch courses from `/api/courses` and display them in a grid.
2.  **AI Chat Interface**:
    -   Create `src/pages/PulseChat.tsx`.
    -   Build a chat UI that calls `/api/ai/chat`.
3.  **Quiz Interface**:
    -   Create a component to take quizzes.
    -   Display questions one by one and submit answers to the backend.
4.  **Gamification UI**:
    -   Create `src/pages/Leaderboard.tsx`.
    -   Fetch and display top users from `/api/users/leaderboard`.

## 🔑 Environment Variables

**Server (`server/.env`)**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/edupulse
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
```

**Client**
No `.env` needed yet, API URL is hardcoded in `src/services/api.ts`. You can move it to `VITE_API_URL` in `.env` later.
