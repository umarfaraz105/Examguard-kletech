# ExamGuard Troubleshooting Guide

Comprehensive troubleshooting guide for common issues and their solutions.

## 🚨 System Won't Start

### Docker Services Not Starting

**Issue**: `docker-compose up -d` fails or services don't start

**Solutions**:
```bash
# 1. Check Docker Desktop is running
docker --version
docker-compose --version

# 2. Check available resources
docker system df
docker system prune -f  # Clean up if needed

# 3. Stop conflicting services
docker-compose down
docker system prune -f
docker-compose up -d

# 4. Check service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db
```

**Common Causes**:
- Docker Desktop not running
- Insufficient memory (need 8GB+)
- Port conflicts (3000, 8000, 5432 in use)
- Corrupted Docker images

### Port Already in Use

**Issue**: `Error: Port 3000/8000/5432 is already in use`

**Solutions**:
```bash
# Find what's using the ports
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000
netstat -tulpn | grep :5432

# Kill the processes (Windows)
taskkill /PID <process_id> /F

# Kill the processes (Linux/Mac)
sudo kill -9 <process_id>

# Or use different ports in docker-compose.yml
services:
  frontend:
    ports:
      - "3001:3000"  # Use port 3001 instead
```

### Database Connection Failed

**Issue**: Backend can't connect to PostgreSQL

**Solutions**:
```bash
# 1. Check database status
docker-compose exec db pg_isready -U examguard

# 2. Verify database exists
docker-compose exec db psql -U examguard -l

# 3. Check database logs
docker-compose logs db

# 4. Reset database (CAUTION: destroys data)
docker-compose down -v
docker-compose up -d
docker-compose exec backend python -m app.utils.init_db
```

**Common Causes**:
- Database container not fully started
- Wrong credentials in `.env` file
- Database volume corruption

## 🔐 Authentication Issues

### Cannot Login

**Issue**: Login fails with correct credentials

**Solutions**:
```bash
# 1. Verify database is initialized
docker-compose exec backend python -m app.utils.init_db

# 2. Check if admin user exists
docker-compose exec db psql -U examguard -d examguard -c "SELECT email, role FROM users WHERE role = 'ADMIN';"

# 3. Reset admin password
docker-compose exec backend python -c "
from app.core.security import get_password_hash
from app.core.database import engine
from sqlalchemy import text
hash = get_password_hash('admin123')
with engine.connect() as conn:
    conn.execute(text('UPDATE users SET hashed_password = :hash WHERE email = :email'), 
                {'hash': hash, 'email': 'admin@kletu.ac.in'})
    conn.commit()
print('Password reset successfully')
"

# 4. Clear browser data
# Clear cookies, local storage, and cache for localhost:3000
```

**Exact Credentials to Try**:
```
Email: admin@kletu.ac.in
Password: admin123
```

### Token Expired Errors

**Issue**: `401 Unauthorized` errors after some time

**Solutions**:
```bash
# 1. Check token expiration settings
grep ACCESS_TOKEN_EXPIRE_MINUTES backend/.env

# 2. Clear browser storage
# Go to Developer Tools → Application → Storage → Clear All

# 3. Login again to get fresh token
```

**Prevention**:
- Increase token expiration time in `.env`
- Implement automatic token refresh (future enhancement)

### Permission Denied Errors

**Issue**: `403 Forbidden` when accessing features

**Check User Role**:
```sql
-- Connect to database
docker-compose exec db psql -U examguard -d examguard

-- Check user roles
SELECT id, email, role, is_active FROM users;

-- Update user role if needed
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@kletu.ac.in';
```

**Role Requirements**:
- **Create Plans**: ADMIN or EXAM_CELL
- **Execute Engines**: ADMIN or EXAM_CELL  
- **Manage Users**: ADMIN only
- **View Plans**: All authenticated users

## 📊 Engine Operation Issues

### Schedule Generation Fails

**Issue**: Engine 1 returns "INFEASIBLE" or times out

