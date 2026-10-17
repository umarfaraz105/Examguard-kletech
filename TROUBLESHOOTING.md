# ExamGuard Troubleshooting Guide

Quick reference for common issues and their solutions. For comprehensive troubleshooting, see [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md).

## Quick Diagnostics

```bash
# Check if all services are running
docker-compose ps

# View service logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Restart all services
docker-compose restart

# Complete reset (CAUTION: destroys data)
docker-compose down -v
docker-compose up -d
```

## Common Issues

### 1. System Won't Start

**Problem**: Docker services fail to start

**Quick Fix**:
```bash
# Stop everything
docker-compose down

# Clean up Docker resources
docker system prune -f

# Start fresh
docker-compose up -d

# Check logs for errors
docker-compose logs
```

### 2. Cannot Login

**Problem**: Login fails with correct credentials

**Default Credentials**:
- Email: `admin@kletu.ac.in`
- Password: `admin123`

**Quick Fix**:
```bash
# Reset admin password
docker-compose exec backend python -c "
from app.core.security import get_password_hash
from app.core.database import engine
from sqlalchemy import text
hash = get_password_hash('admin123')
with engine.connect() as conn:
    conn.execute(text('UPDATE users SET hashed_password = :hash WHERE email = :email'), 
                {'hash': hash, 'email': 'admin@kletu.ac.in'})
    conn.commit()
print('Password reset to: admin123')
"

# Clear browser cache and cookies
# Try login again
```

### 3. Port Already in Use

**Problem**: Error about port 3000, 8000, or 5432 already in use

**Quick Fix (Windows)**:
```powershell
# Find what's using the port
netstat -ano | findstr :8000

# Kill the process (replace PID)
taskkill /PID <process_id> /F
```

**Quick Fix (Linux/Mac)**:
```bash
# Find what's using the port
lsof -i :8000

# Kill the process
kill -9 <process_id>
```

### 4. Database Connection Failed

**Problem**: Backend can't connect to database

**Quick Fix**:
```bash
# Check database is running
docker-compose exec db pg_isready -U examguard

# If not ready, restart database
docker-compose restart db

# Wait 10 seconds, then restart backend
docker-compose restart backend

# Re-run migrations if needed
docker-compose exec backend alembic upgrade head
```

### 5. Frontend Shows Blank Page

**Problem**: Frontend loads but shows nothing

**Quick Fix**:
```bash
# Check frontend logs
docker-compose logs frontend

# Check backend is accessible
curl http://localhost:8000/health

# Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)

# Clear browser cache and local storage
# DevTools → Application → Storage → Clear All

# Restart frontend
docker-compose restart frontend
```

### 6. API Connection Errors (CORS)

**Problem**: Frontend can't connect to backend API

**Quick Fix**:
```bash
# Check CORS configuration
docker-compose exec backend cat .env | grep ALLOWED_ORIGINS

# Update CORS if needed (backend/.env)
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:3001"]

# Restart backend
docker-compose restart backend
```

### 7. Engine Execution Fails

**Problem**: Scheduling, seating, or invigilator assignment fails

**Quick Checks**:
```bash
# Check engine health
curl http://localhost:8000/api/engines/v2/health/all

# View recent engine executions
curl http://localhost:8000/api/engines/v2/engine1-scheduling/executions \
  -H "Authorization: Bearer <your-token>"

# Check backend logs for errors
docker-compose logs backend | grep -i error
```

**Engine-Specific Issues**:

- **Engine 1 (Scheduling)**: Increase timeout, check for course conflicts
- **Engine 2 (Room/Seating)**: Verify sufficient room capacity
- **Engine 3 (Invigilator)**: Check faculty availability

### 8. File Upload Failures

**Problem**: CSV or Excel upload fails

**Common Causes**:
- Wrong file format (must be CSV or XLSX)
- Missing required columns
- Invalid data in cells

**Quick Fix**:
- Check file format matches template
- Ensure all required columns present
- Remove special characters from data
- Check file size (< 10MB recommended)

