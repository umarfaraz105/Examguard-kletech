'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search, Filter, Calendar, User, Clock, Award, CheckCircle } from 'lucide-react';

interface Course {
  id: number;
  course_code: string;
  course_name: string;
  credits: number;
  semester: string;
  instructor: string;
  department: string;
  registration_status: 'registered' | 'completed' | 'in_progress';
  grade?: string;
  attendance_percentage?: number;
  exam_schedule?: {
    isa1_date?: string;
    isa2_date?: string;
    esa_date?: string;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Mock data - replace with actual API call
      const mockCourses: Course[] = [
        {
          id: 1,
          course_code: 'MATH101',
          course_name: 'Mathematics - I',
          credits: 4,
          semester: '5th Semester',
          instructor: 'Dr. Sarah Johnson',
          department: 'Mathematics',
          registration_status: 'in_progress',
          attendance_percentage: 85,
          exam_schedule: {
            isa1_date: '2026-10-15',
            isa2_date: '2026-11-20',
            esa_date: '2026-12-18'
          }
        },
        {
          id: 2,
          course_code: 'PHY102',
          course_name: 'Physics - II',
          credits: 4,
          semester: '5th Semester',
          instructor: 'Prof. Michael Chen',
          department: 'Physics',
          registration_status: 'in_progress',
          attendance_percentage: 92,
          exam_schedule: {
            isa1_date: '2026-10-18',
            isa2_date: '2026-11-22',
            esa_date: '2026-12-20'
          }
        },
        {
          id: 3,
          course_code: 'CHEM103',
          course_name: 'Chemistry',
          credits: 3,
          semester: '5th Semester',
          instructor: 'Dr. Emily Brown',
          department: 'Chemistry',
          registration_status: 'in_progress',
          attendance_percentage: 78,
          exam_schedule: {
            isa1_date: '2026-10-20',
            esa_date: '2026-12-22'
          }
        },
        {
          id: 4,
          course_code: 'CS104',
          course_name: 'Data Structures',
          credits: 4,
          semester: '5th Semester',
          instructor: 'Dr. Robert Wilson',
          department: 'Computer Science',
          registration_status: 'in_progress',
          attendance_percentage: 88,
          exam_schedule: {
            isa1_date: '2026-10-22',
            isa2_date: '2026-11-25',
            esa_date: '2026-12-25'
          }
        },
        {
          id: 5,
          course_code: 'ENG105',
          course_name: 'Technical Communication',
          credits: 2,
          semester: '5th Semester',
          instructor: 'Prof. Linda Martinez',
          department: 'English',
          registration_status: 'in_progress',
          attendance_percentage: 95,
          exam_schedule: {
            isa1_date: '2026-10-25',
            esa_date: '2026-12-28'
          }
        },
        {
          id: 6,
          course_code: 'MATH001',
          course_name: 'Calculus I',
          credits: 4,
          semester: '3rd Semester',
          instructor: 'Dr. James Anderson',
          department: 'Mathematics',
          registration_status: 'completed',
          grade: 'A',
          attendance_percentage: 90
        }
      ];
      
      setCourses(mockCourses);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 85) return 'text-green-600';
    if (percentage >= 75) return 'text-orange-600';
    return 'text-red-600';
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = 
      course.course_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || course.registration_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCredits = courses
    .filter(c => c.registration_status === 'in_progress')
    .reduce((sum, c) => sum + c.credits, 0);

  const avgAttendance = courses
    .filter(c => c.registration_status === 'in_progress' && c.attendance_percentage)
    .reduce((sum, c) => sum + (c.attendance_percentage || 0), 0) / 
    courses.filter(c => c.registration_status === 'in_progress').length;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Registered Courses</h1>
        <p className="text-gray-600 mt-2">View your course details, attendance, and examination schedule</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold">{courses.filter(c => c.registration_status === 'in_progress').length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-purple-600">{totalCredits}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
                <p className={`text-2xl font-bold ${getAttendanceColor(avgAttendance)}`}>
                  {avgAttendance.toFixed(1)}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {courses.filter(c => c.registration_status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No courses found</p>
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">
                        {course.course_code} - {course.course_name}
                      </h3>
                      <Badge className={getStatusColor(course.registration_status)}>
                        {course.registration_status.replace('_', ' ')}
                      </Badge>
                      {course.grade && (
                        <Badge variant="outline" className="font-bold">
                          Grade: {course.grade}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {course.credits} Credits
                      </span>
                      <span>•</span>
                      <span>{course.semester}</span>
                      <span>•</span>
                      <span>{course.department}</span>
                    </div>
                  </div>
                  {course.attendance_percentage !== undefined && (
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getAttendanceColor(course.attendance_percentage)}`}>
                        {course.attendance_percentage}%
                      </div>
                      <div className="text-xs text-gray-600">Attendance</div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-700 mb-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Instructor:</span>
                      <span>{course.instructor}</span>
                    </div>
                  </div>

                  {course.exam_schedule && course.registration_status === 'in_progress' && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Examination Schedule:</h4>
                      <div className="space-y-1 text-sm">
                        {course.exam_schedule.isa1_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="font-medium">ISA-1:</span>
                            <span>{new Date(course.exam_schedule.isa1_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {course.exam_schedule.isa2_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="font-medium">ISA-2:</span>
                            <span>{new Date(course.exam_schedule.isa2_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {course.exam_schedule.esa_date && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="font-medium">ESA:</span>
                            <span>{new Date(course.exam_schedule.esa_date).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {course.attendance_percentage && course.attendance_percentage < 75 && (
                  <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-300 rounded">
                    <div className="flex items-start gap-2">
                      <div className="text-red-600 mt-0.5">⚠️</div>
                      <div>
                        <p className="text-sm font-medium text-red-800">Low Attendance Warning</p>
                        <p className="text-sm text-red-700 mt-1">
                          Your attendance is below the minimum required 75%. Please attend classes regularly.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Important Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Important Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Attendance Requirements:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Minimum 75% attendance required for exam eligibility</li>
                <li>• Medical certificates accepted for genuine absences</li>
                <li>• Late entries may affect attendance record</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Academic Guidelines:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Regular assignment submissions required</li>
                <li>• Active participation encouraged</li>
                <li>• Contact instructors for academic support</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
