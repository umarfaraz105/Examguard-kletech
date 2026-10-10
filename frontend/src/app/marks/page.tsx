'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import Input from '@/components/ui/Input';
import { Award, TrendingUp, FileText, Download, Upload, Eye } from 'lucide-react';

interface MarksRecord {
  id: number;
  student_usn: string;
  student_name: string;
  course_code: string;
  course_name: string;
  exam_type: string;
  marks_obtained: number | null;
  max_marks: number;
  status: 'PENDING' | 'ENTERED' | 'PUBLISHED';
  grade?: string;
}

export default function MarksPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<MarksRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('ALL');

  useEffect(() => {
    fetchMarksRecords();
  }, []);

  const fetchMarksRecords = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData: MarksRecord[] = [
      {
        id: 1,
        student_usn: '4NI21CS001',
        student_name: 'Aarav Kumar',
        course_code: 'CS301',
        course_name: 'Data Structures',
        exam_type: 'ISA1',
        marks_obtained: 38,
        max_marks: 50,
        status: 'PUBLISHED',
        grade: 'A'
      },
      {
        id: 2,
        student_usn: '4NI21CS002',
        student_name: 'Priya Sharma',
        course_code: 'CS301',
        course_name: 'Data Structures',
        exam_type: 'ISA1',
        marks_obtained: 42,
        max_marks: 50,
        status: 'PUBLISHED',
        grade: 'A+'
      },
      {
        id: 3,
        student_usn: '4NI21CS003',
        student_name: 'Rahul Patil',
        course_code: 'CS301',
        course_name: 'Data Structures',
        exam_type: 'ISA1',
        marks_obtained: 28,
        max_marks: 50,
        status: 'PUBLISHED',
        grade: 'B'
      },
      {
        id: 4,
        student_usn: '4NI21CS001',
        student_name: 'Aarav Kumar',
        course_code: 'CS302',
        course_name: 'Database Systems',
        exam_type: 'ISA1',
        marks_obtained: 35,
        max_marks: 50,
        status: 'ENTERED',
        grade: 'A'
      },
      {
        id: 5,
        student_usn: '4NI21CS002',
        student_name: 'Priya Sharma',
        course_code: 'CS302',
        course_name: 'Database Systems',
        exam_type: 'ISA1',
        marks_obtained: null,
        max_marks: 50,
        status: 'PENDING'
      },
      {
        id: 6,
        student_usn: '4NI21CS004',
        student_name: 'Sneha Desai',
        course_code: 'CS303',
        course_name: 'Operating Systems',
        exam_type: 'ISA1',
        marks_obtained: null,
        max_marks: 50,
        status: 'PENDING'
      }
    ];
    
    setRecords(mockData);
    setLoading(false);
  };

  const courses = Array.from(new Set(records.map(r => r.course_code)));

  const filteredRecords = records.filter(record => {
    const matchesFilter = filter === 'ALL' || record.status === filter;
    const matchesCourse = selectedCourse === 'ALL' || record.course_code === selectedCourse;
    const matchesSearch = 
      record.student_usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.course_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesCourse && matchesSearch;
  });

  const handleEnterMarks = (id: number) => {
    alert(`Opening marks entry interface for record #${id}...`);
  };

  const handlePublishMarks = () => {
    setRecords(records.map(r => 
      r.status === 'ENTERED' ? { ...r, status: 'PUBLISHED' as const } : r
    ));
    alert('Publishing all entered marks...');
  };

  const handleBulkUpload = () => {
    alert('Opening bulk marks upload interface...');
  };

  const handleExportResults = () => {
    alert('Exporting results as Excel...');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusColors = {
    PENDING: 'kle-status-warning',
    ENTERED: 'bg-primary-light text-primary',
    PUBLISHED: 'kle-status-success'
  };

  const totalRecords = records.length;
  const publishedCount = records.filter(r => r.status === 'PUBLISHED').length;
  const enteredCount = records.filter(r => r.status === 'ENTERED').length;
  const pendingCount = records.filter(r => r.status === 'PENDING').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text">Marks & Results</h1>
          <p className="text-text-muted mt-1">Manage exam marks entry and result publication</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleBulkUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button variant="secondary" onClick={handleExportResults}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button variant="primary" onClick={handlePublishMarks}>
              Publish Results
            </Button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Records</p>
              <p className="text-3xl font-bold text-text">{totalRecords}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Published</p>
              <p className="text-3xl font-bold text-success">{publishedCount}</p>
              <p className="text-xs text-text-muted mt-1">
                {totalRecords > 0 ? Math.round((publishedCount / totalRecords) * 100) : 0}% complete
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Entered</p>
              <p className="text-3xl font-bold text-primary">{enteredCount}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Pending</p>
              <p className="text-3xl font-bold text-warning">{pendingCount}</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by USN, name, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="ALL">All Courses</option>
          {courses.map(course => (
            <option key={course} value={course}>{course}</option>
          ))}
        </select>
        <div className="flex gap-3">
          {['ALL', 'PENDING', 'ENTERED', 'PUBLISHED'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'All' : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Marks Records Table */}
      <Card>
        {filteredRecords.length === 0 ? (
          <p className="text-center text-text-muted py-8">
            {searchTerm
              ? 'No marks records found matching your search.'
              : 'No marks records found for the selected filter.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-bg">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Exam Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Marks
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-bg">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text">{record.student_usn}</div>
                      <div className="text-sm text-text-muted">{record.student_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-text">{record.course_code}</div>
                      <div className="text-sm text-text-muted">{record.course_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
                      {record.exam_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.marks_obtained !== null ? (
                        <div className="text-sm font-semibold text-text">
                          {record.marks_obtained} / {record.max_marks}
                        </div>
                      ) : (
                        <span className="text-sm text-text-muted">Not entered</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.grade && (
                        <span className="px-2 py-1 text-sm font-semibold bg-primary-light text-primary rounded">
                          {record.grade}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded ${statusColors[record.status]}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {record.status === 'PENDING' && (user?.role === 'FACULTY' || user?.role === 'EXAM_CELL') ? (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEnterMarks(record.id)}
                        >
                          Enter Marks
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEnterMarks(record.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-primary-light rounded-lg border border-primary/20">
        <h3 className="font-semibold text-primary mb-2">📊 Marks Entry Guidelines</h3>
        <ul className="text-sm text-text space-y-1">
          <li>• Faculty can enter marks for their assigned courses within the deadline</li>
          <li>• Marks must be verified by HOD before publishing to students</li>
          <li>• Bulk upload accepts Excel files with USN, Course Code, and Marks columns</li>
          <li>• Grade calculation follows university guidelines (A+: 45-50, A: 40-44, B: 35-39, etc.)</li>
          <li>• Published marks are visible to students immediately on their portal</li>
        </ul>
      </div>
    </div>
  );
}
