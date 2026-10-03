/**
 * Data Tables Test Page - Demonstrates advanced table features
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Eye, UserPlus, BookOpen } from 'lucide-react';
import DataTable from '@/components/table/DataTable';
import { TableColumn } from '@/lib/hooks/useTableData';
import { useToast } from '@/lib/toast';

const DataTablesTestPage: React.FC = () => {
  const { toast } = useToast();

  // Sample student data
  const [studentsData] = useState([
    { id: 1, usn: '4NM21CS001', name: 'John Doe', email: 'john.doe@example.com', branch: 'CSE', semester: 5, section: 'A', phone: '9876543210', cgpa: 8.5, status: 'Active', joinDate: '2021-09-01', gender: 'Male', age: 21 },
    { id: 2, usn: '4NM21CS002', name: 'Jane Smith', email: 'jane.smith@example.com', branch: 'CSE', semester: 5, section: 'A', phone: '9876543211', cgpa: 9.0, status: 'Active', joinDate: '2021-09-01', gender: 'Female', age: 20 },
    { id: 3, usn: '4NM21CS003', name: 'Bob Johnson', email: 'bob.johnson@example.com', branch: 'CSE', semester: 5, section: 'B', phone: '9876543212', cgpa: 7.5, status: 'Active', joinDate: '2021-09-01', gender: 'Male', age: 22 },
    { id: 4, usn: '4NM21EC001', name: 'Alice Brown', email: 'alice.brown@example.com', branch: 'ECE', semester: 3, section: 'A', phone: '9876543213', cgpa: 8.8, status: 'Active', joinDate: '2022-09-01', gender: 'Female', age: 19 },
    { id: 5, usn: '4NM21EC002', name: 'Charlie Davis', email: 'charlie.davis@example.com', branch: 'ECE', semester: 3, section: 'A', phone: '9876543214', cgpa: 7.2, status: 'Inactive', joinDate: '2022-09-01', gender: 'Male', age: 20 },
    { id: 6, usn: '4NM21ME001', name: 'Diana Wilson', email: 'diana.wilson@example.com', branch: 'MECH', semester: 7, section: 'A', phone: '9876543215', cgpa: 8.0, status: 'Active', joinDate: '2020-09-01', gender: 'Female', age: 23 },
    { id: 7, usn: '4NM21ME002', name: 'Ethan Miller', email: 'ethan.miller@example.com', branch: 'MECH', semester: 7, section: 'B', phone: '9876543216', cgpa: 6.9, status: 'Active', joinDate: '2020-09-01', gender: 'Male', age: 24 },
    { id: 8, usn: '4NM21CV001', name: 'Fiona Garcia', email: 'fiona.garcia@example.com', branch: 'CIVIL', semester: 1, section: 'A', phone: '9876543217', cgpa: 9.2, status: 'Active', joinDate: '2024-09-01', gender: 'Female', age: 18 },
    { id: 9, usn: '4NM21CV002', name: 'George Rodriguez', email: 'george.rodriguez@example.com', branch: 'CIVIL', semester: 1, section: 'A', phone: '9876543218', cgpa: 8.1, status: 'Active', joinDate: '2024-09-01', gender: 'Male', age: 19 },
    { id: 10, usn: '4NM21IT001', name: 'Hannah Martinez', email: 'hannah.martinez@example.com', branch: 'IT', semester: 6, section: 'A', phone: '9876543219', cgpa: 8.7, status: 'Active', joinDate: '2021-09-01', gender: 'Female', age: 22 }
  ]);

  // Sample course data
  const [coursesData] = useState([
    { id: 1, code: 'CS501', name: 'Design and Analysis of Algorithms', branch: 'CSE', semester: 5, credits: 4, faculty: 'Dr. Smith', examType: 'END_SEM', status: 'Active', startDate: '2024-01-15', endDate: '2024-05-15', enrolled: 45 },
    { id: 2, code: 'CS502', name: 'Computer Networks', branch: 'CSE', semester: 5, credits: 4, faculty: 'Dr. Johnson', examType: 'END_SEM', status: 'Active', startDate: '2024-01-15', endDate: '2024-05-15', enrolled: 42 },
    { id: 3, code: 'CS503', name: 'Database Management Systems', branch: 'CSE', semester: 5, credits: 3, faculty: 'Dr. Brown', examType: 'END_SEM', status: 'Active', startDate: '2024-01-15', endDate: '2024-05-15', enrolled: 48 },
    { id: 4, code: 'EC301', name: 'Analog Electronics', branch: 'ECE', semester: 3, credits: 4, faculty: 'Dr. Davis', examType: 'END_SEM', status: 'Active', startDate: '2024-01-15', endDate: '2024-05-15', enrolled: 38 },
    { id: 5, code: 'EC302', name: 'Digital Electronics', branch: 'ECE', semester: 3, credits: 3, faculty: 'Dr. Wilson', examType: 'END_SEM', status: 'Active', startDate: '2024-01-15', endDate: '2024-05-15', enrolled: 40 },
    { id: 6, code: 'ME701', name: 'Heat Transfer', branch: 'MECH', semester: 7, credits: 4, faculty: 'Dr. Miller', examType: 'END_SEM', status: 'Active', startDate: '2024-01-15', endDate: '2024-05-15', enrolled: 35 },
    { id: 7, code: 'CV101', name: 'Engineering Mechanics', branch: 'CIVIL', semester: 1, credits: 4, faculty: 'Dr. Garcia', examType: 'END_SEM', status: 'Active', startDate: '2024-01-15', endDate: '2024-05-15', enrolled: 50 }
  ]);

  // Define columns for students table
  const studentColumns: TableColumn[] = [
    { 
      key: 'usn', 
      header: 'USN', 
      width: 120,
      render: (value) => <span className="font-mono font-medium">{value}</span>
    },
    { 
      key: 'name', 
      header: 'Name', 
      width: 180,
      render: (value) => <span className="font-medium">{value}</span>
    },
    { 
      key: 'email', 
      header: 'Email', 
      width: 220,
      render: (value) => <span className="text-blue-600">{value}</span>
    },
    { 
      key: 'branch', 
      header: 'Branch', 
      width: 80,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Computer Science', value: 'CSE' },
        { label: 'Electronics', value: 'ECE' },
        { label: 'Mechanical', value: 'MECH' },
        { label: 'Civil', value: 'CIVIL' },
        { label: 'Information Technology', value: 'IT' }
      ],
      render: (value) => (
        <Badge variant={value === 'CSE' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'semester', 
      header: 'Sem', 
      width: 60,
      filterable: true,
      filterType: 'number'
    },
    { 
      key: 'section', 
      header: 'Sec', 
      width: 50,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Section A', value: 'A' },
        { label: 'Section B', value: 'B' }
      ]
    },
    { 
      key: 'cgpa', 
      header: 'CGPA', 
      width: 80,
      filterable: true,
      filterType: 'number',
      render: (value) => (
        <span className={`font-medium ${value >= 8.5 ? 'text-green-600' : value >= 7.5 ? 'text-yellow-600' : 'text-red-600'}`}>
          {value.toFixed(2)}
        </span>
      )
    },
    { 
      key: 'status', 
      header: 'Status', 
      width: 90,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
      ],
      render: (value) => (
        <Badge variant={value === 'Active' ? 'default' : 'destructive'}>
          {value}
        </Badge>
      )
    },
    { 
      key: 'age', 
      header: 'Age', 
      width: 60,
      filterable: true,
      filterType: 'number'
    },
    { 
      key: 'gender', 
      header: 'Gender', 
      width: 80,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Male', value: 'Male' },
        { label: 'Female', value: 'Female' }
      ]
    },
    { 
      key: 'joinDate', 
      header: 'Join Date', 
      width: 120,
      filterable: true,
      filterType: 'date',
      format: (value) => new Date(value).toLocaleDateString()
    }
  ];

  // Define columns for courses table
  const courseColumns: TableColumn[] = [
    { 
      key: 'code', 
      header: 'Code', 
      width: 100,
      render: (value) => <span className="font-mono font-medium">{value}</span>
    },
    { 
      key: 'name', 
      header: 'Course Name', 
      width: 250,
      render: (value) => <span className="font-medium">{value}</span>
    },
    { 
      key: 'branch', 
      header: 'Branch', 
      width: 80,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Computer Science', value: 'CSE' },
        { label: 'Electronics', value: 'ECE' },
        { label: 'Mechanical', value: 'MECH' },
        { label: 'Civil', value: 'CIVIL' }
      ]
    },
    { 
      key: 'semester', 
      header: 'Semester', 
      width: 80,
      filterable: true,
      filterType: 'number'
    },
    { 
      key: 'credits', 
      header: 'Credits', 
      width: 70,
      filterable: true,
      filterType: 'number'
    },
    { 
      key: 'faculty', 
      header: 'Faculty', 
      width: 150
    },
    { 
      key: 'enrolled', 
      header: 'Enrolled', 
      width: 80,
      filterable: true,
      filterType: 'number',
      render: (value) => (
        <Badge variant="outline" className="font-mono">
          {value}
        </Badge>
      )
    },
    { 
      key: 'status', 
      header: 'Status', 
      width: 90,
      filterable: true,
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
      ],
      render: (value) => (
        <Badge variant={value === 'Active' ? 'default' : 'secondary'}>
          {value}
        </Badge>
      )
    }
  ];

  // Action handlers
  const handleStudentAction = (action: string, student: any) => {
    toast({
      title: `${action} Student`,
      description: `${action} action for ${student.name} (${student.usn})`,
      variant: 'default'
    });
  };

  const handleCourseAction = (action: string, course: any) => {
    toast({
      title: `${action} Course`,
      description: `${action} action for ${course.name} (${course.code})`,
      variant: 'default'
    });
  };

  const handleSelectionChange = (selectedItems: any[], type: string) => {
    toast({
      title: 'Selection Changed',
      description: `Selected ${selectedItems.length} ${type}(s)`,
      variant: 'default'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Advanced Data Tables</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive data tables with search, filtering, sorting, and pagination capabilities.
        </p>
      </div>

      <Tabs defaultValue="students" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="features">Feature Demo</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-4">
          <DataTable
            data={studentsData}
            columns={studentColumns}
            title="Student Management"
            description="Manage student records with advanced search, filtering, and bulk operations"
            searchPlaceholder="Search students by name, USN, email..."
            pageSize={5}
            enableGlobalSearch={true}
            enableColumnSearch={false}
            enableFiltering={true}
            enableSorting={true}
            enablePagination={true}
            onSelectionChange={(selected) => handleSelectionChange(selected, 'student')}
            onRowClick={(student) => toast({
              title: 'Student Details',
              description: `Clicked on ${student.name} (${student.usn})`,
              variant: 'default'
            })}
            actions={[
              {
                label: 'View Details',
                onClick: (student) => handleStudentAction('View', student),
                icon: <Eye className="h-4 w-4 mr-2" />
              },
              {
                label: 'Edit',
                onClick: (student) => handleStudentAction('Edit', student),
                icon: <Edit className="h-4 w-4 mr-2" />
              },
              {
                label: 'Delete',
                onClick: (student) => handleStudentAction('Delete', student),
                icon: <Trash2 className="h-4 w-4 mr-2" />,
                variant: 'destructive'
              }
            ]}
          />
        </TabsContent>

        <TabsContent value="courses" className="space-y-4">
          <DataTable
            data={coursesData}
            columns={courseColumns}
            title="Course Management"
            description="Manage course catalog with enrollment tracking and faculty assignments"
            searchPlaceholder="Search courses by code, name, faculty..."
            pageSize={6}
            enableGlobalSearch={true}
            enableColumnSearch={false}
            enableFiltering={true}
            enableSorting={true}
            enablePagination={true}
            onSelectionChange={(selected) => handleSelectionChange(selected, 'course')}
            onRowClick={(course) => toast({
              title: 'Course Details',
              description: `Clicked on ${course.name} (${course.code})`,
              variant: 'default'
            })}
            actions={[
              {
                label: 'View Enrollment',
                onClick: (course) => handleCourseAction('View Enrollment', course),
                icon: <UserPlus className="h-4 w-4 mr-2" />
              },
              {
                label: 'Edit Course',
                onClick: (course) => handleCourseAction('Edit', course),
                icon: <Edit className="h-4 w-4 mr-2" />
              },
              {
                label: 'Course Details',
                onClick: (course) => handleCourseAction('Details', course),
                icon: <BookOpen className="h-4 w-4 mr-2" />
              }
            ]}
          />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <div className="grid gap-6">
            {/* Feature Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Table Features Demonstration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔍 Global Search</h4>
                    <p className="text-sm text-gray-600">
                      Search across all searchable columns simultaneously
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🔽 Column Sorting</h4>
                    <p className="text-sm text-gray-600">
                      Click column headers to sort ascending/descending
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">🎛️ Advanced Filtering</h4>
                    <p className="text-sm text-gray-600">
                      Multiple filter types: text, number, select, date
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">📄 Pagination</h4>
                    <p className="text-sm text-gray-600">
                      Configurable page sizes with navigation controls
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">✅ Row Selection</h4>
                    <p className="text-sm text-gray-600">
                      Single and bulk selection with callbacks
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">⚡ Actions Menu</h4>
                    <p className="text-sm text-gray-600">
                      Context-specific actions for each row
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compact Table Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Compact View Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={studentsData.slice(0, 3)}
                  columns={[
                    { key: 'usn', header: 'USN', width: 120 },
                    { key: 'name', header: 'Name', width: 150 },
                    { key: 'branch', header: 'Branch', width: 80 },
                    { key: 'cgpa', header: 'CGPA', width: 80, format: (value) => value.toFixed(2) },
                    { key: 'status', header: 'Status', width: 90 }
                  ]}
                  pageSize={3}
                  enableGlobalSearch={false}
                  enableFiltering={false}
                  enablePagination={false}
                  className="border-0"
                />
              </CardContent>
            </Card>

            {/* Loading State Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Loading State Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={[]}
                  columns={studentColumns.slice(0, 4)}
                  loading={true}
                  loadingMessage="Fetching student data..."
                />
              </CardContent>
            </Card>

            {/* Empty State Demo */}
            <Card>
              <CardHeader>
                <CardTitle>Empty State Demo</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={[]}
                  columns={courseColumns.slice(0, 4)}
                  emptyMessage="No courses found. Add some courses to get started."
                  enableGlobalSearch={false}
                  enableFiltering={false}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataTablesTestPage;