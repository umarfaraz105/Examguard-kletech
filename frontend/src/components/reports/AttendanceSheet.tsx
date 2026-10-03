/**
 * AttendanceSheet Component
 * Attendance form with student list and signature columns for invigilators
 */

'use client'

import * as React from 'react'
import { Calendar, Clock, MapPin, Users, FileText, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatDateTime } from '@/lib/utils'
import type { Student, Exam, Room, Invigilator, SeatingAssignment } from './index'

interface AttendanceSheetProps {
  exam: Exam
  room: Room
  students: Student[]
  assignments: SeatingAssignment[]
  invigilators: Invigilator[]
  includeSignatureColumn?: boolean
  includeRemarksColumn?: boolean
  className?: string
}

const AttendanceSheet = React.forwardRef<HTMLDivElement, AttendanceSheetProps>(
  ({
    exam,
    room,
    students,
    assignments,
    invigilators,
    includeSignatureColumn = true,
    includeRemarksColumn = true,
    className,
    ...props
  }, ref) => {
    // Get students assigned to this exam and room with their seat assignments
    const assignedStudents = React.useMemo(() => {
      return assignments
        .filter(assignment => assignment.examId === exam.id && assignment.roomId === room.id)
        .map(assignment => {
          const student = students.find(s => s.id === assignment.studentId)
          return student ? { ...student, seatNumber: assignment.seatNumber } : null
        })
        .filter((student): student is Student & { seatNumber: string } => student !== null)
        .sort((a, b) => a.seatNumber.localeCompare(b.seatNumber))
    }, [exam.id, room.id, students, assignments])

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white p-8 max-w-6xl mx-auto',
          'print:p-0 print:max-w-none print:mx-0 print:bg-white',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="border-b-4 border-primary-500 pb-6 mb-8 print:border-b-2 print:pb-4 print:mb-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-primary-500 print:text-2xl">
              KLE Dr. M.S. Sheshgiri College of Engineering and Technology
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mt-2 print:text-lg print:mt-1">
              Examination Attendance Sheet
            </h2>
          </div>

          {/* Exam Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-4">
            <div className="space-y-3 print:space-y-2">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
                <div>
                  <p className="text-sm text-gray-500 print:text-xs">Subject</p>
                  <p className="font-semibold text-gray-900 print:text-sm">
                    {exam.courseCode} - {exam.courseName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
                <div>
                  <p className="text-sm text-gray-500 print:text-xs">Date</p>
                  <p className="font-semibold text-gray-900 print:text-sm">
                    {formatDate(exam.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
                <div>
                  <p className="text-sm text-gray-500 print:text-xs">Time</p>
                  <p className="font-semibold text-gray-900 print:text-sm">
                    {exam.startTime} - {exam.endTime} ({exam.duration} minutes)
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 print:space-y-2">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
                <div>
                  <p className="text-sm text-gray-500 print:text-xs">Room</p>
                  <p className="font-semibold text-gray-900 print:text-sm">
                    {room.name} {room.location && `(${room.location})`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
                <div>
                  <p className="text-sm text-gray-500 print:text-xs">Total Students</p>
                  <p className="font-semibold text-gray-900 print:text-sm">
                    {assignedStudents.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
                <div>
                  <p className="text-sm text-gray-500 print:text-xs">Max Marks</p>
                  <p className="font-semibold text-gray-900 print:text-sm">
                    {exam.maxMarks}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invigilator Information */}
        {invigilators.length > 0 && (
          <div className="mb-6 print:mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base print:mb-2">
              Invigilators
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
              {invigilators.map((invigilator, index) => (
                <div key={invigilator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg print:p-2">
                  <div>
                    <p className="font-medium text-gray-900 print:text-sm">{invigilator.name}</p>
                    <p className="text-sm text-gray-600 print:text-xs">
                      {invigilator.department} {index === 0 && '(Chief)'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="w-32 border-b border-gray-400 mb-1 print:w-24"></div>
                    <p className="text-xs text-gray-500">Signature</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="mb-8 print:mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 print:text-base print:mb-3">
            Student Attendance
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 print:text-xs">
              <thead>
                <tr className="bg-primary-50 print:bg-gray-100">
                  <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2 w-16">
                    S.No
                  </th>
                  <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2 w-24">
                    Seat No.
                  </th>
                  <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2 w-32">
                    Reg. Number
                  </th>
                  <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                    Student Name
                  </th>
                  <th className="border border-gray-300 px-3 py-3 text-center font-semibold text-gray-900 print:px-2 print:py-2 w-24">
                    Present
                  </th>
                  {includeSignatureColumn && (
                    <th className="border border-gray-300 px-3 py-3 text-center font-semibold text-gray-900 print:px-2 print:py-2 w-32">
                      Signature
                    </th>
                  )}
                  {includeRemarksColumn && (
                    <th className="border border-gray-300 px-3 py-3 text-center font-semibold text-gray-900 print:px-2 print:py-2 w-40">
                      Remarks
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {assignedStudents.map((student, index) => (
                  <tr key={student.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 px-3 py-4 text-center print:px-2 print:py-3">
                      {index + 1}
                    </td>
                    <td className="border border-gray-300 px-3 py-4 text-center font-semibold print:px-2 print:py-3">
                      {student.seatNumber}
                    </td>
                    <td className="border border-gray-300 px-3 py-4 font-mono print:px-2 print:py-3">
                      {student.regNo}
                    </td>
                    <td className="border border-gray-300 px-3 py-4 print:px-2 print:py-3">
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        {student.department && (
                          <div className="text-sm text-gray-600 print:text-xs">{student.department}</div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-300 px-3 py-4 text-center print:px-2 print:py-3">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-gray-400 rounded print:w-4 print:h-4"></div>
                      </div>
                    </td>
                    {includeSignatureColumn && (
                      <td className="border border-gray-300 px-3 py-4 print:px-2 print:py-3">
                        <div className="h-8 print:h-6"></div>
                      </td>
                    )}
                    {includeRemarksColumn && (
                      <td className="border border-gray-300 px-3 py-4 print:px-2 print:py-3">
                        <div className="h-8 print:h-6"></div>
                      </td>
                    )}
                  </tr>
                ))}
                
                {/* Add empty rows if less than 10 students */}
                {Array.from({ length: Math.max(0, 10 - assignedStudents.length) }).map((_, index) => (
                  <tr key={`empty-${index}`} className={(assignedStudents.length + index) % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 px-3 py-4 text-center text-gray-400 print:px-2 print:py-3">
                      {assignedStudents.length + index + 1}
                    </td>
                    <td className="border border-gray-300 px-3 py-4 print:px-2 print:py-3"></td>
                    <td className="border border-gray-300 px-3 py-4 print:px-2 print:py-3"></td>
                    <td className="border border-gray-300 px-3 py-4 print:px-2 print:py-3"></td>
                    <td className="border border-gray-300 px-3 py-4 text-center print:px-2 print:py-3">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-gray-400 rounded print:w-4 print:h-4"></div>
                      </div>
                    </td>
                    {includeSignatureColumn && (
                      <td className="border border-gray-300 px-3 py-4 print:px-2 print:py-3">
                        <div className="h-8 print:h-6"></div>
                      </td>
                    )}
                    {includeRemarksColumn && (
                      <td className="border border-gray-300 px-3 py-4 print:px-2 print:py-3">
                        <div className="h-8 print:h-6"></div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary and Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 print:gap-6 print:mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base print:mb-2">
              Attendance Summary
            </h3>
            <div className="space-y-2 text-sm print:text-xs">
              <div className="flex justify-between">
                <span>Total Students Assigned:</span>
                <span className="font-semibold">{assignedStudents.length}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Students Present:</span>
                <span className="font-semibold">_______</span>
              </div>
              <div className="flex justify-between">
                <span>Students Absent:</span>
                <span className="font-semibold">_______</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span>Malpractice Cases:</span>
                <span className="font-semibold">_______</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base print:mb-2">
              Instructions
            </h3>
            <ul className="text-sm text-gray-700 space-y-1 print:text-xs print:space-y-0.5">
              <li>• Mark attendance at the beginning of the examination</li>
              <li>• Verify student identity with ID cards</li>
              <li>• Note any irregularities in the remarks column</li>
              <li>• Submit this sheet to the Controller of Examinations</li>
              <li>• Report any malpractice cases immediately</li>
            </ul>
          </div>
        </div>

        {/* Footer with Signatures */}
        <div className="border-t border-gray-300 pt-6 print:pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 print:gap-6">
            <div className="text-center">
              <div className="border-b border-gray-400 w-48 mb-2 mx-auto print:w-40"></div>
              <p className="text-sm text-gray-600 print:text-xs">Chief Invigilator</p>
              <p className="text-xs text-gray-500 mt-1 print:text-[10px]">Name & Signature</p>
            </div>
            
            <div className="text-center">
              <div className="border-b border-gray-400 w-48 mb-2 mx-auto print:w-40"></div>
              <p className="text-sm text-gray-600 print:text-xs">Assistant Invigilator</p>
              <p className="text-xs text-gray-500 mt-1 print:text-[10px]">Name & Signature</p>
            </div>

            <div className="text-center">
              <div className="border-b border-gray-400 w-48 mb-2 mx-auto print:w-40"></div>
              <p className="text-sm text-gray-600 print:text-xs">Controller of Examinations</p>
              <p className="text-xs text-gray-500 mt-1 print:text-[10px]">Received by</p>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500 print:mt-4 print:text-[10px]">
            Generated on {formatDateTime(new Date())} | This document is computer generated and does not require physical signature for generation.
          </div>
        </div>
      </div>
    )
  }
)

AttendanceSheet.displayName = 'AttendanceSheet'

export { AttendanceSheet }