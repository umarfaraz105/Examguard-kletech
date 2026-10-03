'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { studentsAPI } from '@/lib/api';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';

interface Student {
  id: number;
  usn: string;
  full_name: string;
  email: string;
  branch: string;
  semester: number;
  section?: string;
  enrolled_courses_count?: number;
  created_at: string;
}

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    usn: '',
    full_name: '',
    email: '',
    branch: '',
    semester: 1,
    section: '',
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.list();
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await studentsAPI.create(formData);
      setShowForm(false);
      setFormData({
        usn: '',
        full_name: '',
        email: '',
        branch: '',
        semester: 1,
        section: '',
      });
      fetchStudents();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to create student');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    
    try {
      await studentsAPI.delete(id);
      fetchStudents();
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Failed to delete student');
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.usn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.branch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-1">Manage student records</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Student'}
          </Button>
        )}
      </div>

      <div className="mb-6">
        <Input
          placeholder="Search by USN, name, or branch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="USN"
                value={formData.usn}
                onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                placeholder="4NI21CS123"
                required
              />
              <Input
                label="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="John Doe"
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john.doe@example.com"
                required
              />
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
                label="Section (Optional)"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="A"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Student</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredStudents.length === 0 ? (
          <Card>
            <p className="text-center text-gray-600 py-8">
              {searchTerm
                ? 'No students found matching your search.'
                : 'No students found. Add your first student to get started.'}
            </p>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{student.usn}</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-primary-light text-primary rounded">
                      {student.branch}
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                      Sem {student.semester}
                    </span>
                    {student.section && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                        Sec {student.section}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-900 mt-1 font-medium">{student.full_name}</p>
                  <p className="text-gray-600 text-sm">{student.email}</p>
                  {student.enrolled_courses_count !== undefined && (
                    <p className="text-sm text-gray-500 mt-1">
                      Enrolled in {student.enrolled_courses_count} course(s)
                    </p>
                  )}
                </div>
                {(user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDelete(student.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {filteredStudents.length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing {filteredStudents.length} of {students.length} students
        </div>
      )}
    </div>
  );
}
