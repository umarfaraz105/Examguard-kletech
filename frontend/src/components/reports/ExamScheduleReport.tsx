/**
 * ExamScheduleReport Component
 * Comprehensive examination schedule with dates, times, courses, and room assignments
 */

'use client'

import * as React from 'react'
import { Calendar, Clock, MapPin, BookOpen, Users, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { Exam, Room, Invigilator, DutyAssignment } from './index'

interface ExamScheduleReportProps {
  exams: Exam[]
  rooms: Room[]
  invigilators: Invigilator[]
  dutyAssignments: DutyAssignment[]
  title?: string
  academicYear?: string
  semester?: string
  department?: string
  groupByDate?: boolean
  className?: string
}

interface ExamWithDetails extends Exam {
  room?: Room
  chiefInvigilator?: Invigilator
  assistantInvigilators: Invigilator[]
}

const ExamScheduleReport = React.forwardRef<HTMLDivElement, ExamScheduleReportProps>(
  ({
    exams,
    rooms,
    invigilators,
    dutyAssignments,
    title = 'Examination Schedule',
    academicYear = '2024-25',
    semester = 'Current',
    department,
    groupByDate = true,
    className,
    ...props
  }, ref) => {
    // Combine exam data with room and invigilator information
    const examsWithDetails = React.useMemo(() => {
      return exams.map(exam => {
        const room = rooms.find(r => r.id === exam.roomId)
        const examDuties = dutyAssignments.filter(d => d.examId === exam.id)
        
        const chiefInvigilator = examDuties
          .filter(d => d.role === 'chief')
          .map(d => invigilators.find(i => i.id === d.invigilatorId))
          .find(i => i !== undefined)

        const assistantInvigilators = examDuties
          .filter(d => d.role === 'assistant')
          .map(d => invigilators.find(i => i.id === d.invigilatorId))
          .filter((i): i is Invigilator => i !== undefined)

        return {
          ...exam,
          room,
          chiefInvigilator,
          assistantInvigilators
        }
      }).sort((a, b) => {
        // Sort by date first, then by start time
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
        if (dateCompare !== 0) return dateCompare
        return a.startTime.localeCompare(b.startTime)
      })
    }, [exams, rooms, invigilators, dutyAssignments])

    // Group exams by date if requested
    const groupedExams = React.useMemo(() => {
      if (!groupByDate) {
        return { 'All Exams': examsWithDetails }
      }

      return examsWithDetails.reduce((groups, exam) => {
        const dateKey = formatDate(exam.date)
        if (!groups[dateKey]) {
          groups[dateKey] = []
        }
        groups[dateKey].push(exam)
        return groups
      }, {} as Record<string, ExamWithDetails[]>)
    }, [examsWithDetails, groupByDate])

    const totalExams = examsWithDetails.length
    const uniqueDates = new Set(examsWithDetails.map(e => formatDate(e.date))).size
    const uniqueRooms = new Set(examsWithDetails.map(e => e.roomId)).size

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white p-8 max-w-7xl mx-auto',
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
              {title}
            </h2>
            <div className="flex justify-center items-center gap-6 mt-4 text-sm text-gray-600 print:gap-4 print:mt-3 print:text-xs">
              <span>Academic Year: {academicYear}</span>
              <span>•</span>
              <span>Semester: {semester}</span>
              {department && (
                <>
                  <span>•</span>
                  <span>Department: {department}</span>
                </>
              )}
            </div>
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-3">
            <div className="bg-primary-50 p-4 rounded-lg text-center print:p-3">
              <div className="text-2xl font-bold text-primary-500 print:text-xl">{totalExams}</div>
              <div className="text-sm text-gray-600 print:text-xs">Total Exams</div>
            </div>
            
            <div className="bg-info-50 p-4 rounded-lg text-center print:p-3">
              <div className="text-2xl font-bold text-info-500 print:text-xl">{uniqueDates}</div>
              <div className="text-sm text-gray-600 print:text-xs">Exam Days</div>
            </div>

            <div className="bg-success-50 p-4 rounded-lg text-center print:p-3">
              <div className="text-2xl font-bold text-success-500 print:text-xl">{uniqueRooms}</div>
              <div className="text-sm text-gray-600 print:text-xs">Rooms Used</div>
            </div>

            <div className="bg-warning-50 p-4 rounded-lg text-center print:p-3">
              <div className="text-2xl font-bold text-warning-500 print:text-xl">{invigilators.length}</div>
              <div className="text-sm text-gray-600 print:text-xs">Invigilators</div>
            </div>
          </div>
        </div>

        {/* Schedule Tables */}
        {Object.entries(groupedExams).map(([dateGroup, examList], groupIndex) => (
          <div key={dateGroup} className={cn(
            'mb-8 print:mb-6',
            groupIndex > 0 && 'print:page-break-before'
          )}>
            {groupByDate && (
              <div className="flex items-center gap-3 mb-4 print:mb-3">
                <Calendar className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
                <h2 className="text-xl font-semibold text-gray-900 print:text-lg">
                  {dateGroup}
                </h2>
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="text-sm text-gray-500 print:text-xs">
                  {examList.length} exam{examList.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 print:text-xs">
                <thead>
                  <tr className="bg-primary-50 print:bg-gray-100">
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                      Time
                    </th>
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                      Subject
                    </th>
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                      Room
                    </th>
                    <th className="border border-gray-300 px-3 py-3 text-center font-semibold text-gray-900 print:px-2 print:py-2">
                      Duration
                    </th>
                    <th className="border border-gray-300 px-3 py-3 text-center font-semibold text-gray-900 print:px-2 print:py-2">
                      Max Marks
                    </th>
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                      Chief Invigilator
                    </th>
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                      Assistant(s)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {examList.map((exam, index) => (
                    <tr key={exam.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500 print:h-3 print:w-3" />
                          <div>
                            <div className="font-semibold text-gray-900 print:text-xs">
                              {exam.startTime} - {exam.endTime}
                            </div>
                            {!groupByDate && (
                              <div className="text-xs text-gray-500 print:text-[10px]">
                                {formatDate(exam.date)}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gray-500 print:h-3 print:w-3" />
                          <div>
                            <div className="font-semibold text-gray-900 print:text-xs">
                              {exam.courseCode}
                            </div>
                            <div className="text-sm text-gray-600 print:text-[10px]">
                              {exam.courseName}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                        {exam.room ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 print:h-3 print:w-3" />
                            <div>
                              <div className="font-semibold text-gray-900 print:text-xs">
                                {exam.room.name}
                              </div>
                              <div className="text-xs text-gray-500 print:text-[10px]">
                                Capacity: {exam.room.capacity}
                                {exam.room.location && ` • ${exam.room.location}`}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic print:text-xs">Not Assigned</span>
                        )}
                      </td>

                      <td className="border border-gray-300 px-3 py-3 text-center print:px-2 print:py-2">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-gray-900 print:text-xs">
                            {exam.duration}
                          </span>
                          <span className="text-xs text-gray-500 print:text-[10px]">minutes</span>
                        </div>
                      </td>

                      <td className="border border-gray-300 px-3 py-3 text-center print:px-2 print:py-2">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-gray-900 print:text-xs">
                            {exam.maxMarks}
                          </span>
                          <span className="text-xs text-gray-500 print:text-[10px]">marks</span>
                        </div>
                      </td>

                      <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                        {exam.chiefInvigilator ? (
                          <div>
                            <div className="font-semibold text-gray-900 print:text-xs">
                              {exam.chiefInvigilator.name}
                            </div>
                            <div className="text-xs text-gray-500 print:text-[10px]">
                              {exam.chiefInvigilator.department}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic print:text-xs">Not Assigned</span>
                        )}
                      </td>

                      <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                        {exam.assistantInvigilators.length > 0 ? (
                          <div className="space-y-1 print:space-y-0.5">
                            {exam.assistantInvigilators.map((assistant, idx) => (
                              <div key={assistant.id}>
                                <div className="font-medium text-gray-900 print:text-xs">
                                  {assistant.name}
                                </div>
                                <div className="text-xs text-gray-500 print:text-[10px]">
                                  {assistant.department}
                                </div>
                                {idx < exam.assistantInvigilators.length - 1 && (
                                  <hr className="border-gray-200 my-1 print:my-0.5" />
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic print:text-xs">Not Assigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {/* Instructions for Invigilators */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg print:mt-6 print:p-3 print:bg-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base print:mb-2">
            Instructions for Invigilators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 print:gap-3 print:text-xs">
            <ul className="space-y-1 print:space-y-0.5">
              <li>• Report to the examination hall 30 minutes before the scheduled time</li>
              <li>• Verify the identity of all students using ID cards</li>
              <li>• Ensure proper seating arrangements are maintained</li>
              <li>• Distribute question papers at the exact scheduled time</li>
            </ul>
            <ul className="space-y-1 print:space-y-0.5">
              <li>• Maintain vigilance throughout the examination</li>
              <li>• Handle any irregularities as per examination rules</li>
              <li>• Collect answer sheets and submit to the office promptly</li>
              <li>• Fill out the attendance sheet and irregularity report</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-300 flex justify-between items-center print:mt-6 print:pt-4">
          <div className="text-sm text-gray-600 print:text-xs">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="h-4 w-4 print:h-3 print:w-3" />
              <span className="font-medium">Generated on:</span>
              <span>{formatDate(new Date())}</span>
            </div>
            <div className="text-xs text-gray-500 print:text-[10px]">
              This is a computer-generated document. For any queries, contact the Controller of Examinations.
            </div>
          </div>
          
          <div className="text-right">
            <div className="border-b border-gray-400 w-48 mb-2 print:w-40"></div>
            <p className="text-sm text-gray-600 print:text-xs">Controller of Examinations</p>
          </div>
        </div>
      </div>
    )
  }
)

ExamScheduleReport.displayName = 'ExamScheduleReport'

export { ExamScheduleReport }