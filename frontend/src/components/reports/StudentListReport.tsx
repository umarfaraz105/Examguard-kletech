/**
 * StudentListReport Component
 * Student roster with enrollment details and course information
 */

'use client'

import * as React from 'react'
import { Users, GraduationCap, Hash, Mail, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { Student } from './index'

interface StudentListReportProps {
  students: Student[]
  title?: string
  department?: string
  semester?: string
  course?: string
  groupByDepartment?: boolean
  includeContactInfo?: boolean
  className?: string
}

const StudentListReport = React.forwardRef<HTMLDivElement, StudentListReportProps>(
  ({
    students,
    title = 'Student List',
    department,
    semester,
    course,
    groupByDepartment = false,
    includeContactInfo = false,
    className,
    ...props
  }, ref) => {
    const groupedStudents = React.useMemo(() => {
      if (!groupByDepartment) {
        return { 'All Students': students }
      }

      return students.reduce((groups, student) => {
        const deptKey = student.department || 'Unknown Department'
        if (!groups[deptKey]) {
          groups[deptKey] = []
        }
        groups[deptKey].push(student)
        return groups
      }, {} as Record<string, Student[]>)
    }, [students, groupByDepartment])

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
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold text-primary-500 print:text-2xl">
              KLE Dr. M.S. Sheshgiri College of Engineering and Technology
            </h1>
            <h2 className="text-xl font-semibold text-gray-700 mt-2 print:text-lg print:mt-1">
              {title}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-3">
            {department && (
              <div className="text-center">
                <p className="text-sm text-gray-500 print:text-xs">Department</p>
                <p className="font-semibold text-gray-900 print:text-sm">{department}</p>
              </div>
            )}
            {semester && (
              <div className="text-center">
                <p className="text-sm text-gray-500 print:text-xs">Semester</p>
                <p className="font-semibold text-gray-900 print:text-sm">{semester}</p>
              </div>
            )}
            {course && (
              <div className="text-center">
                <p className="text-sm text-gray-500 print:text-xs">Course</p>
                <p className="font-semibold text-gray-900 print:text-sm">{course}</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-sm text-gray-500 print:text-xs">Total Students</p>
              <p className="font-semibold text-gray-900 print:text-sm">{students.length}</p>
            </div>
          </div>
        </div>

        {/* Student Lists */}
        {Object.entries(groupedStudents).map(([groupName, studentList], index) => (
          <div key={groupName} className="mb-8 print:mb-6">
            {groupByDepartment && (
              <h3 className="text-xl font-semibold text-gray-900 mb-4 print:text-lg print:mb-3">
                {groupName} ({studentList.length} students)
              </h3>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 print:text-xs">
                <thead>
                  <tr className="bg-primary-50 print:bg-gray-100">
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                      S.No
                    </th>
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                      Reg. Number
                    </th>
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                      Student Name
                    </th>
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                      Course
                    </th>
                    {!groupByDepartment && (
                      <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                        Department
                      </th>
                    )}
                    <th className="border border-gray-300 px-3 py-3 text-center font-semibold text-gray-900 print:px-2 print:py-2">
                      Semester
                    </th>
                    {includeContactInfo && (
                      <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                        Contact Info
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {studentList.map((student, idx) => (
                    <tr key={student.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 px-3 py-3 text-center print:px-2 print:py-2">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 px-3 py-3 font-mono print:px-2 print:py-2">
                        {student.regNo}
                      </td>
                      <td className="border border-gray-300 px-3 py-3 font-medium text-gray-900 print:px-2 print:py-2">
                        {student.name}
                      </td>
                      <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                        {student.course || 'N/A'}
                      </td>
                      {!groupByDepartment && (
                        <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                          {student.department || 'N/A'}
                        </td>
                      )}
                      <td className="border border-gray-300 px-3 py-3 text-center print:px-2 print:py-2">
                        {student.semester || 'N/A'}
                      </td>
                      {includeContactInfo && (
                        <td className="border border-gray-300 px-3 py-3 text-sm print:px-2 print:py-2 print:text-xs">
                          {student.email && (
                            <div className="flex items-center gap-1 mb-1">
                              <Mail className="h-3 w-3" />
                              <span>{student.email}</span>
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{student.phone}</span>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-300 flex justify-between items-center print:mt-6 print:pt-4">
          <div className="text-sm text-gray-600 print:text-xs">
            Generated on {formatDate(new Date())}
          </div>
          <div className="text-right">
            <div className="border-b border-gray-400 w-48 mb-2 print:w-40"></div>
            <p className="text-sm text-gray-600 print:text-xs">Authorized Signature</p>
          </div>
        </div>
      </div>
    )
  }
)

StudentListReport.displayName = 'StudentListReport'

export { StudentListReport }