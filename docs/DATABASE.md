# ExamGuard Database Schema Documentation

Complete database schema and data model documentation for ExamGuard.

## 🗄️ Database Overview

ExamGuard uses **PostgreSQL 15+** as the primary database with **SQLAlchemy 2.0** as the ORM layer. The schema supports multi-tenancy, audit trails, and version management.

### Key Design Principles

- **Normalized Design**: Eliminates data redundancy
- **Referential Integrity**: Foreign key constraints ensure data consistency
- **Audit Trail**: Complete operation logging with AuditLog
- **Soft Deletes**: Important entities use `is_active` flags instead of hard deletes
- **Timestamps**: All entities track `created_at` and `updated_at`
- **Indexes**: Optimized for common query patterns

## 📊 Entity Relationship Diagram

```
                    ┌─────────────┐
                    │    User     │
                    │             │
                    │ id (PK)     │
                    │ email       │
                    │ role        │
                    │ department  │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
                    │    Plan     │
                    │             │
                    │ id (PK)     │
                    │ name        │
                    │ version     │
                    │ status      │
                    │ created_by  │
                    └──────┬──────┘
                           │
                    ┌──────┴──────┐
               ┌────│ScheduledExam│────┐
               │    │             │    │
               │    │ id (PK)     │    │
               │    │ plan_id (FK)│    │
               │    │ course_id   │    │
               │    │ exam_date   │    │
               │    │ session     │    │
               │    └─────────────┘    │
               │                       │
    ┌──────────┴──────┐      ┌─────────┴──────────┐
    │ SeatAssignment  │      │InvigilatorAssignmt │
    │                 │      │                    │
    │ id (PK)         │      │ id (PK)           │
    │ exam_id (FK)    │      │ exam_id (FK)      │
    │ student_id (FK) │      │ user_id (FK)      │
    │ room_id (FK)    │      │ room_id (FK)      │
    │ seat_code       │      │ role              │
    └─────────────────┘      └────────────────────┘
```

## 📋 Table Definitions

### Core Entities

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(50),
    department VARCHAR(100),
    role VARCHAR(20) NOT NULL DEFAULT 'FACULTY',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enum constraint for roles
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'EXAM_CELL', 'HOD', 'FACULTY'));
```

#### rules
```sql
CREATE TABLE rules (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    exam_type VARCHAR(20),
    value_type VARCHAR(20) NOT NULL,
    int_value INTEGER,
    float_value DECIMAL(10,2),
    string_value TEXT,
    bool_value BOOLEAN,
    json_value JSONB,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(code, exam_type)
);

-- Enum constraints
ALTER TABLE rules ADD CONSTRAINT rules_category_check 
CHECK (category IN ('TIMING', 'SEATING', 'SCHEDULING', 'INVIGILATION', 'ELIGIBILITY'));

ALTER TABLE rules ADD CONSTRAINT rules_exam_type_check 
CHECK (exam_type IN ('ISA1', 'ISA2', 'ESA'));

ALTER TABLE rules ADD CONSTRAINT rules_value_type_check 
CHECK (value_type IN ('int', 'float', 'string', 'bool', 'json'));
```

#### courses
```sql
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    semester INTEGER NOT NULL,
    branch VARCHAR(50) NOT NULL,
    credits INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### students
```sql
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    usn VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    branch VARCHAR(50) NOT NULL,
    semester INTEGER NOT NULL,
    section VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### student_courses (Many-to-Many)
```sql
CREATE TABLE student_courses (
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (student_id, course_id)
);
```

### Infrastructure Entities

#### rooms
```sql
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    building VARCHAR(100),
    floor INTEGER,
    capacity INTEGER NOT NULL,
    rows INTEGER NOT NULL,
    columns INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### benches
```sql
CREATE TABLE benches (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    bench_number VARCHAR(20) NOT NULL,
    row INTEGER NOT NULL,
    column INTEGER NOT NULL,
    positions INTEGER DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(room_id, row, column)
);
```

### Plan Management

#### plans
```sql
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    exam_type VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'DRAFT',
    approved_by_id INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_by_id INTEGER REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enum constraint for status
ALTER TABLE plans ADD CONSTRAINT plans_status_check 
CHECK (status IN ('DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'PUBLISHED', 'ARCHIVED'));

-- Enum constraint for exam type
ALTER TABLE plans ADD CONSTRAINT plans_exam_type_check 
CHECK (exam_type IN ('ISA1', 'ISA2', 'ESA'));
```

### Engine Outputs

#### scheduled_exams (Engine 1 Output)
```sql
CREATE TABLE scheduled_exams (
    id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES plans(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id),
    exam_date DATE NOT NULL,
    session VARCHAR(20) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(plan_id, course_id)
);

-- Enum constraint for session
ALTER TABLE scheduled_exams ADD CONSTRAINT scheduled_exams_session_check 
CHECK (session IN ('MORNING', 'AFTERNOON', 'EVENING'));
```

#### seat_assignments (Engine 2 Output)
```sql
CREATE TABLE seat_assignments (
    id SERIAL PRIMARY KEY,
    scheduled_exam_id INTEGER REFERENCES scheduled_exams(id) ON DELETE CASCADE,
    student_id INTEGER REFERENCES students(id),
    room_id INTEGER REFERENCES rooms(id),
    bench_id INTEGER REFERENCES benches(id),
    seat_code VARCHAR(20) NOT NULL,
    row INTEGER NOT NULL,
    column INTEGER NOT NULL,
    position VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(scheduled_exam_id, student_id),
    UNIQUE(scheduled_exam_id, seat_code)
);
```

#### faculty_availability
```sql
CREATE TABLE faculty_availability (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, exam_date)
);
```

#### invigilator_assignments (Engine 3 Output)
```sql
CREATE TABLE invigilator_assignments (
    id SERIAL PRIMARY KEY,
    scheduled_exam_id INTEGER REFERENCES scheduled_exams(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    room_id INTEGER REFERENCES rooms(id),
    role VARCHAR(20) NOT NULL,
    workload_points DECIMAL(5,2) DEFAULT 0.0,
    notification_sent BOOLEAN DEFAULT FALSE,
    confirmed BOOLEAN DEFAULT FALSE,
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enum constraint for invigilator role
ALTER TABLE invigilator_assignments ADD CONSTRAINT invigilator_role_check 
CHECK (role IN ('PRIMARY', 'RELIEF', 'RESERVE'));
```

### Audit and Logging

#### audit_logs
```sql
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📈 Performance Indexes

### Primary Indexes (Automatic)
```sql
-- Primary key indexes created automatically
-- users_pkey, rules_pkey, courses_pkey, etc.
```

### Unique Indexes
```sql
-- Unique constraints create indexes automatically
CREATE UNIQUE INDEX users_email_idx ON users(email);
CREATE UNIQUE INDEX courses_code_idx ON courses(code);
CREATE UNIQUE INDEX students_usn_idx ON students(usn);
CREATE UNIQUE INDEX rooms_name_idx ON rooms(name);
```

### Query Optimization Indexes
```sql
-- Plan and exam queries
CREATE INDEX idx_scheduled_exam_plan_id ON scheduled_exams(plan_id);
CREATE INDEX idx_scheduled_exam_date ON scheduled_exams(exam_date);
CREATE INDEX idx_scheduled_exam_plan_date ON scheduled_exams(plan_id, exam_date);

-- Seating queries
CREATE INDEX idx_seat_assignment_exam_id ON seat_assignments(scheduled_exam_id);
CREATE INDEX idx_seat_assignment_room_id ON seat_assignments(room_id);
CREATE INDEX idx_seat_assignment_student_id ON seat_assignments(student_id);

-- Invigilator queries
CREATE INDEX idx_invigilator_assignment_exam_id ON invigilator_assignments(scheduled_exam_id);
CREATE INDEX idx_invigilator_assignment_user_id ON invigilator_assignments(user_id);
CREATE INDEX idx_faculty_availability_user_date ON faculty_availability(user_id, exam_date);

-- Enrollment queries
CREATE INDEX idx_student_courses_student_id ON student_courses(student_id);
CREATE INDEX idx_student_courses_course_id ON student_courses(course_id);

-- Rule queries
CREATE INDEX idx_rules_lookup ON rules(exam_type, category, code);
CREATE INDEX idx_rules_category ON rules(category);

-- Audit queries
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Room and bench queries
CREATE INDEX idx_benches_room_id ON benches(room_id);
CREATE INDEX idx_benches_position ON benches(room_id, row, column);
```

## 🔄 Data Relationships

### One-to-Many Relationships

```python
# User → Plans (one user creates many plans)
User.plans = relationship("Plan", back_populates="created_by")

# Plan → ScheduledExams (one plan has many exams)
Plan.scheduled_exams = relationship("ScheduledExam", back_populates="plan")

# ScheduledExam → SeatAssignments (one exam has many seat assignments)
ScheduledExam.seat_assignments = relationship("SeatAssignment", back_populates="scheduled_exam")

# Room → Benches (one room has many benches)
Room.benches = relationship("Bench", back_populates="room")
```

### Many-to-Many Relationships

```python
# Student ↔ Course (students enroll in multiple courses)
student_courses = Table(
    'student_courses',
    Column('student_id', Integer, ForeignKey('students.id')),
    Column('course_id', Integer, ForeignKey('courses.id'))
)

Student.courses = relationship("Course", secondary=student_courses, back_populates="students")
Course.students = relationship("Student", secondary=student_courses, back_populates="courses")
```

## 📊 Data Constraints and Validation

### Domain Constraints
```sql
-- Date constraints
ALTER TABLE plans ADD CONSTRAINT plans_date_order 
CHECK (start_date <= end_date);

-- Capacity constraints  
ALTER TABLE rooms ADD CONSTRAINT rooms_positive_capacity 
CHECK (capacity > 0 AND rows > 0 AND columns > 0);