**Diagnostic Steps**:
```bash
# 1. Check course enrollment data
docker-compose exec db psql -U examguard -d examguard -c "
SELECT c.code, c.name, COUNT(sc.student_id) as enrollment
FROM courses c
LEFT JOIN student_courses sc ON c.id = sc.course_id
GROUP BY c.id, c.code, c.name
ORDER BY enrollment DESC;
"

# 2. Check for extreme conflicts
docker-compose exec db psql -U examguard -d examguard -c "
SELECT c1.code, c2.code, COUNT(DISTINCT sc1.student_id) as shared_students
FROM courses c1, courses c2, student_courses sc1, student_courses sc2
WHERE c1.id < c2.id 
  AND c1.id = sc1.course_id 
  AND c2.id = sc2.course_id 
  AND sc1.student_id = sc2.student_id
GROUP BY c1.code, c2.code
ORDER BY shared_students DESC
LIMIT 10;
"
```

**Solutions**:
```python
# 1. Increase timeout
{
  "plan_id": 1,
  "course_ids": [1, 2, 3],
  "timeout_seconds": 120  # Increase from 60
}

# 2. Reduce problem size
# Select fewer courses per scheduling run

# 3. Check date range
# Ensure sufficient days between start_date and end_date

# 4. Verify rules
# Check minimum gap requirements aren't too restrictive
```

### Room Allocation Fails

**Issue**: Engine 2a can't find suitable rooms

**Diagnostic Steps**:
```sql
-- Check room availability and capacity
SELECT r.name, r.capacity, r.building, 
       COUNT(b.id) as bench_count,
       (COUNT(b.id) * 2) as theoretical_capacity
FROM rooms r
LEFT JOIN benches b ON r.id = b.room_id
GROUP BY r.id, r.name, r.capacity, r.building
ORDER BY r.capacity DESC;

-- Check exam requirements
SELECT se.id, c.code, COUNT(sc.student_id) as students_needed
FROM scheduled_exams se
JOIN courses c ON se.course_id = c.id
LEFT JOIN student_courses sc ON c.id = sc.course_id
WHERE se.plan_id = 1  -- Replace with actual plan ID
GROUP BY se.id, c.code;
```

**Solutions**:
```bash
# 1. Add more rooms
curl -X POST http://localhost:8000/api/rooms \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "R-201",
    "building": "Main Block", 
    "floor": 2,
    "capacity": 60,
    "rows": 10,
    "columns": 6
  }'

# 2. Check room configurations
# Ensure rooms have benches created
# Verify capacity calculations are correct

# 3. Split large exams
# Consider creating separate sections for large courses
```

### Seat Allocation Branch Separation Issues

**Issue**: Engine 2b fails branch separation validation

**Debug Branch Distribution**:
```sql
-- Check student branch distribution
SELECT s.branch, COUNT(*) as count
FROM students s
JOIN student_courses sc ON s.id = sc.student_id  
JOIN courses c ON sc.course_id = c.id
WHERE c.id = 1  -- Replace with problematic course ID
GROUP BY s.branch
ORDER BY count DESC;

-- Check room layout
SELECT r.name, r.rows, r.columns, COUNT(b.id) as bench_count
FROM rooms r
LEFT JOIN benches b ON r.id = b.room_id
WHERE r.id = 1  -- Replace with problematic room ID
GROUP BY r.id, r.name, r.rows, r.columns;
```

**Solutions**:
```bash
# 1. Increase room capacity
# Use larger rooms or multiple rooms

# 2. Check bench layout
# Ensure proper grid configuration

# 3. Balance branch sizes
# Consider section reorganization if one branch dominates
```

### Invigilator Assignment Issues

**Issue**: Engine 3 can't find enough invigilators

**Check Faculty Availability**:
```sql
-- Check faculty count and availability
SELECT u.role, u.department, u.is_active, 
       COUNT(*) as count
FROM users u
WHERE u.role = 'FACULTY'
GROUP BY u.role, u.department, u.is_active;

-- Check specific date availability
SELECT u.full_name, u.department, fa.is_available, fa.reason
FROM users u
LEFT JOIN faculty_availability fa ON u.id = fa.user_id 
WHERE u.role = 'FACULTY' 
  AND fa.exam_date = '2024-12-01'  -- Replace with exam date
ORDER BY u.department, u.full_name;

-- Check current workload
SELECT u.full_name, u.department,
       COUNT(ia.id) as assignments,
       SUM(ia.workload_points) as total_workload
FROM users u
LEFT JOIN invigilator_assignments ia ON u.id = ia.user_id
WHERE u.role = 'FACULTY'
GROUP BY u.id, u.full_name, u.department
ORDER BY total_workload DESC;
```

