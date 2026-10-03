# ExamGuard Quick Start Guide

Get ExamGuard running in 5 minutes! This guide will have you creating and managing exam plans immediately.

## 🚀 Prerequisites

Before starting, ensure you have:
- **Docker Desktop** installed and running
- **8GB RAM** minimum available
- **Modern web browser** (Chrome 90+, Firefox 88+, Safari 14+)
- **10GB free disk space** for containers and data

## ⚡ Quick Setup

### Step 1: Get the Code
```bash
# Clone the repository (or download ZIP)
git clone <repository-url>
cd examguard
```

### Step 2: Start the System
```bash
# Start all services with one command
docker-compose up -d

# Wait for services to start (takes 30-60 seconds)
# Check status
docker-compose ps
```

### Step 3: Initialize Database
```bash
# Set up database with default data
docker-compose exec backend python -m app.utils.init_db

# This creates:
# - Default admin user
# - Sample rules for ISA and ESA exams  
# - Database schema and indexes
```

## 🌐 Access the System

### Frontend Application
- **URL**: http://localhost:3000
- **Description**: Main user interface for exam management

### Backend API
- **URL**: http://localhost:8000
- **Description**: REST API server with authentication

### API Documentation
- **URL**: http://localhost:8000/docs
- **Description**: Interactive Swagger/OpenAPI documentation

## 🔐 Login Credentials

Use these credentials to log in:

```
Email: admin@kletu.ac.in
Password: admin123
Role: Administrator (full access)
```

## 🎯 First Exam Plan (5-Minute Demo)

### Step 1: Login
1. Open http://localhost:3000
2. Enter the demo credentials above
3. Click "Sign In"
4. You'll see the dashboard with system statistics

### Step 2: Create Your First Plan
1. Click **"Create New Exam Plan"** button
2. Fill in the form:
   - **Plan Name**: "Demo ISA-1 December 2024"
   - **Exam Type**: Select "ISA1"
   - **Academic Year**: "2024-25"
   - **Start Date**: Any future date
   - **End Date**: 7 days after start date
   - **Description**: "Demo examination plan"
3. Click **"Create Plan"**

### Step 3: Generate Schedule (Engine 1)
1. You'll be redirected to the plan detail page
2. Check the boxes next to sample courses
3. Click **"Generate Schedule (Engine 1)"**
4. Wait 10-30 seconds for optimization to complete
5. See the generated exam schedule with dates and times

### Step 4: Execute Additional Engines
For each scheduled exam, you can now:
1. Click **"Rooms"** to allocate examination venues (Engine 2a)
2. Click **"Seats"** to create detailed seating charts (Engine 2b)  
3. Click **"Invigilators"** to assign faculty members (Engine 3)

### Step 5: Validate and Score (Engine 4)
1. Click **"Validate Plan"** button
2. Engine 4 will audit the entire plan independently
3. See compliance score, grade, and detailed issue analysis
4. Review recommendations for improvements

## 🎉 Congratulations!

You've successfully:
- ✅ Started the ExamGuard system
- ✅ Created an exam plan
- ✅ Generated an optimized schedule
- ✅ Executed all four engines
- ✅ Validated compliance

## 📊 What You Can Explore Next

### Dashboard Features
- **Statistics Cards**: View system overview
- **Recent Plans**: Quick access to latest work
- **System Status**: Monitor health indicators

### Plan Management
- **View All Plans**: Navigate to Plans page
- **Filter by Status**: Use dropdown filters
- **Plan Workflow**: Experience DRAFT → APPROVED → PUBLISHED flow

### User Roles (Create Test Users)
1. Go to API docs: http://localhost:8000/docs
2. Use POST `/api/auth/register` to create users with different roles:
   - **EXAM_CELL**: Can manage exams but not users
   - **HOD**: Department-level access
   - **FACULTY**: Can view and confirm assignments

### Sample Data Exploration
The system comes pre-loaded with:
- **5 Sample Courses**: CS101, CS102, CS103, EC101, ME101
- **Default Rules**: ISA (60 min, 1:30 ratio) and ESA (180 min, 1:24 ratio)
- **Room Templates**: Ready for room creation

## 🔧 Development Mode (Optional)

For developers who want to run services individually:

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows

pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
# Access at http://localhost:3001 (different port to avoid conflicts)
```

## 🐛 Troubleshooting Quick Issues

### Services Won't Start
```bash
# Check Docker is running
docker --version

# Check available memory
docker system df

# Restart services
docker-compose down
docker-compose up -d
```

### Database Connection Issues
```bash
# Check database status
docker-compose exec db pg_isready -U examguard

# Reset database if needed
docker-compose down -v
docker-compose up -d
docker-compose exec backend python -m app.utils.init_db
```

### Frontend Can't Connect to API
1. Verify backend is running: http://localhost:8000/health
2. Check CORS settings in backend/.env
3. Clear browser cache and cookies

### Login Issues
1. Ensure database is initialized (Step 3 of setup)
2. Try the exact credentials: `admin@kletu.ac.in` / `admin123`
3. Check browser developer console for errors

## 📚 Next Steps

Now that you have ExamGuard running:

1. **Read the User Guide**: [USER_GUIDE.md](USER_GUIDE.md) for complete features
2. **Explore the API**: http://localhost:8000/docs for integration possibilities
3. **Check Architecture**: [ARCHITECTURE.md](ARCHITECTURE.md) for technical details
4. **Production Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md) for real-world setup

## 🆘 Need Help?

- **Common Issues**: Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Frequently Asked**: See [FAQ.md](FAQ.md)
- **Feature Questions**: Review [USER_GUIDE.md](USER_GUIDE.md)
- **Technical Details**: Study [ARCHITECTURE.md](ARCHITECTURE.md)

---

**Welcome to ExamGuard!** You're now ready to manage examinations intelligently with our multi-engine system. 🎓✨