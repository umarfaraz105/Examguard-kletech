# Database Models

## Overview

ExamGuard uses SQLAlchemy ORM models with PostgreSQL. All models inherit from `BaseModel` which provides:
- `id`: Primary key (auto-increment)
- `created_at`: Timestamp of record creation
- `updated_at`: Timestamp of last update

## Model Hierarchy

### Core Models

#### User
Authentication and role-based access control.

**Roles:**
- `ADMIN`: Full system access
- `EXAM_CELL`: Plan creation, management, publishing
- `HOD`: Plan review and approval
- `FACULTY`: View plans, invigilate exams

**Key Fields:**
- `email`: Unique login identifier
- `hashed_password`: Bcrypt hashed password
- `role`: User role
- `department`: Department affiliation
- `employee_id`: University employee ID

#### Rule
Exam configuration rules (created in Task 2).

**Categories:**
- `TIMING`: Duration, session times
- `SEATING`: Students per bench, capacity
- `SCHEDULING`: Gap days, sessions
- `INVIGILATION`: Ratios, requirements
- `ELIGIBILITY`: Attendance rules

### Academic Models

#### Course
Represents a course/subject offered in a semester.

**Key Fields:**
- `course_code`: Unique identifier (e.g., "CS101")
- `course_name`: Full course name
- `semester`: Semester number (1-8)
- `branch`: Department (CSE, ECE, MECH, etc.)
- `section`: Section identifier (A, B, etc.)
- `academic_year`: Academic year (e.g., "2023-24")

**Relationships:**
- Many-to-Many with `Student` (via `student_course` table)
- One-to-Many with `ScheduledExam`

#### Student
Represents a student enrolled in the university.

**Key Fields:**
- `usn`: University Seat Number (unique)
- `full_name`: Student name
- `semester`: Current semester
- `branch`: Department
- `attendance_percentage`: Overall attendance
- `is_active`: Active enrollment status

**Relationships:**
- Many-to-Many with `Course`
- One-to-Many with `SeatAssignment`

### Infrastructure Models

#### Room
Physical examination rooms.

**Key Fields:**
- `room_code`: Unique identifier (e.g., "R-101")
- `capacity`: Maximum student capacity
- `num_benches`: Number of benches
- `is_available`: Availability status
- `room_type`: CLASSROOM, LAB, AUDITORIUM

**Relationships:**
- One-to-Many with `Bench`
- One-to-Many with `ScheduledExam`

#### Bench
Individual benches within rooms for granular seating.

**Key Fields:**
- `room_id`: Foreign key to room
- `bench_number`: Bench number within room
- `row_number`, `column_number`: Grid position
- `is_available`: Usability status

**Relationships:**
- Many-to-One with `Room`
- One-to-Many with `SeatAssignment`

### Planning Models

#### Plan
Exam plan versions (supports what-if scenarios).

**Statuses:**
- `DRAFT`: Being created/edited
- `PENDING_APPROVAL`: Submitted for review
- `APPROVED`: Approved but not published
- `PUBLISHED`: Active and in use (only one per exam type)
- `ARCHIVED`: Historical record

**Key Fields:**
- `plan_name`: Descriptive name
- `exam_type`: ISA1, ISA2, ESA, etc.
- `version`: Auto-incremented version number
- `status`: Current workflow status
- `is_what_if`: Whether this is a scenario analysis

**Workflow:**
1. Create plan (DRAFT)
2. Submit for approval (PENDING_APPROVAL)
3. HOD/Exam Cell approves (APPROVED)
4. Publish to make active (PUBLISHED)

### Engine Output Models

#### ScheduledExam
**Engine 1 Output** - Course scheduled for specific date/time/room.

**Key Fields:**
- `plan_id`: Parent exam plan
- `course_id`: Course being examined
- `room_id`: Assigned room (NULL initially)
- `exam_date`: Date of exam
- `session`: MORNING/AFTERNOON/EVENING
- `start_time`, `end_time`: Exact times
- `num_students`: Number of students

**Sessions:**
- `MORNING`: Typically 09:00-12:00
- `AFTERNOON`: Typically 14:00-17:00
- `EVENING`: Special cases

#### SeatAssignment
**Engine 2 Output** - Exact seat for each student.

**Seat Code Format:** `R-101-B04-L`
- `R-101`: Room code
- `B04`: Bench number (zero-padded)
- `L`: Position (L=Left, R=Right, M=Middle)

**Key Fields:**
- `scheduled_exam_id`: Parent scheduled exam
- `student_id`: Student being seated
- `bench_id`: Bench assigned
- `seat_code`: Unique seat identifier
- `position`: L/R/M
- `row_number`, `column_number`: Grid coordinates

**Branch Separation:**
Engine 2 ensures no two students from the same branch are neighbors in all 8 directions (front, back, left, right, 4 diagonals).

#### InvigilatorAssignment
**Engine 3 Output** - Faculty assigned to invigilate.

