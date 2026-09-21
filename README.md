# The Girls Kingdom School and College Mardan

An enterprise-grade, modern Web Portal and Learning Management System (LMS) designed for **The Girls Kingdom School and College Mardan**. Built with a unified, role-based architecture for Administrators, Teachers, and Students.

---

## 🌟 Key Features

- **🔐 Robust Role-Based Access Control (RBAC)**: Distinct workflows and secure dashboards for `admin`, `teacher`, and `student`.
- **🏫 Class & Cohort Management**: Admin and faculty control over classrooms, student enrollments, and academic streams.
- **📝 Online Assessment & Quiz System**:
  - Interactive quiz builder with multiple question types (Multiple Choice, True/False, Short Answer).
  - Time limits, randomized questions, attempt tracking, and distraction-free exam environment.
  - Automatic grading with instant results and teacher evaluation queues.
- **📊 Real-Time Academic Dashboards**: Metrics for class averages, student performance trends, attendance, and activity logs.
- **🔔 Notifications & Broadcasts**: System-wide and targeted announcements for exams, schedules, and alerts.
- **🌓 Modern Responsive UI**: Tailored burgundy brand theme with dark/light mode toggle, built with React 19 and Tailwind CSS.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite 6
- **Routing**: React Router 7
- **Styling**: Tailwind CSS + Custom Design System
- **State & Data Fetching**: TanStack React Query + Axios
- **UI Components**: Lucide React, Framer Motion, Sonner Toasts

### Backend
- **Runtime**: Node.js + Express 5
- **Database**: MongoDB with Mongoose ODM
- **Security**: JWT (Access & Refresh tokens), bcryptjs, Helmet, Express Rate Limit, Dynamic CORS
- **File Storage**: Static uploads middleware with multipart support

---

## 📂 Project Structure

```text
The-Girls-Kingdom-School-And-College-Mardan/
├── backend/                  # Express REST API
│   ├── seeds/                # Seed scripts for initial setup
│   ├── src/
│   │   ├── config/           # DB, CORS, and Environment configs
│   │   ├── middleware/       # Auth, Rate limiting, Error handling
│   │   ├── modules/          # Auth, Classes, Quizzes, Students, Teachers, Notifications
│   │   ├── utils/            # Helper utilities and constants
│   │   ├── app.js            # Express application setup
│   │   └── server.js         # Entry point & DB bootstrap
│   ├── .env.example          # Sample environment variables
│   └── package.json
│
├── frontend/                 # Vite + React Single Page App
│   ├── public/               # Logos, favicon, static assets
│   ├── src/
│   │   ├── components/       # Shared UI widgets, Layouts, Navigation
│   │   ├── config/           # Axios instance & dynamic API URL resolver
│   │   ├── context/          # Auth and Theme providers
│   │   ├── features/         # Modular feature pages & hooks (Auth, Admin, Quizzes, etc.)
│   │   └── main.jsx          # React app entry point
│   ├── .env.example          # Sample environment variables
│   ├── vercel.json           # Client-side routing rewrites for Vercel
│   └── package.json
│
├── render.yaml               # Render Blueprint configuration for backend
├── vercel.json               # Root Vercel deployment fallback
└── README.md
```

---

## 🚀 Deployment Guide

### 1. Backend Deployment (Render)

1. Sign in to [Render](https://render.com).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository: `Irfan-CodeSynth/The-Girls-Kingdom-School-And-College-Mardan-`.
4. Configure the Web Service:
   - **Name**: `the-girls-kingdom-api`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   | Key | Value / Description |
   |-----|---------------------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGO_URI` | Your MongoDB Atlas connection URI (e.g. `mongodb+srv://...`) |
   | `JWT_SECRET` | A secure random 32+ character string |
   | `JWT_EXPIRE` | `15m` |
   | `JWT_REFRESH_EXPIRE` | `7d` |
   | `CORS_ORIGIN` | Your Vercel frontend URL (e.g., `https://the-girls-kingdom.vercel.app`) or `*` |
   | `ADMIN_EMAIL` | `admin@girlskingdom.edu` |
   | `ADMIN_PASSWORD` | `Admin@123456` |
   | `ADMIN_NAME` | `System Administrator` |
6. Click **Create Web Service**. Once deployed, copy your Render service URL (e.g., `https://the-girls-kingdom-api.onrender.com`).

---

### 2. Frontend Deployment (Vercel)

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository: `Irfan-CodeSynth/The-Girls-Kingdom-School-And-College-Mardan-`.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `frontend` (or leave default root with provided `vercel.json`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Under **Environment Variables**, add:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | Your Render backend URL (e.g., `https://the-girls-kingdom-api.onrender.com`) |
6. Click **Deploy**. Vercel will build the frontend and serve it with client-side SPA routing enabled.

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally or a MongoDB Atlas URI)

### Step 1: Clone Repository
```bash
git clone https://github.com/Irfan-CodeSynth/The-Girls-Kingdom-School-And-College-Mardan-.git
cd The-Girls-Kingdom-School-And-College-Mardan-
```

### Step 2: Configure & Start Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Backend API will be running on `http://localhost:5000`. Default admin is automatically seeded on first launch.

### Step 3: Configure & Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend portal will be accessible at `http://localhost:5173`.

---

## 🔑 Default Credentials (Seeded)

- **Administrator**:
  - Email: `admin@girlskingdom.edu`
  - Password: `Admin@123456`
- **Teacher (Demo)**:
  - Email: `teacher@girlskingdom.edu`
  - Password: `Teacher@123456`
- **Student (Demo)**:
  - Email: `ayesha@girlskingdom.edu`
  - Password: `Student@123456`

---

## 📄 License
ISC License © The Girls Kingdom School and College Mardan.