-- Semester constraints
ALTER TABLE students ADD CONSTRAINT students_semester_range 
CHECK (semester BETWEEN 1 AND 8);

-- Version constraints
ALTER TABLE plans ADD CONSTRAINT plans_positive_version 
CHECK (version > 0);
```

### Business Rule Constraints
```sql
-- Seat code format validation
ALTER TABLE seat_assignments ADD CONSTRAINT seat_code_format 
CHECK (seat_code ~ '^R-[0-9]+-B[0-9]+-[LR]$');

-- Email format validation (basic)
ALTER TABLE users ADD CONSTRAINT users_email_format 
CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$');

-- USN format validation
ALTER TABLE students ADD CONSTRAINT students_usn_format 
CHECK (usn ~ '^[0-9][A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{3}$');
```

## 🔧 Database Functions and Triggers

### Timestamp Management
```sql
-- Trigger function to update 'updated_at' timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Apply to all other tables...
```

### Audit Trail Trigger
```sql
-- Function to log changes to audit_logs
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        action, entity_type, entity_id, old_values, new_values
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN row_to_json(NEW) ELSE NULL END
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit trigger to critical tables
CREATE TRIGGER audit_plans AFTER INSERT OR UPDATE OR DELETE ON plans
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## 📋 Sample Queries

### Common Application Queries

```sql
-- 1. Get all courses for a student
SELECT c.code, c.name, c.semester, c.branch
FROM courses c
JOIN student_courses sc ON c.id = sc.course_id
WHERE sc.student_id = ?;

-- 2. Find conflicts for schedule generation
SELECT DISTINCT c1.id as course1_id, c2.id as course2_id
FROM courses c1, courses c2, student_courses sc1, student_courses sc2
WHERE c1.id < c2.id
  AND c1.id = sc1.course_id
  AND c2.id = sc2.course_id
  AND sc1.student_id = sc2.student_id;

-- 3. Get seating chart for a room and exam
SELECT sa.seat_code, sa.position, s.usn, s.name, s.branch
FROM seat_assignments sa
JOIN students s ON sa.student_id = s.id
WHERE sa.scheduled_exam_id = ? AND sa.room_id = ?
ORDER BY sa.row, sa.column, sa.position;

-- 4. Calculate faculty workload
SELECT u.full_name, u.department, 
       COUNT(ia.id) as assignment_count,
       SUM(ia.workload_points) as total_points
FROM users u
LEFT JOIN invigilator_assignments ia ON u.id = ia.user_id
WHERE u.role = 'FACULTY'
GROUP BY u.id, u.full_name, u.department;

-- 5. Get plan statistics
SELECT p.name, p.status,
       COUNT(DISTINCT se.id) as scheduled_exams,
       COUNT(DISTINCT sa.id) as seat_assignments,
       COUNT(DISTINCT ia.id) as invigilator_assignments
FROM plans p
LEFT JOIN scheduled_exams se ON p.id = se.plan_id
LEFT JOIN seat_assignments sa ON se.id = sa.scheduled_exam_id
LEFT JOIN invigilator_assignments ia ON se.id = ia.scheduled_exam_id
WHERE p.id = ?
GROUP BY p.id, p.name, p.status;
```

### Analytical Queries

```sql
-- Room utilization analysis
SELECT r.name, r.capacity,
       COUNT(sa.id) as seats_used,
       ROUND(COUNT(sa.id)::decimal / r.capacity * 100, 2) as utilization_percent
FROM rooms r
LEFT JOIN seat_assignments sa ON r.id = sa.room_id
LEFT JOIN scheduled_exams se ON sa.scheduled_exam_id = se.id
WHERE se.plan_id = ?
GROUP BY r.id, r.name, r.capacity;

-- Branch distribution in seating
SELECT sa.room_id, r.name, s.branch, COUNT(*) as student_count
FROM seat_assignments sa
JOIN students s ON sa.student_id = s.id
JOIN rooms r ON sa.room_id = r.id
JOIN scheduled_exams se ON sa.scheduled_exam_id = se.id
WHERE se.plan_id = ?
GROUP BY sa.room_id, r.name, s.branch
ORDER BY sa.room_id, s.branch;
```

## 🚀 Database Maintenance

### Regular Maintenance Tasks

```sql
-- Update table statistics
ANALYZE;

-- Rebuild indexes (if needed)
REINDEX DATABASE examguard;

-- Check for unused indexes
SELECT schemaname, tablename, indexname, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_tup_read = 0;

-- Monitor table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY size_bytes DESC;
```

### Backup and Recovery

```sql
-- Create backup
pg_dump -h localhost -U examguard -d examguard > backup.sql

-- Restore backup
psql -h localhost -U examguard -d examguard < backup.sql

-- Partial backup (data only)
pg_dump -h localhost -U examguard -d examguard --data-only > data_backup.sql
```

---

This database documentation provides the complete schema reference for ExamGuard. For application-level data access patterns, refer to the SQLAlchemy models in the codebase.