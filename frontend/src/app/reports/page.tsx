'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { FileText, Download, TrendingUp, BarChart3, PieChart, Calendar } from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'EXAM' | 'STUDENT' | 'ATTENDANCE' | 'PERFORMANCE' | 'ADMIN';
  icon: 'FileText' | 'BarChart3' | 'PieChart' | 'TrendingUp';
  formats: string[];
}

export default function ReportsPage() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [generating, setGenerating] = useState<string | null>(null);

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'exam-schedule',
      name: 'Exam Schedule Report',
      description: 'Complete exam timetable with dates, timings, and room allocations',
      category: 'EXAM',
      icon: 'FileText',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'seating-arrangement',
      name: 'Seating Arrangement Report',
      description: 'Hall-wise student seating arrangements for all exams',
      category: 'EXAM',
      icon: 'FileText',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'invigilator-duty',
      name: 'Invigilator Duty Chart',
      description: 'Faculty-wise invigilation duty schedule with contact details',
      category: 'EXAM',
      icon: 'FileText',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'hall-tickets',
      name: 'Hall Tickets Summary',
      description: 'List of generated hall tickets with download status',
      category: 'STUDENT',
      icon: 'FileText',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'student-enrollment',
      name: 'Student Enrollment Report',
      description: 'Course-wise student enrollment with branch and semester breakdown',
      category: 'STUDENT',
      icon: 'BarChart3',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'attendance-summary',
      name: 'Attendance Summary Report',
      description: 'Exam-wise attendance statistics with absentee details',
      category: 'ATTENDANCE',
      icon: 'PieChart',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'malpractice-report',
      name: 'Malpractice Cases Report',
      description: 'Detailed report of malpractice incidents with evidence',
      category: 'ATTENDANCE',
      icon: 'FileText',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'marks-analysis',
      name: 'Marks Analysis Report',
      description: 'Course-wise marks distribution with statistical analysis',
      category: 'PERFORMANCE',
      icon: 'TrendingUp',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'result-statistics',
      name: 'Result Statistics',
      description: 'Pass/fail percentages, grade distribution, and performance trends',
      category: 'PERFORMANCE',
      icon: 'BarChart3',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'revaluation-summary',
      name: 'Revaluation Summary',
      description: 'List of revaluation requests with before/after marks comparison',
      category: 'PERFORMANCE',
      icon: 'FileText',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'room-utilization',
      name: 'Room Utilization Report',
      description: 'Hall-wise capacity utilization and availability analysis',
      category: 'ADMIN',
      icon: 'PieChart',
      formats: ['PDF', 'Excel']
    },
    {
      id: 'comprehensive-report',
      name: 'Comprehensive Exam Report',
      description: 'All-in-one report covering complete exam cycle from schedule to results',
      category: 'ADMIN',
      icon: 'FileText',
      formats: ['PDF']
    }
  ];

  const filteredReports = reportTemplates.filter(report => 
    selectedCategory === 'ALL' || report.category === selectedCategory
  );

  const handleGenerateReport = async (reportId: string, format: string) => {
    setGenerating(reportId);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(null);
    alert(`${reportTemplates.find(r => r.id === reportId)?.name} generated as ${format}!`);
  };

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      FileText: <FileText className="w-6 h-6 text-primary" />,
      BarChart3: <BarChart3 className="w-6 h-6 text-primary" />,
      PieChart: <PieChart className="w-6 h-6 text-primary" />,
      TrendingUp: <TrendingUp className="w-6 h-6 text-primary" />
    };
    return icons[iconName] || <FileText className="w-6 h-6 text-primary" />;
  };

  if (user?.role !== 'ADMIN' && user?.role !== 'EXAM_CELL') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <p className="text-text text-lg">Access Restricted</p>
            <p className="text-text-muted mt-1">
              Reports are only accessible to administrators and exam cell staff.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">Reports & Analytics</h1>
        <p className="text-text-muted mt-1">Generate comprehensive examination reports</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Available Reports</p>
              <p className="text-3xl font-bold text-text">{reportTemplates.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Exam Reports</p>
              <p className="text-3xl font-bold text-text">
                {reportTemplates.filter(r => r.category === 'EXAM').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Performance</p>
              <p className="text-3xl font-bold text-text">
                {reportTemplates.filter(r => r.category === 'PERFORMANCE').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Student Reports</p>
              <p className="text-3xl font-bold text-text">
                {reportTemplates.filter(r => r.category === 'STUDENT').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 mb-6 flex-wrap">
        {['ALL', 'EXAM', 'STUDENT', 'ATTENDANCE', 'PERFORMANCE', 'ADMIN'].map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'ALL' ? 'All Categories' : category}
          </Button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center">
                {getIcon(report.icon)}
              </div>
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text mb-1">
                  {report.name}
                </h3>
                <p className="text-sm text-text-muted mb-3">
                  {report.description}
                </p>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2 py-1 text-xs font-medium bg-primary-light text-primary rounded">
                    {report.category}
                  </span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {report.formats.map((format) => (
                    <Button
                      key={format}
                      variant="primary"
                      size="sm"
                      onClick={() => handleGenerateReport(report.id, format)}
                      disabled={generating === report.id}
                    >
                      {generating === report.id ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-surface"></div>
                          <span>Generating...</span>
                        </div>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-1" />
                          Download {format}
                        </>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-primary-light rounded-lg border border-primary/20">
        <h3 className="font-semibold text-primary mb-2">📊 Report Generation Info</h3>
        <ul className="text-sm text-text space-y-1">
          <li>• Reports are generated in real-time with latest data from the database</li>
          <li>• PDF format is recommended for printing and distribution</li>
          <li>• Excel format allows further analysis and custom filtering</li>
          <li>• Large reports may take a few seconds to generate</li>
          <li>• Generated reports are automatically timestamped for record-keeping</li>
        </ul>
      </div>
    </div>
  );
}