### 9. Permission Denied Errors

**Problem**: `403 Forbidden` when accessing features

**Check User Role**:
```bash
# Connect to database
docker-compose exec db psql -U examguard -d examguard

# Check your user role
SELECT email, role, is_active FROM users WHERE email = 'your@email.com';

# Update role if needed (ADMIN only)
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

**Role Requirements**:
- **ADMIN**: All permissions
- **EXAM_CELL**: Create plans, execute engines, manage data
- **HOD**: View plans, manage department faculty
- **FACULTY**: Set availability, view assignments
- **STUDENT**: View schedule, download hall ticket

### 10. Performance Issues

**Problem**: Slow response times or timeouts

**Quick Fixes**:
```bash
# Check Docker resource usage
docker stats

# Check database performance
docker-compose exec db psql -U examguard -d examguard -c "
SELECT schemaname, tablename, 
       pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 5;
"

# Run database optimization
docker-compose exec db psql -U examguard -d examguard -c "VACUUM ANALYZE;"

# Restart services
docker-compose restart
```

## Error Messages

### Common HTTP Status Codes

| Code | Meaning | Common Cause | Solution |
|------|---------|--------------|----------|
| 400 | Bad Request | Invalid input data | Check request format |
| 401 | Unauthorized | Missing/expired token | Login again |
| 403 | Forbidden | Insufficient permissions | Check user role |
| 404 | Not Found | Resource doesn't exist | Verify ID/URL |
| 500 | Server Error | Backend error | Check logs |

### Common Error Messages

**"Plan is already published"**
- Published plans cannot be modified
- Create a new plan or clone existing one

**"Conflict detected"**
- Student enrolled in conflicting courses
- Use Engine 4 conflict dashboard to identify
- Resolve enrollment conflicts

**"Insufficient room capacity"**
- Not enough rooms/benches for students
- Add more rooms or increase capacity
- Consider splitting large exams

**"No feasible solution"**
- OR-Tools can't find valid schedule
- Increase timeout_seconds parameter
- Reduce constraints (gap days, etc.)
- Check for impossible conflicts

**"Token has expired"**
- JWT token expired (default 30 minutes)
- Login again to get fresh token

## Debug Mode

Enable detailed logging for troubleshooting:

```bash
# Backend debug mode
# Edit backend/.env
DEBUG=true
LOG_LEVEL=DEBUG

# Restart backend
docker-compose restart backend

# Watch logs in real-time
docker-compose logs -f backend
```

## Browser Console

Check browser console for frontend errors:

1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for red error messages
4. Check Network tab for failed API requests

## Getting More Help

### Comprehensive Guide
For detailed troubleshooting, see [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) which includes:
- Detailed diagnostic procedures
- Database debugging queries
- Engine-specific troubleshooting
- Performance optimization
- Security issues

### Other Resources
- **[FAQ](docs/FAQ.md)**: Frequently asked questions
- **[User Guide](docs/USER_GUIDE.md)**: Complete usage instructions
- **[API Documentation](docs/API.md)**: API reference

### Support Channels
1. Check documentation first
2. Search existing GitHub issues
3. Create new issue with:
   - Description of problem
   - Steps to reproduce
   - Error messages
   - Log files
   - System information

### Log Collection

If you need to report an issue, collect logs:

```bash
# Create logs directory
mkdir examguard-logs

# Collect service logs
docker-compose logs backend > examguard-logs/backend.log
docker-compose logs frontend > examguard-logs/frontend.log
docker-compose logs db > examguard-logs/database.log

# Collect system info
docker-compose ps > examguard-logs/services.txt
docker system info > examguard-logs/docker-info.txt

# Create archive
tar -czf examguard-logs.tar.gz examguard-logs/
```

**⚠️ Warning**: Remove sensitive data (passwords, tokens, personal information) before sharing logs.

---

**Most issues can be resolved by restarting services and checking logs. When in doubt, check [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for detailed solutions.**
