# ExamGuard User Guide

Complete user guide for the ExamGuard Examination Management System.

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Roles and Permissions](#user-roles-and-permissions)
3. [Dashboard Overview](#dashboard-overview)
4. [Exam Plan Management](#exam-plan-management)
5. [Complete Workflow Guide](#complete-workflow-guide)
6. [Courses and Students](#courses-and-students)
7. [Room Management](#room-management)
8. [Reports and Analytics](#reports-and-analytics)
9. [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing the System

1. Open your web browser and navigate to the ExamGuard URL
2. You'll be redirected to the login page
3. Enter your email and password
4. Click "Sign In" to access the dashboard

### Demo Credentials

For testing purposes, use these credentials:
- **Email**: `admin@kletu.ac.in`
- **Password**: `admin123`

### First Time Setup

After logging in for the first time:

1. **Change Your Password**
   - Click on your name in the top-right corner
   - Select "Change Password"
   - Enter your current and new passwords

2. **Review System Rules**
   - Navigate to Rules (if you have Admin/Exam Cell access)
   - Verify the default exam rules match your institution's requirements

3. **Add Courses and Students**
   - Set up your course catalog
   - Import or add student data

## User Roles and Permissions

ExamGuard supports four user roles with different access levels:

### 1. Administrator (ADMIN)
**Full system access including:**
- All exam plan operations
- User management
- System configuration
- Rule management
- Complete workflow control

### 2. Exam Cell (EXAM_CELL)
**Exam management access including:**
- Create and manage exam plans
- Execute all engines
- Generate reports
- Approve plans
- Manage courses and students

### 3. Head of Department (HOD)
**Department-level access including:**
- View exam plans
- Manage department courses
- View reports and analytics
- Limited plan modifications

### 4. Faculty (FACULTY)
**Limited access including:**
- View personal invigilator assignments
- Confirm/decline assignments
- View exam schedules
- Update availability

## Dashboard Overview

The dashboard provides a comprehensive overview of the system:

### Statistics Cards
- **Total Plans**: Number of exam plans in the system
- **Courses**: Total courses configured
- **Students**: Total student records
- **Rooms**: Total examination rooms

### Quick Actions
- **Create New Exam Plan**: Start a new examination schedule
- **Add Course**: Register a new course
- **Add Student**: Add new student record

### Recent Plans Table
Shows the latest exam plans with:
- Plan name and type
- Current status
- Exam dates
- Quick action links

### System Status
Real-time indicators showing:
- API connection status
- Database connectivity
- Engine availability

## Exam Plan Management

### Creating a New Plan

1. **Navigate to Plans**
   - Click "Plans" in the navigation menu
   - Click "Create New Plan" button

2. **Fill in Plan Details**
   - **Plan Name**: Descriptive name (e.g., "ISA-1 December 2024")
   - **Exam Type**: Select from ISA1, ISA2, or ESA
   - **Academic Year**: Enter academic year (e.g., "2024-25")
   - **Start Date**: First possible exam date
   - **End Date**: Last possible exam date
   - **Description**: Optional additional details

3. **Save the Plan**
   - Click "Create Plan" to save
   - You'll be redirected to the plan detail page

### Plan Status Workflow

Plans follow a structured workflow:

1. **DRAFT**: Initial creation, can be modified
2. **PENDING_APPROVAL**: Submitted for review
3. **APPROVED**: Ready for publishing
4. **PUBLISHED**: Live and visible to faculty
5. **ARCHIVED**: Completed or outdated

### Plan Detail View

The plan detail page shows:

- **Plan Information**: Basic details and current status
- **Statistics**: Count of scheduled exams, seat assignments, and invigilator assignments
- **Workflow Actions**: Status-specific action buttons
- **Course Selection**: Choose which courses to include
- **Scheduled Exams Table**: View generated schedule

## Complete Workflow Guide

Follow this step-by-step process to create a complete exam plan:

### Step 1: Create Plan
1. Create a new plan with basic information
2. Set appropriate exam type and date range

### Step 2: Generate Schedule (Engine 1)
1. In the plan detail view, select courses to include
2. Use checkboxes to select multiple courses
3. Click "Generate Schedule (Engine 1)"
4. Wait for the CP-SAT solver to create optimal schedule
5. Review the generated exam dates and times

**What Engine 1 Does:**
- Analyzes course conflicts (students taking multiple courses)
- Uses constraint programming to find optimal dates
- Ensures minimum gap requirements between exams
- Creates `ScheduledExam` records

### Step 3: Allocate Rooms (Engine 2a)
1. For each scheduled exam, click "Rooms"
2. Engine 2 will automatically assign rooms based on:
   - Student enrollment numbers
   - Room capacity
   - Availability on exam date

**What Room Allocation Does:**
- Calculates required room capacity
- Uses First-Fit Decreasing algorithm
- Assigns multiple rooms if needed
- Ensures rooms are available

### Step 4: Allocate Seats (Engine 2b)
1. After room allocation, click "Seats" for each exam
2. Engine 2 will create detailed seating arrangements with:
   - Branch separation (no same-branch students adjacent)
   - Unique seat codes (R-101-B04-L format)
   - 8-direction neighbor checking

**What Seat Allocation Does:**
- Groups students by branch
- Places students to maintain separation
- Generates seat codes with room-bench-position format
- Creates `SeatAssignment` records

### Step 5: Assign Invigilators (Engine 3)
1. Click "Invigilators" for each exam
2. Engine 3 automatically assigns faculty based on:
   - Faculty availability
   - Workload balancing
   - Required ratios (ISA: 1:30, ESA: 1:24)
   - Minimum per room requirements

**What Invigilator Assignment Does:**
- Calculates required invigilator count
- Checks faculty availability
- Selects faculty with lowest workload
- Assigns PRIMARY, RELIEF, and RESERVE roles
- Sends notifications

### Step 6: Validate Plan (Engine 4)
1. Click "Validate Plan" to run comprehensive checks
2. Engine 4 independently verifies:
   - Scheduling rule compliance
   - Seating arrangement correctness
   - Invigilator assignment adequacy
   - Plan completeness

**Validation Results:**
- Compliance score (0-100%)
- Letter grade (A+ to F)
- Detailed issue list by severity
- Recommendations for improvements

### Step 7: Approve and Publish
1. **Approve**: Click "Approve Plan" (requires Admin/Exam Cell role)
2. **Publish**: Click "Publish Plan" to make it live
3. Published plans are visible to all faculty members

## Courses and Students

### Managing Courses

**Add New Course:**
1. Navigate to Courses → Add Course
2. Fill in course details:
   - Course Code (e.g., "CS101")
   - Course Name
   - Semester and Branch
   - Credit hours

**Course Enrollment:**
- View enrollment counts on course list
- Track which students are registered

### Managing Students

**Add New Student:**
1. Navigate to Students → Add Student
2. Enter student information:
   - USN (University Serial Number)
   - Full Name and Email
   - Branch and Semester
   - Section

**Course Enrollment:**
1. Go to student detail page
2. Click "Enroll in Courses"
3. Select courses from the list
4. Save changes

## Room Management

### Room Configuration

**Add New Room:**
1. Navigate to Rooms → Add Room
2. Configure room details:
   - Room name (e.g., "R-101")
   - Building and floor
   - Total capacity
   - Grid dimensions (rows × columns)

**Bench Setup:**
- Benches are automatically created based on grid dimensions
- Each bench typically seats 2 students
- Bench positions are used for seat code generation

### Room Utilization

- View room usage across different plans
- Check capacity and availability
- Monitor seat assignment efficiency

## Reports and Analytics

### Compliance Reports

**Generate PDF Report:**
1. Go to plan detail page
2. Use Engine 4 to generate compliance report
3. Download PDF with detailed analysis

**Report Contents:**
- Executive summary
- Compliance score breakdown
- Issues by category and severity
- Recommendations

### Schedule Reports

**Export Schedule:**
- Generate Excel spreadsheets
- Include all exam details
- Filter by date range or branch

### Seating Charts

**Generate Seating Reports:**
- Room-wise seating arrangements
- Student-wise seat assignments
- Invigilator assignments per room

## Faculty Workflow

### For Faculty Members

**View Assignments:**
1. Login with faculty credentials
2. Dashboard shows your invigilator assignments
3. View details including date, time, and room

**Confirm/Decline Assignments:**
1. Go to Invigilators → My Assignments
2. Click "Confirm" or "Decline" for each assignment
3. Add notes if declining

**Set Availability:**
1. Go to Invigilators → My Availability
2. Mark dates when you're unavailable
3. Provide reason for unavailability

## System Rules Configuration

### Rule Categories

**Timing Rules:**
- Exam duration by type
- Session start times
- Break intervals

**Seating Rules:**
- Students per bench
- Maximum students per room
- Branch separation requirements

**Scheduling Rules:**
- Minimum gap between exams
- Maximum exams per day
- Blackout dates

**Invigilation Rules:**
- Student-to-invigilator ratios
- Minimum invigilators per room
- Workload points per assignment

### Modifying Rules

**For Admin/Exam Cell users:**
1. Navigate to Rules section
2. Select rule category
3. Edit values as needed
4. Save changes (affects future operations)

## Best Practices

### Planning Phase
1. **Set Up Data First**: Ensure all courses, students, and rooms are configured
2. **Review Rules**: Verify rules match your institution's policies
3. **Plan Timeline**: Allow sufficient time between plan creation and exam dates

### Execution Phase
1. **Follow Sequential Workflow**: Complete engines in order (1→2→3→4)
2. **Validate Frequently**: Run validation after major changes
3. **Review Reports**: Check compliance before publishing

### Monitoring Phase
1. **Track Faculty Confirmations**: Follow up on pending confirmations
2. **Monitor Compliance**: Address critical issues immediately
3. **Generate Backups**: Export important data before exam periods

## Troubleshooting

### Common Issues

#### Login Problems
- **Forgot Password**: Contact administrator for reset
- **Account Locked**: Check with system administrator
- **Wrong Role**: Verify you have appropriate permissions

#### Plan Creation Issues
- **Date Conflicts**: Ensure start date is before end date
- **Course Selection**: Verify courses have enrolled students
- **Permission Denied**: Check if you have Admin/Exam Cell role

#### Schedule Generation Problems
- **No Feasible Solution**: 
  - Check if date range is sufficient
  - Verify course conflicts aren't too complex
  - Consider increasing timeout or splitting large plans
- **Timeout Error**: Increase timeout seconds or reduce course count

#### Room Allocation Issues
- **Insufficient Capacity**: 
  - Add more rooms
  - Check room availability
  - Verify student enrollment numbers
- **No Available Rooms**: Check room configurations and capacities

#### Seat Allocation Problems
- **Branch Separation Violations**: 
  - Increase room capacity
  - Add more rooms with better layouts
  - Check bench configurations
- **Incomplete Assignments**: Verify room bench setups

#### Invigilator Assignment Issues
- **Insufficient Faculty**: 
  - Check faculty availability
  - Add more faculty users
  - Adjust invigilator ratios
- **Overload Warnings**: Review faculty workload distribution

### Getting Help

1. **Check Validation Results**: Engine 4 provides detailed issue analysis
2. **Review System Logs**: Look for error messages in the interface
3. **Consult Documentation**: Refer to this guide and API documentation
4. **Contact Support**: Reach out to system administrators

### Error Messages

**"Insufficient Permissions"**
- Solution: Contact admin to verify your user role

**"Plan Cannot Be Modified"**
- Solution: Check plan status; published plans are read-only

**"Validation Failed"**
- Solution: Review validation report and address critical issues

**"Engine Timeout"**
- Solution: Reduce problem complexity or increase timeout

## Advanced Features

### API Access

For developers and integrations:
- Interactive API documentation at `/docs`
- RESTful endpoints for all operations
- JWT-based authentication
- Comprehensive error handling

### Bulk Operations

**Import Students:**
- Use CSV import functionality (when implemented)
- Batch enroll students in courses

**Export Data:**
- Generate comprehensive reports
- Export to Excel, PDF, or JSON formats

### Audit Trail

All system operations are logged:
- User actions with timestamps
- Plan modifications and approvals
- Engine execution results
- System configuration changes

---

This user guide covers the core functionality of ExamGuard. For technical details, refer to the API documentation. For deployment information, see the DEPLOYMENT.md file.