**Roles:**
- `PRIMARY`: Main invigilator
- `RELIEF`: Break replacement
- `RESERVE`: Backup

**Statuses:**
- `ASSIGNED`: Initial assignment
- `CONFIRMED`: Faculty confirmed availability
- `DECLINED`: Faculty declined
- `REPLACED`: Replacement found

**Key Fields:**
- `scheduled_exam_id`: Exam being invigilated
- `faculty_id`: Faculty member assigned
- `role`: Invigilator role
- `status`: Assignment status
- `workload_points`: Contribution to workload
- `replacement_for_id`: If replacing another faculty

#### FacultyAvailability
Tracks faculty availability for assignment.

**Key Fields:**
- `faculty_id`: Faculty member
- `exam_date`: Date of unavailability
- `session`: Session (or NULL for all day)
- `is_available`: Available (True) or unavailable (False)
- `reason`: Reason for unavailability

### Audit Models

#### AuditLog
Complete audit trail of all system actions.

**Actions:**
- CREATE, UPDATE, DELETE
- APPROVE, PUBLISH, ARCHIVE
- ASSIGN, UNASSIGN
- LOGIN, LOGOUT

**Entities:**
- USER, COURSE, STUDENT, ROOM, RULE
- PLAN, SCHEDULED_EXAM
- SEAT_ASSIGNMENT, INVIGILATOR_ASSIGNMENT

**Key Fields:**
- `user_id`: Who performed the action
- `action`: Type of action
- `entity_type`: Type of entity affected
- `entity_id`: ID of affected entity
- `description`: Human-readable description
- `old_values`: Previous state (JSON)
- `new_values`: New state (JSON)
- `ip_address`, `user_agent`: Request context
- `request_id`: Correlation ID

## Relationships Summary

```
User (Faculty) ----< InvigilatorAssignment
User (Faculty) ----< Course
User (Creator) ----< Plan

Course >----< Student (via student_course)
Course ----< ScheduledExam

Room ----< Bench
Room ----< ScheduledExam

Plan ----< ScheduledExam

ScheduledExam ----< SeatAssignment
ScheduledExam ----< InvigilatorAssignment

Student ----< SeatAssignment
Bench ----< SeatAssignment

User ----< AuditLog
```

## Data Flow Through Engines

1. **Setup Phase**
   - Create Users, Courses, Students, Rooms, Rules
   - Enroll students in courses

2. **Engine 1: Scheduling**
   - Input: Courses, Students, Rules
   - Output: ScheduledExam (date + session per course)
   - Ensures: No student has exam clash

3. **Engine 2: Room & Seating**
   - Input: ScheduledExam, Rooms, Benches, Rules
   - Output: SeatAssignment (exact seat per student)
   - Ensures: Branch separation, capacity constraints

4. **Engine 3: Exam Management**
   - Input: ScheduledExam, Faculty, FacultyAvailability, Rules
   - Output: InvigilatorAssignment (faculty per exam)
   - Ensures: Workload fairness, ratio compliance

5. **Engine 4: Validation**
   - Input: All the above (reads independently)
   - Output: Compliance reports, conflict detection
   - Ensures: All rules followed correctly

## Migrations

### Creating Migrations

```bash
cd backend

# Auto-generate migration from model changes
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

### Initial Setup

```bash
# Create initial migration
alembic revision --autogenerate -m "initial schema"

# Apply migration
alembic upgrade head

# Initialize with default data
python -m app.utils.init_db
```

## Common Queries

### Get all courses for a student
```python
student = db.query(Student).filter(Student.usn == "1KT20CS001").first()
courses = student.courses
```

### Get scheduled exams for a plan
```python
plan = db.query(Plan).filter(Plan.id == 1).first()
exams = plan.scheduled_exams
```

### Get seat assignment for a student in an exam
```python
assignment = db.query(SeatAssignment).filter(
    SeatAssignment.student_id == student_id,
    SeatAssignment.scheduled_exam_id == exam_id
).first()
```

### Get invigilators for an exam
```python
exam = db.query(ScheduledExam).filter(ScheduledExam.id == exam_id).first()
invigilators = exam.invigilator_assignments
```

### Audit trail for an entity
```python
logs = db.query(AuditLog).filter(
    AuditLog.entity_type == AuditEntity.PLAN,
    AuditLog.entity_id == plan_id
).order_by(AuditLog.created_at.desc()).all()
```

## Best Practices

1. **Always use transactions** for multi-table updates
2. **Log all significant changes** to AuditLog
3. **Use relationships** instead of manual joins
4. **Validate data** with Pydantic schemas before database operations
5. **Check constraints** before creating records (e.g., plan status before publishing)
6. **Use soft deletes** for important records (is_active flag) instead of hard deletes
7. **Index foreign keys** and frequently queried fields
8. **Use lazy loading** for relationships unless you know you need them

## Testing

See `backend/tests/test_models.py` for model tests.

Run tests:
```bash
pytest backend/tests/test_models.py -v
```
