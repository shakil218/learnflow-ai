# LearnFlow AI — Intelligent Study Path & Skill Mastery Tracker

**LearnFlow AI** is a full-stack web application designed to help self-directed learners transform ambitious technical goals into structured weekly milestones, actionable micro-tasks, and verified knowledge with AI assessments.

Built as an independent full-stack project for the **NT Tech Innovation Technical Assessment**.

---

## 🌐 Live Deployments

- **Frontend Client**: [https://learnflow-ai-eight.vercel.app](https://learnflow-ai-eight.vercel.app)
- **Backend API Server**: [https://learnflow-ai-server-ecru.vercel.app](https://learnflow-ai-server-ecru.vercel.app)
- **API Health Check**: [https://learnflow-ai-server-ecru.vercel.app/health](https://learnflow-ai-server-ecru.vercel.app/health)

---

## 🌟 Key Features

1. **AI Curriculum & Roadmap Synthesis**:
   - Accepts any skill, framework, or technology topic along with user constraints (target skill level, weekly available hours, target weeks).
   - Synthesizes structured modules, summaries, and estimated time allocations with granular micro-tasks.
2. **Dynamic Progress Workflow & Streak Calculations**:
   - Automated task status lifecycle (`pending` ➔ `in_progress` ➔ `completed`).
   - Weighted completion formula calculating overall roadmap progress percentage in real time.
   - Daily habit tracking that calculates consecutive study streaks based on logged dates.
3. **Interactive AI Skill Assessment**:
   - Dynamic 4-option multiple-choice diagnostic quizzes generated from roadmap topics.
   - Instant scoring with percentage metrics, pass/review thresholds, and rationale explanations for every question.
4. **Authentication & Session Security**:
   - Powered by **Better Auth** with the official `@better-auth/mongo-adapter`.
   - Native MongoDB replica-set transaction support (`atlas-148dia-shard-0`).
   - Typed schema validation for every incoming API payload using **Zod**.
5. **Modern, Responsive Frontend**:
   - Built on **Next.js 16 (App Router)** and **React 19** with Tailwind CSS styling.
   - Loading skeletons, empty states, modals, and dynamic progress bars.

---

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router) & React 19
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Auth Client**: Better Auth React SDK (`better-auth/react`)
- **Language**: TypeScript

### Backend & Database
- **Server**: Node.js & Express 5 (ESM)
- **Database**: MongoDB Atlas (`mongodb` native driver 7.7)
- **Authentication**: Better Auth with `@better-auth/mongo-adapter`
- **Validation**: Zod schema validation middleware
- **Runtime**: TypeScript & tsx

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v20+ recommended)
- npm

### 2. Clone Repository
```bash
git clone https://github.com/shakil218/learnflow-ai.git
cd learnflow-ai
```

### 3. Server Setup
```bash
cd server
npm install

# Copy environment variables
cp .env.example .env

# Start server development mode
npm run dev
```
The server will start on `http://localhost:5000` with the MongoDB connection initialized.

### 4. Client Setup
```bash
cd ../client
npm install

# Copy environment variables
cp .env.example .env.local

# Start client development mode
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Running Automated Tests

Run the business logic unit tests covering weighted roadmap completion and consecutive streak calculations:

```bash
cd server
npx tsx src/services/progressLogic.test.ts
```

---

## 🔑 Demo Credentials

To test the application immediately, register a new account on the `/register` page or use the demo credentials:

- **Email**: `student@learnflow.ai`
- **Password**: `learnflow2026`

---

## 📁 Project Architecture & Folder Structure

```text
learnflow-ai/
├── client/
│   ├── src/
│   │   ├── app/                      # Next.js App Router pages
│   │   │   ├── dashboard/page.tsx    # Roadmaps overview & AI trigger
│   │   │   ├── login/page.tsx        # Authentication sign-in
│   │   │   ├── register/page.tsx     # Account registration
│   │   │   ├── roadmaps/[id]/page.tsx# Roadmap details, modules & quiz
│   │   │   ├── study/page.tsx        # Habit tracker & study logger
│   │   │   ├── layout.tsx            # Global frame with Navbar & Footer
│   │   │   └── page.tsx              # Landing page
│   │   ├── components/
│   │   │   ├── auth/                 # LoginForm, RegisterForm
│   │   │   ├── layout/               # Navbar, Footer
│   │   │   ├── roadmap/              # RoadmapCard, ModuleCard, TaskItemRow, AiRoadmapGenerator, QuizView
│   │   │   └── ui/                   # Button, Card, Badge, ProgressBar, Skeleton, Modal, EmptyState
│   │   ├── lib/                      # api-client, auth-client
│   │   └── types/                    # api interfaces
├── server/
│   ├── src/
│   │   ├── auth/                     # Better Auth engine & adapter config
│   │   ├── config/                   # Environment variables loader
│   │   ├── controllers/              # Roadmap, Module/Task, Study/Quiz controllers
│   │   ├── db/                       # MongoDB connection singleton & collection names
│   │   ├── middlewares/              # Session authentication & Zod validation
│   │   ├── routes/                   # Roadmap, Planner, Study API endpoints
│   │   ├── services/                 # Business logic, AI generator, Quiz engine, CRUD services
│   │   ├── types/                    # Domain models & database schema definitions
│   │   ├── validations/              # Zod input schemas
│   │   └── index.ts                  # Express entrypoint
```

---

## 📄 License
ISC License. Built for NT Tech Innovation Practical Assessment.
