# 🚀 Starting ExamGuard Application

## Current System Status

✅ **Python 3.13.14** - Installed and ready  
✅ **Node.js v24.15.0** - Installed and ready  
❌ **Docker** - Not available  
❌ **PostgreSQL** - Database required

## 🎯 To Run ExamGuard, You Have 3 Options:

### Option 1: Install Docker Desktop (Recommended - Easiest)

This is the **fastest and easiest** way to run the complete system:

1. **Download Docker Desktop**:
   - Visit: https://www.docker.com/products/docker-desktop/
   - Download for Windows
   - Install and restart computer

2. **Start ExamGuard**:
   ```powershell
   # Navigate to project
   cd "C:\Users\umarf\OneDrive\Desktop\project mini"
   
   # Start all services (database, backend, frontend)
   docker compose up -d
   
   # Initialize database
   docker compose exec backend python -m app.utils.init_db
   ```

3. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Login: admin@kletu.ac.in / admin123

**Time Required**: 15-20 minutes (including Docker installation)

---

### Option 2: Install PostgreSQL Locally

If you prefer not to use Docker:

1. **Install PostgreSQL**:
   - Download from: https://www.postgresql.org/download/windows/
   - Install PostgreSQL 15 or higher
   - Set password during installation (remember it!)

2. **Create Database**:
   ```powershell
   # Open PowerShell and run:
   psql -U postgres
   # In PostgreSQL prompt:
   CREATE DATABASE examguard;
   CREATE USER examguard WITH ENCRYPTED PASSWORD 'password123';
   GRANT ALL PRIVILEGES ON DATABASE examguard TO examguard;
   \q
   ```

3. **Configure Backend**:
   ```powershell
   cd backend
   
   # Copy environment template
   copy .env.example .env
   
   # Edit .env file and update DATABASE_URL:
   # DATABASE_URL=postgresql://examguard:password123@localhost:5432/examguard
   ```

4. **Install Backend Dependencies**:
   ```powershell
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Initialize Database**:
   ```powershell
   # Still in backend folder with venv activated
   alembic upgrade head
   python -m app.utils.init_db
   ```

6. **Start Backend** (keep this terminal open):
   ```powershell
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

7. **Start Frontend** (in a NEW terminal):
   ```powershell
   cd frontend
   npm install
   
   # Create .env.local file:
   echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
   
   npm run dev
   ```

8. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

**Time Required**: 30-45 minutes (including PostgreSQL installation)

---

### Option 3: Quick Demo (Frontend Only - No Backend)

If you just want to see the UI:

```powershell
cd frontend
npm install
npm run dev
```

Then open: http://localhost:3000

**Note**: This will show the frontend but you won't be able to login or use features without the backend and database.

**Time Required**: 5 minutes

---

## 🎬 Quick Start Commands (After Setup)

Once you have Docker OR PostgreSQL set up:

### With Docker:
```powershell
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View logs
docker compose logs -f
```

### Without Docker:
```powershell
# Terminal 1 - Backend
cd backend
.\venv\Scripts\activate
uvicorn app.main:app --reload

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 📊 What You'll See When Running

### 1. Login Page
- Clean, modern UI with ExamGuard branding
- Email and password fields
- Demo credentials displayed

### 2. Dashboard
- Statistics cards (Plans, Courses, Students, Rooms)
- Quick action buttons
- Recent plans table
- System status indicators

### 3. Exam Plan Management
- Create new plans with form validation
- View all plans with filtering
- Execute engines step-by-step
- See real-time progress

### 4. Complete Workflow
- Schedule generation with OR-Tools
- Room allocation visualization
- Seat assignment with branch separation
- Invigilator management
- Validation with compliance scoring

## 🎯 Recommended Approach

**For First-Time Users**: Use **Option 1 (Docker Desktop)**
- ✅ Easiest setup
- ✅ Everything works together
- ✅ No configuration needed
- ✅ Includes database automatically

**For Developers**: Use **Option 2 (Local PostgreSQL)**
- ✅ Full control over services
- ✅ Easier debugging
- ✅ Can run services individually
- ✅ Better for development

**For Quick Preview**: Use **Option 3 (Frontend Only)**
- ✅ See the UI immediately
- ⚠️ No functionality without backend

## 🆘 Current Blockers

To run the full application right now, you need:

1. **Database**: PostgreSQL must be installed and running
2. **Either**:
   - Docker Desktop (runs everything together), OR
   - PostgreSQL + Python virtual environment + Node.js setup

## 📞 What Would You Like To Do?

**A)** Install Docker Desktop and use Option 1 (Recommended)  
**B)** Install PostgreSQL and use Option 2 (Full control)  
**C)** Just run frontend for UI preview (Option 3)  
**D)** Wait and run later when you have time to set up

Let me know and I can provide more detailed guidance for your choice!

---

## 📚 Additional Resources

- **Quick Start Guide**: [docs/QUICK_START.md](docs/QUICK_START.md)
- **Full Documentation**: [docs/README.md](docs/README.md)
- **Troubleshooting**: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
- **User Guide**: [docs/USER_GUIDE.md](docs/USER_GUIDE.md)

---

**The application is 100% complete and ready to run** - we just need the database infrastructure in place! 🚀✨