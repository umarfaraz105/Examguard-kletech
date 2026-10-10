/**
 * AnalyticsSummaryReport Component
 * Charts and metrics summary with room utilization, enrollment statistics, and exam distribution
 */

'use client'

import * as React from 'react'
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  BarChart3, 
  PieChart,
  Activity,
  Target
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import type { AnalyticsData } from './index'

interface AnalyticsSummaryReportProps {
  data: AnalyticsData
  title?: string
  reportPeriod?: string
  className?: string
}

const AnalyticsSummaryReport = React.forwardRef<HTMLDivElement, AnalyticsSummaryReportProps>(
  ({
    data,
    title = 'Analytics Summary Report',
    reportPeriod = 'Current Semester',
    className,
    ...props
  }, ref) => {
    // Calculate percentages for department distribution
    const departmentWithPercentages = React.useMemo(() => {
      const total = data.departmentDistribution.reduce((sum, dept) => sum + dept.count, 0)
      return data.departmentDistribution.map(dept => ({
        ...dept,
        percentage: total > 0 ? Math.round((dept.count / total) * 100) : 0
      }))
    }, [data.departmentDistribution])

    // Sort exams by date for trend analysis
    const sortedExamsByDate = React.useMemo(() => {
      return [...data.examsByDate].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    }, [data.examsByDate])

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
              {title}
            </h2>
            <p className="text-gray-600 mt-1 print:text-sm">
              Report Period: {reportPeriod}
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:gap-3">
            <div className="bg-primary-50 p-4 rounded-lg text-center print:p-3">
              <Users className="h-8 w-8 text-primary-500 mx-auto mb-2 print:h-6 print:w-6 print:mb-1" />
              <div className="text-2xl font-bold text-primary-500 print:text-xl">{data.totalStudents}</div>
              <div className="text-sm text-gray-600 print:text-xs">Total Students</div>
            </div>
            
            <div className="bg-success-50 p-4 rounded-lg text-center print:p-3">
              <Calendar className="h-8 w-8 text-success-500 mx-auto mb-2 print:h-6 print:w-6 print:mb-1" />
              <div className="text-2xl font-bold text-success-500 print:text-xl">{data.totalExams}</div>
              <div className="text-sm text-gray-600 print:text-xs">Total Exams</div>
            </div>

            <div className="bg-info-50 p-4 rounded-lg text-center print:p-3">
              <MapPin className="h-8 w-8 text-info-500 mx-auto mb-2 print:h-6 print:w-6 print:mb-1" />
              <div className="text-2xl font-bold text-info-500 print:text-xl">{data.totalRooms}</div>
              <div className="text-sm text-gray-600 print:text-xs">Available Rooms</div>
            </div>

            <div className="bg-warning-50 p-4 rounded-lg text-center print:p-3">
              <Target className="h-8 w-8 text-warning-500 mx-auto mb-2 print:h-6 print:w-6 print:mb-1" />
              <div className="text-2xl font-bold text-warning-500 print:text-xl">{data.utilizationRate}%</div>
              <div className="text-sm text-gray-600 print:text-xs">Utilization Rate</div>
            </div>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="mb-8 print:mb-6">
          <div className="flex items-center gap-3 mb-4 print:mb-3">
            <PieChart className="h-6 w-6 text-primary-500 print:h-5 print:w-5" />
            <h3 className="text-xl font-semibold text-gray-900 print:text-lg">
              Student Distribution by Department
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:gap-6">
            {/* Table */}
            <div>
              <table className="w-full border border-gray-300 print:text-xs">
                <thead>
                  <tr className="bg-primary-50 print:bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 print:px-3 print:py-2">
                      Department
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 print:px-3 print:py-2">
                      Students
                    </th>
                    <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 print:px-3 print:py-2">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {departmentWithPercentages.map((dept, index) => (
                    <tr key={dept.department} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 px-4 py-3 font-medium print:px-3 print:py-2">
                        {dept.department}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center print:px-3 print:py-2">
                        {dept.count}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center print:px-3 print:py-2">
                        {dept.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visual representation */}
            <div className="space-y-3 print:space-y-2">
              {departmentWithPercentages.map((dept, index) => (
                <div key={dept.department}>
                  <div className="flex justify-between items-center mb-1 print:text-xs">
                    <span className="font-medium text-gray-700">{dept.department}</span>
                    <span className="text-sm text-gray-600">{dept.count} ({dept.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 print:h-2">
                    <div 
                      className={cn(
                        'h-3 rounded-full print:h-2',
                        index % 4 === 0 ? 'bg-primary-500' :
                        index % 4 === 1 ? 'bg-success-500' :
                        index % 4 === 2 ? 'bg-info-500' : 'bg-warning-500'
                      )}
                      style={{ width: `${dept.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Exam Distribution by Date */}
        <div className="mb-8 print:mb-6">
          <div className="flex items-center gap-3 mb-4 print:mb-3">
            <BarChart3 className="h-6 w-6 text-primary-500 print:h-5 print:w-5" />
            <h3 className="text-xl font-semibold text-gray-900 print:text-lg">
              Exam Distribution by Date
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 print:text-xs">
              <thead>
                <tr className="bg-primary-50 print:bg-gray-100">
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 print:px-3 print:py-2">
                    Date
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 print:px-3 print:py-2">
                    Number of Exams
                  </th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900 print:px-3 print:py-2">
                    Load Distribution
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedExamsByDate.map((examDay, index) => {
                  const maxExams = Math.max(...data.examsByDate.map(d => d.count))
                  const percentage = maxExams > 0 ? Math.round((examDay.count / maxExams) * 100) : 0
                  
                  return (
                    <tr key={examDay.date} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 px-4 py-3 print:px-3 print:py-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500 print:h-3 print:w-3" />
                          <span className="font-medium">{formatDate(examDay.date)}</span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center font-semibold text-gray-900 print:px-3 print:py-2">
                        {examDay.count}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 print:px-3 print:py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-primary-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600 w-12 print:text-xs">{percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Capacity and Utilization Analysis */}
        <div className="mb-8 print:mb-6">
          <div className="flex items-center gap-3 mb-4 print:mb-3">
            <Activity className="h-6 w-6 text-primary-500 print:h-5 print:w-5" />
            <h3 className="text-xl font-semibold text-gray-900 print:text-lg">
              Capacity and Utilization Analysis
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-4">
            <div className="bg-gray-50 p-4 rounded-lg print:p-3">
              <h4 className="font-semibold text-gray-900 mb-3 print:text-sm print:mb-2">Room Capacity</h4>
              <div className="space-y-2 print:space-y-1">
                <div className="flex justify-between text-sm print:text-xs">
                  <span>Average Capacity:</span>
                  <span className="font-semibold">{Math.round(data.averageCapacity)}</span>
                </div>
                <div className="flex justify-between text-sm print:text-xs">
                  <span>Total Rooms:</span>
                  <span className="font-semibold">{data.totalRooms}</span>
                </div>
                <div className="flex justify-between text-sm print:text-xs">
                  <span>Total Capacity:</span>
                  <span className="font-semibold">{Math.round(data.averageCapacity * data.totalRooms)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg print:p-3">
              <h4 className="font-semibold text-gray-900 mb-3 print:text-sm print:mb-2">Utilization Metrics</h4>
              <div className="space-y-2 print:space-y-1">
                <div className="flex justify-between text-sm print:text-xs">
                  <span>Current Utilization:</span>
                  <span className="font-semibold">{data.utilizationRate}%</span>
                </div>
                <div className="flex justify-between text-sm print:text-xs">
                  <span>Students per Room:</span>
                  <span className="font-semibold">{Math.round(data.totalStudents / data.totalRooms)}</span>
                </div>
                <div className="flex justify-between text-sm print:text-xs">
                  <span>Efficiency Rating:</span>
                  <span className={cn(
                    'font-semibold',
                    data.utilizationRate > 80 ? 'text-success-600' :
                    data.utilizationRate > 60 ? 'text-warning-600' : 'text-error-600'
                  )}>
                    {data.utilizationRate > 80 ? 'Excellent' :
                     data.utilizationRate > 60 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg print:p-3">
              <h4 className="font-semibold text-gray-900 mb-3 print:text-sm print:mb-2">Recommendations</h4>
              <ul className="text-sm text-gray-700 space-y-1 print:text-xs print:space-y-0.5">
                {data.utilizationRate < 60 && (
                  <li>• Consider optimizing room allocation</li>
                )}
                {data.utilizationRate > 90 && (
                  <li>• Monitor capacity limits closely</li>
                )}
                <li>• Review department distribution</li>
                <li>• Plan for peak examination days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Summary and Insights */}
        <div className="bg-primary-50 p-6 rounded-lg print:p-4 print:bg-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 print:text-base print:mb-3">
            Key Insights & Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700 print:gap-4 print:text-xs">
            <div>
              <h4 className="font-medium text-gray-900 mb-2 print:mb-1">Strengths:</h4>
              <ul className="space-y-1 print:space-y-0.5">
                <li>• Total of {data.totalStudents} students enrolled</li>
                <li>• {data.totalExams} examinations scheduled</li>
                <li>• {data.utilizationRate}% room utilization achieved</li>
                <li>• Balanced distribution across {data.departmentDistribution.length} departments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2 print:mb-1">Areas for Attention:</h4>
              <ul className="space-y-1 print:space-y-0.5">
                <li>• Monitor peak examination days</li>
                <li>• Ensure adequate invigilator allocation</li>
                <li>• Regular capacity utilization review</li>
                <li>• Maintain infrastructure standards</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-300 flex justify-between items-center print:mt-6 print:pt-4">
          <div className="text-sm text-gray-600 print:text-xs">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 print:h-3 print:w-3" />
              <span>Report generated on {formatDate(new Date())}</span>
            </div>
            <div className="text-xs text-gray-500 print:text-[10px]">
              Data reflects current semester statistics and enrollment figures
            </div>
          </div>
          
          <div className="text-right">
            <div className="border-b border-gray-400 w-48 mb-2 print:w-40"></div>
            <p className="text-sm text-gray-600 print:text-xs">Authorized by Academic Office</p>
          </div>
        </div>
      </div>
    )
  }
)

AnalyticsSummaryReport.displayName = 'AnalyticsSummaryReport'

export { AnalyticsSummaryReport }
