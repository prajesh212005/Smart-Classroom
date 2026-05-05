# Smart Classroom & AI Timetable Scheduler

A MERN-style smart classroom management app for managing courses, faculty, rooms, classrooms, notifications, and generating timetables. It also includes an optional Gemini-powered chatbot endpoint.

## Features

- Faculty, room, course, and classroom CRUD
- Timetable generation and storage
- Notifications module
- Auth (register/login) with JWT
- Optional AI chat endpoint (Gemini)

## Tech Stack

- Frontend: React + Vite + Tailwind
- Backend: Node.js + Express + Mongoose (MongoDB)
- AI (optional): Google Gemini via `@google/generative-ai`

## Repo Structure

```
.
├─ backend/
│  ├─ models/
│  ├─ routes/
│  ├─ scripts/
│  ├─ solver/
│  ├─ uploads/
│  ├─ utils/
│  └─ server.js
└─ frontend/
   ├─ src/
   └─ vite.config.js
```

## Prerequisites

- Node.js (recommended: Node 22+)
  - The frontend `package.json` specifies `node >= 22.5.0`.
- MongoDB connection string (MongoDB Atlas or local MongoDB)

## Quickstart (Windows / PowerShell)

1) Backend

```powershell
cd backend
npm install
```

Create `backend/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>/<db>
JWT_SECRET=change-me
PORT=5000

# Optional (for /api/ai)
# GOOGLE_API_KEY=...
# GEMINI_API_KEY=...
# GEMINI_CHAT_MODEL=gemini-1.5-flash
```

Run the API:

```powershell
npm run dev
# or: npm start
```

2) Frontend

```powershell
cd ..\frontend
npm install
npm run dev
```

By default, the frontend calls the backend at `http://localhost:5000` (several pages have the base URL hard-coded).

## Environment Variables

Backend (`backend/.env`):

- `MONGO_URI` (required): MongoDB connection string.
- `JWT_SECRET` (required for auth): Secret used to sign JWTs.
- `PORT` (optional): Defaults to `5000`.
- `GOOGLE_API_KEY` or `GEMINI_API_KEY` (optional): Enables Gemini endpoints.
- `GEMINI_CHAT_MODEL` / `GEMINI_MODEL` (optional): Defaults to `gemini-1.5-flash`.

## API Routes (Backend)

Base URL: `http://localhost:5000/api`

- `/auth` (login/register)
- `/courses`
- `/faculty`
- `/rooms`
- `/classrooms`
- `/timetables`
- `/notifications`
- `/ai` (Gemini chat + model listing)

Uploads are served from: `http://localhost:5000/uploads`

## Useful Backend Scripts

From the `backend/` folder:

- Reset DB (requires explicit confirmation):

```powershell
$env:CONFIRM_RESET_DB='YES'; npm run reset-db
```

Optional reset settings:

- `RESET_DB_MODE=drop` (default) or `RESET_DB_MODE=truncate`
- `RESET_UPLOADS=YES` to clear `backend/uploads`

- Seed sample courses:

```powershell
npm run seed-sem6
```

## Notes / Troubleshooting

- If auth endpoints return “missing JWT_SECRET”, set `JWT_SECRET` in `backend/.env`.
- If AI endpoints return “Gemini is not configured”, set `GOOGLE_API_KEY` (or `GEMINI_API_KEY`).
- If the frontend can’t reach the backend, ensure the backend is running on port `5000` (or update the hard-coded URLs in the frontend).
