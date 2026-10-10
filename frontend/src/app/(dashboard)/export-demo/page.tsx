/**
 * Export Demo Page
 * Demonstrates all export and print functionality with sample data
 */

'use client'

import * as React from 'react'
import { Download, FileText, Users, Calendar, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/Card'
import {
  ExportButton,
  ExportDropdown,
  PrintButton,
  BulkExportDialog,
  PrintPreviewModal,
  type ExportFormat
} from '@/components/export'
import {
  HallTicket,
  SeatingChart,
  AttendanceSheet,
  ExamScheduleReport,
  StudentListReport,
  InvigilatorRoster,
  AnalyticsSummaryReport,
  type Student,
  type Exam,
  type Room,
  type Invigilator,
  type SeatingAssignment,
  type DutyAssignment,
  type AnalyticsData
} from '@/components/reports'

// Sample data for demonstrations
const sampleStudents: Student[] = [
  {
    id: '1',
    name: 'Arun Kumar',
    regNo: '4KE21CS001',
    course: 'B.Tech Computer Science',
    department: 'Computer Science & Engineering',
    semester: '7th Semester',
    email: 'arun.kumar@kletech.ac.in',
    phone: '+91 9876543210'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    regNo: '4KE21EC015',
    course: 'B.Tech Electronics',
    department: 'Electronics & Communication',
    semester: '7th Semester',
    email: 'priya.sharma@kletech.ac.in',
    phone: '+91 9876543211'
  },
  {
    id: '3',
    name: 'Ravi Patel',
    regNo: '4KE21ME020',
    course: 'B.Tech Mechanical',
    department: 'Mechanical Engineering',
    semester: '7th Semester',
    email: 'ravi.patel@kletech.ac.in',
    phone: '+91 9876543212'
  }
]

const sampleExams: Exam[] = [
  {
    id: '1',
    courseCode: 'CS701',
    courseName: 'Machine Learning',
    date: '2024-11-15',
    startTime: '09:00 AM',
    endTime: '12:00 PM',
    duration: 180,
    maxMarks: 100,
    roomId: '1',
    roomName: 'Room 101'
  },
  {
    id: '2',
    courseCode: 'CS702',
    courseName: 'Data Structures',
    date: '2024-11-17',
    startTime: '02:00 PM',
    endTime: '05:00 PM',
    duration: 180,
    maxMarks: 100,
    roomId: '2',
    roomName: 'Room 102'
  }
]

const sampleRooms: Room[] = [
  {
    id: '1',
    name: 'Room 101',
    capacity: 60,
    location: 'Block A, First Floor',
    facilities: ['Projector', 'AC', 'CCTV']
  },
  {
    id: '2',
    name: 'Room 102',
    capacity: 50,
    location: 'Block A, First Floor',
    facilities: ['Projector', 'AC']
  }
]

const sampleInvigilators: Invigilator[] = [
  {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    department: 'Computer Science',
    email: 'rajesh.kumar@kletech.ac.in',
    phone: '+91 9988776655'
  },
  {
    id: '2',
    name: 'Prof. Sunita Rao',
    department: 'Electronics',
    email: 'sunita.rao@kletech.ac.in',
    phone: '+91 9988776656'
  }
]

const sampleSeatingAssignments: SeatingAssignment[] = [
  { studentId: '1', seatNumber: 'A1', roomId: '1', examId: '1' },
  { studentId: '2', seatNumber: 'A2', roomId: '1', examId: '1' },
  { studentId: '3', seatNumber: 'B1', roomId: '2', examId: '2' }
]

const sampleDutyAssignments: DutyAssignment[] = [
  { id: '1', invigilatorId: '1', examId: '1', roomId: '1', role: 'chief' },
  { id: '2', invigilatorId: '2', examId: '1', roomId: '1', role: 'assistant' }
]

const sampleAnalyticsData: AnalyticsData = {
  totalStudents: 1250,
  totalExams: 45,
  totalRooms: 12,
  averageCapacity: 55,
  utilizationRate: 78,
  departmentDistribution: [
    { department: 'Computer Science & Engineering', count: 450 },
    { department: 'Electronics & Communication', count: 350 },
    { department: 'Mechanical Engineering', count: 280 },
    { department: 'Civil Engineering', count: 170 }
  ],
  examsByDate: [
    { date: '2024-11-15', count: 8 },
    { date: '2024-11-17', count: 12 },
    { date: '2024-11-19', count: 10 },
    { date: '2024-11-21', count: 15 }
  ]
}

const ExportDemoPage = () => {
  const [bulkExportOpen, setBulkExportOpen] = React.useState(false)
  const [printPreviewOpen, setPrintPreviewOpen] = React.useState(false)
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>('csv')

  // Sample export data sets
  const exportItems = [
    {
      id: 'students',
      name: 'Student List',
      format: 'csv' as ExportFormat,
      data: sampleStudents,
      filename: 'students_list'
    },
    {
      id: 'exams',
      name: 'Exam Schedule',
      format: 'excel' as ExportFormat,
      data: sampleExams,
      filename: 'exam_schedule'
    },
    {
      id: 'rooms',
      name: 'Room Details',
      format: 'json' as ExportFormat,
      data: sampleRooms,
      filename: 'room_details'
    }
  ]

  const handleExportSuccess = (format: ExportFormat) => {
    console.log(`Export successful: ${format}`)
  }

  const handleExportError = (error: string, format: ExportFormat) => {
    console.error(`Export failed (${format}):`, error)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Export & Print Demo
        </h1>
        <p className="text-gray-600">
          Demonstration of all export and print functionality with sample data
        </p>
      </div>

      {/* Export Components Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Components
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Single Export Buttons */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Single Export</h3>
            <div className="space-y-3">
              <ExportButton
                data={sampleStudents}
                format="csv"
                filename="students"
                onSuccess={() => handleExportSuccess('csv')}
                onError={(error) => handleExportError(error, 'csv')}
              />
              <ExportButton
                data={sampleExams}
                format="excel"
                filename="exams"
                onSuccess={() => handleExportSuccess('excel')}
                onError={(error) => handleExportError(error, 'excel')}
              />
              <ExportButton
                data={sampleRooms}
                format="json"
                filename="rooms"
                onSuccess={() => handleExportSuccess('json')}
                onError={(error) => handleExportError(error, 'json')}
              />
            </div>
          </div>

          {/* Export Dropdown */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Export Dropdown</h3>
            <div className="space-y-3">
              <ExportDropdown
                data={sampleStudents}
                filename="students_multi"
                formats={['csv', 'excel', 'json']}
                onExportSuccess={handleExportSuccess}
                onExportError={handleExportError}
              />
              <Button
                variant="outline"
                onClick={() => setBulkExportOpen(true)}
              >
                <Download className="h-4 w-4 mr-2" />
                Bulk Export Demo
              </Button>
            </div>
          </div>

          {/* Print Components */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-3">Print Options</h3>
            <div className="space-y-3">
              <PrintButton
                elementId="hall-ticket-demo"
                onSuccess={() => console.log('Print successful')}
                onError={(error) => console.error('Print failed:', error)}
              />
              <PrintButton
                elementId="hall-ticket-demo"
                showPreview={true}
                onSuccess={() => console.log('Preview opened')}
                onError={(error) => console.error('Preview failed:', error)}
              >
                Print Preview
              </PrintButton>
              <Button
                variant="outline"
                onClick={() => setPrintPreviewOpen(true)}
              >
                Advanced Preview
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Report Templates Demo */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Report Templates
        </h2>

        <div className="space-y-8">
          {/* Hall Ticket */}
          <div id="hall-ticket-demo">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Hall Ticket</h3>
            <div className="border rounded-lg p-4">
              <HallTicket
                student={sampleStudents[0]}
                exams={sampleExams}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <ExportDropdown
                elementId="hall-ticket-demo"
                formats={['pdf', 'print']}
                filename="hall_ticket"
              />
            </div>
          </div>

          {/* Seating Chart */}
          <div id="seating-chart-demo">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Seating Chart</h3>
            <div className="border rounded-lg p-4">
              <SeatingChart
                exam={sampleExams[0]}
                room={sampleRooms[0]}
                students={sampleStudents}
                assignments={sampleSeatingAssignments}
                invigilators={sampleInvigilators}
                rows={6}
                columns={4}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <ExportDropdown
                elementId="seating-chart-demo"
                formats={['pdf', 'print']}
                filename="seating_chart"
              />
            </div>
          </div>

          {/* Attendance Sheet */}
          <div id="attendance-sheet-demo">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Attendance Sheet</h3>
            <div className="border rounded-lg p-4">
              <AttendanceSheet
                exam={sampleExams[0]}
                room={sampleRooms[0]}
                students={sampleStudents}
                assignments={sampleSeatingAssignments}
                invigilators={sampleInvigilators}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <ExportDropdown
                elementId="attendance-sheet-demo"
                formats={['pdf', 'print']}
                filename="attendance_sheet"
              />
            </div>
          </div>

          {/* Exam Schedule */}
          <div id="exam-schedule-demo">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Exam Schedule Report</h3>
            <div className="border rounded-lg p-4">
              <ExamScheduleReport
                exams={sampleExams}
                rooms={sampleRooms}
                invigilators={sampleInvigilators}
                dutyAssignments={sampleDutyAssignments}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <ExportDropdown
                elementId="exam-schedule-demo"
                formats={['pdf', 'print']}
                filename="exam_schedule"
              />
            </div>
          </div>

          {/* Student List */}
          <div id="student-list-demo">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Student List Report</h3>
            <div className="border rounded-lg p-4">
              <StudentListReport
                students={sampleStudents}
                groupByDepartment={true}
                includeContactInfo={true}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <ExportDropdown
                elementId="student-list-demo"
                formats={['pdf', 'print']}
                filename="student_list"
              />
            </div>
          </div>

          {/* Invigilator Roster */}
          <div id="invigilator-roster-demo">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Invigilator Roster</h3>
            <div className="border rounded-lg p-4">
              <InvigilatorRoster
                invigilators={sampleInvigilators}
                exams={sampleExams}
                rooms={sampleRooms}
                dutyAssignments={sampleDutyAssignments}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <ExportDropdown
                elementId="invigilator-roster-demo"
                formats={['pdf', 'print']}
                filename="invigilator_roster"
              />
            </div>
          </div>

          {/* Analytics Summary */}
          <div id="analytics-summary-demo">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Analytics Summary</h3>
            <div className="border rounded-lg p-4">
              <AnalyticsSummaryReport
                data={sampleAnalyticsData}
              />
            </div>
            <div className="mt-3 flex gap-2">
              <ExportDropdown
                elementId="analytics-summary-demo"
                formats={['pdf', 'print']}
                filename="analytics_summary"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Usage Examples */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Integration Examples
        </h2>

        <div className="space-y-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">Basic Export Button:</h4>
            <code className="block bg-gray-100 p-2 rounded text-xs">
              {`<ExportButton data={students} format="csv" filename="students" />`}
            </code>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">Export Dropdown with Multiple Formats:</h4>
            <code className="block bg-gray-100 p-2 rounded text-xs">
              {`<ExportDropdown data={data} formats={['csv', 'excel', 'pdf']} />`}
            </code>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">Print Button for Element:</h4>
            <code className="block bg-gray-100 p-2 rounded text-xs">
              {`<PrintButton elementId="report-content" showPreview={true} />`}
            </code>
          </div>

          <div>
            <h4 className="font-medium text-gray-800 mb-2">Hall Ticket Generation:</h4>
            <code className="block bg-gray-100 p-2 rounded text-xs">
              {`<HallTicket student={student} exams={exams} />`}
            </code>
          </div>
        </div>
      </Card>

      {/* Bulk Export Dialog */}
      <BulkExportDialog
        open={bulkExportOpen}
        onOpenChange={setBulkExportOpen}
        items={exportItems}
        onSuccess={() => console.log('Bulk export successful')}
        onError={(error) => console.error('Bulk export failed:', error)}
      />

      {/* Print Preview Modal */}
      <PrintPreviewModal
        open={printPreviewOpen}
        onOpenChange={setPrintPreviewOpen}
        elementId="hall-ticket-demo"
        title="Hall Ticket Preview"
        onPrint={() => console.log('Print from preview')}
        onError={(error) => console.error('Preview error:', error)}
      />
    </div>
  )
}

export default ExportDemoPage
