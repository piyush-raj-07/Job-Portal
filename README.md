# 💼 Job Portal

A job portal built with the MERN stack. Students find and apply for jobs,
recruiters post jobs and manage applicants, and an AI resume builder helps
students write and improve their resumes.

**Timeline:** January 2025 – June 2025 · Personal Project

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Redux Toolkit, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI:** Python (FastAPI) + Groq
- **Auth:** JWT access token + rotating refresh token in an httpOnly cookie, email verification with Nodemailer
- **Uploads:** Multer + Cloudinary

## ✨ Features

**For students**
- Browse and filter jobs by title, location or category
- Apply to jobs and track application status
- Edit profile, skills and resume

**For recruiters**
- Create and manage companies
- Post, edit and delete jobs
- View applicants and accept or reject them

**AI Resume Builder**
- Build a resume in a form with a live preview
- 4 templates: Classic, Modern, Minimal, Developer
- Let AI write your summary or improve a project description
- Get a review score with suggestions
- Match your resume against a real job posting
- Save multiple resumes and export as PDF

## 🚀 Setup

You need Node.js 20+, Python 3.10+, MongoDB, and a Groq API key.

**1. Backend**

```bash
cd backend
npm install
npm run dev
```

Copy `backend/.env.example` to `backend/.env` and fill in your values.
It lists every variable, including the JWT and SMTP (email) settings.

**Email verification:** new accounts must click a link in their email before
they can log in. While developing you can leave the `SMTP_*` variables empty —
the verification link is then printed in the backend terminal instead of
being emailed. If your database already has users from before this feature,
run this once so they aren't locked out:

```bash
cd backend
npm run verify-existing-users
```

**2. Frontend**

```bash
cd client
npm install
npm run dev
```

Create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:3000
```

**3. AI service** (optional — only needed for the AI resume features)

```bash
cd backend/ai-service
pip install -r requirements.txt
   --host 127.0.0.1
```

Now open http://localhost:5173

## 📁 Folders

```
backend/
  controllers/   route logic
  models/        database schemas
  routers/       API routes
  middlewares/   auth and file uploads
  ai-service/    Python AI service

client/src/
  components/    all React pages and UI
  redux/         global state
  hooks/         data fetching
  services/      API calls
```

## 🔌 API

All routes start with `/api/v1`.

| Area | Routes |
|---|---|
| User | `/user/register`, `/user/login`, `/user/logout`, `/user/refresh-token`, `/user/profile/update` |
| Email verification | `/user/verify-email`, `/user/resend-verification` (max 3 per 15 min) |
| Job | `/job/getAllJobs`, `/job/postJob`, `/job/findJobById/:id`, `/job/deleteJob/:id` |
| Company | `/company/registercompany`, `/company/getcompany`, `/company/update/:id` |
| Application | `/application/apply/:id`, `/application/get`, `/application/applicants/:id` |
| Resume | `/resume` (list, create), `/resume/:id` (get, update, delete) |
| Resume AI | `/resume/ai/summary`, `/resume/ai/review`, `/resume/ai/ats` |

Most routes need you to be logged in.

## 🖼️ Screenshots

![image](https://github.com/user-attachments/assets/367335e9-a9bc-401b-a95d-fa061bbd5ad4)

![image](https://github.com/user-attachments/assets/b0ee6f24-cbd3-44be-b45d-1ed5bdd0fd95)

![image](https://github.com/user-attachments/assets/a2796fc7-0c00-4bba-83d0-fe70f47f1928)

![image](https://github.com/user-attachments/assets/b919643e-d39e-4847-a0c7-8befe2411f89)

![image](https://github.com/user-attachments/assets/937a87b1-0148-41dd-8755-154ca33d9c5d)
  