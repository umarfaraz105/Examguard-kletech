'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { plansAPI, enginesAPI, schedulesAPI, coursesAPI } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function PlanDetailPage() {
  const params = useParams();
  const planId = parseInt(params.id as string);
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const router = useRouter();
  
  const [plan, setPlan] = useState<any>(null);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [validation, setValidation] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const fetchPlanData = useCallback(async () => {
    try {
      const [planRes, schedulesRes, coursesRes] = await Promise.all([
        plansAPI.get(planId),
        schedulesAPI.list(planId),
        coursesAPI.list(),
      ]);
      setPlan(planRes.data);
      setSchedules(schedulesRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      console.error('Error fetching plan data:', error);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlanData();
    }
  }, [isAuthenticated, fetchPlanData]);

  const handleGenerateSchedule = async () => {
    if (selectedCourses.length === 0) {
      setMessage({ type: 'error', text: 'Please select courses to schedule' });
      return;
    }

    setProcessing(true);
    setMessage(null);
    
    try {
      const response = await enginesAPI.generateSchedule({
        plan_id: planId,
        course_ids: selectedCourses,
        timeout_seconds: 60,
      });
      setMessage({ type: 'success', text: response.data.message });
      await fetchPlanData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to generate schedule' });
    } finally {
      setProcessing(false);
    }
  };

  const handleAllocateRooms = async (examId: number) => {
    setProcessing(true);
    try {
      const response = await enginesAPI.allocateRooms(examId);
      setMessage({ type: 'success', text: response.data.message });
      await fetchPlanData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to allocate rooms' });
    } finally {
      setProcessing(false);
    }
  };

  const handleAllocateSeats = async (examId: number) => {
    setProcessing(true);
    try {
      const response = await enginesAPI.allocateSeats(examId);
      setMessage({ type: 'success', text: response.data.message });
      await fetchPlanData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to allocate seats' });
    } finally {
      setProcessing(false);
    }
  };

  const handleAssignInvigilators = async (examId: number) => {
    setProcessing(true);
    try {
      const response = await enginesAPI.assignInvigilators(examId);
      setMessage({ type: 'success', text: response.data.message });
      await fetchPlanData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to assign invigilators' });
    } finally {
      setProcessing(false);
    }
  };

  const handleValidate = async () => {
    setProcessing(true);
    try {
      const response = await enginesAPI.validatePlan(planId);
      setValidation(response.data);
      setMessage({ type: 'success', text: `Validation complete. Score: ${response.data.compliance_score.toFixed(1)}% (${response.data.grade})` });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Validation failed' });
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    try {
      await plansAPI.approve(planId);
      setMessage({ type: 'success', text: 'Plan approved successfully' });
      await fetchPlanData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to approve plan' });
    }
  };

  const handlePublish = async () => {
    try {
      await plansAPI.publish(planId);
      setMessage({ type: 'success', text: 'Plan published successfully' });
      await fetchPlanData();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.response?.data?.detail || 'Failed to publish plan' });
    }
  };

  if (authLoading || !isAuthenticated || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!plan) {
    return <div>Plan not found</div>;
  }

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-800',
    PENDING_APPROVAL: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    PUBLISHED: 'bg-blue-100 text-blue-800',
    ARCHIVED: 'bg-gray-100 text-gray-600',
  };

  const canModify = (user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && plan.status !== 'PUBLISHED';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button onClick={() => router.back()} className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4">
            ← Back to Plans
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
              <p className="text-gray-600 mt-1">{plan.description}</p>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${statusColors[plan.status as keyof typeof statusColors]}`}>
              {plan.status}
            </span>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'kle-status-success' : 'bg-primary-light border border-primary text-primary'}`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card title="Plan Details">
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Exam Type</dt>
                <dd className="text-sm text-gray-900">{plan.exam_type}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Academic Year</dt>
                <dd className="text-sm text-gray-900">{plan.academic_year}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Duration</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(plan.start_date).toLocaleDateString()} - {new Date(plan.end_date).toLocaleDateString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Version</dt>
                <dd className="text-sm text-gray-900">v{plan.version}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Statistics">
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Scheduled Exams</dt>
                <dd className="text-2xl font-bold text-gray-900">{plan.scheduled_exams_count || 0}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Seat Assignments</dt>
                <dd className="text-2xl font-bold text-gray-900">{plan.seat_assignments_count || 0}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Invigilators Assigned</dt>
                <dd className="text-2xl font-bold text-gray-900">{plan.invigilator_assignments_count || 0}</dd>
              </div>
            </dl>
          </Card>

          <Card title="Workflow Actions">
            <div className="space-y-2">
              {plan.status === 'DRAFT' && canModify && (
                <Button variant="success" className="w-full" onClick={handleValidate} disabled={processing}>
                  Validate Plan
                </Button>
              )}
              {plan.status === 'PENDING_APPROVAL' && (user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
                <Button variant="success" className="w-full" onClick={handleApprove}>
                  Approve Plan
                </Button>
              )}
              {plan.status === 'APPROVED' && (user?.role === 'ADMIN' || user?.role === 'EXAM_CELL') && (
                <Button variant="primary" className="w-full" onClick={handlePublish}>
                  Publish Plan
                </Button>
              )}
              {validation && (
                <div className="mt-4 p-3 bg-primary-light rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary">Compliance Score</p>
                  <p className="text-3xl font-bold text-primary">{validation.compliance_score.toFixed(1)}%</p>
                  <p className="text-sm text-text">Grade: {validation.grade}</p>
                  <p className="text-xs text-text-muted mt-2">{validation.total_issues} issues found</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {canModify && schedules.length === 0 && (
          <Card title="Step 1: Generate Schedule" className="mb-6">
            <p className="text-sm text-gray-600 mb-4">Select courses to include in the exam schedule:</p>
            <div className="max-h-60 overflow-y-auto mb-4 border rounded-lg">
              {courses.map((course) => (
                <label key={course.id} className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedCourses.includes(course.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCourses([...selectedCourses, course.id]);
                      } else {
                        setSelectedCourses(selectedCourses.filter(id => id !== course.id));
                      }
                    }}
                    className="mr-3"
                  />
                  <span className="text-sm">{course.code} - {course.name} ({course.branch}, Sem {course.semester})</span>
                </label>
              ))}
            </div>
            <Button
              variant="primary"
              onClick={handleGenerateSchedule}
              disabled={processing || selectedCourses.length === 0}
              loading={processing}
            >
              Generate Schedule (Engine 1)
            </Button>
          </Card>
        )}

        {schedules.length > 0 && (
          <Card title="Scheduled Exams" className="mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    {canModify && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedules.map((exam) => (
                    <tr key={exam.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{exam.course_id}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(exam.exam_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{exam.session}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(exam.start_time).toLocaleTimeString()} - {new Date(exam.end_time).toLocaleTimeString()}
                      </td>
                      {canModify && (
                        <td className="px-4 py-3 text-sm space-x-2">
                          <button onClick={() => handleAllocateRooms(exam.id)} className="text-blue-600 hover:text-blue-800 text-xs" disabled={processing}>
                            Rooms
                          </button>
                          <button onClick={() => handleAllocateSeats(exam.id)} className="text-blue-600 hover:text-blue-800 text-xs" disabled={processing}>
                            Seats
                          </button>
                          <button onClick={() => handleAssignInvigilators(exam.id)} className="text-blue-600 hover:text-blue-800 text-xs" disabled={processing}>
                            Invigilators
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
