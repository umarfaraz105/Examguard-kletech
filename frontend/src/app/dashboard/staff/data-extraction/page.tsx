'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/lib/api';

interface ExtractionData {
  statistics: {
    total_students: number;
    total_courses: number;
    total_enrollments: number;
    avg_courses_per_student: number;
    avg_students_per_course: number;
    largest_course: string;
    largest_course_size: number;
  };
  conflicts: Array<{
    course1: string;
    course2: string;
    course1_name: string;
    course2_name: string;
    student_count: number;
    common_students: string[];
  }>;
  courses_by_department: Record<string, string[]>;
  courses_by_semester: Record<string, string[]>;
}

export default function DataExtractionPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ExtractionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'EXAM_CELL' && user?.role !== 'ADMIN')) {
      router.push('/login/staff');
    } else {
      loadExtractionData();
    }
  }, [isAuthenticated, user, router]);

  const loadExtractionData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/data-extraction/all/extract`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load extraction data');
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || (user?.role !== 'EXAM_CELL' && user?.role !== 'ADMIN')) {
    return <div>Redirecting...</div>;
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">Loading extraction data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 mb-4">
          <p className="text-red-800">{error}</p>
        </div>
        <Button onClick={loadExtractionData}>Retry</Button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-text-muted">No data available</p>
          <Button onClick={loadExtractionData} className="mt-4">
            Load Data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text">Data Extraction & Analysis</h1>
        <p className="text-text-muted">
          Student-course matrix and conflict detection for scheduling
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <p className="text-text-muted text-sm mb-2">Total Students</p>
          <p className="text-3xl font-bold text-text">{data.statistics.total_students}</p>
        </Card>

        <Card>
          <p className="text-text-muted text-sm mb-2">Total Courses</p>
          <p className="text-3xl font-bold text-text">{data.statistics.total_courses}</p>
        </Card>

        <Card>
          <p className="text-text-muted text-sm mb-2">Total Enrollments</p>
          <p className="text-3xl font-bold text-text">{data.statistics.total_enrollments}</p>
        </Card>

        <Card>
          <p className="text-text-muted text-sm mb-2">Scheduling Conflicts</p>
          <p className="text-3xl font-bold text-red-600">{data.conflicts.length}</p>
        </Card>
      </div>

      {/* Averages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="font-semibold text-text mb-3">Average Load</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-muted">Courses per Student:</span>
              <span className="font-semibold text-text">
                {data.statistics.avg_courses_per_student.toFixed(1)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Students per Course:</span>
              <span className="font-semibold text-text">
                {data.statistics.avg_students_per_course.toFixed(1)}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-text mb-3">Largest Course</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-text-muted">Course Code:</span>
              <span className="font-semibold text-text">
                {data.statistics.largest_course || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Student Count:</span>
              <span className="font-semibold text-text">
                {data.statistics.largest_course_size}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Conflicts Section */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text">⚠️ Scheduling Conflicts</h2>
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            {data.conflicts.length} conflicts
          </span>
        </div>

        {data.conflicts.length === 0 ? (
          <p className="text-center py-8 text-text-muted">
            ✅ No scheduling conflicts detected! All courses can be scheduled independently.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-3 text-text font-semibold">Course 1</th>
                  <th className="text-left py-2 px-3 text-text font-semibold">Course 2</th>
                  <th className="text-right py-2 px-3 text-text font-semibold">
                    Conflicting Students
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.conflicts.slice(0, 20).map((conflict, idx) => (
                  <tr key={idx} className="border-b border-border hover:bg-gray-50">
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-semibold text-text">{conflict.course1}</p>
                        <p className="text-xs text-text-muted">{conflict.course1_name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <div>
                        <p className="font-semibold text-text">{conflict.course2}</p>
                        <p className="text-xs text-text-muted">{conflict.course2_name}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                        {conflict.student_count} students
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {data.conflicts.length > 20 && (
              <p className="text-center py-4 text-text-muted text-sm">
                Showing top 20 of {data.conflicts.length} conflicts
              </p>
            )}
          </div>
        )}
      </Card>

      {/* Courses by Department */}
      <Card>
        <h2 className="text-xl font-bold text-text mb-6">📚 Courses by Department</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data.courses_by_department).map(([dept, courses]) => (
            <div key={dept} className="p-4 bg-gray-50 rounded-lg border border-border">
              <p className="font-semibold text-text mb-2">{dept}</p>
              <p className="text-2xl font-bold text-primary">{courses.length}</p>
              <p className="text-xs text-text-muted">courses</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Courses by Semester */}
      <Card>
        <h2 className="text-xl font-bold text-text mb-6">📅 Courses by Semester</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(data.courses_by_semester)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([sem, courses]) => (
              <div key={sem} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="font-semibold text-text mb-2">Semester {sem}</p>
                <p className="text-2xl font-bold text-blue-600">{courses.length}</p>
                <p className="text-xs text-text-muted">courses</p>
              </div>
            ))}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={loadExtractionData}>🔄 Refresh Data</Button>
        <Button
          variant="secondary"
          onClick={() => router.push('/dashboard/staff')}
        >
          ← Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
