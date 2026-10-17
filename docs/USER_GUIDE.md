# ExamGuard User Guide

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Admin Functions](#admin-functions)
4. [Faculty Functions](#faculty-functions)
5. [Student Functions](#student-functions)
6. [Common Tasks](#common-tasks)
7. [Help and Support](#help-and-support)

## Getting Started

### Logging In

1. Navigate to the ExamGuard login page
2. Enter your institutional email address
3. Enter your password
4. Click the "Sign In" button
5. You will be redirected to your role-specific dashboard

**First-time users**: Contact your system administrator for account creation and initial credentials.

### Password Requirements

- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Forgot Password

1. Click "Forgot Password?" on the login page
2. Enter your email address
3. Check your email for a reset link
4. Follow the link to create a new password

## Dashboard Overview

After logging in, you'll see your role-specific dashboard with:

- **Navigation Menu** (left sidebar): Access all system features
- **Quick Actions**: Common tasks for your role
- **Recent Activity**: Your recent actions and updates
- **Notifications**: Important alerts and messages
- **Analytics**: Role-specific statistics and charts

### Navigation Menu

- **Dashboard**: Return to the main dashboard
- **Exam Plans**: Create and manage examination schedules
- **Courses**: View and manage courses
- **Students**: Student information and management
- **Rooms**: Examination room management
- **Seating**: Seating arrangement management
- **Invigilators**: Invigilator assignment and scheduling
- **Reports**: Generate various reports
- **Settings**: System and profile settings

### Using the Help System

Click the **Help** button (?) in the sidebar to access:
- Contextual help for the current page
- Interactive tours for complex workflows
- Quick reference guides
- Video tutorials (when available)

## Admin Functions

### User Management

**Creating Users:**
1. Navigate to Settings → Users
2. Click "Add New User"
3. Fill in user details (name, email, role)
4. Set initial password
5. Click "Create User"

**Managing User Roles:**
- ADMIN: Full system access
- EXAM_CELL: Examination management
- HOD: Department-level management
- FACULTY: Course and grade management
- STUDENT: Student portal access

### Exam Plan Creation

1. Navigate to Exam Plans
2. Click "Create New Plan"
3. Fill in plan details:
   - Plan name (e.g., "Mid-Term Exams 2024")
   - Academic year and semester
   - Start and end dates
   - Exam type (Mid-term, End-term, etc.)
4. Add courses to the plan
5. Set exam dates and time slots
6. Click "Save Plan"

### Room Management

**Adding Rooms:**
1. Go to Rooms → Add Room
2. Enter room details:
   - Room number/name
   - Building
   - Capacity
   - Type (Classroom, Lab, Hall)
3. Add facilities (projector, AC, etc.)
4. Click "Save Room"

### Running the Scheduling Engine

**Engine 1 - Exam Scheduler:**
1. Navigate to Dashboard → Engine Control
2. Select Engine 1 (Scheduler)
3. Choose the exam plan
4. Configure options:
   - Conflict detection
   - Room allocation preferences
   - Time slot distribution
5. Click "Run Engine"
6. Review results
7. Apply or modify schedule

**Engine 2 - Room Seating:**
1. Select Engine 2 (Room Seating)
2. Choose exam plan and date
3. Configure seating preferences:
   - Alternate seating
   - Distance between students
   - Room utilization
4. Click "Generate Seating"
5. Review and export seating arrangements

**Engine 3 - Invigilator Assignment:**
1. Select Engine 3 (Invigilators)
2. Choose exam plan
3. Set duty preferences:
   - Maximum duties per invigilator
   - Department rotation
   - Avoid conflicts
4. Click "Assign Invigilators"
5. Review and notify invigilators

## Faculty Functions

### Course Management

**Viewing Courses:**
1. Navigate to Courses
2. View your assigned courses
3. Click on a course to see details

**Managing Students:**
1. Select a course
2. View enrolled students
3. Add/remove students if authorized
4. Export student lists

### Grade Entry

1. Navigate to Marks Entry
2. Select course and exam type
3. Enter marks for each student
4. System validates mark ranges automatically
5. Click "Save Marks"
6. Submit for approval if required

### Exam Duties

**Viewing Duty Schedule:**
1. Navigate to Invigilators
2. View your assigned duties
3. Check exam details:
   - Date and time
   - Room assignment
   - Number of students
4. Download duty slip

**Reporting Issues:**
1. Click "Report Issue" on duty card
2. Describe the problem
3. Submit to exam cell
4. Receive confirmation

## Student Functions

### Viewing Exam Schedule

1. Log in to student portal
2. Dashboard shows upcoming exams
3. Navigate to "My Schedule" for complete timetable
4. View details for each exam:
   - Course name
   - Date and time
   - Room assignment
   - Seat number (when assigned)

### Downloading Hall Ticket

1. Navigate to Hall Tickets
2. Select exam session
3. Click "Download Hall Ticket"
4. PDF will be generated with:
   - Student photo and details
   - Exam schedule
   - Seat assignments
   - Instructions
5. Print and bring to examination

### Course Registration

1. Navigate to Courses → Register
2. View available courses
3. Check prerequisites
4. Select courses to register
5. Submit registration
6. Await approval from HOD/Faculty

### Checking Results

1. Navigate to Results
2. Select semester/exam type
3. View marks and grades
4. Download mark sheet if available
5. Request revaluation if needed

## Common Tasks

### Generating Reports

**Attendance Reports:**
1. Navigate to Reports
2. Select "Attendance Report"
3. Choose exam plan and date
4. Click "Generate"
5. Download as PDF or Excel

**Seating Charts:**
1. Go to Seating → Reports
2. Select exam and room
3. Generate seating chart
4. Print for posting outside rooms

**Exam Statistics:**
1. Navigate to Analytics
2. Select exam plan
3. View statistics:
   - Total students
   - Room utilization
   - Invigilator assignments
4. Export data as needed

### Exporting Data

ExamGuard supports multiple export formats:
- **CSV**: For spreadsheet applications
- **Excel**: Formatted Excel files
- **PDF**: For printing and archival
- **JSON**: For data integration

**To export:**
1. Navigate to any data table
2. Click the Export button
3. Select format
4. File will download automatically

### Uploading Data

**CSV/Excel Upload:**
1. Click Upload button on relevant page
2. Download template if needed
3. Fill in data following template format
4. Select file to upload
5. System validates data
6. Review any errors
7. Confirm upload

**Supported uploads:**
- Student lists
- Course data
- Room information
- Invigilator lists

### Using Filters and Search

**Search:**
- Use search box at top of data tables
- Search works across all visible columns
- Results update as you type

**Filters:**
1. Click filter icon on column headers
2. Set filter criteria
3. Apply multiple filters
4. Clear filters with "Clear All" button

**Sorting:**
- Click column header to sort
- Click again to reverse sort order
- Shift+click for multi-column sorting

## Help and Support

### Accessing Help

- **Help Button**: Click ? in sidebar for contextual help
- **Tooltips**: Hover over ? icons for quick info
- **Guided Tours**: Available for complex features
- **FAQ**: Navigate to Help → FAQ

### Common Issues

**Cannot Log In:**
- Verify email and password
- Check Caps Lock is off
- Try password reset
- Contact admin if account locked

**Permission Denied:**
- Check your role and permissions
- Contact administrator for access
- Some features require specific roles

**Data Not Saving:**
- Check required fields are filled
- Verify data format is correct
- Check file size for uploads
- Ensure stable internet connection

### Getting Additional Help

**Contact Options:**
- Email: support@examguard.kle.edu
- Help Desk: Available during office hours
- Submit ticket through Help → Support
- Check documentation at docs.examguard.kle.edu

### Reporting Bugs

1. Navigate to Help → Report Issue
2. Describe the problem
3. Include:
   - What you were trying to do
   - What happened instead
   - Error messages if any
   - Screenshots if helpful
4. Submit report
5. You'll receive a ticket number

---

**Version**: 1.0  
**Last Updated**: 2024  
**For additional guides**: See [Documentation Index](README.md)
