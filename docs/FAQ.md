# ExamGuard Frequently Asked Questions (FAQ)

Common questions and answers about the ExamGuard examination management system.

## 🎯 General Questions

### What is ExamGuard?
ExamGuard is an intelligent multi-engine examination management system designed for educational institutions. It automates the complete exam lifecycle from planning to reporting using four specialized engines for scheduling, room allocation, seating arrangement, and validation.

### Who is ExamGuard designed for?
ExamGuard is built specifically for **KLE Technological University** but can be adapted for other educational institutions. It serves:
- **Administrators**: Complete system management
- **Exam Cell**: Exam planning and execution
- **HODs**: Department-level oversight
- **Faculty**: Assignment management and confirmation

### What makes ExamGuard different from other exam management systems?
- **Multi-Engine Architecture**: Four specialized engines work together
- **OR-Tools Integration**: Uses Google's constraint programming solver
- **No Hard-Coded Rules**: All parameters configurable in database
- **Independent Validation**: Engine 4 audits without bias
- **Branch Separation**: Automated seating with conflict avoidance
- **Complete Audit Trail**: Every operation logged

## 🚀 Getting Started

### What do I need to run ExamGuard?
**Minimum Requirements:**
- Docker Desktop installed
- 8GB RAM available
- 10GB free disk space
- Modern web browser (Chrome 90+, Firefox 88+)

**Recommended:**
- 16GB RAM for optimal performance
- SSD storage for faster database operations
- Dual-core CPU (quad-core preferred)

### How do I install ExamGuard?
1. Clone the repository
2. Run `docker-compose up -d`
3. Execute `docker-compose exec backend python -m app.utils.init_db`
4. Access http://localhost:3000

See [QUICK_START.md](QUICK_START.md) for detailed instructions.

### What are the default login credentials?
```
Email: admin@kletu.ac.in
Password: admin123
Role: Administrator
```
**Important**: Change these credentials immediately in production!

## 📋 Exam Planning

### How does exam scheduling work?
Engine 1 uses constraint programming (OR-Tools CP-SAT solver) to create optimal schedules:

1. Analyzes student enrollments to detect course conflicts
2. Builds a conflict graph where nodes are courses and edges are shared students
3. Uses constraint programming to assign dates and sessions
4. Minimizes conflicts while respecting gap requirements
5. Generates `ScheduledExam` records with exact times

### What exam types are supported?
Three exam types with different rules:
- **ISA1** (Internal Semester Assessment 1): 60 minutes, 1 day gap, 1:30 ratio
- **ISA2** (Internal Semester Assessment 2): 60 minutes, 1 day gap, 1:30 ratio  
- **ESA** (End Semester Assessment): 180 minutes, 2 day gap, 1:24 ratio, min 2 per room

### Can I customize exam rules?
Yes! All rules are stored in the database:
- Duration, gap requirements, ratios are configurable
- No code changes needed - modify via Rules interface
- Changes apply to future operations immediately

### What happens if the system can't create a feasible schedule?
The CP-SAT solver returns one of three statuses:
- **OPTIMAL**: Best possible solution found
- **FEASIBLE**: Good solution found within time limit
- **INFEASIBLE**: No valid solution exists

For infeasible schedules, try:
- Extending the date range
- Reducing course conflicts by splitting large groups
- Increasing the timeout period

## 🏢 Room and Seating

### How does room allocation work?
Engine 2a uses a First-Fit Decreasing algorithm:
1. Calculates required capacity based on student count
2. Sorts available rooms by capacity (largest first)
3. Assigns rooms ensuring availability and sufficient space
4. Supports multiple rooms per exam if needed

### What is branch separation in seating?
Branch separation prevents students from the same academic branch from sitting adjacent to each other:
- Checks 8 directions: front, back, left, right, and 4 diagonals
- Groups students by branch before placement
- Uses greedy algorithm to maintain separation
- Generates unique seat codes (R-101-B04-L format)

### What does the seat code format mean?
Seat codes follow the pattern: **R-101-B04-L**
- **R-101**: Room number
- **B04**: Bench number  
- **L**: Position (L=Left, R=Right)

This provides hierarchical identification: Room → Bench → Position

### Can students be moved after seat allocation?
Yes, but it requires re-running Engine 2b (seat allocation) for that exam. The system will maintain branch separation rules during reallocation.

## 👨‍🏫 Invigilator Management

### How are invigilators assigned?
Engine 3 uses workload balancing:
1. Calculates required count based on student-to-invigilator ratios
2. Checks faculty availability for the exam date
3. Selects faculty with the lowest current workload
4. Assigns roles: PRIMARY, RELIEF, RESERVE
5. Sends notifications for confirmation

### What are the invigilator ratios?
Default ratios (configurable via rules):
- **ISA exams**: 1 invigilator per 30 students
- **ESA exams**: 1 invigilator per 24 students  
- **Minimum**: 2 invigilators per room regardless of student count

### How do faculty confirm or decline assignments?
Faculty can:
1. View assignments on their dashboard
2. Click "Confirm" or "Decline" for each assignment
3. Add notes when declining
4. Set availability in advance to avoid conflicts

### What happens if an invigilator declines?
The system supports replacement workflow:
1. Original assignment is marked as declined
2. System finds replacement using same workload balancing
3. New notification sent to replacement invigilator
4. Original declining faculty receives confirmation
5. All changes logged in audit trail

## ✅ Validation and Reporting

### What does Engine 4 validate?
Engine 4 independently checks:
- **Scheduling Rules**: Conflicts, gaps, timing compliance
- **Seating Rules**: Capacity, branch separation, room assignments
- **Invigilation Rules**: Ratios, minimums, availability
- **Completeness**: All required data present

