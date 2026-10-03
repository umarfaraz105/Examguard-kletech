/**
 * Export and Print Test Page - Demonstrates export and print functionality
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ExportButton from '@/components/export/ExportButton';
import PrintButton from '@/components/export/PrintButton';
import { ExportColumn } from '@/lib/export-utils';
import { createHallTicketHTML, createSeatingChartHTML } from '@/lib/print-utils';

const ExportPrintTestPage: React.FC = () => {
  // Sample data for testing
  const [sampleStudents] = useState([
    { id: 1, usn: '4NM21CS001', name: 'John Doe', email: 'john.doe@example.com', branch: 'CSE', semester: 5, section: 'A', phone: '9876543210', cgpa: 8.5, status: 'Active' },
    { id: 2, usn: '4NM21CS002', name: 'Jane Smith', email: 'jane.smith@example.com', branch: 'CSE', semester: 5, section: 'A', phone: '9876543211', cgpa: 9.0, status: 'Active' },
    { id: 3, usn: '4NM21CS003', name: 'Bob Johnson', email: 'bob.johnson@example.com', branch: 'CSE', semester: 5, section: 'B', phone: '9876543212', cgpa: 7.5, status: 'Active' },
    { id: 4, usn: '4NM21EC001', name: 'Alice Brown', email: 'alice.brown@example.com', branch: 'ECE', semester: 3, section: 'A', phone: '9876543213', cgpa: 8.8, status: 'Active' },
    { id: 5, usn: '4NM21EC002', name: 'Charlie Davis', email: 'charlie.davis@example.com', branch: 'ECE', semester: 3, section: 'A', phone: '9876543214', cgpa: 7.2, status: 'Inactive' }
  ]);

  const [sampleCourses] = useState([
    { id: 1, code: 'CS501', name: 'Design and Analysis of Algorithms', branch: 'CSE', semester: 5, credits: 4, faculty: 'Dr. Smith', examType: 'END_SEM', status: 'Active' },
    { id: 2, code: 'CS502', name: 'Computer Networks', branch: 'CSE', semester: 5, credits: 4, faculty: 'Dr. Johnson', examType: 'END_SEM', status: 'Active' },
    { id: 3, code: 'CS503', name: 'Database Management Systems', branch: 'CSE', semester: 5, credits: 3, faculty: 'Dr. Brown', examType: 'END_SEM', status: 'Active' },
    { id: 4, code: 'EC301', name: 'Analog Electronics', branch: 'ECE', semester: 3, credits: 4, faculty: 'Dr. Davis', examType: 'END_SEM', status: 'Active' },
    { id: 5, code: 'EC302', name: 'Digital Electronics', branch: 'ECE', semester: 3, credits: 3, faculty: 'Dr. Wilson', examType: 'END_SEM', status: 'Active' }
  ]);

  // Define columns for exports
  const studentColumns: ExportColumn[] = [
    { key: 'usn', header: 'USN', width: 12 },
    { key: 'name', header: 'Name', width: 20 },
    { key: 'email', header: 'Email', width: 25 },
    { key: 'branch', header: 'Branch', width: 10 },
    { key: 'semester', header: 'Semester', width: 8 },
    { key: 'section', header: 'Section', width: 8 },
    { key: 'phone', header: 'Phone', width: 15 },
    { key: 'cgpa', header: 'CGPA', width: 8, format: (value) => value.toFixed(2) },
    { key: 'status', header: 'Status', width: 10 }
  ];

  const courseColumns: ExportColumn[] = [
    { key: 'code', header: 'Course Code', width: 12 },
    { key: 'name', header: 'Course Name', width: 30 },
    { key: 'branch', header: 'Branch', width: 10 },
    { key: 'semester', header: 'Semester', width: 8 },
    { key: 'credits', header: 'Credits', width: 8 },
    { key: 'faculty', header: 'Faculty', width: 20 },
    { key: 'examType', header: 'Exam Type', width: 12 },
    { key: 'status', header: 'Status', width: 10 }
  ];

  const [exportResults, setExportResults] = useState<string[]>([]);

  const addExportResult = (message: string) => {
    setExportResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Export & Print Components</h1>
        <p className="text-gray-600 mt-2">
          Test and demonstration page for export and print functionality with sample data.
        </p>
      </div>

      <Tabs defaultValue="data-export" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="data-export">Data Export</TabsTrigger>
          <TabsTrigger value="print-docs">Print Documents</TabsTrigger>
          <TabsTrigger value="hall-tickets">Hall Tickets</TabsTrigger>
          <TabsTrigger value="seating-charts">Seating Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="data-export" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Student Data Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Student Data Export</span>
                  <Badge variant="outline">{sampleStudents.length} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Sample data table */}
                <div id="student-table" className="overflow-auto max-h-48 border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {studentColumns.slice(0, 5).map(col => (
                          <th key={col.key} className="text-left p-2 font-medium">{col.header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleStudents.map(student => (
                        <tr key={student.id} className="border-t">
                          <td className="p-2">{student.usn}</td>
                          <td className="p-2">{student.name}</td>
                          <td className="p-2">{student.email}</td>
                          <td className="p-2">{student.branch}</td>
                          <td className="p-2">{student.semester}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ExportButton
                    data={sampleStudents}
                    columns={studentColumns}
                    filename="students_data"
                    formats={['csv']}
                    onExportComplete={() => addExportResult('Students exported to CSV')}
                  />
                  <ExportButton
                    data={sampleStudents}
                    columns={studentColumns}
                    filename="students_data"
                    formats={['excel']}
                    onExportComplete={() => addExportResult('Students exported to Excel')}
                  />
                  <ExportButton
                    data={sampleStudents}
                    columns={studentColumns}
                    filename="students_data"
                    formats={['json']}
                    onExportComplete={() => addExportResult('Students exported to JSON')}
                  />
                  <ExportButton
                    data={sampleStudents}
                    columns={studentColumns}
                    filename="students_complete"
                    formats={['csv', 'excel', 'json']}
                    onExportComplete={() => addExportResult('Students multi-format export')}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Course Data Export */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Course Data Export</span>
                  <Badge variant="outline">{sampleCourses.length} records</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div id="course-table" className="overflow-auto max-h-48 border rounded-lg">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {courseColumns.slice(0, 5).map(col => (
                          <th key={col.key} className="text-left p-2 font-medium">{col.header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sampleCourses.map(course => (
                        <tr key={course.id} className="border-t">
                          <td className="p-2">{course.code}</td>
                          <td className="p-2">{course.name}</td>
                          <td className="p-2">{course.branch}</td>
                          <td className="p-2">{course.semester}</td>
                          <td className="p-2">{course.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-wrap gap-2">
                  <ExportButton
                    data={sampleCourses}
                    columns={courseColumns}
                    filename="courses_data"
                    formats={['csv', 'excel', 'json']}
                    onExportComplete={() => addExportResult('Courses exported')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="print-docs" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Print Student List */}
            <Card>
              <CardHeader>
                <CardTitle>Print Student List</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div id="print-student-list">
                  <h3 className="font-bold text-lg mb-4">CSE 5th Semester Students</h3>
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">USN</th>
                        <th className="border p-2 text-left">Name</th>
                        <th className="border p-2 text-left">Section</th>
                        <th className="border p-2 text-left">CGPA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleStudents.filter(s => s.branch === 'CSE' && s.semester === 5).map(student => (
                        <tr key={student.id}>
                          <td className="border p-2">{student.usn}</td>
                          <td className="border p-2">{student.name}</td>
                          <td className="border p-2">{student.section}</td>
                          <td className="border p-2">{student.cgpa}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex gap-2">
                  <PrintButton
                    targetElementId="print-student-list"
                    title="CSE 5th Semester Student List"
                    showPreview={true}
                    showSettings={true}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Print Course Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Print Course Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div id="print-course-schedule">
                  <h3 className="font-bold text-lg mb-4">End Semester Examination Schedule</h3>
                  <div className="mb-4">
                    <p><strong>Academic Year:</strong> 2023-24</p>
                    <p><strong>Examination:</strong> End Semester</p>
                    <p><strong>Date:</strong> December 2023</p>
                  </div>
                  <table className="w-full border-collapse border">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border p-2 text-left">Course Code</th>
                        <th className="border p-2 text-left">Course Name</th>
                        <th className="border p-2 text-left">Branch</th>
                        <th className="border p-2 text-left">Semester</th>
                        <th className="border p-2 text-left">Credits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sampleCourses.map(course => (
                        <tr key={course.id}>
                          <td className="border p-2">{course.code}</td>
                          <td className="border p-2">{course.name}</td>
                          <td className="border p-2">{course.branch}</td>
                          <td className="border p-2">{course.semester}</td>
                          <td className="border p-2">{course.credits}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex gap-2">
                  <PrintButton
                    targetElementId="print-course-schedule"
                    title="End Semester Examination Schedule"
                    showPreview={true}
                    showSettings={true}
                    defaultOptions={{
                      orientation: 'landscape',
                      showHeader: true,
                      showFooter: true
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hall-tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hall Ticket Generation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div id="hall-ticket-sample" 
                   dangerouslySetInnerHTML={{
                     __html: createHallTicketHTML({
                       usn: '4NM21CS001',
                       name: 'John Doe',
                       course: 'B.E Computer Science Engineering',
                       semester: '5th Semester',
                       examType: 'End Semester Examination - December 2023',
                       examDate: '15th December 2023',
                       centerName: 'NMAMIT, Nitte',
                       seatNumber: 'CS-101-15',
                       instructions: [
                         'Students must report to the examination center 30 minutes before the scheduled time',
                         'Bring original ID card and this hall ticket',
                         'Mobile phones and electronic devices are strictly prohibited',
                         'Use only blue/black pen for writing',
                         'Do not write anything on the hall ticket'
                       ]
                     })
                   }} 
              />
              
              <div className="flex gap-2">
                <PrintButton
                  targetElementId="hall-ticket-sample"
                  title="Hall Ticket - John Doe"
                  showPreview={true}
                  showSettings={true}
                  defaultOptions={{
                    orientation: 'portrait',
                    pageSize: 'A4',
                    margins: '15mm'
                  }}
                />
                <Button 
                  variant="outline" 
                  onClick={() => {
                    // Generate multiple hall tickets
                    const tickets = sampleStudents.slice(0, 3).map(student => 
                      createHallTicketHTML({
                        usn: student.usn,
                        name: student.name,
                        course: `B.E ${student.branch} Engineering`,
                        semester: `${student.semester}th Semester`,
                        examType: 'End Semester Examination - December 2023',
                        examDate: '15th December 2023',
                        centerName: 'NMAMIT, Nitte',
                        seatNumber: `${student.branch}-101-${student.id}5`,
                        instructions: [
                          'Students must report 30 minutes early',
                          'Bring original ID card and hall ticket',
                          'Electronic devices prohibited',
                          'Use only blue/black pen'
                        ]
                      })
                    );
                    
                    const batchContent = tickets.join('<div class="page-break"></div>');
                    const tempDiv = document.createElement('div');
                    tempDiv.id = 'batch-hall-tickets';
                    tempDiv.innerHTML = batchContent;
                    tempDiv.style.display = 'none';
                    document.body.appendChild(tempDiv);
                    
                    setTimeout(() => {
                      PrintButton({ 
                        targetElementId: 'batch-hall-tickets',
                        title: 'Batch Hall Tickets',
                        showPreview: false,
                        showSettings: false
                      });
                      document.body.removeChild(tempDiv);
                    }, 100);
                  }}
                >
                  Print Batch Hall Tickets
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seating-charts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seating Arrangement Charts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div id="seating-chart-sample"
                   dangerouslySetInnerHTML={{
                     __html: createSeatingChartHTML({
                       code: 'R-101',
                       name: 'Room 101, Main Block',
                       capacity: 20,
                       rows: 5,
                       columns: 4,
                       examDate: '15th December 2023',
                       examTime: '09:00 AM - 12:00 PM',
                       course: 'CS501 - Design and Analysis of Algorithms'
                     }, [
                       { row: 1, col: 1, usn: '4NM21CS001', name: 'John Doe' },
                       { row: 1, col: 2 }, // empty seat
                       { row: 1, col: 3, usn: '4NM21CS002', name: 'Jane Smith' },
                       { row: 1, col: 4 }, // empty seat
                       { row: 2, col: 1 }, // empty seat
                       { row: 2, col: 2, usn: '4NM21CS003', name: 'Bob Johnson' },
                       { row: 2, col: 3 }, // empty seat
                       { row: 2, col: 4, usn: '4NM21EC001', name: 'Alice Brown' },
                       // Add more seats as needed
                       { row: 3, col: 1, usn: '4NM21EC002', name: 'Charlie Davis' },
                     ])
                   }}
              />
              
              <div className="flex gap-2">
                <PrintButton
                  targetElementId="seating-chart-sample"
                  title="Seating Arrangement - Room 101"
                  showPreview={true}
                  showSettings={true}
                  defaultOptions={{
                    orientation: 'landscape',
                    pageSize: 'A3',
                    margins: '10mm'
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Results Log */}
      {exportResults.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Export Activity Log</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setExportResults([])}
            >
              Clear Log
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-32 overflow-auto">
              {exportResults.map((result, index) => (
                <p key={index} className="text-sm text-gray-600 font-mono">
                  {result}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExportPrintTestPage;