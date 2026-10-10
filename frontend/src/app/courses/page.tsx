'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { coursesAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

interface Course {
  id: number;
  course_code: string;
  course_name: string;
  exam_type: string;
  branch: string;
  semester: number;
  credits: number;
  enrolled_students_count?: number;
  created_at: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    course_code: '',
    course_name: '',
    exam_type: 'ISA1',
    branch: '',
    semester: 1,
    credits: 3,
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.list();
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await coursesAPI.create(formData);
      setShowForm(false);
      setFormData({
        course_code: '',
        course_name: '',
        exam_type: 'ISA1',
        branch: '',
        semester: 1,
        credits: 3,
      });
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create course');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    
    try {
      await coursesAPI.delete(id);
      fetchCourses();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading courses...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600 mt-1">Manage examination courses</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Course'}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Course</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Course Code"
                value={formData.course_code}
                onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                placeholder="CS101"
                required
              />
              <Input
                label="Course Name"
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                placeholder="Data Structures"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Type
                </label>
                <select
                  value={formData.exam_type}
                  onChange={(e) => setFormData({ ...formData, exam_type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="ISA1">ISA-1</option>
                  <option value="ISA2">ISA-2</option>
                  <option value="ESA">ESA</option>
                </select>
              </div>
              <Input
                label="Branch"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="CSE"
                required
              />
              <Input
                label="Semester"
                type="number"
                min="1"
                max="8"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) })}
                required
              />
              <Input
                label="Credits"
                type="number"
                min="1"
                max="6"
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Course</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {courses.length === 0 ? (
          <Card>
            <p className="text-center text-gray-600 py-8">
              No courses found. Add your first course to get started.
            </p>
          </Card>
        ) : (
          courses.map((course) => (
            <Card key={course.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.course_code}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium bg-primary-light text-primary rounded">
                      {course.exam_type}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      Sem {course.semester}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{course.course_name}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-500">
                    <span>Branch: {course.branch}</span>
                    <span>Credits: {course.credits}</span>
                    {course.enrolled_students_count !== undefined && (
                      <span>Students: {course.enrolled_students_count}</span>
                    )}
                  </div>
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(course.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
