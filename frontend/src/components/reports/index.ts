/**
 * Reports components barrel file
 * Provides easy imports for all report template components
 */

export { HallTicket } from './HallTicket'
export { SeatingChart } from './SeatingChart'
export { AttendanceSheet } from './AttendanceSheet'
export { ExamScheduleReport } from './ExamScheduleReport'
export { StudentListReport } from './StudentListReport'
export { InvigilatorRoster } from './InvigilatorRoster'
export { AnalyticsSummaryReport } from './AnalyticsSummaryReport'

// Report data types
export interface Student {
  id: string
  name: string
  regNo: string
  course?: string
  department?: string
  semester?: string
  photo?: string
  email?: string
  phone?: string
}

export interface Exam {
  id: string
  courseCode: string
  courseName: string
  date: string
  startTime: string
  endTime: string
  duration: number
  maxMarks: number
  roomId?: string
  roomName?: string
}

export interface Room {
  id: string
  name: string
  capacity: number
  location?: string
  facilities?: string[]
}

export interface Invigilator {
  id: string
  name: string
  department: string
  email?: string
  phone?: string
}

export interface SeatingAssignment {
  studentId: string
  seatNumber: string
  roomId: string
  examId: string
}

export interface DutyAssignment {
  id: string
  invigilatorId: string
  examId: string
  roomId: string
  role: 'chief' | 'assistant'
}

export interface AnalyticsData {
  totalStudents: number
  totalExams: number
  totalRooms: number
  averageCapacity: number
  utilizationRate: number
  departmentDistribution: Array<{
    department: string
    count: number
  }>
  examsByDate: Array<{
    date: string
    count: number
  }>
}