import { http, HttpResponse } from 'msw';
import {
  mockAdminUser,
  mockFacultyUser,
  mockStudentUser,
  mockLoginResponse,
  mockCourse,
  mockCourse2,
  mockStudent,
  mockStudent2,
  mockRoom,
  mockRoom2,
  mockPlan,
  mockApprovedPlan,
  mockSchedule,
  mockSeatAssignment,
  mockInvigilatorAvailability,
  mockInvigilatorAssignment,
  mockRule,
  mockEngine,
  mockEngine2,
  mockExecutionResponse,
  mockExecutionStatus,
  mockExtractionResult,
  mockConflictCheck,
} from './mock-data';

const API_URL = 'http://localhost:8000';

export const handlers = [
  // ============================================================================
  // Auth endpoints
  // ============================================================================
  http.post(`${API_URL}/api/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    // Simulate invalid credentials
    if (body.email === 'invalid@example.com') {
      return HttpResponse.json(
        { detail: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json(mockLoginResponse);
  }),

  http.get(`${API_URL}/api/auth/me`, () => {
    return HttpResponse.json(mockAdminUser);
  }),

  http.post(`${API_URL}/api/auth/register`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockAdminUser,
      ...(body as any),
      id: 999,
    }, { status: 201 });
  }),

  http.post(`${API_URL}/api/auth/change-password`, () => {
    return HttpResponse.json({ message: 'Password changed successfully' });
  }),

  // ============================================================================
  // Users endpoints
  // ============================================================================
  http.get(`${API_URL}/api/users`, ({ request }) => {
    const url = new URL(request.url);
    const role = url.searchParams.get('role');
    
    const users = [mockAdminUser, mockFacultyUser, mockStudentUser];
    
    if (role) {
      return HttpResponse.json(users.filter(u => u.role === role));
    }
    
    return HttpResponse.json(users);
  }),

  http.get(`${API_URL}/api/users/:id`, ({ params }) => {
    const { id } = params;
    if (id === '1') return HttpResponse.json(mockAdminUser);
    if (id === '2') return HttpResponse.json(mockFacultyUser);
    if (id === '3') return HttpResponse.json(mockStudentUser);
    return HttpResponse.json({ detail: 'User not found' }, { status: 404 });
  }),

  http.post(`${API_URL}/api/users`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockAdminUser,
      ...(body as any),
      id: 999,
    }, { status: 201 });
  }),

  http.patch(`${API_URL}/api/users/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockAdminUser,
      ...(body as any),
      id: Number(params.id),
    });
  }),

  http.delete(`${API_URL}/api/users/:id`, () => {
    return HttpResponse.json({ message: 'User deleted' }, { status: 204 });
  }),

  // ============================================================================
  // Plans endpoints
  // ============================================================================
  http.get(`${API_URL}/api/plans`, ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    
    const plans = [mockPlan, mockApprovedPlan];
    
    if (status) {
      return HttpResponse.json(plans.filter(p => p.status === status));
    }
    
    return HttpResponse.json(plans);
  }),

  http.get(`${API_URL}/api/plans/:id`, ({ params }) => {
    const { id } = params;
    if (id === '1') return HttpResponse.json(mockPlan);
    if (id === '2') return HttpResponse.json(mockApprovedPlan);
    return HttpResponse.json({ detail: 'Plan not found' }, { status: 404 });
  }),

  http.post(`${API_URL}/api/plans`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockPlan,
      ...(body as any),
      id: 999,
    }, { status: 201 });
  }),

  http.patch(`${API_URL}/api/plans/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockPlan,
      ...(body as any),
      id: Number(params.id),
    });
  }),

  http.post(`${API_URL}/api/plans/:id/approve`, ({ params }) => {
    return HttpResponse.json({
      ...mockPlan,
      id: Number(params.id),
      status: 'approved',
      approved_at: new Date().toISOString(),
    });
  }),

  http.post(`${API_URL}/api/plans/:id/publish`, ({ params }) => {
    return HttpResponse.json({
      ...mockPlan,
      id: Number(params.id),
      status: 'published',
      published_at: new Date().toISOString(),
    });
  }),

  http.delete(`${API_URL}/api/plans/:id`, () => {
    return HttpResponse.json({ message: 'Plan deleted' }, { status: 204 });
  }),

  // ============================================================================
  // Courses endpoints
  // ============================================================================
  http.get(`${API_URL}/api/courses`, ({ request }) => {
    const url = new URL(request.url);
    const branch = url.searchParams.get('branch');
    const semester = url.searchParams.get('semester');
    
    let courses = [mockCourse, mockCourse2];
    
    if (branch) {
      courses = courses.filter(c => c.branch === branch);
    }
    if (semester) {
      courses = courses.filter(c => c.semester === Number(semester));
    }
    
    return HttpResponse.json(courses);
  }),

  http.get(`${API_URL}/api/courses/:id`, ({ params }) => {
    const { id } = params;
    if (id === '1') return HttpResponse.json(mockCourse);
    if (id === '2') return HttpResponse.json(mockCourse2);
    return HttpResponse.json({ detail: 'Course not found' }, { status: 404 });
  }),

  http.post(`${API_URL}/api/courses`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockCourse,
      ...(body as any),
      id: 999,
    }, { status: 201 });
  }),

  http.patch(`${API_URL}/api/courses/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockCourse,
      ...(body as any),
      id: Number(params.id),
    });
  }),

  http.delete(`${API_URL}/api/courses/:id`, () => {
    return HttpResponse.json({ message: 'Course deleted' }, { status: 204 });
  }),

  // ============================================================================
  // Students endpoints
  // ============================================================================
  http.get(`${API_URL}/api/students`, ({ request }) => {
    const url = new URL(request.url);
    const branch = url.searchParams.get('branch');
    const semester = url.searchParams.get('semester');
    
    let students = [mockStudent, mockStudent2];
    
    if (branch) {
      students = students.filter(s => s.branch === branch);
    }
    if (semester) {
      students = students.filter(s => s.semester === Number(semester));
    }
    
    return HttpResponse.json(students);
  }),

  http.get(`${API_URL}/api/students/:id`, ({ params }) => {
    const { id } = params;
    if (id === '1') return HttpResponse.json(mockStudent);
    if (id === '2') return HttpResponse.json(mockStudent2);
    return HttpResponse.json({ detail: 'Student not found' }, { status: 404 });
  }),

  http.post(`${API_URL}/api/students`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockStudent,
      ...(body as any),
      id: 999,
    }, { status: 201 });
  }),

  http.patch(`${API_URL}/api/students/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockStudent,
      ...(body as any),
      id: Number(params.id),
    });
  }),

  http.post(`${API_URL}/api/students/:id/enroll`, () => {
    return HttpResponse.json({ message: 'Student enrolled successfully' });
  }),

  http.delete(`${API_URL}/api/students/:id`, () => {
    return HttpResponse.json({ message: 'Student deleted' }, { status: 204 });
  }),

  // ============================================================================
  // Rooms endpoints
  // ============================================================================
  http.get(`${API_URL}/api/rooms`, () => {
    return HttpResponse.json([mockRoom, mockRoom2]);
  }),

  http.get(`${API_URL}/api/rooms/:id`, ({ params }) => {
    const { id } = params;
    if (id === '1') return HttpResponse.json(mockRoom);
    if (id === '2') return HttpResponse.json(mockRoom2);
    return HttpResponse.json({ detail: 'Room not found' }, { status: 404 });
  }),

  http.post(`${API_URL}/api/rooms`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockRoom,
      ...(body as any),
      id: 999,
    }, { status: 201 });
  }),

  http.patch(`${API_URL}/api/rooms/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockRoom,
      ...(body as any),
      id: Number(params.id),
    });
  }),

  http.delete(`${API_URL}/api/rooms/:id`, () => {
    return HttpResponse.json({ message: 'Room deleted' }, { status: 204 });
  }),

  // ============================================================================
  // Schedules endpoints
  // ============================================================================
  http.get(`${API_URL}/api/schedules`, () => {
    return HttpResponse.json([mockSchedule]);
  }),

  http.get(`${API_URL}/api/schedules/:id`, ({ params }) => {
    if (params.id === '1') return HttpResponse.json(mockSchedule);
    return HttpResponse.json({ detail: 'Schedule not found' }, { status: 404 });
  }),

  // ============================================================================
  // Seating endpoints
  // ============================================================================
  http.get(`${API_URL}/api/seating`, () => {
    return HttpResponse.json([mockSeatAssignment]);
  }),

  http.get(`${API_URL}/api/seating/:id`, ({ params }) => {
    if (params.id === '1') return HttpResponse.json(mockSeatAssignment);
    return HttpResponse.json({ detail: 'Seat assignment not found' }, { status: 404 });
  }),

  // ============================================================================
  // Invigilators endpoints
  // ============================================================================
  http.get(`${API_URL}/api/invigilators/availability`, () => {
    return HttpResponse.json([mockInvigilatorAvailability]);
  }),

  http.post(`${API_URL}/api/invigilators/availability`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockInvigilatorAvailability,
      ...(body as any),
      id: 999,
    }, { status: 201 });
  }),

  http.get(`${API_URL}/api/invigilators/assignments`, () => {
    return HttpResponse.json([mockInvigilatorAssignment]);
  }),

  http.post(`${API_URL}/api/invigilators/assignments/:id/confirm`, () => {
    return HttpResponse.json({ message: 'Assignment confirmed' });
  }),

  // ============================================================================
  // Rules endpoints
  // ============================================================================
  http.get(`${API_URL}/api/rules`, () => {
    return HttpResponse.json([mockRule]);
  }),

  http.post(`${API_URL}/api/rules`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockRule,
      ...(body as any),
      id: 999,
    }, { status: 201 });
  }),

  // ============================================================================
  // Engines v2 endpoints
  // ============================================================================
  http.get(`${API_URL}/api/engines/v2/`, () => {
    return HttpResponse.json([mockEngine, mockEngine2]);
  }),

  http.get(`${API_URL}/api/engines/v2/:engineName`, ({ params }) => {
    if (params.engineName === 'scheduling-engine') {
      return HttpResponse.json(mockEngine);
    }
    if (params.engineName === 'seating-engine') {
      return HttpResponse.json(mockEngine2);
    }
    return HttpResponse.json({ detail: 'Engine not found' }, { status: 404 });
  }),

  http.post(`${API_URL}/api/engines/v2/:engineName/execute`, () => {
    return HttpResponse.json(mockExecutionResponse, { status: 202 });
  }),

  http.get(`${API_URL}/api/engines/v2/:engineName/status/:executionId`, () => {
    return HttpResponse.json(mockExecutionStatus);
  }),

  // ============================================================================
  // Data Extraction endpoints
  // ============================================================================
  http.post(`${API_URL}/api/data-extraction/courses`, () => {
    return HttpResponse.json(mockExtractionResult);
  }),

  http.post(`${API_URL}/api/data-extraction/students`, () => {
    return HttpResponse.json(mockExtractionResult);
  }),

  http.post(`${API_URL}/api/data-extraction/rooms`, () => {
    return HttpResponse.json(mockExtractionResult);
  }),

  http.post(`${API_URL}/api/data-extraction/check-conflicts`, () => {
    return HttpResponse.json(mockConflictCheck);
  }),
];
