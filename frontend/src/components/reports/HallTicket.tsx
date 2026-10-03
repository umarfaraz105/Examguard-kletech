/**
 * HallTicket Component
 * Student hall ticket with QR code, exam details, and KLE branding
 */

'use client'

import * as React from 'react'
import QRCode from 'qrcode.react'
import { Calendar, Clock, MapPin, User, BookOpen, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatDateTime } from '@/lib/utils'
import type { Student, Exam } from './index'

interface HallTicketProps {
  student: Student
  exams: Exam[]
  instituteName?: string
  examSession?: string
  instructions?: string[]
  className?: string
}

const HallTicket = React.forwardRef<HTMLDivElement, HallTicketProps>(
  ({
    student,
    exams,
    instituteName = 'KLE Dr. M.S. Sheshgiri College of Engineering and Technology',
    examSession = 'Regular Examination',
    instructions = [
      'Students must report to the examination hall 15 minutes before the scheduled time.',
      'Mobile phones and electronic devices are strictly prohibited in the examination hall.',
      'Students must bring valid ID card and this hall ticket for entry.',
      'Use of unfair means is strictly prohibited and will result in cancellation.',
      'Students are advised to read all instructions carefully before attempting the paper.'
    ],
    className,
    ...props
  }, ref) => {
    // Generate QR code data
    const qrData = JSON.stringify({
      studentId: student.id,
      regNo: student.regNo,
      name: student.name,
      session: examSession,
      exams: exams.length
    })

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white p-8 max-w-4xl mx-auto',
          'print:p-0 print:max-w-none print:mx-0 print:bg-white',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="border-b-4 border-primary-500 pb-6 mb-6 print:border-b-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-primary-500 print:text-xl">
                {instituteName}
              </h1>
              <p className="text-lg text-gray-600 mt-1 print:text-base">
                {examSession} - Hall Ticket
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Student Photo Placeholder */}
              <div className="w-24 h-32 border-2 border-gray-300 rounded flex items-center justify-center bg-gray-50 print:w-20 print:h-28">
                {student.photo ? (
                  <img 
                    src={student.photo} 
                    alt={`${student.name}`}
                    className="w-full h-full object-cover rounded"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <User className="h-8 w-8 mx-auto mb-1" />
                    <span className="text-xs">Photo</span>
                  </div>
                )}
              </div>

              {/* QR Code */}
              <div className="text-center">
                <QRCode 
                  value={qrData} 
                  size={80}
                  className="print:scale-75"
                />
                <p className="text-xs text-gray-500 mt-1">Scan for verification</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Information */}
        <div className="grid grid-cols-2 gap-8 mb-8 print:gap-4 print:mb-6">
          <div className="space-y-4 print:space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
              <div>
                <p className="text-sm text-gray-500 print:text-xs">Student Name</p>
                <p className="font-semibold text-gray-900 print:text-sm">{student.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
              <div>
                <p className="text-sm text-gray-500 print:text-xs">Registration Number</p>
                <p className="font-semibold text-gray-900 print:text-sm">{student.regNo}</p>
              </div>
            </div>

            {student.course && (
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
                <div>
                  <p className="text-sm text-gray-500 print:text-xs">Course</p>
                  <p className="font-semibold text-gray-900 print:text-sm">{student.course}</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 print:space-y-3">
            {student.department && (
              <div className="flex items-center gap-3">
                <BookOpen className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
                <div>
                  <p className="text-sm text-gray-500 print:text-xs">Department</p>
                  <p className="font-semibold text-gray-900 print:text-sm">{student.department}</p>
                </div>
              </div>
            )}

            {student.semester && (
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
                <div>
                  <p className="text-sm text-gray-500 print:text-xs">Semester</p>
                  <p className="font-semibold text-gray-900 print:text-sm">{student.semester}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
              <div>
                <p className="text-sm text-gray-500 print:text-xs">Issue Date</p>
                <p className="font-semibold text-gray-900 print:text-sm">
                  {formatDate(new Date())}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Examination Schedule */}
        <div className="mb-8 print:mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg print:mb-3">
            Examination Schedule
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 print:text-sm">
              <thead>
                <tr className="bg-primary-50 print:bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 print:px-3 print:py-2">
                    Date
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 print:px-3 print:py-2">
                    Time
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 print:px-3 print:py-2">
                    Subject Code
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 print:px-3 print:py-2">
                    Subject Name
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 print:px-3 print:py-2">
                    Room
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 print:px-3 print:py-2">
                    Duration
                  </th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam, index) => (
                  <tr key={exam.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border border-gray-300 px-4 py-3 print:px-3 print:py-2">
                      {formatDate(exam.date)}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 print:px-3 print:py-2">
                      {exam.startTime} - {exam.endTime}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 font-semibold print:px-3 print:py-2">
                      {exam.courseCode}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 print:px-3 print:py-2">
                      {exam.courseName}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 print:px-3 print:py-2">
                      {exam.roomName || 'TBA'}
                    </td>
                    <td className="border border-gray-300 px-4 py-3 text-center print:px-3 print:py-2">
                      {exam.duration} min
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 print:mb-4">
          <h2 className="text-xl font-bold text-gray-900 mb-4 print:text-lg print:mb-3">
            Instructions for Candidates
          </h2>
          
          <ol className="list-decimal list-inside space-y-2 text-gray-700 print:space-y-1 print:text-sm">
            {instructions.map((instruction, index) => (
              <li key={index} className="leading-relaxed">
                {instruction}
              </li>
            ))}
          </ol>
        </div>

        {/* Footer with Signatures */}
        <div className="flex justify-between items-end pt-6 border-t border-gray-300 print:pt-4">
          <div className="text-center">
            <div className="border-b border-gray-400 w-48 mb-2 print:w-40"></div>
            <p className="text-sm text-gray-600 print:text-xs">Student's Signature</p>
          </div>
          
          <div className="text-center">
            <div className="border-b border-gray-400 w-48 mb-2 print:w-40"></div>
            <p className="text-sm text-gray-600 print:text-xs">Controller of Examinations</p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-gray-50 border-l-4 border-primary-500 print:mt-4 print:p-3">
          <p className="text-sm text-gray-600 print:text-xs">
            <strong>Note:</strong> This hall ticket is valid only for the examinations mentioned above. 
            Any tampering or modification will render this document invalid. Students must preserve 
            this hall ticket throughout the examination period.
          </p>
        </div>

        {/* Print-only footer */}
        <div className="hidden print:block print:fixed print:bottom-0 print:left-0 print:right-0 print:text-center print:text-xs print:text-gray-500 print:py-2">
          Generated on {formatDateTime(new Date())} | {instituteName}
        </div>
      </div>
    )
  }
)

HallTicket.displayName = 'HallTicket'

export { HallTicket }