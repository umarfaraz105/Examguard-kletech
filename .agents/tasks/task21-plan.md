# Task 21: Comprehensive Documentation Plan

This plan details the creation and enhancement of all documentation for the ExamGuard examination management system. Each file section lists the source references for accurate, grounded content.

---

## 1. README.md (Root) - Enhancement

**Current State**: Comprehensive README exists with plugin architecture overview, tech stack, quick start.

**Enhancements Needed**:
- Expand "Quick Start" section with troubleshooting for common startup issues
- Add "Documentation Navigation" section linking to all docs
- Include contribution guidelines summary
- Add system requirements (Docker, Node.js, Python versions)
- Enhance production deployment warnings
- Add badges/status indicators

**Sections to Add/Enhance**:
1. **Prerequisites & System Requirements** - explicit versions from package.json, requirements.txt
2. **Documentation Guide** - navigation to all documentation files
3. **Production Checklist** - reference frontend/SECURITY.md checklist
4. **Contribution Quick Links** - link to CONTRIBUTING.md
5. **Troubleshooting Quick Links** - link to TROUBLESHOOTING.md
6. **License & Contact** - expand existing section

**Reference Files**:
- Current README.md
- frontend/package.json (Node.js version)
- backend/requirements.txt (Python dependencies)
- frontend/SECURITY.md (production checklist)
- docs/QUICK_START.md (setup steps)

**Verification**: Review README renders correctly on GitHub, all links work, quick start instructions are accurate

---

## 2. CONTRIBUTING.md (Root) - New File

**Purpose**: Guide developers contributing to ExamGuard

**Sections to Write**:

### 2.1 Welcome & Project Overview
- Brief system description (from README.md)
- Plugin architecture emphasis (from docs/ARCHITECTURE.md)

### 2.2 Development Environment Setup
- Prerequisites (Docker, Node.js 18+, Python 3.11+)
- Clone and setup steps
- Running backend locally: `cd backend && python -m venv venv && pip install -r requirements.txt && alembic upgrade head && uvicorn app.main:app --reload`
- Running frontend locally: `cd frontend && npm install && npm run dev`
- Database initialization steps

### 2.3 Project Structure
- Directory tree from STRUCTURE.md
- Key directories: backend/app/services (engines), frontend/src/app (routes), backend/app/api (endpoints)

### 2.4 Coding Standards
- **Backend**: Python type hints, Pydantic schemas, FastAPI best practices
- **Frontend**: TypeScript strict mode, React hooks patterns
- **Testing**: pytest for backend, Jest for frontend (from package.json)
- **Security**: Input sanitization (reference frontend/SECURITY.md)

### 2.5 Adding a New Engine (Plugin)
- Step-by-step guide from docs/ENGINES.md
- Implement BaseEngine interface (app/core/engine_interface.py)
- Register in app/main.py startup
- No modification to existing engine code required
- Example: Creating Engine 5

### 2.6 Testing Guidelines
- Run backend tests: `cd backend && pytest`
- Run frontend tests: `cd frontend && npm test`
- Test coverage requirements: `pytest --cov` and `npm run test:coverage`
- Integration tests pattern

### 2.7 Commit Message Guidelines
- Conventional Commits format: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Reference issue numbers

### 2.8 Pull Request Process
- Create feature branch
- Run all tests
- Update documentation
- PR template checklist

### 2.9 Code Review Guidelines
- What reviewers look for
- Response time expectations

**Reference Files**:
- README.md (architecture overview)
- docs/ARCHITECTURE.md (plugin system)
- docs/ENGINES.md (engine creation)
- backend/requirements.txt (dependencies)
- frontend/package.json (scripts and dependencies)
- frontend/SECURITY.md (security practices)

**Verification**: Follow setup instructions on clean machine, verify all commands work

---

## 3. TROUBLESHOOTING.md (Root) - New File

**Purpose**: Centralized troubleshooting guide for common issues

**Sections to Write**:

### 3.1 System Won't Start
- Docker services not starting (from docs/TROUBLESHOOTING.md)
- Port conflicts (3000, 8000, 5432)
- Database connection failures
- Commands to check: `docker ps`, `docker-compose logs`, `netstat -tulpn`

