/**
 * Reports Page
 * Main reports hub with links to various report types and export demo
 */

'use client'

import Link from 'next/link'
import { 
  FileText, 
  Users, 
  Calendar, 
  MapPin, 
  BarChart3, 
  Shield,
  Download,
  Eye,
  Printer,
  ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const reportCategories = [
  {
    title: 'Student Reports',
    description: 'Hall tickets, student lists, and enrollment reports',
    icon: Users,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    reports: [
      { name: 'Hall Tickets', description: 'Generate student hall tickets with QR codes' },
      { name: 'Student Lists', description: 'Comprehensive student rosters by department' },
      { name: 'Enrollment Reports', description: 'Course-wise enrollment statistics' }
    ]
  },
  {
    title: 'Examination Reports',
    description: 'Schedules, seating arrangements, and attendance sheets',
    icon: Calendar,
    color: 'text-green-500',
    bgColor: 'bg-green-50',
    reports: [
      { name: 'Exam Schedules', description: 'Complete examination timetables' },
      { name: 'Seating Charts', description: 'Room-wise seating arrangements' },
      { name: 'Attendance Sheets', description: 'Student attendance forms for invigilators' }
    ]
  },
  {
    title: 'Administrative Reports',
    description: 'Duty rosters, room utilization, and analytics',
    icon: Shield,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50',
    reports: [
      { name: 'Invigilator Roster', description: 'Faculty duty assignments and schedules' },
      { name: 'Room Utilization', description: 'Capacity and usage analytics' },
      { name: 'Analytics Summary', description: 'Comprehensive examination statistics' }
    ]
  },
  {
    title: 'Export & Print',
    description: 'Multiple format exports and print-optimized layouts',
    icon: Download,
    color: 'text-orange-500',
    bgColor: 'bg-orange-50',
    reports: [
      { name: 'CSV Export', description: 'Spreadsheet-compatible data export' },
      { name: 'Excel Workbooks', description: 'Multi-sheet Excel reports' },
      { name: 'PDF Generation', description: 'Professional PDF documents' },
      { name: 'Print Layouts', description: 'Printer-friendly report formats' }
    ]
  }
]

const ReportsPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reports & Analytics
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Generate comprehensive reports, export data in multiple formats, and access 
          analytics for examination management and student administration.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link href="/export-demo">
          <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <Eye className="h-5 w-5 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Export Demo</h3>
                <p className="text-sm text-gray-600">Try all export features</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 ml-auto" />
            </div>
          </Card>
        </Link>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success-50 rounded-lg">
              <Printer className="h-5 w-5 text-success-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Print Preview</h3>
              <p className="text-sm text-gray-600">Preview before printing</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-info-50 rounded-lg">
              <BarChart3 className="h-5 w-5 text-info-500" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Analytics</h3>
              <p className="text-sm text-gray-600">View system statistics</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Report Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {reportCategories.map((category) => {
          const Icon = category.icon
          
          return (
            <Card key={category.title} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-lg ${category.bgColor}`}>
                  <Icon className={`h-6 w-6 ${category.color}`} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {category.title}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {category.reports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">{report.name}</h4>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link href="/export-demo">
                  <Button variant="outline" className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    View Examples & Export Options
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Export Formats Info */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Supported Export Formats
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <FileText className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">CSV</h3>
            <p className="text-sm text-gray-600">Spreadsheet compatible</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Excel</h3>
            <p className="text-sm text-gray-600">Multi-sheet workbooks</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <FileText className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">PDF</h3>
            <p className="text-sm text-gray-600">Professional documents</p>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <Printer className="h-8 w-8 text-gray-500 mx-auto mb-2" />
            <h3 className="font-medium text-gray-900">Print</h3>
            <p className="text-sm text-gray-600">Optimized layouts</p>
          </div>
        </div>
      </Card>

      {/* Features Summary */}
      <Card className="p-6 bg-primary-50">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Export & Print Features
          </h2>
          <p className="text-gray-700 mb-4">
            Comprehensive export capabilities with professional formatting and print optimization
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2 justify-center">
              <Download className="h-4 w-4 text-primary-500" />
              <span>Multiple format support</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <Eye className="h-4 w-4 text-primary-500" />
              <span>Print preview with customization</span>
            </div>
            <div className="flex items-center gap-2 justify-center">
              <BarChart3 className="h-4 w-4 text-primary-500" />
              <span>Bulk export capabilities</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default ReportsPage
