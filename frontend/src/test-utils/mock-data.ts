import type * as T from '@/lib/types';

// Mock Users
export const mockAdminUser: T.User = {
  id: 1,
  email: 'admin@example.com',
  full_name: 'Admin User',
  role: 'admin',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockFacultyUser: T.User = {
  id: 2,
  email: 'faculty@example.com',
  full_name: 'Faculty User',
  role: 'faculty',
  department_id: 1,
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockStudentUser: T.User = {
  id: 3,
  email: 'student@example.com',
  full_name: 'Student User',
  role: 'student',
  is_active: true,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Login Response
export const mockLoginResponse: T.LoginResponse = {
  access_token: 'mock-jwt-token-xyz123',
  token_type: 'bearer',
};

// Mock Course
export const mockCourse: T.Course = {
  id: 1,
  code: 'CSE101',
  name: 'Introduction to Computer Science',
  branch: 'CSE',
  semester: 3,
  credits: 4,
  exam_type: 'MID_TERM',
  department_id: 1,
  is_active: true,
  enrollment_count: 120,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockCourse2: T.Course = {
  id: 2,
  code: 'MAT201',
  name: 'Advanced Mathematics',
  branch: 'CSE',
  semester: 3,
  credits: 3,
  exam_type: 'END_SEM',
  is_active: true,
  enrollment_count: 115,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Student
export const mockStudent: T.Student = {
  id: 1,
  usn: '1CR21CS001',
  name: 'John Doe',
  email: 'john.doe@student.com',
  branch: 'CSE',
  semester: 3,
  section: 'A',
  phone: '+919876543210',
  is_active: true,
  enrolled_courses: [1, 2],
  created_at: '2024-01-01T00:00:00Z',
};

export const mockStudent2: T.Student = {
  id: 2,
  usn: '1CR21CS002',
  name: 'Jane Smith',
  email: 'jane.smith@student.com',
  branch: 'CSE',
  semester: 3,
  section: 'A',
  is_active: true,
  enrolled_courses: [1],
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Room
export const mockRoom: T.Room = {
  id: 1,
  code: 'R101',
  name: 'Room 101',
  capacity: 60,
  rows: 10,
  columns: 6,
  is_active: true,
  building: 'Main Block',
  floor: 1,
  features: ['AC', 'Projector'],
  created_at: '2024-01-01T00:00:00Z',
};

export const mockRoom2: T.Room = {
  id: 2,
  code: 'R102',
  name: 'Room 102',
  capacity: 40,
  rows: 8,
  columns: 5,
  is_active: true,
  building: 'Main Block',
  floor: 1,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Plan
export const mockPlan: T.Plan = {
  id: 1,
  name: 'Mid-Term Exam March 2024',
  exam_type: 'MID_TERM',
  start_date: '2024-03-15',
  end_date: '2024-03-20',
  status: 'draft',
  sessions: ['9:00-12:00', '14:00-17:00'],
  course_count: 25,
  schedule_count: 50,
  created_by: 1,
  created_at: '2024-01-01T00:00:00Z',
};

export const mockApprovedPlan: T.Plan = {
  id: 2,
  name: 'End-Sem Exam May 2024',
  exam_type: 'END_SEM',
  start_date: '2024-05-01',
  end_date: '2024-05-15',
  status: 'approved',
  sessions: ['9:00-12:00', '14:00-17:00'],
  course_count: 30,
  schedule_count: 60,
  approved_by: 1,
  approved_at: '2024-02-15T00:00:00Z',
  created_by: 1,
  created_at: '2024-01-15T00:00:00Z',
};

// Mock Schedule
export const mockSchedule: T.Schedule = {
  id: 1,
  plan_id: 1,
  course_id: 1,
  exam_date: '2024-03-15',
  session: '9:00-12:00',
  duration_minutes: 180,
  student_count: 120,
  room_count: 2,
  course: mockCourse,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Seat Assignment
export const mockSeatAssignment: T.SeatAssignment = {
  id: 1,
  scheduled_exam_id: 1,
  student_id: 1,
  room_id: 1,
  bench_id: 1,
  seat_position: 'left',
  student: mockStudent,
  room: mockRoom,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Invigilator Availability
export const mockInvigilatorAvailability: T.InvigilatorAvailability = {
  id: 1,
  user_id: 2,
  exam_date: '2024-03-15',
  session: '9:00-12:00',
  is_available: true,
  user: mockFacultyUser,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Invigilator Assignment
export const mockInvigilatorAssignment: T.InvigilatorAssignment = {
  id: 1,
  scheduled_exam_id: 1,
  user_id: 2,
  room_id: 1,
  role: 'primary',
  is_confirmed: true,
  confirmed_at: '2024-03-01T00:00:00Z',
  notified_at: '2024-02-28T00:00:00Z',
  user: mockFacultyUser,
  room: mockRoom,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Rule
export const mockRule: T.Rule = {
  id: 1,
  name: 'No consecutive exams',
  category: 'student_constraint',
  exam_type: 'MID_TERM',
  description: 'Students should not have consecutive exams on the same day',
  is_active: true,
  priority: 10,
  configuration: { min_gap_hours: 3 },
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Engine
export const mockEngine: T.Engine = {
  name: 'scheduling-engine',
  display_name: 'Scheduling Engine',
  version: '1.0.0',
  description: 'Generates exam schedules based on courses and constraints',
  capabilities: ['schedule_generation', 'conflict_detection'],
  dependencies: [],
  execution_order: 1,
  health: 'healthy',
  configured: true,
  enabled: true,
};

export const mockEngine2: T.Engine = {
  name: 'seating-engine',
  display_name: 'Seating Arrangement Engine',
  version: '1.0.0',
  description: 'Allocates seats to students in exam rooms',
  capabilities: ['seat_allocation', 'room_optimization'],
  dependencies: ['scheduling-engine'],
  execution_order: 2,
  health: 'healthy',
  configured: true,
  enabled: true,
};

// Mock Engine Execution Response
export const mockExecutionResponse: T.EngineExecutionResponse = {
  execution_id: 'exec-123-abc',
  engine_name: 'scheduling-engine',
  status: 'running',
  started_at: '2024-01-01T10:00:00Z',
  message: 'Execution started successfully',
};

// Mock Engine Execution Status
export const mockExecutionStatus: T.EngineExecutionStatus = {
  execution_id: 'exec-123-abc',
  engine_name: 'scheduling-engine',
  status: 'completed',
  started_at: '2024-01-01T10:00:00Z',
  completed_at: '2024-01-01T10:05:00Z',
  execution_time_ms: 300000,
  progress: 100,
  message: 'Schedule generated successfully',
  output_data: {
    schedules_created: 50,
    conflicts_resolved: 5,
  },
};

// Mock Course Registration
export const mockCourseRegistration: T.CourseRegistration = {
  id: 1,
  student_id: 1,
  course_id: 1,
  academic_year: '2023-24',
  semester: 3,
  registration_date: '2024-01-01',
  is_active: true,
  student: mockStudent,
  course: mockCourse,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Extraction Result
export const mockExtractionResult: T.ExtractionResult = {
  success: true,
  message: 'Data extracted successfully',
  data: {
    courses: [mockCourse, mockCourse2],
    count: 2,
  },
};

// Mock Conflict Check
export const mockConflictCheck: T.ConflictCheck = {
  has_conflicts: false,
  conflicts: [],
};

export const mockConflictCheckWithConflicts: T.ConflictCheck = {
  has_conflicts: true,
  conflicts: [
    {
      type: 'time_conflict',
      message: 'Student has overlapping exams',
      details: { student_id: 1, course_ids: [1, 2] },
    },
  ],
};

// Mock Dashboard Stats
export const mockDashboardStats: T.DashboardStats = {
  total_users: 150,
  total_courses: 50,
  total_students: 1200,
  total_rooms: 25,
  active_plans: 3,
  upcoming_exams: 15,
  pending_approvals: 2,
};

// Mock Notification
export const mockNotification: T.Notification = {
  id: 1,
  user_id: 2,
  type: 'invigilator_assignment',
  title: 'New Exam Duty Assigned',
  message: 'You have been assigned as invigilator for CSE101 exam on 2024-03-15',
  is_read: false,
  created_at: '2024-01-01T00:00:00Z',
};

// Mock Bench
export const mockBench: T.Bench = {
  id: 1,
  room_id: 1,
  row: 1,
  column: 1,
  is_usable: true,
};