### 3.2 Authentication Issues
- Cannot login (verify admin user exists in DB)
- Token expiration (check ACCESS_TOKEN_EXPIRE_MINUTES in .env)
- Role-based access denied (verify UserRole enum in backend/app/models/user.py)

### 3.3 Frontend Issues
- White screen / Build errors
- API connection failures (check NEXT_PUBLIC_API_URL)
- CORS errors (backend allows localhost:3000)
- CSP violations (check frontend/SECURITY.md and next.config.js)

### 3.4 Backend Issues
- Import errors (verify virtual environment activated)
- Database migration errors: `alembic upgrade head`
- OR-Tools import failure (Engine 1) - check ortools in requirements.txt
- SQLAlchemy connection pool exhaustion

### 3.5 Engine Execution Failures
- Engine 1 (Scheduling): No feasible solution - check course conflicts, date ranges
- Engine 2 (Room/Seating): Insufficient room capacity - verify room/bench data
- Engine 3 (Invigilator): No available invigilators - check faculty availability table
- Check engine health: GET /api/engines/v2/{engine_name}/health

### 3.6 Data Import Issues
- CSV upload failures (format validation from frontend/src/lib/upload-utils.ts)
- Student enrollment errors
- Course registration conflicts

### 3.7 Performance Issues
- Slow scheduling (increase timeout_seconds in Engine 1)
- Database query optimization
- Frontend bundle size (check with `npm run analyze`)

### 3.8 Common Error Messages
- "Plan is already published" - cannot modify published plans
- "Conflict detected" - use Engine 4 conflict dashboard
- "Insufficient permissions" - check user role (backend/app/models/user.py)

### 3.9 Debugging Tips
- Enable debug logging in backend
- Use browser DevTools Network tab for API inspection
- Check engine execution history: GET /api/engines/v2/{engine_name}/executions
- Review audit logs: backend/app/models/audit_log.py

**Reference Files**:
- docs/TROUBLESHOOTING.md (existing content)
- frontend/SECURITY.md (CSP issues)
- backend/app/api/engines_v2.py (engine endpoints)
- backend/app/models/user.py (roles and permissions)
- frontend/src/lib/upload-utils.ts (file validation)

**Verification**: Test each troubleshooting step, verify commands produce expected output

---

## 4. docs/README.md - Already Exists, Minor Enhancement

**Current State**: Complete documentation index with all major docs listed

**Enhancements Needed**:
- Add links to new root-level CONTRIBUTING.md and TROUBLESHOOTING.md
- Update "Last Updated" date
- Verify all document links are correct

**Sections to Update**:
1. Core Documentation table - add CONTRIBUTING.md
2. Quick Reference table - verify TROUBLESHOOTING.md link

**Reference Files**: 
- Existing docs/README.md

**Verification**: All links resolve correctly

---

## 5. docs/USER_GUIDE.md - Enhancement

**Current State**: Good foundation with roles, dashboard, workflow overview

**Sections to Add/Enhance**:

### 5.1 Complete Workflow Examples
- End-to-end ISA-1 exam planning walkthrough
- Screenshots placeholders for each step
- Expected outcomes at each stage

### 5.2 Role-Specific Guides by Page Route

#### Admin/Exam Cell User Flow:
- **Login** (frontend/src/app/login) - Authentication
- **Dashboard** (frontend/src/app/dashboard) - Statistics overview
- **Plans** (frontend/src/app/plans) - Create/manage exam plans (reference backend/app/api/plans.py endpoints)
- **Courses** (frontend/src/app/courses) - Course management (reference backend/app/api/courses.py)
- **Students** (frontend/src/app/students) - Student records (reference backend/app/api/students.py)
- **Rooms** (frontend/src/app/rooms) - Room and bench setup (reference backend/app/api/rooms.py)
- **Rules** (frontend/src/app/rules) - Configure exam rules (reference backend/app/api/rules.py)
- **Reports** (frontend/src/app/reports) - Generate compliance/seating reports
- **Seating** (frontend/src/app/seating) - View seat assignments

