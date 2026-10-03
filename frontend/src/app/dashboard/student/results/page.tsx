'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Download, TrendingUp, TrendingDown, Minus, BarChart3, FileText } from 'lucide-react';

interface CourseResult {
  id: number;
  course_code: string;
  course_name: string;
  credits: number;
  isa1_marks?: number;
  isa1_max?: number;
  isa2_marks?: number;
  isa2_max?: number;
  esa_marks?: number;
  esa_max?: number;
  total_marks: number;
  max_marks: number;
  percentage: number;
  grade: string;
  grade_points: number;
  status: 'pass' | 'fail' | 'absent';
}

interface SemesterResult {
  semester: string;
  academic_year: string;
  courses: CourseResult[];
  sgpa: number;
  total_credits: number;
  earned_credits: number;
  status: 'published' | 'pending' | 'draft';
  published_date?: string;
}

export default function ResultsPage() {
  const [results, setResults] = useState<SemesterResult[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      // Mock data - replace with actual API call
      const mockResults: SemesterResult[] = [
        {
          semester: '4th Semester',
          academic_year: '2025-26',
          sgpa: 8.5,
          total_credits: 20,
          earned_credits: 20,
          status: 'published',
          published_date: '2026-09-20',
          courses: [
            {
              id: 1,
              course_code: 'MATH001',
              course_name: 'Calculus I',
              credits: 4,
              isa1_marks: 38,
              isa1_max: 50,
              isa2_marks: 42,
              isa2_max: 50,
              esa_marks: 75,
              esa_max: 100,
              total_marks: 155,
              max_marks: 200,
              percentage: 77.5,
              grade: 'A',
              grade_points: 9,
              status: 'pass'
            },
            {
              id: 2,
              course_code: 'PHY001',
              course_name: 'Physics I',
              credits: 4,
              isa1_marks: 40,
              isa1_max: 50,
              isa2_marks: 45,
              isa2_max: 50,
              esa_marks: 80,
              esa_max: 100,
              total_marks: 165,
              max_marks: 200,
              percentage: 82.5,
              grade: 'A',
              grade_points: 9,
              status: 'pass'
            },
            {
              id: 3,
              course_code: 'CS001',
              course_name: 'Programming in C',
              credits: 4,
              isa1_marks: 45,
              isa1_max: 50,
              isa2_marks: 47,
              isa2_max: 50,
              esa_marks: 85,
              esa_max: 100,
              total_marks: 177,
              max_marks: 200,
              percentage: 88.5,
              grade: 'A+',
              grade_points: 10,
              status: 'pass'
            },
            {
              id: 4,
              course_code: 'ENG001',
              course_name: 'Technical English',
              credits: 2,
              isa1_marks: 35,
              isa1_max: 50,
              isa2_marks: 40,
              isa2_max: 50,
              esa_marks: 70,
              esa_max: 100,
              total_marks: 145,
              max_marks: 200,
              percentage: 72.5,
              grade: 'B+',
              grade_points: 8,
              status: 'pass'
            },
            {
              id: 5,
              course_code: 'MECH001',
              course_name: 'Engineering Mechanics',
              credits: 3,
              isa1_marks: 42,
              isa1_max: 50,
              isa2_marks: 44,
              isa2_max: 50,
              esa_marks: 78,
              esa_max: 100,
              total_marks: 164,
              max_marks: 200,
              percentage: 82.0,
              grade: 'A',
              grade_points: 9,
              status: 'pass'
            },
            {
              id: 6,
              course_code: 'CHEM001',
              course_name: 'Engineering Chemistry',
              credits: 3,
              isa1_marks: 36,
              isa1_max: 50,
              isa2_marks: 38,
              isa2_max: 50,
              esa_marks: 72,
              esa_max: 100,
              total_marks: 146,
              max_marks: 200,
              percentage: 73.0,
              grade: 'B+',
              grade_points: 8,
              status: 'pass'
            }
          ]
        },
        {
          semester: '3rd Semester',
          academic_year: '2025-26',
          sgpa: 8.2,
          total_credits: 22,
          earned_credits: 22,
          status: 'published',
          published_date: '2026-05-15',
          courses: [
            {
              id: 7,
              course_code: 'MATH002',
              course_name: 'Linear Algebra',
              credits: 4,
              isa1_marks: 36,
              isa1_max: 50,
              isa2_marks: 40,
              isa2_max: 50,
              esa_marks: 72,
              esa_max: 100,
              total_marks: 148,
              max_marks: 200,
              percentage: 74.0,
              grade: 'B+',
              grade_points: 8,
              status: 'pass'
            }
          ]
        }
      ];
      
      setResults(mockResults);
      if (mockResults.length > 0) {
        setSelectedSemester(mockResults[0].semester);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade === 'A+' || grade === 'O') return 'bg-green-100 text-green-800';
    if (grade === 'A') return 'bg-blue-100 text-blue-800';
    if (grade.startsWith('B')) return 'bg-yellow-100 text-yellow-800';
    if (grade.startsWith('C')) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'pass') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (status === 'fail') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const calculateCGPA = () => {
    const totalGradePoints = results.reduce((sum, sem) => sum + (sem.sgpa * sem.total_credits), 0);
    const totalCredits = results.reduce((sum, sem) => sum + sem.total_credits, 0);
    return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : '0.00';
  };

  const currentSemester = results.find(r => r.semester === selectedSemester);

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Examination Results</h1>
          <p className="text-gray-600 mt-2">View your semester-wise examination results and grades</p>
        </div>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Marksheet
        </Button>
      </div>

      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">CGPA</p>
                <p className="text-3xl font-bold text-blue-600">{calculateCGPA()}</p>
              </div>
              <Award className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current SGPA</p>
                <p className="text-3xl font-bold text-green-600">
                  {currentSemester?.sgpa.toFixed(2) || '-'}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-3xl font-bold text-purple-600">
                  {results.reduce((sum, sem) => sum + sem.earned_credits, 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Semesters</p>
                <p className="text-3xl font-bold text-orange-600">{results.length}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Semester Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Select Semester:</label>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {results.map(result => (
                  <SelectItem key={result.semester} value={result.semester}>
                    {result.semester} ({result.academic_year})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Semester Details */}
      {currentSemester && (
        <>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{currentSemester.semester} - {currentSemester.academic_year}</CardTitle>
                <div className="flex items-center gap-4">
                  <Badge className={getGradeColor('A')}>
                    SGPA: {currentSemester.sgpa.toFixed(2)}
                  </Badge>
                  <Badge variant="outline">
                    {currentSemester.earned_credits}/{currentSemester.total_credits} Credits
                  </Badge>
                  {currentSemester.published_date && (
                    <span className="text-sm text-gray-600">
                      Published: {new Date(currentSemester.published_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-3 text-left">Course Code</th>
                      <th className="border border-gray-300 p-3 text-left">Course Name</th>
                      <th className="border border-gray-300 p-3 text-center">Credits</th>
                      <th className="border border-gray-300 p-3 text-center">ISA-1</th>
                      <th className="border border-gray-300 p-3 text-center">ISA-2</th>
                      <th className="border border-gray-300 p-3 text-center">ESA</th>
                      <th className="border border-gray-300 p-3 text-center">Total</th>
                      <th className="border border-gray-300 p-3 text-center">%</th>
                      <th className="border border-gray-300 p-3 text-center">Grade</th>
                      <th className="border border-gray-300 p-3 text-center">GP</th>
                      <th className="border border-gray-300 p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSemester.courses.map((course, index) => (
                      <tr key={course.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="border border-gray-300 p-3 font-mono text-sm">{course.course_code}</td>
                        <td className="border border-gray-300 p-3">{course.course_name}</td>
                        <td className="border border-gray-300 p-3 text-center">{course.credits}</td>
                        <td className="border border-gray-300 p-3 text-center">
                          {course.isa1_marks !== undefined ? `${course.isa1_marks}/${course.isa1_max}` : '-'}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          {course.isa2_marks !== undefined ? `${course.isa2_marks}/${course.isa2_max}` : '-'}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          {course.esa_marks !== undefined ? `${course.esa_marks}/${course.esa_max}` : '-'}
                        </td>
                        <td className="border border-gray-300 p-3 text-center font-semibold">
                          {course.total_marks}/{course.max_marks}
                        </td>
                        <td className="border border-gray-300 p-3 text-center font-semibold">
                          {course.percentage.toFixed(1)}%
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          <Badge className={getGradeColor(course.grade)}>
                            {course.grade}
                          </Badge>
                        </td>
                        <td className="border border-gray-300 p-3 text-center font-semibold">
                          {course.grade_points}
                        </td>
                        <td className="border border-gray-300 p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {getStatusIcon(course.status)}
                            <span className="capitalize text-sm">{course.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold">
                      <td colSpan={2} className="border border-gray-300 p-3 text-right">Total / SGPA:</td>
                      <td className="border border-gray-300 p-3 text-center">{currentSemester.total_credits}</td>
                      <td colSpan={6} className="border border-gray-300 p-3"></td>
                      <td className="border border-gray-300 p-3 text-center text-lg">
                        {currentSemester.sgpa.toFixed(2)}
                      </td>
                      <td className="border border-gray-300 p-3"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Grading System Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Grading System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <Badge className={getGradeColor('O')}>O</Badge>
                  <p className="text-xs text-gray-600 mt-1">90-100% (10 GP)</p>
                </div>
                <div className="text-center">
                  <Badge className={getGradeColor('A+')}>A+</Badge>
                  <p className="text-xs text-gray-600 mt-1">80-89% (9 GP)</p>
                </div>
                <div className="text-center">
                  <Badge className={getGradeColor('A')}>A</Badge>
                  <p className="text-xs text-gray-600 mt-1">70-79% (8 GP)</p>
                </div>
                <div className="text-center">
                  <Badge className={getGradeColor('B+')}>B+</Badge>
                  <p className="text-xs text-gray-600 mt-1">60-69% (7 GP)</p>
                </div>
                <div className="text-center">
                  <Badge className={getGradeColor('B')}>B</Badge>
                  <p className="text-xs text-gray-600 mt-1">50-59% (6 GP)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
