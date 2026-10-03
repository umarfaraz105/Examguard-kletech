# ExamGuard - Running Instructions

## ✅ Application is Currently Running!

### Backend Server
- **URL**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Status**: ✅ Running

### Frontend Server
- **URL**: http://localhost:3000
- **Status**: ✅ Running

### Default Login Credentials
- **Email**: admin@examguard.edu
- **Password**: admin123
- ⚠️ **IMPORTANT**: Change this password immediately after first login!

---

## How We Set It Up

### Backend Setup (Python + FastAPI)
1. Created Python virtual environment in `backend/venv`
2. Installed all dependencies (FastAPI, SQLAlchemy, OR-Tools, etc.)
3. Configured SQLite database for local development
4. Initialized database with default admin user and exam rules
5. Started backend server on port 8000

### Frontend Setup (Next.js + TypeScript)
1. Installed Node.js dependencies
2. Started Next.js development server on port 3000

---

## To Stop the Servers

Press `Ctrl+C` in the terminal windows where the servers are running, or stop the background processes.

---

## To Restart the Servers Later

### Backend:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend:
```powershell
cd frontend
npm run dev
```

---

## Database Location

The SQLite database is stored at:
```
backend/examguard.db
```

This contains all your data (users, rules, courses, students, plans, etc.)

---

## Next Steps

1. **Open your browser** and navigate to http://localhost:3000
2. **Login** with the default credentials above (use `admin@examguard.edu` NOT `admin@kletu.ac.in`)
3. **Explore** the ExamGuard dashboard with these pages:
   - **Dashboard** - Overview and statistics
   - **Plans** - Create and manage exam plans
   - **Courses** - Add examination courses
   - **Students** - Manage student records
   - **Rooms** - Configure exam rooms and layouts
   - **Rules** - Configure scheduling rules (Admin/Exam Cell only)
4. **Create your first exam plan**:
   - Navigate to **Courses** and add some courses
   - Navigate to **Students** and add student records
   - Navigate to **Rooms** and configure exam rooms
   - Navigate to **Plans** and create a new plan
   - Run Engine 1 to generate schedule
   - Run Engine 2 to allocate seats
   - Run Engine 3 to assign invigilators
   - Run Engine 4 to validate and generate reports

---

## Troubleshooting

- If ports 3000 or 8000 are already in use, stop the conflicting application or modify the port numbers
- Check `backend/examguard.db` exists - if missing, run `python -m app.utils.init_db` from the backend directory
- For frontend issues, try deleting `frontend/.next` and `frontend/node_modules`, then run `npm install` again

---

## Documentation

Full documentation is available in the `docs/` folder:
- `docs/README.md` - Documentation index
- `docs/QUICK_START.md` - 5-minute setup guide
- `docs/USER_GUIDE.md` - Complete user guide
- `docs/ARCHITECTURE.md` - System design
- `docs/API.md` - API documentation
- `docs/DATABASE.md` - Database schema
- `docs/ENGINES.md` - Engine specifications
- `docs/DEPLOYMENT.md` - Production deployment
- `docs/FAQ.md` - Frequently asked questions
- `docs/TROUBLESHOOTING.md` - Common issues and solutions