#### Faculty User Flow:
- **Invigilators** (frontend/src/app/invigilators) - View assignments, set availability (reference backend/app/api/invigilators.py)
- **Dashboard** - View upcoming duties
- **Notifications** (frontend/src/app/notifications) - Duty notifications

#### Student User Flow:
- **Dashboard** - View exam schedule
- **Hall Tickets** (frontend/src/app/hall-tickets) - Download hall ticket with QR code
- **Seating** - Find seat assignment
- **Marks** (frontend/src/app/marks) - View results

### 5.3 Engine Execution Guide
- Using Engine 1: Schedule generation (POST /api/engines/v2/engine1-scheduling/execute)
- Using Engine 2: Room and seating allocation (POST /api/engines/v2/engine2-room-seating/execute)
- Using Engine 3: Invigilator assignment (POST /api/engines/v2/engine3-invigilator/execute)
- Monitoring execution status (GET /api/engines/v2/{engine_name}/status/{execution_id})
- Understanding execution results

### 5.4 Report Generation
- Compliance reports (Engine 4)
- Seating charts
- Invigilator duty rosters
- Export formats (PDF, Excel, JSON)

### 5.5 Common Tasks
- Bulk student enrollment
- CSV import format
- Cloning exam plans
- Handling conflicts

**Reference Files**:
- Existing docs/USER_GUIDE.md
- backend/app/api/*.py (all endpoint files)
- backend/app/models/user.py (roles and permissions)
- frontend/src/app/*/page.tsx (route functionality)
- backend/API.md (endpoint examples)

**Verification**: Walk through each user flow, verify endpoints and permissions match code

---

## 6. docs/ADMIN_GUIDE.md - New File

**Purpose**: System administration and configuration guide

**Sections to Write**:

### 6.1 Installation & Initial Setup
- Docker Compose deployment
- Environment variable configuration (.env files)
- Database initialization: `alembic upgrade head`
- Creating first admin user

### 6.2 User Management
- User roles from backend/app/models/user.py: ADMIN, EXAM_CELL, HOD, FACULTY, STUDENT
- Creating users (POST /api/users)
- Role assignment and permissions
- Deactivating users (DELETE /api/users/{id})

### 6.3 Rule Configuration
- Rule table structure (backend/app/models/rule.py)
- Exam types: ISA1, ISA2, ESA
- Configuring exam duration, students per bench, gap days, invigilator ratios
- Rule validation

### 6.4 System Configuration
- Engine configuration (backend/app/models/engine_execution.py)
- Engine health monitoring (GET /api/engines/v2/health/all)
- Enabling/disabling engines
- Performance tuning (OR-Tools timeout, database connection pool)

### 6.5 Backup & Recovery
- Database backup: `docker-compose exec db pg_dump -U examguard examguard > backup.sql`
- Restore procedure: `docker-compose exec db psql -U examguard examguard < backup.sql`
- File storage backup
- Disaster recovery plan

### 6.6 Monitoring & Logs
- Application logs: `docker-compose logs backend`
- Database logs: `docker-compose logs db`
- Audit trail (backend/app/models/audit_log.py)
- Engine execution history (GET /api/engines/v2/{engine_name}/executions)

### 6.7 Security Administration
- JWT token configuration (backend/app/core/security.py)
- Password policies
- Rate limiting (backend/app/core/rate_limiter.py)
- CSRF protection (frontend/SECURITY.md)
- CSP configuration (frontend next.config.js)

