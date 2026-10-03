'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, Play, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Plan {
  id: number;
  name: string;
  description: string;
}

interface Course {
  id: number;
  course_code: string;
  course_name: string;
  credits: number;
}

interface ScheduleResult {
  scheduled_exams: Array<{
    course_id: number;
    course_code: string;
    date: string;
    session: string;
    slot_index: number;
  }>;
  statistics: {
    solver_metrics: {
      solver_time_ms: number;
      solution_found: boolean;
      total_slots: number;
      used_slots: number;
    };
    density_analysis: {
      utilization_percentage: number;
      peak_days: number;
      load_distribution: Record<string, number>;
    };
    conflict_analysis: {
      total_conflicts: number;
      scheduling_difficulty: string;
    };
  };
  alternatives?: Array<{
    alternative_id: number;
    optimization_score: number;
    schedule_data: any[];
  }>;
  recommendations: string[];
}

export default function Engine1Scheduler() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    plan_id: '',
    course_ids: [] as number[],
    start_date: '',
    end_date: '',
    sessions: ['morning', 'afternoon'],
    optimization_options: {
      generate_alternatives: true,
      max_alternatives: 3,
      enable_gap_optimization: true
    }
  });

  useEffect(() => {
    fetchPlans();
    fetchCourses();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };
  const handleExecute = async () => {
    if (!formData.plan_id || formData.course_ids.length === 0 || !formData.start_date || !formData.end_date) {
      setError('Please fill in all required fields');
      return;
    }

    setExecuting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/engines/v2/engine1-scheduling/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          input_data: {
            plan_id: parseInt(formData.plan_id),
            course_ids: formData.course_ids,
            start_date: formData.start_date,
            end_date: formData.end_date,
            sessions: formData.sessions,
            optimization_options: formData.optimization_options
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to execute scheduling engine');
      }

      const executionResponse = await response.json();
      
      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/engines/v2/engine1-scheduling/status/${executionResponse.execution_id}`,
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

      // Clear polling after 2 minutes
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
  const toggleCourse = (courseId: number) => {
    setFormData(prev => ({
      ...prev,
      course_ids: prev.course_ids.includes(courseId)
        ? prev.course_ids.filter(id => id !== courseId)
        : [...prev.course_ids, courseId]
    }));
  };

  const toggleSession = (session: string) => {
    setFormData(prev => ({
      ...prev,
      sessions: prev.sessions.includes(session)
        ? prev.sessions.filter(s => s !== session)
        : [...prev.sessions, session]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Engine 1: Conflict-Optimized Scheduler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="plan">Examination Plan</Label>
              <Select value={formData.plan_id} onValueChange={(value) => setFormData(prev => ({ ...prev, plan_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  {plans.map(plan => (
                    <SelectItem key={plan.id} value={plan.id.toString()}>
                      {plan.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>
          </div>
          {/* Course Selection */}
          <div>
            <Label>Select Courses</Label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-4 space-y-2">
              {courses.map(course => (
                <div key={course.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`course-${course.id}`}
                    checked={formData.course_ids.includes(course.id)}
                    onCheckedChange={() => toggleCourse(course.id)}
                  />
                  <label htmlFor={`course-${course.id}`} className="text-sm cursor-pointer">
                    {course.course_code} - {course.course_name}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Selected: {formData.course_ids.length} courses
            </p>
          </div>

          {/* Session Selection */}
          <div>
            <Label>Examination Sessions</Label>
            <div className="flex gap-4">
              {['morning', 'afternoon', 'evening'].map(session => (
                <div key={session} className="flex items-center space-x-2">
                  <Checkbox
                    id={`session-${session}`}
                    checked={formData.sessions.includes(session)}
                    onCheckedChange={() => toggleSession(session)}
                  />
                  <label htmlFor={`session-${session}`} className="text-sm cursor-pointer capitalize">
                    {session}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Optimization Options */}
          <div className="border-t pt-4">
            <Label className="text-base font-medium">Optimization Options</Label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="generate_alternatives"
                  checked={formData.optimization_options.generate_alternatives}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      optimization_options: {
                        ...prev.optimization_options,
                        generate_alternatives: !!checked
                      }
                    }))
                  }
                />
                <label htmlFor="generate_alternatives" className="text-sm">Generate Alternatives</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gap_optimization"
                  checked={formData.optimization_options.enable_gap_optimization}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({
                      ...prev,
                      optimization_options: {
                        ...prev.optimization_options,
                        enable_gap_optimization: !!checked
                      }
                    }))
                  }
                />
                <label htmlFor="gap_optimization" className="text-sm">Gap Optimization</label>
              </div>

              <div>
                <Label htmlFor="max_alternatives" className="text-sm">Max Alternatives</Label>
                <Input
                  id="max_alternatives"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.optimization_options.max_alternatives}
                  onChange={(e) => 
                    setFormData(prev => ({
                      ...prev,
                      optimization_options: {
                        ...prev.optimization_options,
                        max_alternatives: parseInt(e.target.value) || 3
                      }
                    }))
                  }
                  className="w-20"
                />
              </div>
            </div>
          </div>
          <Button
            onClick={handleExecute}
            disabled={executing || !formData.plan_id || formData.course_ids.length === 0}
            className="w-full flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {executing ? 'Generating Schedule...' : 'Execute Scheduler'}
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
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Scheduling Results & Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {result.statistics.solver_metrics.solution_found ? 'SUCCESS' : 'FAILED'}
                  </div>
                  <div className="text-sm text-gray-600">Solution Status</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {result.statistics.density_analysis.utilization_percentage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Slot Utilization</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {result.statistics.solver_metrics.solver_time_ms}ms
                  </div>
                  <div className="text-sm text-gray-600">Execution Time</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Conflict Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Conflicts:</span>
                      <span className="font-medium">{result.statistics.conflict_analysis.total_conflicts}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <Badge variant="outline">{result.statistics.conflict_analysis.scheduling_difficulty}</Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Density Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Peak Days:</span>
                      <span className="font-medium">{result.statistics.density_analysis.peak_days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Used Slots:</span>
                      <span className="font-medium">
                        {result.statistics.solver_metrics.used_slots} / {result.statistics.solver_metrics.total_slots}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Schedule Display */}
          <Card>
            <CardHeader>
              <CardTitle>Generated Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 p-2 text-left">Course Code</th>
                      <th className="border border-gray-300 p-2 text-center">Date</th>
                      <th className="border border-gray-300 p-2 text-center">Session</th>
                      <th className="border border-gray-300 p-2 text-center">Slot</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.scheduled_exams.map((exam, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="border border-gray-300 p-2 font-mono">{exam.course_code}</td>
                        <td className="border border-gray-300 p-2 text-center">
                          {new Date(exam.date).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-300 p-2 text-center capitalize">{exam.session}</td>
                        <td className="border border-gray-300 p-2 text-center">{exam.slot_index}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Alternatives */}
          {result.alternatives && result.alternatives.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Alternative Schedules</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.alternatives.map((alt, index) => (
                    <div key={alt.alternative_id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Alternative {index + 1}</h4>
                        <Badge variant="secondary">
                          Score: {alt.optimization_score.toFixed(3)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {alt.schedule_data.length} exams scheduled
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Optimization Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-blue-600 font-bold">{index + 1}.</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}