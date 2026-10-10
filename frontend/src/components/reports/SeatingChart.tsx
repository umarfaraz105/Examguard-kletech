/**
 * SeatingChart Component
 * Room layout with student seating positions and invigilator details
 */

'use client'

import * as React from 'react'
import { MapPin, Users, Clock, Calendar, User, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, formatDateTime } from '@/lib/utils'
import type { Student, Exam, Room, Invigilator, SeatingAssignment } from './index'

interface SeatingChartProps {
  exam: Exam
  room: Room
  students: Student[]
  assignments: SeatingAssignment[]
  invigilators: Invigilator[]
  rows?: number
  columns?: number
  className?: string
}

const SeatingChart = React.forwardRef<HTMLDivElement, SeatingChartProps>(
  ({
    exam,
    room,
    students,
    assignments,
    invigilators,
    rows = 10,
    columns = 6,
    className,
    ...props
  }, ref) => {
    // Create seating grid based on assignments
    const seatingGrid = React.useMemo(() => {
      const grid: Array<Array<{ student: Student | null; seatNumber: string }>> = []
      
      // Initialize empty grid
      for (let row = 0; row < rows; row++) {
        grid[row] = []
        for (let col = 0; col < columns; col++) {
          const seatNumber = `${String.fromCharCode(65 + row)}${col + 1}`
          grid[row][col] = { student: null, seatNumber }
        }
      }

      // Fill grid with student assignments
      assignments.forEach(assignment => {
        if (assignment.examId === exam.id && assignment.roomId === room.id) {
          const student = students.find(s => s.id === assignment.studentId)
          if (student) {
            // Parse seat number (e.g., "A1" -> row 0, col 0)
            const seatMatch = assignment.seatNumber.match(/([A-Z])(\d+)/)
            if (seatMatch) {
              const row = seatMatch[1].charCodeAt(0) - 65
              const col = parseInt(seatMatch[2]) - 1
              if (row < rows && col < columns && row >= 0 && col >= 0) {
                grid[row][col].student = student
              }
            }
          }
        }
      })

      return grid
    }, [exam.id, room.id, students, assignments, rows, columns])

    const assignedStudents = assignments.filter(a => a.examId === exam.id && a.roomId === room.id).length
    const utilization = Math.round((assignedStudents / room.capacity) * 100)

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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-500 print:text-2xl">
                Seating Arrangement
              </h1>
              <p className="text-lg text-gray-600 mt-2 print:text-base print:mt-1">
                {exam.courseCode} - {exam.courseName}
              </p>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-gray-500 print:text-xs">Generated on</p>
              <p className="font-semibold text-gray-900 print:text-sm">
                {formatDateTime(new Date())}
              </p>
            </div>
          </div>

          {/* Exam and Room Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
              <div>
                <p className="text-sm text-gray-500 print:text-xs">Date & Time</p>
                <p className="font-semibold text-gray-900 print:text-sm">
                  {formatDate(exam.date)} | {exam.startTime} - {exam.endTime}
                </p>
              </div>
            </div>

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
                <p className="text-sm text-gray-500 print:text-xs">Capacity</p>
                <p className="font-semibold text-gray-900 print:text-sm">
                  {assignedStudents} / {room.capacity} ({utilization}%)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invigilator Information */}
        {invigilators.length > 0 && (
          <div className="mb-8 p-4 bg-primary-50 rounded-lg print:mb-6 print:p-3 print:bg-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2 print:text-base print:mb-2">
              <Shield className="h-5 w-5 text-primary-500 print:h-4 print:w-4" />
              Invigilators
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-3">
              {invigilators.map((invigilator, index) => (
                <div key={invigilator.id} className="flex items-center gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold print:w-6 print:h-6 print:text-xs',
                    index === 0 ? 'bg-primary-500 text-white' : 'bg-gray-400 text-white'
                  )}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 print:text-sm">{invigilator.name}</p>
                    <p className="text-sm text-gray-600 print:text-xs">
                      {invigilator.department} {index === 0 && '(Chief Invigilator)'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seating Chart */}
        <div className="mb-8 print:mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 print:text-lg">
              Seating Layout
            </h2>
            <div className="text-sm text-gray-500 print:text-xs">
              Front of the Room
            </div>
          </div>

          {/* Front indicator */}
          <div className="w-full h-8 bg-primary-500 rounded-t-lg mb-4 flex items-center justify-center text-white font-medium print:h-6 print:mb-3 print:text-sm">
            Invigilator's Desk / Blackboard
          </div>

          {/* Seating Grid */}
          <div className="grid gap-2 print:gap-1" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {seatingGrid.map((row, rowIndex) => (
              row.map((seat, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    'aspect-square border-2 rounded-lg p-2 text-center transition-colors print:p-1 print:text-xs',
                    seat.student
                      ? 'border-primary-500 bg-primary-50 hover:bg-primary-100'
                      : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <div className="h-full flex flex-col justify-center">
                    <div className="font-mono text-xs font-semibold text-gray-600 mb-1 print:text-[10px]">
                      {seat.seatNumber}
                    </div>
                    {seat.student ? (
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 text-xs leading-tight print:text-[10px]">
                          {seat.student.name.split(' ').slice(0, 2).join(' ')}
                        </div>
                        <div className="text-[10px] text-gray-600 font-mono print:text-[8px]">
                          {seat.student.regNo}
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-xs print:text-[10px]">
                        Empty
                      </div>
                    )}
                  </div>
                </div>
              ))
            ))}
          </div>

          {/* Back indicator */}
          <div className="w-full h-4 bg-gray-200 rounded-b-lg mt-4 flex items-center justify-center text-gray-600 text-sm print:h-3 print:mt-3 print:text-xs">
            Back of the Room
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:gap-3 print:mb-6">
          <div className="bg-gray-50 p-4 rounded-lg text-center print:p-3">
            <div className="text-2xl font-bold text-primary-500 print:text-xl">
              {assignedStudents}
            </div>
            <div className="text-sm text-gray-600 print:text-xs">Students Assigned</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg text-center print:p-3">
            <div className="text-2xl font-bold text-gray-600 print:text-xl">
              {room.capacity - assignedStudents}
            </div>
            <div className="text-sm text-gray-600 print:text-xs">Empty Seats</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-center print:p-3">
            <div className="text-2xl font-bold text-success-500 print:text-xl">
              {utilization}%
            </div>
            <div className="text-sm text-gray-600 print:text-xs">Utilization</div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-center print:p-3">
            <div className="text-2xl font-bold text-info-500 print:text-xl">
              {exam.duration}
            </div>
            <div className="text-sm text-gray-600 print:text-xs">Minutes</div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-50 p-4 rounded-lg print:p-3">
          <h3 className="font-semibold text-gray-900 mb-3 print:text-sm print:mb-2">Legend</h3>
          <div className="flex flex-wrap gap-4 text-sm print:gap-3 print:text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-primary-500 bg-primary-50 rounded"></div>
              <span>Occupied Seat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-300 bg-gray-50 rounded"></div>
              <span>Empty Seat</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary-500 rounded"></div>
              <span>Front Area</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-300 flex justify-between items-center print:mt-6 print:pt-4">
          <div className="text-sm text-gray-600 print:text-xs">
            <strong>Note:</strong> This seating arrangement is final. 
            Students must occupy only their assigned seats.
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

SeatingChart.displayName = 'SeatingChart'

export { SeatingChart }