### 6.8 Performance Optimization
- Database indexing (check backend/app/models/*.py)
- Query optimization
- Frontend bundle optimization: `npm run analyze`
- Caching strategies

### 6.9 Upgrades & Maintenance
- Database migration procedure: `alembic upgrade head`
- Rolling updates
- Dependency updates (npm audit, pip list --outdated)
- Downtime planning

**Reference Files**:
- backend/app/models/user.py (roles)
- backend/app/models/rule.py (rule structure)
- backend/app/models/audit_log.py (audit trail)
- backend/app/models/engine_execution.py (engine tracking)
- backend/app/core/security.py (JWT, passwords)
- backend/app/core/rate_limiter.py (rate limiting)
- frontend/SECURITY.md (frontend security)
- docker-compose.yml (deployment)

**Verification**: Follow installation steps on clean server, verify all admin operations work

---

## 7. docs/STUDENT_GUIDE.md - New File

**Purpose**: Student-focused guide for accessing exam information

**Sections to Write**:

### 7.1 Getting Started
- How to receive login credentials
- First-time login (frontend/src/app/login)
- Password change

### 7.2 Viewing Exam Schedule
- Dashboard view (frontend/src/app/dashboard)
- Understanding exam dates, times, sessions
- Course-wise schedule

### 7.3 Finding Your Seat
- Accessing seating page (frontend/src/app/seating)
- Understanding seat assignments
- Room locations and bench numbers

### 7.4 Downloading Hall Ticket
- Hall ticket page (frontend/src/app/hall-tickets)
- QR code explanation
- What to bring to exam

### 7.5 Viewing Results
- Marks page (frontend/src/app/marks)
- Understanding grade display

### 7.6 Important Information
- Exam rules and regulations
- What happens if you have conflicts (escalation process)
- Contact information for exam cell

### 7.7 Frequently Asked Questions
- "I can't see my seat assignment" - check if plan is published
- "I have two exams at the same time" - Engine 1 should prevent this, contact exam cell
- "I forgot my password" - password reset procedure
- "My hall ticket won't download" - browser requirements, PDF generation

**Reference Files**:
- frontend/src/app/login/page.tsx
- frontend/src/app/dashboard/page.tsx
- frontend/src/app/seating/page.tsx
- frontend/src/app/hall-tickets/page.tsx
- frontend/src/app/marks/page.tsx
- backend/app/api/auth.py (authentication)
- backend/app/api/schedules.py (schedule viewing)
- backend/app/api/seating.py (seat assignments)

**Verification**: Follow guide as student user, verify all features work with STUDENT role

---

## 8. docs/API_REFERENCE.md - New File

**Purpose**: Complete REST API documentation for developers and integrators

**Sections to Write**:

### 8.1 API Overview
- Base URL: http://localhost:8000/api
- Authentication: JWT Bearer tokens
- Response formats (JSON)
- Error handling conventions

### 8.2 Authentication Endpoints
From backend/app/api/auth.py:
- POST /api/auth/register - Register new user
- POST /api/auth/login - Get JWT token
- POST /api/auth/token - OAuth2 compatible login
- GET /api/auth/me - Get current user
- POST /api/auth/change-password - Change password

### 8.3 User Management Endpoints
From backend/app/api/users.py:
- GET /api/users - List users (Admin/Exam Cell)
- GET /api/users/{id} - Get user by ID
- POST /api/users - Create user (Admin)
- PATCH /api/users/{id} - Update user
- DELETE /api/users/{id} - Deactivate user

### 8.4 Rule Configuration Endpoints
From backend/app/api/rules.py:
- GET /api/rules - List rules (filterable by exam_type)
- GET /api/rules/{id} - Get rule details
- POST /api/rules - Create rule (Admin/Exam Cell)
- PATCH /api/rules/{id} - Update rule
- DELETE /api/rules/{id} - Delete rule

### 8.5 Course Management Endpoints
From backend/app/api/courses.py:
- GET /api/courses - List courses
- GET /api/courses/{id} - Get course details
- POST /api/courses - Create course
- PATCH /api/courses/{id} - Update course
- DELETE /api/courses/{id} - Delete course

### 8.6 Student Management Endpoints
From backend/app/api/students.py:
- GET /api/students - List students
- GET /api/students/{id} - Get student details
- POST /api/students - Create student
- PATCH /api/students/{id} - Update student
- POST /api/students/{id}/enroll - Enroll in courses
- DELETE /api/students/{id} - Delete student

### 8.7 Room Management Endpoints
From backend/app/api/rooms.py:
- GET /api/rooms - List rooms
- GET /api/rooms/{id} - Get room with benches
- POST /api/rooms - Create room
- PATCH /api/rooms/{id} - Update room
- POST /api/rooms/{id}/benches - Add bench to room
- DELETE /api/rooms/{id} - Delete room

### 8.8 Exam Plan Endpoints
From backend/app/api/plans.py:
- GET /api/plans - List plans with statistics
- GET /api/plans/{id} - Get plan details
- POST /api/plans - Create plan
- PATCH /api/plans/{id} - Update plan
- POST /api/plans/{id}/approve - Approve plan
- POST /api/plans/{id}/publish - Publish plan
- DELETE /api/plans/{id} - Delete plan

### 8.9 Schedule Endpoints
From backend/app/api/schedules.py:
- GET /api/schedules - List scheduled exams
- GET /api/schedules/{id} - Get scheduled exam details

### 8.10 Seating Endpoints
From backend/app/api/seating.py:
- GET /api/seating - List seat assignments
- GET /api/seating/{id} - Get seat assignment

### 8.11 Invigilator Endpoints
From backend/app/api/invigilators.py:
- GET /api/invigilators/availability - List faculty availability
- POST /api/invigilators/availability - Set availability
- GET /api/invigilators/assignments - List assignments
- POST /api/invigilators/assignments/{id}/confirm - Confirm assignment

### 8.12 Engine API v2 (Universal Plugin API)
From backend/app/api/engines_v2.py:

**Engine Discovery:**
- GET /api/engines/v2/ - List all registered engines with metadata
- GET /api/engines/v2/{engine_name}/metadata - Get engine details
- GET /api/engines/v2/{engine_name}/health - Check engine health

**Engine Execution:**
- POST /api/engines/v2/{engine_name}/execute - Execute any engine
- GET /api/engines/v2/{engine_name}/status/{execution_id} - Get execution status
- GET /api/engines/v2/{engine_name}/executions - List execution history

**System Health:**
- GET /api/engines/v2/health/all - Check all engine health
- GET /api/engines/v2/dependencies/validate - Validate dependencies

**Engine-Specific Examples:**
- Engine 1 (Scheduling): POST /api/engines/v2/engine1-scheduling/execute with {plan_id, course_ids, start_date, end_date, sessions}
- Engine 2 (Room/Seating): POST /api/engines/v2/engine2-room-seating/execute with {scheduled_exam_ids, exam_type, operation}
- Engine 3 (Invigilator): POST /api/engines/v2/engine3-invigilator/execute with {scheduled_exam_ids, exam_type, operation}

### 8.13 Complete Workflow Example
- Copy workflow from backend/API.md (steps 1-9)
- Add additional examples for common use cases

### 8.14 Error Responses
- Standard HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Error response format: `{"detail": "Error message"}`

### 8.15 Rate Limiting & Security
- Rate limit policies (from backend/app/core/rate_limiter.py)
- CSRF token handling
- JWT token expiration (default 30 minutes)

**Reference Files**:
- backend/app/api/*.py (all API route files)
- backend/API.md (existing examples)
- backend/app/core/rate_limiter.py (rate limiting)
- backend/app/core/security.py (JWT handling)

**Verification**: Test every endpoint with curl/Postman, verify request/response examples are accurate

---

## 9. docs/ARCHITECTURE.md - Enhancement

**Current State**: Good foundation with plugin architecture diagram

**Sections to Add/Enhance**:

### 9.1 Technology Stack Details
- Backend: FastAPI 0.109.0, SQLAlchemy 2.0.25, Alembic 1.13.1 (from requirements.txt)
- Frontend: Next.js 14.1.0, React 18.2.0, TypeScript 5.3.3 (from package.json)
- Database: PostgreSQL (production), SQLite (development)
- Optimization: OR-Tools 9.8.3296 (Engine 1)
- Reports: openpyxl, reportlab

### 9.2 Database Schema
- Link to docs/DATABASE.md for detailed schema
- Key tables: users, courses, students, rooms, plans, scheduled_exams, seat_assignments, invigilator_assignments
- Audit trail: audit_log table (backend/app/models/audit_log.py)
- Engine tracking: engine_execution table (backend/app/models/engine_execution.py)

### 9.3 Engine Details
Each engine section should reference docs/ENGINES.md:
- Engine 1: CP-SAT solver algorithm (backend/app/services/engine1/)
- Engine 2: First-Fit Decreasing algorithm (backend/app/services/engine2/)
- Engine 3: Workload balancing algorithm (backend/app/services/engine3/)
- Engine 4: Independent validation (backend/app/services/engine4/)

### 9.4 Frontend Architecture
- Next.js App Router (frontend/src/app/)
- Component structure (frontend/src/components/)
- State management (React Context - frontend/src/contexts/)
- API client (frontend/src/lib/api.ts)
- Route protection and role-based rendering

### 9.5 Security Architecture
- JWT authentication flow (backend/app/core/security.py)
- Role-based access control (backend/app/models/user.py - UserRole enum)
- Rate limiting (backend/app/core/rate_limiter.py)
- Input sanitization (frontend/src/lib/security/sanitize.ts)
- CSP and security headers (frontend next.config.js)

### 9.6 Plugin Architecture Deep Dive
- BaseEngine interface (backend/app/core/engine_interface.py)
- EngineRegistry pattern (backend/app/core/engine_registry.py)
- Dynamic discovery mechanism
- Adding new engines without code changes

### 9.7 Data Flow Diagrams
- Authentication flow
- Engine execution pipeline
- Report generation flow

**Reference Files**:
- Existing docs/ARCHITECTURE.md
- backend/requirements.txt (dependency versions)
- frontend/package.json (dependency versions)
- backend/app/core/*.py (core infrastructure)
- backend/app/models/*.py (database models)
- frontend/src/app/ (routing structure)

**Verification**: Verify all version numbers match actual dependencies, diagrams accurately reflect code structure

---

## 10. docs/DEVELOPMENT.md - New File

**Purpose**: Developer guide for working on ExamGuard codebase

**Sections to Write**:

### 10.1 Development Environment
- IDE recommendations (VSCode with Python/TypeScript extensions)
- Git workflow (feature branches, main branch protection)
- Local development setup (from CONTRIBUTING.md)

### 10.2 Backend Development
- FastAPI project structure
- SQLAlchemy models and relationships (backend/app/models/)
- Pydantic schemas (backend/app/schemas/)
- Database migrations with Alembic: `alembic revision --autogenerate -m "message"` then `alembic upgrade head`
- Dependency injection pattern (backend/app/core/dependencies.py)

### 10.3 Frontend Development
- Next.js 14 App Router patterns
- TypeScript configuration (frontend/tsconfig.json)
- Component organization (frontend/src/components/)
- shadcn/ui component library usage
- API integration patterns

### 10.4 Engine Development
- Implementing BaseEngine interface (backend/app/core/engine_interface.py)
- Engine metadata specification
- Input/output validation
- Health check implementation
- Registration in app/main.py startup
- Example: Creating a new engine step-by-step

### 10.5 Testing
- Backend unit tests: pytest (backend/tests/)
- Frontend unit tests: Jest (frontend package.json scripts)
- Integration tests
- End-to-end tests: Playwright (frontend package.json scripts)
- Test coverage requirements
- Mocking strategies

### 10.6 API Development
- Adding new endpoints to existing routers (backend/app/api/*.py)
- Request/response schemas
- Authentication and authorization decorators
- Error handling patterns
- API versioning strategy

### 10.7 Database Development
- Creating new models (backend/app/models/)
- Migration best practices
- Indexing strategies
- Query optimization
- Relationship patterns (one-to-many, many-to-many)

### 10.8 Frontend Features
- Creating new pages (frontend/src/app/)
- Form handling with react-hook-form
- Data fetching patterns
- Loading states and error boundaries
- Accessibility requirements (WCAG compliance)

### 10.9 Debugging
- Backend debugging (uvicorn --reload, breakpoints)
- Frontend debugging (React DevTools, Next.js debugging)
- Database query logging
- Engine execution logging

### 10.10 Code Quality
- Linting: ESLint (frontend), Pylint/Black (backend)
- Type checking: TypeScript strict mode, Python type hints
- Pre-commit hooks
- Code review checklist

**Reference Files**:
- backend/app/core/engine_interface.py (BaseEngine)
- backend/app/api/*.py (API patterns)
- backend/app/models/*.py (model patterns)
- frontend/src/app/ (route patterns)
- frontend/package.json (test scripts)
- backend/pytest.ini (test configuration)

**Verification**: Follow development guides to add a simple feature end-to-end, verify all steps work

---

## 11. docs/OPERATIONS.md - New File

**Purpose**: Production operations, deployment, and maintenance guide

**Sections to Write**:

### 11.1 Production Deployment
- Server requirements (8GB+ RAM, 4+ CPU cores, 50GB+ storage)
- Docker Compose production configuration
- Environment variable setup for production
- SSL/TLS certificate configuration
- Reverse proxy setup (Nginx example)

### 11.2 Configuration Management
- Environment variables (DATABASE_URL, SECRET_KEY, ACCESS_TOKEN_EXPIRE_MINUTES)
- Frontend environment: NEXT_PUBLIC_API_URL
- Engine configuration (timeouts, optimization parameters)
- Security settings (CORS, CSP - update origins in next.config.js)

### 11.3 Database Management
- PostgreSQL configuration
- Connection pooling (SQLAlchemy settings)
- Backup strategy: `pg_dump` schedule
- Restore procedure
- Migration workflow: `alembic upgrade head`
- Performance tuning (indexes, VACUUM, ANALYZE)

### 11.4 Monitoring & Alerting
- Application health checks
- Engine health monitoring (GET /api/engines/v2/health/all)
- Database monitoring (connection pool, query performance)
- Disk space monitoring
- Error rate tracking
- Setting up alerts (email/SMS for critical failures)

### 11.5 Logging
- Application logs location (Docker volumes)
- Log rotation configuration
- Centralized logging (optional: ELK stack, CloudWatch)
- Audit log review (backend/app/models/audit_log.py)

### 11.6 Backup & Recovery
- Database backup schedule (daily recommended)
- File storage backup (if using local file uploads)
- Backup testing procedure
- Disaster recovery runbook
- RTO/RPO targets

### 11.7 Performance Optimization
- Database query optimization
- Caching strategies (Redis optional)
- CDN for static assets
- Frontend bundle optimization
- Engine timeout tuning (OR-Tools solver)

### 11.8 Security Operations
- Security patch management
- Dependency updates: `npm audit` and `pip list --outdated`
- Access log review
- Failed login monitoring (backend/app/core/rate_limiter.py)
- Security checklist from frontend/SECURITY.md

### 11.9 Scaling
- Horizontal scaling (multiple backend instances)
- Database read replicas
- Load balancing configuration
- Session management across instances

### 11.10 Troubleshooting Production Issues
- Common production issues (from TROUBLESHOOTING.md)
- Debugging production errors (without exposing sensitive data)
- Rolling back deployments
- Emergency procedures

### 11.11 Maintenance Windows
- Planning maintenance
- Database migration during maintenance
- Communicating downtime to users
- Health check procedures post-deployment

**Reference Files**:
- docker-compose.yml (deployment structure)
- backend/.env.example (environment variables)
- frontend/.env.local.example (frontend config)
- backend/app/core/config.py (settings)
- frontend/SECURITY.md (security checklist)
- docs/TROUBLESHOOTING.md (common issues)
- backend/app/models/audit_log.py (audit trail)

**Verification**: Deploy to staging environment following guide, verify all operational procedures work

---

## 12. backend/API.md - Enhancement

**Current State**: Comprehensive API documentation with examples, workflow

**Enhancements Needed**:
- Add pagination details for list endpoints
- Add filtering and sorting parameters
- Expand error response examples (400, 401, 403, 404, 500 with actual response bodies)
- Add more workflow examples (cloning plans, handling conflicts)
- Document request/response schemas in detail
- Add authentication header examples for every endpoint
- Include rate limiting information

**Sections to Enhance**:

### 12.1 Authentication Header Examples
- Show exact curl command format for each endpoint type
- Include token refresh workflow

### 12.2 Pagination & Filtering
- Query parameters: ?page=1&page_size=50&sort_by=name&order=asc
- Document which endpoints support pagination
- Filter examples: ?exam_type=ISA1&academic_year=2024-25

### 12.3 Error Handling Details
- 400 Bad Request: Invalid input examples with validation errors
- 401 Unauthorized: Missing/expired token examples
- 403 Forbidden: Insufficient permissions by role
- 404 Not Found: Resource not found examples
- 500 Internal Server Error: Server error format

### 12.4 Additional Workflow Examples
- Workflow: Cloning an existing exam plan
- Workflow: Handling scheduling conflicts
- Workflow: Re-running engines after data changes
- Workflow: Generating multiple report formats

### 12.5 Request/Response Schema Details
- Detailed schemas for POST/PATCH request bodies
- Response schema examples for all endpoints
- Enum values (UserRole, ExamType, InvigilatorRole, etc.)

### 12.6 Rate Limiting
- Rate limit policies (from backend/app/core/rate_limiter.py)
- Rate limit headers in responses
- 429 Too Many Requests handling

**Reference Files**:
- Existing backend/API.md
- backend/app/api/*.py (all endpoints)
- backend/app/schemas/*.py (request/response schemas)
- backend/app/core/rate_limiter.py (rate limiting)
- backend/app/models/*.py (enum definitions)

**Verification**: Test every enhanced endpoint example with curl, verify responses match documented schemas

---

## Summary of Documentation Files

| File | Status | Primary Source References |
|------|--------|---------------------------|
| README.md | Enhance | Current README, package.json, requirements.txt, SECURITY.md |
| CONTRIBUTING.md | New | README, ARCHITECTURE.md, ENGINES.md, package.json |
| TROUBLESHOOTING.md | New | docs/TROUBLESHOOTING.md, SECURITY.md, API docs |
| docs/README.md | Enhance | Existing file, verify links |
| docs/USER_GUIDE.md | Enhance | Existing USER_GUIDE, all backend/app/api/*.py |
| docs/ADMIN_GUIDE.md | New | models/user.py, models/rule.py, core/security.py |
| docs/STUDENT_GUIDE.md | New | Frontend pages, api/auth.py, api/schedules.py |
| docs/API_REFERENCE.md | New | backend/API.md, all backend/app/api/*.py |
| docs/ARCHITECTURE.md | Enhance | Existing ARCHITECTURE, package.json, requirements.txt |
| docs/DEVELOPMENT.md | New | All backend/app/core/*.py, frontend structure |
| docs/OPERATIONS.md | New | docker-compose.yml, core/config.py, SECURITY.md |
| backend/API.md | Enhance | Existing API.md, all backend/app/api/*.py |

---

## Verification Strategy

For each documentation file:

1. **Accuracy Check**: Verify all code references, file paths, and examples against actual codebase
2. **Link Check**: Verify all internal links resolve correctly
3. **Command Check**: Test all commands (npm, docker, curl, etc.) produce expected results
4. **Permission Check**: Verify role-based access control matches UserRole enum in backend/app/models/user.py
5. **Endpoint Check**: Test API endpoints with actual curl commands, verify responses
6. **Workflow Check**: Follow end-to-end workflows, verify each step works as documented

---

## Implementation Order

1. **CONTRIBUTING.md** (Root) - Enables developer contributions
2. **TROUBLESHOOTING.md** (Root) - Immediate user help
3. **README.md Enhancement** - Front door for all users
4. **docs/API_REFERENCE.md** - Core technical reference
5. **docs/ADMIN_GUIDE.md** - System administration
6. **docs/STUDENT_GUIDE.md** - End-user facing
7. **docs/USER_GUIDE.md Enhancement** - Complete user flows
8. **docs/DEVELOPMENT.md** - Developer deep dive
9. **docs/OPERATIONS.md** - Production operations
10. **docs/ARCHITECTURE.md Enhancement** - Technical deep dive
11. **backend/API.md Enhancement** - API completeness
12. **docs/README.md Enhancement** - Documentation index finalization

This ordering prioritizes user-facing and contributor-enabling docs first, then progressively deeper technical documentation.
