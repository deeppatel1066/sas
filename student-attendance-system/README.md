# Student Attendance System

A full-stack student attendance system with a Vite React frontend and an Express Node.js backend.

## Setup

```bash
npm install
npm run install:all
```

Before starting the backend, make sure MongoDB is running locally. The backend uses the `student-attendance` database by default. To use another MongoDB server, copy `backend/.env.example` to `backend/.env` and update `MONGODB_URI`.

## Run both applications

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API health check: http://localhost:5000/api/health
- Teacher endpoint: http://localhost:5000/api/teacher/dashboard
- Student endpoint: http://localhost:5000/api/student/dashboard
- Registration: `POST http://localhost:5000/api/auth/register`
- Login: `POST http://localhost:5000/api/auth/login`
- Create teacher class: `POST http://localhost:5000/api/teacher/classes`
- Teacher student rosters: `GET http://localhost:5000/api/teacher/students?teacherEmail=teacher@example.com`
- Save student details: `POST http://localhost:5000/api/student/details`

Teacher class body uses one education key with the value entered by the teacher:

```json
{
	"teacherEmail": "teacher@example.com",
	"teacherName": "Amit Patel",
	"std": "10",
	"subject": "Mathematics",
	"gender": "mixed",
	"course": "Science"
}
```

For college classes, use `"semester": "3"` instead of `"std": "10"`. Do not send both keys. Student class-entry routes are not added yet.

You can also run each app independently with `npm run dev --prefix frontend` or `npm run dev --prefix backend`.
