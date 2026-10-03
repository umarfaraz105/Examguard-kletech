# 🚀 ExamGuard - How to Run the System

Complete instructions to get ExamGuard running on your system.

## ✅ System Status

**Project Complete**: All components built and ready to run ✨
- ✅ Backend API (FastAPI)
- ✅ Frontend UI (Next.js)  
- ✅ Database Schema (PostgreSQL)
- ✅ 4 Engines (Scheduling, Seating, Exam Mgmt, Validation)
- ✅ Complete Documentation

## 🔧 Prerequisites Check

Before running ExamGuard, you need:

### 1. Docker Desktop
**Status**: ⚠️ Not detected on your system

**Install Docker Desktop**:
1. Download from: https://www.docker.com/products/docker-desktop/
2. Choose "Docker Desktop for Windows"
3. Install and restart your computer
4. Open Docker Desktop to complete setup
5. Verify installation:
   ```powershell
   docker --version
   docker compose version
   ```

### 2. System Requirements
- ✅ **Operating System**: Windows (detected)
- ⚠️ **Memory**: Need 8GB RAM minimum
- ⚠️ **Disk Space**: Need 10GB free space
- ⚠️ **Docker Desktop**: Must be installed and running

## 🚀 Running ExamGuard (Once Docker is Installed)

### Option 1: Using Docker Compose (Recommended)

```powershell
# Navigate to project directory
cd "C:\Users\umarf\OneDrive\Desktop\project mini"

# Start all services
docker compose up -d

# Wait 30-60 seconds for services to start

# Initialize database with default data
docker compose exec backend python -m app.utils.init_db

# Check service status
docker compose ps
```

**Access the system**:
- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs

**Demo Login**:
```
Email: admin@kletu.ac.in
Password: admin123
```

### Option 2: Manual Setup (Without Docker)

If you prefer to run without Docker:

#### Backend Setup

```powershell
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up PostgreSQL (you'll need to install PostgreSQL separately)
# Create database: examguard
# Update backend/.env with your database credentials

# Run migrations
alembic upgrade head

# Initialize database
python -m app.utils.init_db

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Setup (in a new terminal)

```powershell
# Navigate to frontend
cd frontend

# Install Node.js dependencies
npm install

# Set up environment
# Create frontend/.env.local with:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```

## 📋 Verification Steps

Once services are running, verify:

### 1. Check Backend Health
```powershell
# Test backend API
curl http://localhost:8000/health
# Should return: {"status":"healthy"}
```

### 2. Check Frontend
- Open browser to http://localhost:3000
- Should see ExamGuard login page

### 3. Test Login
- Email: `admin@kletu.ac.in`
- Password: `admin123`
- Should redirect to dashboard

### 4. Test Basic Workflow
1. **Create Plan**: Click "Create New Exam Plan"
2. **Add Data**: Fill in plan details
3. **View Dashboard**: See statistics and recent plans

## 🔍 Common Issues

### Issue 1: "Docker command not found"
**Solution**: Install Docker Desktop (see Prerequisites above)

### Issue 2: "Port 3000 already in use"
**Solutions**:
```powershell
# Find what's using the port
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
```

### Issue 3: "Database connection failed"
**Solutions**:
```powershell
# Check if database is running
docker compose ps

# View database logs
docker compose logs db

# Restart database
docker compose restart db
```

### Issue 4: "Services won't start"
**Solutions**:
```powershell
# Check Docker Desktop is running
# Look for whale icon in system tray

# Stop and remove all containers
docker compose down -v

# Start fresh
docker compose up -d

# Reinitialize database
docker compose exec backend python -m app.utils.init_db
```

## 📊 Service Status Check

Run these commands to verify everything is working:

```powershell
# Check all services
docker compose ps

# Expected output:
# NAME                    STATUS
# project-mini-db-1       Up
# project-mini-backend-1  Up
# project-mini-frontend-1 Up

# Check logs if any service is down
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

## 🎯 Complete Test Workflow

Once logged in, test the complete workflow:

### 1. Create Exam Plan
- Dashboard → "Create New Exam Plan"
- Name: "Demo ISA-1 December 2024"
- Type: ISA1
- Dates: Select 7-day range
- Click "Create Plan"

### 2. Generate Schedule (Engine 1)
- Select courses to include
- Click "Generate Schedule"
- Wait for CP-SAT solver (~30 seconds)
- View generated exam timetable

### 3. Allocate Resources (Engines 2 & 3)
- For each exam, click:
  - "Rooms" - Allocate examination venues
  - "Seats" - Create seating arrangements
  - "Invigilators" - Assign faculty

### 4. Validate Plan (Engine 4)
- Click "Validate Plan"
- View compliance score and grade
- Review any issues found

### 5. Approve and Publish
- Click "Approve Plan"
- Click "Publish Plan"
- Plan is now live!

## 📚 Next Steps

After successfully running the system:

1. **Explore Features**: Try all menu items and functions
2. **Read Documentation**: Check [docs/USER_GUIDE.md](docs/USER_GUIDE.md)
3. **Review Architecture**: See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
4. **Test APIs**: Visit http://localhost:8000/docs
5. **Check Engines**: Review [docs/ENGINES.md](docs/ENGINES.md)

## 🆘 Getting Help

If you encounter issues:

1. **Check Logs**: `docker compose logs -f`
2. **Review Troubleshooting**: [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)
3. **Read FAQ**: [docs/FAQ.md](docs/FAQ.md)
4. **Verify Prerequisites**: Ensure Docker Desktop is running
5. **Restart Services**: `docker compose restart`

## 🎉 Success Indicators

You'll know the system is working when:

- ✅ All 3 Docker containers are running (`docker compose ps`)
- ✅ Backend health check returns OK (`curl http://localhost:8000/health`)
- ✅ Frontend loads at http://localhost:3000
- ✅ You can log in with admin credentials
- ✅ Dashboard shows statistics cards
- ✅ You can create a new exam plan

## 📝 System Information

**Project Location**: `C:\Users\umarf\OneDrive\Desktop\project mini`

**Key Files**:
- `docker-compose.yml` - Service orchestration
- `backend/.env.example` - Backend configuration template
- `frontend/.env.local` - Frontend environment variables
- `docs/` - Complete documentation suite

**Technology Stack**:
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL + OR-Tools
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Infrastructure**: Docker Compose + NGINX

## 🔄 Stopping the System

When you're done:

```powershell
# Stop all services (keeps data)
docker compose stop

# Stop and remove containers (keeps volumes)
docker compose down

# Stop and remove everything including data (CAUTION!)
docker compose down -v
```

## 📞 Quick Reference

**Start**: `docker compose up -d`  
**Stop**: `docker compose down`  
**Logs**: `docker compose logs -f`  
**Status**: `docker compose ps`  
**Restart**: `docker compose restart`  
**Init DB**: `docker compose exec backend python -m app.utils.init_db`

---

**Remember**: Install Docker Desktop first, then run the system. Everything is ready to go! 🚀✨