**Solutions**:
```bash
# 1. Add more faculty users
curl -X POST http://localhost:8000/api/users \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "faculty@example.com",
    "password": "password123",
    "full_name": "Faculty Name",
    "employee_id": "FAC001",
    "department": "Computer Science",
    "role": "FACULTY"
  }'

# 2. Check ratio requirements
# Verify invigilator ratios in rules aren't too restrictive

# 3. Update availability
# Ensure faculty haven't marked themselves unavailable
```

## 🌐 Frontend Issues

### Page Won't Load

**Issue**: Frontend shows blank page or loading spinner

**Solutions**:
```bash
# 1. Check frontend container
docker-compose logs frontend

# 2. Check backend connectivity
curl http://localhost:8000/health

# 3. Check browser console
# Open Developer Tools → Console for JavaScript errors

# 4. Clear browser cache
# Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

# 5. Verify environment variables
cat frontend/.env.local
```

### API Connection Errors

**Issue**: Frontend can't connect to backend

**Check CORS Configuration**:
```bash
# Test CORS from browser domain
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS http://localhost:8000/api/plans

# Check backend CORS settings
grep ALLOWED_ORIGINS backend/.env
```

**Solutions**:
```bash
# 1. Update CORS origins in backend/.env
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:3001"]

# 2. Restart backend
docker-compose restart backend

# 3. Check API URL in frontend
# Verify NEXT_PUBLIC_API_URL in frontend/.env.local
```

### Authentication State Issues

**Issue**: User appears logged in but gets 401 errors

**Solutions**:
```javascript
// 1. Check browser storage
localStorage.getItem('access_token')

// 2. Clear authentication state
localStorage.removeItem('access_token')
// Refresh page

// 3. Check token in network requests
// Developer Tools → Network → Check Authorization headers
```

## 📊 Database Issues

### Database Performance Problems

**Issue**: Slow queries or timeouts

**Check Query Performance**:
```sql
-- Enable query logging (temporary)
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Check table sizes
SELECT schemaname, tablename,
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Solutions**:
```sql
-- 1. Update table statistics
ANALYZE;

-- 2. Rebuild indexes if needed
REINDEX DATABASE examguard;

-- 3. Check for missing indexes
-- See DATABASE.md for recommended indexes

-- 4. Increase connection pool
# In backend/app/core/database.py
engine = create_engine(
    DATABASE_URL,
    pool_size=30,      # Increase from 20
    max_overflow=50    # Increase from 30
)
```

### Database Connection Exhaustion

**Issue**: "Too many connections" errors

**Check Connections**:
```sql
-- Check current connections
SELECT count(*) FROM pg_stat_activity;

-- Check connection limit
SHOW max_connections;

-- See active connections by application
SELECT application_name, count(*)
FROM pg_stat_activity 
GROUP BY application_name;
```

**Solutions**:
```sql
-- 1. Kill idle connections (careful!)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity 
WHERE application_name = 'examguard'
  AND state = 'idle'
  AND query_start < NOW() - INTERVAL '1 hour';

-- 2. Increase connection limit (restart required)
ALTER SYSTEM SET max_connections = 200;

-- 3. Configure connection pooling properly
# Check backend/app/core/database.py settings
```

### Migration Issues

**Issue**: Alembic migrations fail

**Solutions**:
```bash
# 1. Check current migration state
docker-compose exec backend alembic current

# 2. Check migration history
docker-compose exec backend alembic history

# 3. Force migration to head (CAUTION)
docker-compose exec backend alembic stamp head

# 4. Create new migration if needed
docker-compose exec backend alembic revision --autogenerate -m "Fix issues"

