'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { UserCheck, Users, Play, AlertCircle, Mail, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScheduledExam {
  id: number;
  course_code: string;
  course_name: string;
  date: string;
  session: string;
  room: string;
  student_count: number;
}

interface Faculty {
  id: number;
  name: string;
  email: string;
  department: string;
  current_workload: number;
}

interface InvigilatorResult {
  invigilator_assignments?: {
    results: Record<string, {
      success: boolean;
      assignments: Array<{
        faculty_id: number;
        faculty_name: string;
        role: string;
        workload_points: number;
      }>;
      warnings: string[];
    }>;
    summary: {
      total_exams: number;
      successful: number;
      failed: number;
      total_assignments: number;
    };
  };
  eligibility_check?: Record<string, {
    total_faculty: number;
    fully_eligible: number;
    with_warnings: number;
    ineligible: number;
    faculty_details: any[];
  }>;
  workload_analysis?: {
    faculty_workloads: Record<string, any>;
    statistics: {
      average_workload: number;
      max_workload: number;
      min_workload: number;
    };
  };
}
export default function Engine3Invigilator() {
  const [scheduledExams, setScheduledExams] = useState<ScheduledExam[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<InvigilatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    scheduled_exam_ids: [] as number[],
    exam_type: 'MID_TERM',
    operation: 'assign_invigilators',
    include_relief: true,
    include_reserve: true,
    department_filter: ''
  });

  useEffect(() => {
    fetchScheduledExams();
    fetchFaculty();
  }, []);

  const fetchScheduledExams = async () => {
    try {
      const response = await fetch('/api/schedules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setScheduledExams(data);
      }
    } catch (error) {
      console.error('Error fetching scheduled exams:', error);
    }
  };

  const fetchFaculty = async () => {
    try {
      const response = await fetch('/api/invigilators', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFaculty(data);
      }
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const handleExecute = async () => {
    if (formData.scheduled_exam_ids.length === 0) {
      setError('Please select at least one scheduled exam');
      return;
    }

    setExecuting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/engines/v2/engine3-invigilator/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          input_data: {
            scheduled_exam_ids: formData.scheduled_exam_ids,
            exam_type: formData.exam_type,
            operation: formData.operation,
            include_relief: formData.include_relief,
            include_reserve: formData.include_reserve,
            department_filter: formData.department_filter || undefined
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to execute invigilator engine');
      }

      const executionResponse = await response.json();
      
      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/engines/v2/engine3-invigilator/status/${executionResponse.execution_id}`,
            {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
              }
            }
          );
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            
            if (statusData.status === 'COMPLETED') {
              clearInterval(pollInterval);
              setResult(statusData.result_data);
              setExecuting(false);
            } else if (statusData.status === 'FAILED') {
              clearInterval(pollInterval);
              setError(statusData.error_message || 'Engine execution failed');
              setExecuting(false);
            }
          }
        } catch (pollError) {
          console.error('Polling error:', pollError);
        }
      }, 2000);

      setTimeout(() => {
        clearInterval(pollInterval);
        if (executing) {
          setExecuting(false);
          setError('Execution timeout - check engine status manually');
        }
      }, 120000);

    } catch (error) {
      setExecuting(false);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  const toggleExam = (examId: number) => {
    setFormData(prev => ({
      ...prev,
      scheduled_exam_ids: prev.scheduled_exam_ids.includes(examId)
        ? prev.scheduled_exam_ids.filter(id => id !== examId)
        : [...prev.scheduled_exam_ids, examId]
    }));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'PRIMARY':
        return 'bg-blue-100 text-blue-800';
      case 'RELIEF':
        return 'bg-green-100 text-green-800';
      case 'RESERVE':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Engine 3: Intelligent Invigilator Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Exam Type</Label>
              <Select value={formData.exam_type} onValueChange={(value) => setFormData(prev => ({ ...prev, exam_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MID_TERM">Mid Term</SelectItem>
                  <SelectItem value="END_TERM">End Term</SelectItem>
                  <SelectItem value="INTERNAL">Internal</SelectItem>
                  <SelectItem value="EXTERNAL">External</SelectItem>
                  <SelectItem value="MAKEUP">Makeup</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Operation Type</Label>
              <Select value={formData.operation} onValueChange={(value) => setFormData(prev => ({ ...prev, operation: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assign_invigilators">Assign Invigilators</SelectItem>
                  <SelectItem value="check_eligibility">Check Eligibility</SelectItem>
                  <SelectItem value="balance_workload">Balance Workload</SelectItem>
                  <SelectItem value="send_notifications">Send Notifications</SelectItem>
                  <SelectItem value="bulk_assign">Bulk Assignment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department_filter">Department Filter (Optional)</Label>
              <Input
                id="department_filter"
                value={formData.department_filter}
                onChange={(e) => setFormData(prev => ({ ...prev, department_filter: e.target.value }))}
                placeholder="e.g., CSE, ECE"
              />
            </div>
          </div>

          {/* Assignment Options */}
          <div className="border-t pt-4">
            <Label className="text-base font-medium mb-3 block">Assignment Options</Label>
            <div className="flex gap-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_relief"
                  checked={formData.include_relief}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_relief: !!checked }))}
                />
                <label htmlFor="include_relief" className="text-sm cursor-pointer">
                  Include Relief Invigilators
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include_reserve"
                  checked={formData.include_reserve}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, include_reserve: !!checked }))}
                />
                <label htmlFor="include_reserve" className="text-sm cursor-pointer">
                  Include Reserve Invigilators
                </label>
              </div>
            </div>
          </div>

          {/* Scheduled Exam Selection */}
          <div>
            <Label>Select Scheduled Exams</Label>
            <div className="max-h-48 overflow-y-auto border rounded-lg p-4 space-y-2">
              {scheduledExams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`exam-${exam.id}`}
                      checked={formData.scheduled_exam_ids.includes(exam.id)}
                      onCheckedChange={() => toggleExam(exam.id)}
                    />
                    <div className="text-sm">
                      <div className="font-medium">{exam.course_code} - {exam.course_name}</div>
                      <div className="text-gray-600">
                        {new Date(exam.date).toLocaleDateString()} • {exam.session} • {exam.room}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {exam.student_count}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Selected: {formData.scheduled_exam_ids.length} exams
            </p>
          </div>

          <Button
            onClick={handleExecute}
            disabled={executing || formData.scheduled_exam_ids.length === 0}
            className="w-full flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {executing ? 'Processing Assignment...' : 'Execute Invigilator Engine'}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {result && (
        <div className="space-y-4">
          {/* Invigilator Assignments */}
          {result.invigilator_assignments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Invigilator Assignment Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.invigilator_assignments.summary.total_exams}
                    </div>
                    <div className="text-sm text-gray-600">Total Exams</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.invigilator_assignments.summary.successful}
                    </div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {result.invigilator_assignments.summary.failed}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.invigilator_assignments.summary.total_assignments}
                    </div>
                    <div className="text-sm text-gray-600">Total Assignments</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Detailed Assignments by Exam</h4>
                  {Object.entries(result.invigilator_assignments.results).map(([examId, examResult]) => {
                    const exam = scheduledExams.find(e => e.id === parseInt(examId));
                    return (
                      <div key={examId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-medium">
                            {exam?.course_code || `Exam ${examId}`} - {exam?.course_name}
                          </span>
                          <Badge className={examResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {examResult.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>

                        {examResult.assignments.length > 0 && (
                          <div className="space-y-2">
                            {examResult.assignments.map((assignment, idx) => (
                              <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-3">
                                  <Badge className={getRoleColor(assignment.role)}>
                                    {assignment.role}
                                  </Badge>
                                  <span className="text-sm font-medium">{assignment.faculty_name}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Workload: {assignment.workload_points} points
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {examResult.warnings.length > 0 && (
                          <Alert className="mt-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="text-sm">
                                <strong>Warnings:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {examResult.warnings.map((warning, idx) => (
                                    <li key={idx}>{warning}</li>
                                  ))}
                                </ul>
                              </div>
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Eligibility Check Results */}
          {result.eligibility_check && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Faculty Eligibility Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(result.eligibility_check).map(([examId, eligibility]) => {
                    const exam = scheduledExams.find(e => e.id === parseInt(examId));
                    return (
                      <div key={examId} className="border rounded-lg p-4">
                        <h4 className="font-semibold mb-3">
                          {exam?.course_code || `Exam ${examId}`}
                        </h4>
                        
                        <div className="grid grid-cols-4 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-xl font-bold text-gray-900">
                              {eligibility.total_faculty}
                            </div>
                            <div className="text-xs text-gray-600">Total Faculty</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-green-600">
                              {eligibility.fully_eligible}
                            </div>
                            <div className="text-xs text-gray-600">Fully Eligible</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-yellow-600">
                              {eligibility.with_warnings}
                            </div>
                            <div className="text-xs text-gray-600">With Warnings</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl font-bold text-red-600">
                              {eligibility.ineligible}
                            </div>
                            <div className="text-xs text-gray-600">Ineligible</div>
                          </div>
                        </div>

                        {eligibility.faculty_details.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold mb-2">Faculty Issues:</h5>
                            <div className="space-y-1">
                              {eligibility.faculty_details.slice(0, 5).map((detail: any, idx: number) => (
                                <div key={idx} className="text-xs p-2 bg-yellow-50 rounded">
                                  <span className="font-medium">{detail.faculty_name}:</span> {detail.issues?.join(', ')}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Workload Analysis */}
          {result.workload_analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Workload Distribution Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.workload_analysis.statistics.average_workload.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Average Workload</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {result.workload_analysis.statistics.max_workload}
                    </div>
                    <div className="text-sm text-gray-600">Maximum Workload</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.workload_analysis.statistics.min_workload}
                    </div>
                    <div className="text-sm text-gray-600">Minimum Workload</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Faculty Workload Details</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(result.workload_analysis.faculty_workloads).map(([facultyId, workload]: [string, any]) => (
                      <div key={facultyId} className="flex justify-between items-center p-2 border rounded">
                        <span className="text-sm font-medium">{workload.faculty_name || `Faculty ${facultyId}`}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-600">
                            {workload.current_assignments || 0} assignments
                          </span>
                          <Badge variant="outline">
                            {workload.workload_points || 0} points
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
