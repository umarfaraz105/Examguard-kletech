# ExamGuard Administrator Guide

Comprehensive guide for system administrators managing the ExamGuard Examination Management System.

## Table of Contents

1. [Admin Overview](#admin-overview)
2. [Admin Dashboard](#admin-dashboard)
3. [User Management](#user-management)
4. [Course Management](#course-management)
5. [Room Management](#room-management)
6. [System Configuration](#system-configuration)
7. [Data Management](#data-management)
8. [Security & Audit](#security--audit)
9. [Troubleshooting Admin Issues](#troubleshooting-admin-issues)

---

## Admin Overview

### Administrator Role

The **ADMIN** role has full system access including:
- Complete user management (create, update, deactivate users)
- System-wide configuration and rule management
- Access to all exam plans and data
- Engine execution and monitoring
- Security and audit log review
- Database operations and maintenance

### Admin Access

Admin login is separate from regular user login:

1. **Navigate to**: `/admin-login` URL path
2. **Enter admin credentials** (no role selector needed)
3. **Access granted** to full admin dashboard

**Security Note**: Admin portal URL should not be publicly advertised. Access is restricted and all actions are audited.

[Screenshot: Admin login page]

---

## Admin Dashboard

### Dashboard Components

The admin dashboard provides comprehensive system oversight:

#### System Statistics
Real-time metrics displayed at the top:
- **Total Plans**: All exam plans (Draft, Approved, Published)
- **Courses**: Complete course catalog
- **Students**: Total enrolled students across all departments
- **Rooms**: Total examination rooms configured
- **Active Users**: Currently logged in users
- **System Health**: Engine status indicators

[Screenshot: Admin dashboard overview]

#### System Health Monitoring
- **Engine Status**: Health check for all four engines
- **Database Status**: Connection pool and query performance
- **API Status**: Backend service health
- **Storage**: Disk usage for logs and uploaded files

#### Recent Activity
- User login activity (last 24 hours)
- Recent engine executions with status
- New plans created or modified
- Failed operations requiring attention

#### Quick Actions
Admin-specific shortcuts:
- Create User
- Configure System Rules
- View Audit Logs
- Generate System Reports
- Backup Database

---

## User Management

### User Roles in ExamGuard

1. **ADMIN**: Full system access (this guide)
2. **EXAM_CELL**: Exam planning and management (displayed as "Staff" in UI)
3. **HOD**: Head of Department - department-level access
4. **FACULTY**: Faculty members - view schedules and invigilator duties
5. **STUDENT**: Students - view personal exam information

[Screenshot: User roles hierarchy diagram]

### Creating Users

#### Creating Individual User

1. **Navigate to**: Users section in sidebar
2. **Click**: "Create User" or "Add New User" button
3. **Fill User Form**:
   - **Email**: Unique email address (used for login)
   - **Full Name**: User's complete name
   - **Role**: Select from dropdown (ADMIN, EXAM_CELL, HOD, FACULTY, STUDENT)
   - **Department**: Applicable for HOD, FACULTY, STUDENT
   - **Employee ID**: For faculty/staff (optional but recommended)
   - **Phone**: Contact number
   - **Password**: Initial password (user should change on first login)
4. **Click**: "Create User"
5. **Confirmation**: User account created, credentials can be sent via email

[Screenshot: Create user form]

**Initial Password Best Practices:**
- Generate random secure passwords
- Require password change on first login
- Minimum 8 characters, include numbers and special characters
- Never reuse passwords

#### Bulk User Creation

1. **Navigate to**: Users → Import Users
2. **Download CSV Template**: Click to get template with correct headers
3. **Fill Template**: Follow format specification below
4. **Upload CSV**: Select file and click Upload
5. **Validation**: System validates all user data
6. **Review Errors**: Fix any validation errors
7. **Confirm Import**: Click Confirm to create users

**User Import CSV Format:**
```csv
email,full_name,role,department,employee_id,phone,password
john@example.com,John Doe,FACULTY,Computer Science,FAC001,1234567890,TempPass123
jane@example.com,Jane Smith,STUDENT,Electronics,STU001,0987654321,Student@123
admin2@example.com,Admin Two,EXAM_CELL,Administration,EXM001,5551234567,Admin@456
```

**CSV Requirements:**
- Email must be unique
- Role must match exactly: ADMIN, EXAM_CELL, HOD, FACULTY, STUDENT
- Password minimum 8 characters
- Phone numbers: digits only

### Managing Existing Users

#### Viewing User List

1. **Navigate to**: Users section
2. **Filter Options**:
   - By role (All, ADMIN, EXAM_CELL, HOD, FACULTY, STUDENT)
   - By department
   - By status (Active, Inactive)
   - Search by name or email
3. **View Details**: Click on user row to see complete profile

[Screenshot: User management table]

#### Updating User Information

1. **Navigate to**: Users → Select user
2. **Click**: "Edit" button
3. **Modify Fields**:
   - Update email (ensure uniqueness)
   - Change role (use carefully - affects permissions)
   - Update department assignment
   - Change contact information
4. **Click**: "Save Changes"
5. **Audit Log**: Change is recorded with admin ID and timestamp

**Caution**: Changing user role immediately affects their access permissions.

#### Resetting User Password

**Method 1: Admin Reset**
1. Navigate to: Users → Select user
2. Click: "Reset Password"
3. Enter new temporary password
4. Check: "Require password change on next login"
5. Click: "Reset"
6. Notify user: Send new credentials via secure method

**Method 2: Self-Service Reset** (User-initiated)
1. User clicks "Forgot Password" on login page
2. Enters email address
3. System sends reset link to registered email
4. User follows link and sets new password
5. Admin can view reset requests in audit log

[Screenshot: Password reset interface]

#### Deactivating Users

**To temporarily disable a user account:**

1. **Navigate to**: Users → Select user
2. **Click**: "Deactivate" or toggle "Active" status
3. **Confirm**: Deactivation action
4. **Result**:
   - User cannot log in
   - Existing sessions terminated
   - Data preserved (not deleted)
   - Can be reactivated anytime

**To reactivate:**
1. Navigate to: Users → Filter: Inactive users
2. Select deactivated user
3. Click: "Activate"
4. User can immediately log in

**Permanent Deletion** (use with extreme caution):
- Only delete users who were created in error
- Deletion removes all user data
- Cannot be undone
- Audit log entry created
- Consider deactivation instead

### User Permissions by Role

#### ADMIN
- Full CRUD operations on all entities
- Execute all engines
- Access audit logs and security features
- Manage system configuration
- Create/modify/delete users of any role

#### EXAM_CELL
- Create and manage exam plans
- Execute engines 1, 2, 3, 4
- Manage courses, students, rooms
- Generate reports
- Cannot create ADMIN users
- Cannot access audit logs

#### HOD
- View exam plans for department
- Manage department courses
- View faculty availability
- Read-only access to most features
- Cannot execute engines

#### FACULTY
- View personal invigilator assignments
- Set own availability
- View exam schedules
- Update own profile
- Read-only for most features

#### STUDENT
- View personal exam schedule
- Download hall ticket
- View seat assignment
- View grades
- Update own profile only

[Screenshot: Permission matrix table]

---

## Course Management

### Adding Courses

1. **Navigate to**: Courses → Add Course
2. **Fill Course Details**:
   - **Course Code**: Unique identifier (e.g., CS301, EC202)
   - **Course Name**: Full name (e.g., "Data Structures and Algorithms")
   - **Credits**: Credit hours (typically 3-4)
   - **Department**: Owning department
   - **Semester**: Typical semester when offered
   - **Course Type**: Theory, Practical, Theory+Practical
   - **Max Students**: Enrollment capacity (optional)
3. **Click**: "Create Course"

[Screenshot: Add course form]

### Bulk Course Import

1. **Navigate to**: Courses → Import Courses
2. **Download Template**: CSV format
3. **Fill Template**:
```csv
course_code,course_name,credits,department,semester,course_type
CS301,Data Structures,4,Computer Science,3,Theory
CS302,DS Lab,2,Computer Science,3,Practical
EC201,Digital Electronics,3,Electronics,2,Theory
```
4. **Upload and Validate**
5. **Confirm Import**

### Managing Course Registrations

#### Enrolling Students in Courses

**Individual Enrollment:**
1. Navigate to: Students → Select Student
2. Click: "Enroll in Courses"
3. Select courses (multi-select)
4. Click: "Enroll"

**Bulk Enrollment via CSV:**
1. Navigate to: Courses → Bulk Enrollment
2. Download CSV template
3. Format:
```csv
student_id,course_code
STU001,CS301
STU001,CS302
STU002,CS301
```
4. Upload and confirm

**Auto-Enrollment by Semester:**
- Configure default courses for each semester
- New students auto-enrolled based on semester
- Admin can enable in System Configuration

### Updating Course Information

1. Navigate to: Courses → Select course
2. Click: "Edit"
3. Modify: Name, credits, department, etc.
4. **Warning**: Changes affect all associated exam plans
5. Save Changes

### Deleting Courses

**Caution**: Only delete courses that were created in error.

1. Check: No students enrolled
2. Check: Not used in any exam plans
3. Navigate to: Courses → Select course
4. Click: "Delete"
5. Confirm: Permanent deletion

**Best Practice**: Archive old courses instead of deleting (mark as inactive).

---

## Room Management

### Adding Examination Rooms

1. **Navigate to**: Rooms → Add Room
2. **Fill Room Details**:
   - **Room Number**: Unique identifier (e.g., LH-101, CR-205)
   - **Building**: Building name or code
   - **Floor**: Floor number
   - **Total Capacity**: Maximum students (sum of bench capacities)
   - **Room Type**: Lecture Hall, Classroom, Laboratory, Auditorium
   - **Availability**: Session availability (Forenoon, Afternoon, Both)
   - **Notes**: Additional information (AC, projector, accessibility)
3. **Click**: "Create Room"

[Screenshot: Add room form]

### Configuring Benches

After creating a room, configure seating benches:

1. **Navigate to**: Rooms → Select Room → "Manage Benches"
2. **Add Each Bench**:
   - **Bench Number**: Sequential (1, 2, 3, ...)
   - **Capacity**: Students per bench (typically 2-4)
   - **Position**: Front, Middle, Back (optional, for reporting)
3. **Quick Add**: Use "Add Multiple Benches" for uniform setup
   - Specify: Starting number, ending number, capacity
   - System creates all benches in one operation
4. **Verify**: Total bench capacity equals or exceeds room total capacity

[Screenshot: Bench configuration interface]

**Example: Adding 40 benches with capacity 3 each:**
- Start Number: 1
- End Number: 40
- Capacity: 3
- Total Room Capacity: 120 students

### Bulk Room Import

1. **Navigate to**: Rooms → Import Rooms
2. **Download Template**
3. **Fill CSV**:
```csv
room_number,building,floor,capacity,room_type,availability
LH-101,Main Building,1,120,Lecture Hall,Both
CR-201,Science Block,2,60,Classroom,Forenoon
LAB-301,Lab Complex,3,30,Laboratory,Afternoon
```
4. **Upload and Validate**
5. **Add Benches**: After room creation, add benches individually or via API

### Setting Room Capacity

**Room capacity** is critical for Engine 2 (seating allocation):

- **Total Capacity**: Maximum students room can accommodate
- **Bench Count × Bench Capacity**: Must equal or exceed total capacity
- **Seating Arrangement**: Consider aisle space, supervision visibility
- **Exam Type Considerations**:
  - ISA: 1 student per bench typically (strict spacing)
  - ESA: 2-3 students per bench allowed

### Room Availability Management

Control when rooms are available for exams:

1. **Navigate to**: Rooms → Select Room → "Edit Availability"
2. **Set Availability**:
   - **Always Available**: Default
   - **Forenoon Only**: 10 AM - 1 PM
   - **Afternoon Only**: 2 PM - 5 PM
   - **Custom Schedule**: Specify exact dates/times unavailable
3. **Reasons for Unavailability**:
   - Maintenance
   - Class scheduled
   - Another event
4. **Save Availability**

Engine 2 respects room availability when allocating.

---

## System Configuration

### Rule Configuration

Rules define exam constraints and policies. Configure via Rules section.

#### Accessing Rules

1. **Navigate to**: Rules section in sidebar
2. **View existing rules**: Filterable by exam type
3. **Click "Add Rule" or "Edit" existing rule**

#### Rule Parameters

**Essential Rules for Each Exam Type (ISA1, ISA2, ESA):**

| Parameter | Description | Typical Values |
|-----------|-------------|----------------|
| **Exam Duration** | Length of exam in minutes | 180 (3 hours) |
| **Students Per Bench** | Maximum students per bench | ISA: 1, ESA: 2-3 |
| **Gap Days** | Minimum days between exams for same student | 1-2 days |
| **Invigilator Ratio** | Faculty per students | 1:30 or 1:40 |
| **Chief Invigilator Required** | One per exam | True |
| **Max Exams Per Day** | Per student | 1-2 |
| **Session Start Time** | Forenoon start | 10:00 AM |
| **Session End Time** | Forenoon end | 1:00 PM |
| **Afternoon Start** | Afternoon start | 2:00 PM |
| **Afternoon End** | Afternoon end | 5:00 PM |

[Screenshot: Rule configuration form]

#### Creating a New Rule

1. **Navigate to**: Rules → Add Rule
2. **Select Exam Type**: ISA1, ISA2, or ESA
3. **Enter Rule Parameters**: As defined above
4. **Set Academic Year**: If rule is year-specific
5. **Validation**: System validates rule consistency
6. **Click**: "Create Rule"
7. **Apply**: Engines use latest rule for each exam type

**Multiple Rules**: You can have multiple rules per exam type for different academic years.

#### Updating Existing Rules

1. **Navigate to**: Rules → Select rule
2. **Click**: "Edit"
3. **Modify Parameters**: Update as needed
4. **Warning**: Affects future engine executions
5. **Save**: Updated rule takes effect immediately

**Best Practice**: Document rule changes in description field.

### Engine Configuration

Configure engine behavior and performance settings.

#### Engine Health Monitoring

1. **Navigate to**: Dashboard → Engine Health
   - Or: System → Engines → Health Check
2. **View Status**:
   - **Engine 1 (Scheduling)**: OR-Tools solver status
   - **Engine 2 (Room/Seating)**: Allocation algorithm status
   - **Engine 3 (Invigilator)**: Assignment algorithm status
   - **Engine 4 (Validation)**: Compliance checker status
3. **Health Indicators**:
   - ✅ Green: Healthy
   - ⚠️ Yellow: Warning (may be slow)
   - ❌ Red: Failure (needs attention)

[Screenshot: Engine health dashboard]

#### Engine Performance Tuning

**Engine 1 (OR-Tools Scheduling) Settings:**
- **Timeout (seconds)**: Max solver time (default: 300)
  - Increase for complex schedules (500-600 seconds)
  - Decrease for faster results with simple schedules
- **Search Strategy**: Optimization priority
  - Minimize gaps between exams
  - Minimize total days
  - Balance workload
- **Conflict Resolution**: How to handle infeasible constraints
  - Relaxation priority order

**Engine 2 (Seating) Settings:**
- **Algorithm**: First-Fit Decreasing (default), Best-Fit
- **Sorting**: How students are sorted for allocation
  - By enrollment date
  - By student ID
  - Random (for fairness)
- **Room Utilization Target**: Preferred % (e.g., 85%)

**Engine 3 (Invigilator) Settings:**
- **Workload Balancing Weight**: 0.0 to 1.0 (1.0 = strict balance)
- **Department Preference**: Prefer same-department invigilators
- **Max Duties Per Day**: Per faculty (default: 2)

**Access Engine Settings:**
- Admin only via backend configuration or environment variables
- Advanced settings require system restart
- Consult technical documentation for parameter details

### Academic Calendar Configuration

Define semesters, holidays, and exam periods:

1. **Navigate to**: System → Academic Calendar
2. **Add Semester**:
   - Academic Year (e.g., 2024-25)
   - Semester Number (1, 2, 3, etc.)
   - Start Date, End Date
   - Exam Windows (ISA1, ISA2, ESA date ranges)
3. **Add Holidays**: Dates when exams cannot be scheduled
4. **Save Calendar**

Engines respect academic calendar when scheduling.

---

## Data Management

### Bulk Data Imports

Efficiently import large datasets.

#### Students Bulk Import

1. **Navigate to**: Students → Import Students
2. **Download CSV Template**
3. **Prepare Data**: Fill template with student records
4. **Upload CSV**: Select file
5. **Validation**:
   - Duplicate IDs checked
   - Email format validated
   - Department existence verified
6. **Error Handling**: Download error report for failed rows
7. **Confirm**: Import successful records

**Performance**: Can handle 1000+ students per import.

#### Course Enrollments Bulk Import

1. **Navigate to**: Courses → Bulk Enrollment
2. **Format**: Simple two-column CSV
```csv
student_id,course_code
STU001,CS301
STU001,CS302
...
```
3. **Upload and Validate**
4. **Confirm**: Enrollments created

#### Faculty Availability Import

1. **Navigate to**: Invigilators → Import Availability
2. **CSV Format**:
```csv
employee_id,date,session,available,reason
FAC001,2024-11-20,Forenoon,No,Leave
FAC002,2024-11-20,Afternoon,Yes,
```
3. **Upload**: System creates availability records
4. **Usage**: Engine 3 respects availability during assignment

### Data Exports

Export data for backup, analysis, or integration.

#### Complete Database Export

1. **Navigate to**: System → Data Management → Export
2. **Select Tables**: Choose what to export
   - All data (complete backup)
   - Specific tables (courses, students, plans, etc.)
3. **Format**: JSON or SQL
4. **Click**: "Generate Export"
5. **Download**: Large exports may take several minutes

**Backup Recommendation**: Weekly full exports, daily incremental.

#### Filtered Exports

Export subsets of data:

1. **Navigate to**: Relevant section (Students, Courses, etc.)
2. **Apply Filters**: Department, semester, date range
3. **Click**: "Export" button
4. **Format**: Excel, CSV, or JSON
5. **Download**: Filtered data file

### Data Cleanup

Maintain database integrity and performance.

#### Removing Duplicate Records

1. **Navigate to**: System → Data Management → Duplicates
2. **Scan**: System identifies duplicate records
   - Students with same email
   - Courses with same code
   - Rooms with same number
3. **Review**: Manually select which record to keep
4. **Merge or Delete**: Choose action
5. **Confirm**: Duplicates removed

#### Archiving Old Data

Archive completed exam plans:

1. **Navigate to**: Plans → Filter: Published, Academic Year < Current-2
2. **Select Plans**: Old plans to archive
3. **Click**: "Archive"
4. **Result**: Plans moved to archive (read-only, not deleted)

**Benefits**: Improves query performance, reduces clutter.

#### Database Maintenance

**Admin Database Tools:**
1. **Navigate to**: System → Database Maintenance
2. **Operations**:
   - **Vacuum**: Reclaim storage space (PostgreSQL)
   - **Analyze**: Update query statistics
   - **Reindex**: Rebuild indexes for performance
   - **Check Integrity**: Verify database consistency
3. **Schedule**: Set up automatic maintenance (weekly recommended)

**Caution**: Maintenance operations may slow system temporarily.

---

## Security & Audit

### Viewing Audit Logs

All user actions are logged for security and compliance.

#### Accessing Audit Logs

1. **Navigate to**: System → Audit Logs
2. **Filter Options**:
   - **Date Range**: Specific time period
   - **User**: Actions by specific user ID or email
   - **Action Type**: Login, Create, Update, Delete, Execute Engine
   - **Entity Type**: User, Plan, Course, Student, etc.
   - **IP Address**: Source of action
3. **View Details**: Click log entry for complete information

[Screenshot: Audit log viewer]

#### Audit Log Information

Each log entry contains:
- **Timestamp**: Exact date and time
- **User ID**: Who performed the action
- **User Email**: User's email
- **User Role**: ADMIN, EXAM_CELL, etc.
- **Action**: CREATE, UPDATE, DELETE, EXECUTE, LOGIN, LOGOUT
- **Entity Type**: What was affected (User, Plan, Course, etc.)
- **Entity ID**: Specific record ID
- **IP Address**: Source IP
- **User Agent**: Browser/client information
- **Changes**: Old value → New value (for updates)

#### Common Audit Queries

**Failed Login Attempts:**
- Filter: Action = LOGIN, Status = Failed
- Review: Multiple failures from same IP or for same user
- Action: Investigate potential security threats

**User Permission Changes:**
- Filter: Entity Type = User, Action = UPDATE, Field = Role
- Review: Who changed user roles and when
- Purpose: Security compliance audit

**Data Deletions:**
- Filter: Action = DELETE
- Review: What was deleted and by whom
- Purpose: Recover or investigate accidental deletions

**Engine Executions:**
- Filter: Action = EXECUTE, Entity Type = Engine
- Review: Who ran engines, parameters used, results
- Purpose: Troubleshoot engine failures

### Managing Sessions

Monitor and control active user sessions.

#### Viewing Active Sessions

1. **Navigate to**: System → Active Sessions
2. **View List**:
   - User email and role
   - Login time
   - Last activity time
   - IP address
   - Session ID
3. **Sort**: By login time, last activity, or user

[Screenshot: Active sessions table]

#### Terminating Sessions

**To force logout a user:**

1. Navigate to: Active Sessions
2. Select user session
3. Click: "Terminate Session"
4. Confirm: User will be logged out immediately
5. Use Case: Security incident, user reports unauthorized access

**Terminate All Sessions:**
- Emergency use only
- Logs out all users except ADMIN
- Navigate to: System → Emergency Actions → Terminate All Sessions

### Security Configuration

#### JWT Token Settings

JWT tokens are used for authentication. Configure via environment variables (backend):

- **ACCESS_TOKEN_EXPIRE_MINUTES**: Token validity (default: 30 minutes)
  - Shorter: More secure, frequent re-login
  - Longer: More convenient, less secure
- **SECRET_KEY**: Token signing key (must be strong, unique)
- **ALGORITHM**: HS256 (default, recommended)

**Update Token Expiration:**
1. Access backend server
2. Edit `.env` file or environment variables
3. Set `ACCESS_TOKEN_EXPIRE_MINUTES=60` (for 60 minutes)
4. Restart backend service
5. New tokens use updated expiration

#### Password Policies

Configure password requirements:

1. **Navigate to**: System → Security → Password Policy
2. **Set Requirements**:
   - **Minimum Length**: 8-16 characters (default: 8)
   - **Require Uppercase**: Yes/No
   - **Require Numbers**: Yes/No
   - **Require Special Characters**: Yes/No
   - **Password Expiry**: Days until must change (0 = never)
   - **History**: Prevent reusing last N passwords
3. **Save Policy**: Applies to all new password changes

**Recommended Settings:**
- Minimum 8 characters
- Require uppercase, numbers, special characters
- Expiry: 90 days for admin, 180 days for others
- History: Last 3 passwords

#### Rate Limiting

Protect against brute force attacks:

1. **Navigate to**: System → Security → Rate Limiting
2. **Configure Limits**:
   - **Login Attempts**: Max attempts per IP per hour (default: 5)
   - **API Requests**: Max requests per user per minute (default: 100)
   - **Failed Login Lockout**: Duration in minutes (default: 30)
3. **Whitelist IPs**: Trusted IPs exempt from rate limiting
4. **Save**: Rate limits apply immediately

**Current Implementation** (backend `rate_limiter.py`):
- 5 failed logins → 30-minute lockout
- Account lockout after 10 failed attempts (admin unlock required)

#### CSRF Protection

Cross-Site Request Forgery protection is enabled by default.

**Frontend Configuration** (next.config.js):
- CSRF tokens generated for all state-changing requests
- Tokens validated on backend
- Admin: Ensure `CSRF_ENABLED=true` in backend environment

#### Content Security Policy (CSP)

**Frontend CSP** (next.config.js):
- Restricts script sources to prevent XSS attacks
- Admin can update CSP headers for additional security
- **Warning**: Incorrect CSP can break frontend functionality

**Verify CSP:**
1. Open frontend in browser
2. Open Developer Tools (F12)
3. Check Console for CSP violations
4. Adjust CSP in next.config.js if legitimate resources blocked

---

## Troubleshooting Admin Issues

### User Cannot Log In

**Check:**
1. User account exists and is active
   - Navigate to: Users → Search user
   - Verify: `is_active = True`
2. Password is correct (reset if needed)
3. User is not locked out (check failed login attempts in audit log)
4. User role is correct (not ADMIN trying to log in via regular portal)

**Solution:**
- Reset password
- Unlock account if locked
- Reactivate account if deactivated

### Engine Execution Failure

**Engine 1 Fails:**
- **Check**: Rule constraints (gap days, sessions)
- **Check**: Course conflicts in input data
- **Review**: Engine execution logs (API endpoint: `/api/engines/v2/engine1-scheduling/executions`)
- **Solution**: Adjust rules, extend date range, or reduce course count

**Engine 2 Fails:**
- **Check**: Sufficient room capacity
- **Calculate**: Total students vs. total room seats
- **Review**: Bench configurations (all rooms have benches defined?)
- **Solution**: Add rooms, increase bench capacities, or reduce students per bench rule

**Engine 3 Fails:**
- **Check**: Faculty availability records exist
- **Check**: Invigilator ratio is achievable with available faculty
- **Review**: Engine 3 execution logs
- **Solution**: Add more faculty, adjust ratio, or manually assign invigilators

**All Engines:**
- **Health Check**: Navigate to System → Engines → Health
- **Dependencies**: Ensure OR-Tools library installed (Engine 1)
- **Logs**: Check backend logs: `docker-compose logs backend`

### Slow System Performance

**Diagnose:**
1. **Check Active Users**: Too many simultaneous users?
   - Navigate to: System → Active Sessions
   - Peak usage during exam season is normal
2. **Check Database**: Query performance issues?
   - Navigate to: System → Database Maintenance → Performance
   - Review slow queries
3. **Check Disk Space**: Running out of storage?
   - Admin server access required
   - Command: `df -h` (Linux) or check disk in Windows

**Solutions:**
- **Optimize Database**: Run VACUUM and ANALYZE (PostgreSQL)
- **Add Indexes**: Identify slow queries and add database indexes
- **Upgrade Hardware**: More RAM, faster CPU for heavy load
- **Load Balancing**: Deploy multiple backend instances (advanced)

### Data Import Failures

**CSV Upload Fails:**
- **Validate Format**: Ensure headers match template exactly
- **Check Encoding**: Use UTF-8 encoding
- **Review Errors**: Download error report from import page
- **Common Issues**:
  - Duplicate IDs
  - Invalid email formats
  - Missing required fields
  - Foreign key violations (e.g., student references non-existent course)

**Large File Timeout:**
- **Split File**: Import in smaller batches (500 records at a time)
- **Increase Timeout**: Backend configuration (advanced)

### Reports Not Generating

**PDF Generation Fails:**
- **Check**: reportlab library installed (backend)
- **Check**: Sufficient disk space for temporary files
- **Review**: Backend logs for specific error

**Excel Export Fails:**
- **Check**: openpyxl library installed (backend)
- **Check**: Data size (very large exports may timeout)
- **Solution**: Export smaller data subsets, or use JSON format

### Database Migration Issues

**Alembic Migration Fails:**
1. **Access Backend Server**
2. **Check Current Version**: `alembic current`
3. **Review Migration Error**: Read error message carefully
4. **Common Issues**:
   - Existing data conflicts with new schema
   - Missing dependencies
   - Database connection failure
5. **Solution**:
   - Backup database first
   - Manually fix data conflicts
   - Retry migration: `alembic upgrade head`
   - Contact developer if unresolved

**Rollback Migration (if needed):**
```bash
alembic downgrade -1  # Rollback one version
```

### Security Incidents

**Suspected Unauthorized Access:**
1. **Immediately**:
   - Navigate to: System → Active Sessions → Terminate All Sessions
   - Change admin password
2. **Review Audit Logs**:
   - Filter: Recent login attempts
   - Check: Unusual IP addresses
   - Identify: Affected user accounts
3. **Reset Passwords**: For compromised accounts
4. **Notify Users**: If data breach suspected
5. **Update Security**:
   - Increase rate limiting
   - Enable additional authentication (if available)
   - Review user permissions

**Repeated Failed Logins:**
- May indicate brute force attack
- Check IP address in audit log
- Consider IP blocking at firewall level (advanced)
- Increase lockout duration

### Getting Technical Support

**Before Contacting Support:**
1. **Gather Information**:
   - Exact error message (screenshot)
   - Steps to reproduce
   - Affected user/entity IDs
   - Relevant audit log entries
   - System configuration details
2. **Check Logs**:
   - Backend: `docker-compose logs backend`
   - Frontend: Browser console (F12)
3. **Attempt Basic Troubleshooting**: Restart services, clear cache

**Contact Information:**
- **Technical Support**: support@kletu.ac.in
- **Developer Team**: dev@kletu.ac.in
- **Emergency**: [Phone number for urgent issues]

**Include in Support Request:**
- ExamGuard version
- Deployment environment (Docker, standalone)
- Database type and version (PostgreSQL)
- Browser and OS (for frontend issues)
- Complete error message and logs

---

## Appendix

### Admin Checklist - Start of Semester

- [ ] Create user accounts for new students and faculty
- [ ] Update course catalog for new semester
- [ ] Enroll students in courses
- [ ] Configure exam rules for upcoming assessments
- [ ] Verify room and bench configurations
- [ ] Set academic calendar with exam windows
- [ ] Test engine executions with sample data
- [ ] Backup database

### Admin Checklist - Before Each Exam Cycle

- [ ] Verify all student enrollments are complete
- [ ] Confirm faculty availability is up-to-date
- [ ] Check room availability (no maintenance scheduled)
- [ ] Review and update exam rules if needed
- [ ] Test engine health (all green)
- [ ] Backup database
- [ ] Notify Exam Cell to begin plan creation

### Admin Checklist - After Exam Publication

- [ ] Verify hall tickets generated correctly
- [ ] Spot-check seating assignments for compliance
- [ ] Confirm invigilator assignments complete
- [ ] Generate and distribute seating charts to rooms
- [ ] Generate invigilator duty rosters
- [ ] Send notifications to students and faculty
- [ ] Monitor for user-reported issues

### Admin Checklist - Post-Exam

- [ ] Archive completed exam plan
- [ ] Review audit logs for any irregularities
- [ ] Generate compliance report for records
- [ ] Backup final exam data
- [ ] Clean up temporary files
- [ ] Review system performance during exam period
- [ ] Document lessons learned for next cycle

### Database Backup Commands

**PostgreSQL Backup (Docker):**
```bash
docker-compose exec db pg_dump -U examguard examguard > backup_$(date +%Y%m%d).sql
```

**PostgreSQL Restore:**
```bash
docker-compose exec db psql -U examguard examguard < backup_20241120.sql
```

**Automated Backup Script** (Linux cron):
```bash
# Add to crontab: Daily backup at 2 AM
0 2 * * * /path/to/backup_script.sh
```

### Environment Variables Reference

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@localhost/examguard
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### API Endpoints for Admin Operations

**User Management:**
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PATCH /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Deactivate user

**System Monitoring:**
- `GET /api/engines/v2/health/all` - Check all engine health
- `GET /api/engines/v2/{engine}/executions` - View execution history

**Full API documentation**: See [backend/API.md](../backend/API.md)

### Glossary

- **Alembic**: Database migration tool for SQLAlchemy
- **CORS**: Cross-Origin Resource Sharing (security feature)
- **CSRF**: Cross-Site Request Forgery (attack type)
- **JWT**: JSON Web Token (authentication mechanism)
- **OR-Tools**: Google optimization library (used in Engine 1)
- **Rate Limiting**: Restricting request frequency to prevent abuse
- **Session**: Active user login instance

### Version Information

- **Document Version**: 1.0
- **Last Updated**: 2024
- **ExamGuard Version**: 2.0 (Plugin Architecture)
- **Target Audience**: System Administrators

---

*For additional information, see:*
- [User Guide](./USER_GUIDE.md) - End-user documentation
- [API Reference](../backend/API.md) - Complete API documentation
- [Architecture Documentation](./ARCHITECTURE.md) - System design
- [Troubleshooting Guide](./TROUBLESHOOTING.md) - Technical issues
- [Database Documentation](./DATABASE.md) - Database schema details
