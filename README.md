# LifeOS — AI-Powered Visual Second Brain

**LifeOS** is a production-grade personal operating system and visual planning dashboard designed to help professionals and students transform unstructured goals into an interactive visual planning system. 

Powered by **Gemini AI**, LifeOS automatically processes natural language inputs, creates structural roadmaps, determines task priorities, detects planning conflicts, and schedules weekly workflows onto an interactive, draggable canvas interface.

---

## 🌟 Key Capabilities

### 🧠 1. Natural Language Brain Dump
- Capture unstructured thoughts, notes, and raw ambitions.
- The **Gemini AI** engine processes the input, extracts high-level goals and granular, actionable tasks, and presents a preview for user approval before rendering them onto the canvas.

### 🕸️ 2. Draggable Visual Canvas
- A fully interactive planning workspace built with **React Flow**.
- Drag, organize, and link Goals, Tasks, Projects, and Events with polymorphic dependency edges.
- Supports **automatic debounced state saving (500ms)** to ensure planning progress is never lost.

### ⚠️ 3. Hybrid Conflict Detection
- Runs a dual-engine conflict analyzer:
  - **Deterministic Rules**: Detects overlapping events, tasks exceeding work hours, and deadlines less than 48 hours apart.
  - **AI Cognitive Analysis**: Gemini flags logical dependencies (e.g., attempting a complex task before its prerequisite learning roadmap is complete).
- Generates descriptive conflict warnings and actionable suggestions directly on the canvas.

### 📺 4. YouTube Action Extractor
- Paste any learning video URL (e.g., coding tutorial, lecture).
- The engine fetches the transcript, uses Gemini to extract a structured, step-by-step learning roadmap, and imports it as connected nodes onto your canvas.

### 📅 5. Weekly Planning Engine
- Generates a customized 7-day calendar schedule.
- Allocates specific time blocks to goals, tasks, and events while strictly respecting your configured daily work hour limit.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS (custom "Silent Coder" dark aesthetic)
- **Canvas Engine**: React Flow v11 (with 5 custom node types & MiniMap)
- **State Management**: Zustand
- **API Client**: Axios (with centralized interceptor for auto-queuing token refreshes)

### Backend (Server)
- **Runtime**: Node.js + Express.js + TypeScript
- **Database**: MongoDB Atlas + Mongoose (11 polymorphic and TTL-indexed schemas)
- **AI Integration**: Official Google Gemini SDK (`@google/genai`)
- **Validation**: Zod (strict validation for all incoming requests)

---

## 🔒 Engineering Highlights

1. **Robust JWT Authentication with Rotation**:
   - Access tokens have a short lifespan (15m) and are stored in memory.
   - Refresh tokens (7d) are stored in secure, `HttpOnly`, `SameSite=Strict` cookies.
   - Features **Automatic Refresh Token Rotation (RTR)** with **Family-based Reuse Detection**. If a token is hijacked and reused, the backend instantly invalidates the entire token family, logging out all sessions for security.
2. **AI Action Validation Lifecycle**:
   - Implements a strict **Pending ➡️ Approved** lifecycle for AI-generated actions. AI outputs are cached as staging records (`AIAnalysis` model) first, ensuring no database mutations occur without explicit user validation.
3. **Bypassed Rate Limiting in Development**:
   - Global, Auth, and AI rate-limiters protect production instances, but automatically bypass restrictions in development (`NODE_ENV=development`) to ensure a smooth local developer workflow.

---

## 🚀 Local Quick Start

### 1. Prerequisites
- **Node.js** v18+
- A **MongoDB Atlas** cluster (or local instance)
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory:
```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_ACCESS_SECRET=your-64-character-hex-access-secret
JWT_REFRESH_SECRET=your-64-character-hex-refresh-secret
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:3000
```

### 3. Run the Application
Start the API Server:
```bash
cd server
npm install
npm run dev
```

Start the Next.js Client:
```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
