'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { UserCheck, XCircle, AlertTriangle, Calendar, Download, Upload } from 'lucide-react';

interface AttendanceRecord {
  id: number;
  exam_name: string;
  exam_date: string;
  exam_time: string;
  room_number: string;
  course_name: string;
  total_students: number;
  present: number;
  absent: number;
  malpractice: number;
  status: 'PENDING' | 'SUBMITTED' | 'VERIFIED';
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAttendanceRecords();
  }, []);

  const fetchAttendanceRecords = async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData: AttendanceRecord[] = [
      {
        id: 1,
        exam_name: 'Data Structures - ISA1',
        exam_date: '2024-12-15',
        exam_time: '09:00 AM - 11:00 AM',
        room_number: '101',
        course_name: 'CS301 - Data Structures',
        total_students: 58,
        present: 55,
        absent: 2,
        malpractice: 1,
        status: 'SUBMITTED'
      },
      {
        id: 2,
        exam_name: 'Database Systems - ISA1',
        exam_date: '2024-12-16',
        exam_time: '02:00 PM - 04:00 PM',
        room_number: '102',
        course_name: 'CS302 - Database Systems',
        total_students: 50,
        present: 48,
        absent: 2,
        malpractice: 0,
        status: 'SUBMITTED'
      },
      {
        id: 3,
        exam_name: 'Computer Networks - ISA1',
        exam_date: '2024-12-17',
        exam_time: '09:00 AM - 11:00 AM',
        room_number: '201',
        course_name: 'CS401 - Computer Networks',
        total_students: 45,
        present: 45,
        absent: 0,
        malpractice: 0,
        status: 'VERIFIED'
      },
      {
        id: 4,
        exam_name: 'Operating Systems - ISA1',
        exam_date: '2024-12-18',
        exam_time: '02:00 PM - 04:00 PM',
        room_number: '301',
        course_name: 'CS303 - Operating Systems',
        total_students: 52,
        present: 0,
        absent: 0,
        malpractice: 0,
        status: 'PENDING'
      }
    ];
    
    setRecords(mockData);
    setLoading(false);
  };

  const filteredRecords = records.filter(record => {
    const matchesFilter = filter === 'ALL' || record.status === filter;
    const matchesSearch = 
      record.exam_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.room_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const handleMarkAttendance = (id: number) => {
    alert(`Opening attendance marking interface for exam #${id}...`);
  };

  const handleSubmitAttendance = (id: number) => {
    setRecords(records.map(r => 
      r.id === id ? { ...r, status: 'SUBMITTED' as const } : r
    ));
  };

  const handleBulkExport = () => {
    alert('Exporting all attendance records as Excel...');
  };

  const handleBulkUpload = () => {
    alert('Opening bulk attendance upload interface...');
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
    SUBMITTED: 'bg-primary-light text-primary',
    VERIFIED: 'kle-status-success'
  };

  const totalStudents = records.reduce((sum, r) => sum + r.total_students, 0);
  const totalPresent = records.reduce((sum, r) => sum + r.present, 0);
  const totalAbsent = records.reduce((sum, r) => sum + r.absent, 0);
  const totalMalpractice = records.reduce((sum, r) => sum + r.malpractice, 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-text">Attendance & Malpractice</h1>
          <p className="text-text-muted mt-1">Track exam attendance and malpractice cases</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleBulkUpload}>
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button variant="primary" onClick={handleBulkExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Records
            </Button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Students</p>
              <p className="text-3xl font-bold text-text">{totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Present</p>
              <p className="text-3xl font-bold text-success">{totalPresent}</p>
              <p className="text-xs text-text-muted mt-1">
                {totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 0}% attendance
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Absent</p>
              <p className="text-3xl font-bold text-warning">{totalAbsent}</p>
            </div>
            <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-warning" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Malpractice Cases</p>
              <p className="text-3xl font-bold text-primary">{totalMalpractice}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Search by exam, course, or room..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          {['ALL', 'PENDING', 'SUBMITTED', 'VERIFIED'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setFilter(status)}
            >
              {status === 'ALL' ? 'All Records' : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Attendance Records */}
      <div className="grid gap-4">
        {filteredRecords.length === 0 ? (
          <Card>
            <p className="text-center text-text-muted py-8">
              {searchTerm
                ? 'No attendance records found matching your search.'
                : 'No attendance records found for the selected filter.'}
            </p>
          </Card>
        ) : (
          filteredRecords.map((record) => (
            <Card key={record.id}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-text">
                      {record.exam_name}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[record.status]}`}>
                      {record.status}
                    </span>
                    {record.malpractice > 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-primary-light text-primary rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {record.malpractice} malpractice
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-text-muted mb-3">{record.course_name}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-text-muted">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(record.exam_date).toLocaleDateString()}</span>
                    </div>
                    <div className="text-text-muted">
                      {record.exam_time}
                    </div>
                    <div className="text-text-muted">
                      Room {record.room_number}
                    </div>
                    <div className="font-medium text-text">
                      {record.total_students} students
                    </div>
                  </div>

                  {record.status !== 'PENDING' && (
                    <div className="mt-3 flex gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-success" />
                        <span className="text-success font-medium">{record.present} Present</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-warning" />
                        <span className="text-warning font-medium">{record.absent} Absent</span>
                      </div>
                      {record.malpractice > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-primary" />
                          <span className="text-primary font-medium">{record.malpractice} Malpractice</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {record.status === 'PENDING' && (user?.role === 'FACULTY' || user?.role === 'EXAM_CELL') && (
                    <>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleMarkAttendance(record.id)}
                      >
                        Mark Attendance
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleSubmitAttendance(record.id)}
                      >
                        Submit
                      </Button>
                    </>
                  )}
                  {record.status !== 'PENDING' && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleMarkAttendance(record.id)}
                    >
                      View Details
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-primary-light rounded-lg border border-primary/20">
        <h3 className="font-semibold text-primary mb-2">📝 Attendance Guidelines</h3>
        <ul className="text-sm text-text space-y-1">
          <li>• Attendance must be marked within 2 hours of exam completion</li>
          <li>• Malpractice cases should be reported with evidence and witness details</li>
          <li>• Absent students are automatically marked if not checked present</li>
          <li>• Once verified by exam cell, attendance records cannot be modified</li>
          <li>• Bulk upload accepts Excel files with pre-defined format</li>
        </ul>
      </div>
    </div>
  );
}