### How is the compliance score calculated?
Compliance scoring (0-100%):
- Starts at 100%
- Deducts points based on issue severity:
  - **CRITICAL**: -20 points each
  - **ERROR**: -10 points each  
  - **WARNING**: -3 points each
  - **INFO**: -1 point each
- Letter grades: A+ (95-100%), A (90-94%), B (80-89%), etc.

### What report formats are available?
- **PDF**: Compliance reports with detailed analysis
- **Excel**: Schedule tables, seating charts, invigilator lists
- **JSON**: Raw data for API integration
- **Dashboard**: Real-time analytics and visualizations

## 🔐 Security and Access

### What user roles are supported?
Four roles with different permissions:
- **ADMIN**: Full system access, user management
- **EXAM_CELL**: Exam operations, plan management
- **HOD**: Department-level access, view reports
- **FACULTY**: View assignments, confirm duties

### How is data secured?
- **Authentication**: JWT tokens with expiration
- **Authorization**: Role-based access control
- **Password Security**: Bcrypt hashing with salts
- **SQL Injection Prevention**: Parameterized queries only
- **Audit Trail**: All operations logged with user tracking

### Can I integrate ExamGuard with other systems?
Yes! ExamGuard provides:
- **REST API**: Complete CRUD operations
- **OpenAPI Documentation**: Interactive docs at `/docs`
- **JSON Export**: Data in standard formats
- **Webhook Support**: Planned for future releases

## 🔧 Technical Questions

### What technology stack does ExamGuard use?
**Backend:**
- Python 3.11, FastAPI, SQLAlchemy 2.0
- PostgreSQL, OR-Tools, Alembic
- JWT authentication, Pydantic validation

**Frontend:**
- Next.js 14, TypeScript, Tailwind CSS
- React Context, Axios, Custom components

**Infrastructure:**
- Docker Compose, NGINX, systemd
- Let's Encrypt SSL, health monitoring

### How does ExamGuard handle large datasets?
Performance optimizations:
- **Database Indexes**: Optimized for common queries  
- **Connection Pooling**: 20 connections with 30 overflow
- **Constraint Solver**: OR-Tools optimized for institutional scale
- **Pagination**: API endpoints support offset/limit
- **Caching**: Rule provider caches frequently accessed data

### Can ExamGuard run on cloud platforms?
Yes! ExamGuard supports deployment on:
- **AWS**: EC2, RDS, ELB, Route 53
- **Azure**: VM, Database, Load Balancer
- **Google Cloud**: Compute Engine, Cloud SQL
- **On-Premises**: Any Linux server with Docker

See [DEPLOYMENT.md](DEPLOYMENT.md) for cloud-specific instructions.

## 🐛 Troubleshooting

### The system won't start. What should I check?
1. **Docker**: Ensure Docker Desktop is running
2. **Memory**: Check available RAM (8GB minimum)
3. **Ports**: Verify ports 3000, 8000, 5432 are free
4. **Logs**: Run `docker-compose logs` to see errors

### Schedule generation is taking too long
- **Reduce Complexity**: Select fewer courses per run
- **Increase Timeout**: Use higher `timeout_seconds` value
- **Check Conflicts**: Complex conflict patterns take longer
- **Split Plans**: Create separate plans for different branches

### Faculty aren't receiving notifications
1. **Email Configuration**: Check SMTP settings in `.env`
2. **Notification Flags**: Verify `notification_sent` in database
3. **Email Validity**: Ensure faculty email addresses are correct
4. **Service Status**: Check if email service is running

### API endpoints return 401 Unauthorized
- **Token Expiry**: Check if JWT token has expired
- **Login Again**: Re-authenticate to get fresh token
- **Role Permissions**: Verify user has required role
- **Token Format**: Ensure proper `Bearer <token>` format

### Seating allocation fails with branch separation errors
- **Room Layout**: Verify room has proper bench configuration
- **Capacity**: Ensure sufficient room capacity for branch separation
- **Student Distribution**: Check if branch sizes allow separation
- **Bench Positions**: Confirm benches have correct row/column data

## 📊 Performance and Scaling

### How many students can ExamGuard handle?
Tested performance:
- **Students**: 10,000+ per institution
- **Courses**: 500+ per semester
- **Rooms**: 100+ examination venues
- **Concurrent Plans**: Multiple active plans supported

### What are typical response times?
Benchmark results:
- **API Endpoints**: Average 287ms response time
- **Schedule Generation**: 45-course plan in 23 seconds
- **Seat Allocation**: 1000 students in under 5 seconds
- **Database Queries**: 95% under 100ms
- **Frontend Load**: 2.1 second Time to Interactive

### Can ExamGuard be horizontally scaled?
Future scaling options:
- **Multiple Backend Replicas**: Load balanced API servers
- **Database Scaling**: Read replicas for reporting
- **Microservice Architecture**: Extract engines to separate services
- **Caching Layer**: Redis for session and rule caching

## 🔮 Future Development

### What features are planned for future releases?
- **Advanced Analytics**: Machine learning for optimization
- **Mobile Apps**: Native iOS/Android applications
- **Multi-Campus Support**: University-wide deployment
- **Real-Time Collaboration**: Live plan editing
- **Integration APIs**: LMS and ERP system connections

### Can I contribute to ExamGuard development?
Yes! Contributions welcome:
- **Bug Reports**: Use GitHub issues
- **Feature Requests**: Submit enhancement proposals
- **Code Contributions**: Follow contribution guidelines
- **Documentation**: Help improve user guides

### How is ExamGuard licensed?
ExamGuard is **proprietary software** developed for KLE Technological University. Contact the development team for licensing inquiries.

---

**Didn't find your question?** Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or [USER_GUIDE.md](USER_GUIDE.md) for more detailed information.