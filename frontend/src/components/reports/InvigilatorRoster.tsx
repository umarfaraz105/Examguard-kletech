/**
 * InvigilatorRoster Component
 * Duty assignments with dates, times, rooms, and contact information for faculty planning
 */

'use client'

import * as React from 'react'
import { Shield, Calendar, Clock, MapPin, Phone, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { Exam, Room, Invigilator, DutyAssignment } from './index'

interface InvigilatorRosterProps {
  invigilators: Invigilator[]
  exams: Exam[]
  rooms: Room[]
  dutyAssignments: DutyAssignment[]
  title?: string
  groupByInvigilator?: boolean
  includeContactInfo?: boolean
  className?: string
}

interface DutyWithDetails extends DutyAssignment {
  exam: Exam
  room?: Room
  invigilator: Invigilator
}

const InvigilatorRoster = React.forwardRef<HTMLDivElement, InvigilatorRosterProps>(
  ({
    invigilators,
    exams,
    rooms,
    dutyAssignments,
    title = 'Invigilator Duty Roster',
    groupByInvigilator = true,
    includeContactInfo = true,
    className,
    ...props
  }, ref) => {
    const dutiesWithDetails = React.useMemo(() => {
      return dutyAssignments.map(duty => {
        const exam = exams.find(e => e.id === duty.examId)!
        const room = rooms.find(r => r.id === duty.roomId)
        const invigilator = invigilators.find(i => i.id === duty.invigilatorId)!
        
        return {
          ...duty,
          exam,
          room,
          invigilator
        }
      }).sort((a, b) => {
        const dateA = new Date(a.exam.date).getTime()
        const dateB = new Date(b.exam.date).getTime()
        if (dateA !== dateB) return dateA - dateB
        return a.exam.startTime.localeCompare(b.exam.startTime)
      })
    }, [dutyAssignments, exams, rooms, invigilators])

    const groupedDuties = React.useMemo(() => {
      if (!groupByInvigilator) {
        return { 'All Duties': dutiesWithDetails }
      }

      return dutiesWithDetails.reduce((groups, duty) => {
        const key = `${duty.invigilator.name} (${duty.invigilator.department})`
        if (!groups[key]) {
          groups[key] = []
        }
        groups[key].push(duty)
        return groups
      }, {} as Record<string, DutyWithDetails[]>)
    }, [dutiesWithDetails, groupByInvigilator])

    const totalDuties = dutiesWithDetails.length
    const chiefDuties = dutiesWithDetails.filter(d => d.role === 'chief').length
    const assistantDuties = dutiesWithDetails.filter(d => d.role === 'assistant').length

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
          </div>

          {/* Summary Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print:gap-3">
            <div className="bg-primary-50 p-4 rounded-lg text-center print:p-3">
              <div className="text-2xl font-bold text-primary-500 print:text-xl">{totalDuties}</div>
              <div className="text-sm text-gray-600 print:text-xs">Total Duties</div>
            </div>
            
            <div className="bg-success-50 p-4 rounded-lg text-center print:p-3">
              <div className="text-2xl font-bold text-success-500 print:text-xl">{chiefDuties}</div>
              <div className="text-sm text-gray-600 print:text-xs">Chief Invigilator</div>
            </div>

            <div className="bg-info-50 p-4 rounded-lg text-center print:p-3">
              <div className="text-2xl font-bold text-info-500 print:text-xl">{assistantDuties}</div>
              <div className="text-sm text-gray-600 print:text-xs">Assistant Duties</div>
            </div>

            <div className="bg-warning-50 p-4 rounded-lg text-center print:p-3">
              <div className="text-2xl font-bold text-warning-500 print:text-xl">{invigilators.length}</div>
              <div className="text-sm text-gray-600 print:text-xs">Total Faculty</div>
            </div>
          </div>
        </div>

        {/* Duty Rosters */}
        {Object.entries(groupedDuties).map(([groupName, dutyList], groupIndex) => (
          <div key={groupName} className={cn(
            'mb-8 print:mb-6',
            groupIndex > 0 && 'print:page-break-before'
          )}>
            {groupByInvigilator && (
              <div className="mb-4 print:mb-3">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 print:text-lg print:mb-1">
                  {groupName}
                </h3>
                {includeContactInfo && dutyList.length > 0 && (
                  <div className="flex items-center gap-6 text-sm text-gray-600 print:text-xs print:gap-4">
                    {dutyList[0].invigilator.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 print:h-3 print:w-3" />
                        <span>{dutyList[0].invigilator.email}</span>
                      </div>
                    )}
                    {dutyList[0].invigilator.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 print:h-3 print:w-3" />
                        <span>{dutyList[0].invigilator.phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 print:text-xs">
                <thead>
                  <tr className="bg-primary-50 print:bg-gray-100">
                    <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                      Date
                    </th>
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
                      Role
                    </th>
                    {!groupByInvigilator && (
                      <th className="border border-gray-300 px-3 py-3 text-left font-semibold text-gray-900 print:px-2 print:py-2">
                        Invigilator
                      </th>
                    )}
                    <th className="border border-gray-300 px-3 py-3 text-center font-semibold text-gray-900 print:px-2 print:py-2">
                      Signature
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dutyList.map((duty, index) => (
                    <tr key={duty.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500 print:h-3 print:w-3" />
                          <span className="font-medium text-gray-900 print:text-xs">
                            {formatDate(duty.exam.date)}
                          </span>
                        </div>
                      </td>

                      <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500 print:h-3 print:w-3" />
                          <div>
                            <div className="font-medium text-gray-900 print:text-xs">
                              {duty.exam.startTime} - {duty.exam.endTime}
                            </div>
                            <div className="text-xs text-gray-500 print:text-[10px]">
                              {duty.exam.duration} minutes
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                        <div>
                          <div className="font-semibold text-gray-900 print:text-xs">
                            {duty.exam.courseCode}
                          </div>
                          <div className="text-sm text-gray-600 print:text-[10px]">
                            {duty.exam.courseName}
                          </div>
                        </div>
                      </td>

                      <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                        {duty.room ? (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-500 print:h-3 print:w-3" />
                            <div>
                              <div className="font-medium text-gray-900 print:text-xs">
                                {duty.room.name}
                              </div>
                              <div className="text-xs text-gray-500 print:text-[10px]">
                                {duty.room.location}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic print:text-xs">Not Assigned</span>
                        )}
                      </td>

                      <td className="border border-gray-300 px-3 py-3 text-center print:px-2 print:py-2">
                        <span className={cn(
                          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium print:px-1 print:text-[10px]',
                          duty.role === 'chief' 
                            ? 'bg-primary-100 text-primary-700' 
                            : 'bg-gray-100 text-gray-700'
                        )}>
                          <Shield className="h-3 w-3 print:h-2 print:w-2" />
                          {duty.role === 'chief' ? 'Chief' : 'Assistant'}
                        </span>
                      </td>

                      {!groupByInvigilator && (
                        <td className="border border-gray-300 px-3 py-3 print:px-2 print:py-2">
                          <div>
                            <div className="font-medium text-gray-900 print:text-xs">
                              {duty.invigilator.name}
                            </div>
                            <div className="text-xs text-gray-500 print:text-[10px]">
                              {duty.invigilator.department}
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="border border-gray-300 px-3 py-3 text-center print:px-2 print:py-2">
                        <div className="h-8 print:h-6"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {groupByInvigilator && (
              <div className="mt-4 text-sm text-gray-600 print:mt-3 print:text-xs">
                <strong>Total duties for {dutyList[0]?.invigilator.name}:</strong> {dutyList.length}
                {' | '}
                <strong>Chief:</strong> {dutyList.filter(d => d.role === 'chief').length}
                {' | '}
                <strong>Assistant:</strong> {dutyList.filter(d => d.role === 'assistant').length}
              </div>
            )}
          </div>
        ))}

        {/* Instructions */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg print:mt-6 print:p-3 print:bg-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 print:text-base print:mb-2">
            Instructions for Invigilators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 print:gap-3 print:text-xs">
            <ul className="space-y-1 print:space-y-0.5">
              <li>• Report 30 minutes before examination time</li>
              <li>• Bring your ID card and this duty roster</li>
              <li>• Verify student identity before allowing entry</li>
              <li>• Follow examination protocols strictly</li>
            </ul>
            <ul className="space-y-1 print:space-y-0.5">
              <li>• Contact the Controller for any issues</li>
              <li>• Submit attendance sheets promptly</li>
              <li>• Report any malpractice cases immediately</li>
              <li>• Ensure proper conduct throughout the exam</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-300 flex justify-between items-center print:mt-6 print:pt-4">
          <div className="text-sm text-gray-600 print:text-xs">
            Generated on {formatDate(new Date())} | Contact: Controller of Examinations
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

InvigilatorRoster.displayName = 'InvigilatorRoster'

export { InvigilatorRoster }
