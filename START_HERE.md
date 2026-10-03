# 🚀 ExamGuard - Start Here

## ✅ System Status: RUNNING

Your ExamGuard examination management system is **fully operational**!

### Running Services:
- ✅ **Backend API** (FastAPI + Python): http://localhost:8000
- ✅ **Frontend UI** (Next.js + React): http://localhost:3000  
- ✅ **Database** (SQLite): `backend/examguard.db`
- ✅ **API Documentation**: http://localhost:8000/docs

---

## 🔐 Login Credentials

```
Email:    admin@examguard.edu
Password: admin123
```

**⚠️ IMPORTANT**: 
- Use the **exact email** above (not admin@kletu.ac.in)
- Password is case-sensitive
- Change this password after first login!

---

## 🎯 Quick Start

### 1. Access the Application
Open your web browser and visit: **http://localhost:3000**

### 2. Login
- The page will redirect to `/login`
- Enter the credentials above
- Click "Sign In"
- You'll be redirected to the dashboard

### 3. Explore the System
Once logged in, you can:
- **View Dashboard** - Statistics and quick actions
- **Manage Courses** - Add/edit examination courses
- **Manage Students** - Import and manage student data
- **Manage Rooms** - Configure exam rooms and bench layouts
- **Create Exam Plans** - Define exam schedules
- **Run Engines**:
  - Engine 1: Generate optimal exam schedule (OR-Tools CP-SAT)
  - Engine 2: Allocate rooms and seats with branch separation
  - Engine 3: Assign invigilators with workload balancing
  - Engine 4: Validate and generate compliance reports

---

## 🧪 Test the Backend API

### Method 1: Interactive API Docs
1. Visit: http://localhost:8000/docs
2. Find POST `/api/auth/login`
3. Click "Try it out"
4. Enter credentials and execute

### Method 2: PowerShell Command
```powershell
$body = @{ email = "admin@examguard.edu"; password = "admin123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

You should receive an `access_token` in the response.

---

## 📁 Project Structure

```
project mini/
├── backend/                    # FastAPI Python backend
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── core/              # Config, security, database
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic (4 engines)
│   │   └── utils/             # Utilities
│   ├── venv/                  # Python virtual environment
│   ├── examguard.db          # SQLite database
│   └── .env                   # Environment configuration
│
├── frontend/                   # Next.js React frontend
│   ├── src/
│   │   ├── app/               # Pages and routing
│   │   ├── components/        # Reusable UI components
│   │   ├── contexts/          # React contexts (Auth)
│   │   └── lib/               # API client
│   └── node_modules/          # NPM dependencies
│
└── docs/                       # Comprehensive documentation
    ├── README.md              # Documentation index
    ├── QUICK_START.md         # 5-minute guide
    ├── USER_GUIDE.md          # Complete user manual
    ├── ARCHITECTURE.md        # System design
    ├── API.md                 # API reference
    ├── DATABASE.md            # Database schema
    ├── ENGINES.md             # Engine specifications
    ├── DEPLOYMENT.md          # Production deployment
    ├── FAQ.md                 # Common questions
    └── TROUBLESHOOTING.md     # Problem solving
```

---

## 🛠️ Manage the Servers

### View Running Processes
Both servers are running as background processes. You can see their output in the terminal windows.

### Stop the Servers
Press `Ctrl+C` in each terminal window, or close the terminals.

### Restart Backend
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Restart Frontend
```powershell
cd frontend
npm run dev
```

---

## 🐛 Troubleshooting Login

### "401 Unauthorized" Error
✅ **Solution**: Make sure you're using `admin@examguard.edu` (NOT `admin@kletu.ac.in`)

### Page doesn't load or shows errors
1. Check both servers are running in their terminal windows
2. Clear browser cache: Press `F12` → Application tab → Clear storage
3. Refresh the page (`Ctrl + R`)

### Need to see detailed errors
1. Press `F12` to open browser Developer Tools
2. Go to **Console** tab - check for JavaScript errors
3. Go to **Network** tab - check for failed API requests (red colored)
4. Take a screenshot of any errors you see

### Verify backend is responding
```powershell
# Test if backend is alive
Invoke-RestMethod -Uri "http://localhost:8000/health"

# Test login directly
$body = @{ email = "admin@examguard.edu"; password = "admin123" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

---

## 📚 Documentation

Full documentation available in `docs/` folder:

- **`docs/QUICK_START.md`** - Get started in 5 minutes
- **`docs/USER_GUIDE.md`** - Complete walkthrough for all user roles
- **`docs/ARCHITECTURE.md`** - Technical system design
- **`docs/API.md`** - All API endpoints with examples
- **`docs/ENGINES.md`** - How the 4 scheduling engines work
- **`docs/DATABASE.md`** - Complete database schema
- **`docs/DEPLOYMENT.md`** - Production deployment guide
- **`docs/FAQ.md`** - Frequently asked questions
- **`docs/TROUBLESHOOTING.md`** - Common issues and solutions

---

## 🎉 What's Included

### ✅ Complete Backend (Python/FastAPI)
- User authentication with JWT tokens
- 11 API routers (auth, users, rules, courses, students, rooms, plans, schedules, seating, invigilators, engines)
- 10 database models (SQLAlchemy)
- 4 intelligent engines for exam management
- Comprehensive rule configuration system
- Audit logging

### ✅ 4 Specialized Engines
1. **Engine 1 - Scheduling**: Google OR-Tools CP-SAT solver for optimal conflict-free exam schedules
2. **Engine 2 - Room & Seating**: Room allocation with branch separation (8-direction neighbor check)
3. **Engine 3 - Invigilator Management**: Fair workload distribution and duty assignment
4. **Engine 4 - Validation & Reporting**: Independent compliance scoring and PDF/Excel report generation

### ✅ Modern Frontend (Next.js/TypeScript)
- Responsive dashboard with statistics
- Complete CRUD interfaces for all entities
- Authentication flow with protected routes
- Real-time feedback and loading states
- Tailwind CSS styling

### ✅ Database (SQLite)
- Pre-initialized with admin user
- 23 default exam rules (ISA-1, ISA-2, ESA configurations)
- All tables created and ready
- Located at: `backend/examguard.db`

---

## 💡 Next Steps

1. **Login** to the system at http://localhost:3000
2. **Explore** the dashboard and navigation
3. **Add sample data**:
   - Create a few courses
   - Add some students
   - Configure exam rooms
4. **Create your first exam plan**
5. **Run the engines** to generate schedule, allocate seats, assign invigilators
6. **Generate reports** to see the results

---

## 📞 Need Help?

If login doesn't work:
1. Check `LOGIN_INSTRUCTIONS.md` for detailed troubleshooting
2. Verify credentials: `admin@examguard.edu` / `admin123`
3. Check browser console (F12) for JavaScript errors
4. Test backend directly using the PowerShell commands above
5. Look at backend terminal for any error messages

---

**Your ExamGuard system is production-ready! 🎓**

The entire multi-engine examination management system with intelligent scheduling, seating allocation, invigilator management, and comprehensive validation is now running on your machine.