# 5. Reset migrations (DESTROYS DATA)
docker-compose down -v
docker-compose up -d
docker-compose exec backend python -m app.utils.init_db
```

## 🔧 Performance Issues

### High Memory Usage

**Issue**: System using too much RAM

**Check Memory Usage**:
```bash
# Check Docker container memory
docker stats

# Check system memory
free -h  # Linux
# Activity Monitor on Mac
# Task Manager on Windows

# Check database memory
docker-compose exec db psql -U examguard -c "
SELECT 
  setting as max_connections,
  pg_size_pretty(setting::bigint * 1024) as shared_buffers
FROM pg_settings 
WHERE name IN ('max_connections', 'shared_buffers');
"
```

**Solutions**:
```yaml
# 1. Add memory limits to docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 2G
  db:
    deploy:
      resources:
        limits:
          memory: 4G
```

### Slow Engine Execution

**Issue**: Engines take too long to execute

**Performance Tuning**:
```python
# 1. For Engine 1 (Scheduling)
# Increase timeout in API request:
{
  "timeout_seconds": 300  # 5 minutes instead of 60 seconds
}

# 2. For Engine 2 (Seating) 
# Process smaller batches of students
# Consider room-by-room allocation

# 3. Monitor execution time
# Check logs for timing information
docker-compose logs backend | grep "Engine.*completed"
```

**System Optimization**:
```bash
# 1. Ensure SSD storage
# OR-Tools performs better with fast disk I/O

# 2. Increase CPU allocation
# Multi-core systems improve constraint solving

# 3. Optimize database
# Run ANALYZE regularly
# Consider read replicas for reporting
```

## 🔍 Debugging Tools

### Enable Debug Logging

```bash
# 1. Backend debug mode
# In backend/.env
DEBUG=true
LOG_LEVEL=DEBUG

# 2. Restart services
docker-compose restart backend

# 3. Watch logs in real-time  
docker-compose logs -f backend
```

### API Testing Tools

```bash
# 1. Test API health
curl http://localhost:8000/health

# 2. Test authentication
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kletu.ac.in","password":"admin123"}'

# 3. Test with token
TOKEN="<your-token-here>"
curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:8000/api/plans

# 4. Use interactive API docs
# Open http://localhost:8000/docs for Swagger UI
```

### Database Debugging

```sql
-- Check data integrity
SELECT 'users' as table_name, count(*) FROM users
UNION ALL
SELECT 'courses', count(*) FROM courses  
UNION ALL
SELECT 'students', count(*) FROM students
UNION ALL
SELECT 'plans', count(*) FROM plans;

-- Check relationships
SELECT p.name, COUNT(se.id) as scheduled_exams
FROM plans p
LEFT JOIN scheduled_exams se ON p.id = se.plan_id
GROUP BY p.id, p.name;

-- Check recent audit logs
SELECT action, entity_type, created_at
FROM audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

## 📞 Getting Help

### Log Collection for Support

```bash
# Collect all relevant logs
mkdir examguard-logs
docker-compose logs backend > examguard-logs/backend.log
docker-compose logs frontend > examguard-logs/frontend.log  
docker-compose logs db > examguard-logs/database.log

# System information
docker-compose ps > examguard-logs/services.txt
docker system info > examguard-logs/docker-info.txt

# Configuration (remove sensitive data!)
cp docker-compose.yml examguard-logs/
cp backend/.env examguard-logs/backend-env.txt  # REMOVE PASSWORDS FIRST!

# Create archive
tar -czf examguard-debug.tar.gz examguard-logs/
```

### Before Contacting Support

1. **Check this guide**: Most issues are covered here
2. **Review logs**: Look for specific error messages
3. **Try basic fixes**: Restart services, clear cache
4. **Check system resources**: Memory, disk space, CPU
5. **Document steps**: What were you doing when the issue occurred?

### Support Channels

- **Documentation**: Check [FAQ.md](FAQ.md) and [USER_GUIDE.md](USER_GUIDE.md)  
- **GitHub Issues**: For bug reports and feature requests
- **System Admin**: For installation and deployment issues
- **Development Team**: For complex technical problems

---

**Most issues can be resolved with the solutions above. When in doubt, restart services and check logs for specific error messages.**