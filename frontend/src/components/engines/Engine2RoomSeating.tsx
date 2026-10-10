'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { MapPin, Users, Play, AlertCircle, Building, Grid3X3 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ScheduledExam {
  id: number;
  course_code: string;
  course_name: string;
  date: string;
  session: string;
  student_count: number;
}

interface Room {
  id: number;
  name: string;
  capacity: number;
  building: string;
  floor: string;
  layout: string;
}

interface RoomSeatingResult {
  room_allocation?: {
    success: boolean;
    allocations: Record<string, number>;
    statistics: {
      total_exams: number;
      rooms_used: number;
      avg_room_usage: number;
    };
  };
  seat_allocation?: {
    results: Record<string, {
      success: boolean;
      num_assignments: number;
      num_violations: number;
      statistics: any;
    }>;
    summary: {
      successful: number;
      failed: number;
      total_violations: number;
    };
  };
}
export default function Engine2RoomSeating() {
  const [scheduledExams, setScheduledExams] = useState<ScheduledExam[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<RoomSeatingResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    scheduled_exam_ids: [] as number[],
    exam_type: 'MID_TERM',
    operation: 'both',
    available_room_ids: [] as number[]
  });

  useEffect(() => {
    fetchScheduledExams();
    fetchRooms();
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

  const fetchRooms = async () => {
    try {
      const response = await fetch('/api/rooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
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
      const response = await fetch('/api/engines/v2/engine2-room-seating/execute', {
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
            available_room_ids: formData.available_room_ids.length > 0 ? formData.available_room_ids : undefined
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to execute room & seating engine');
      }

      const executionResponse = await response.json();
      
      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(
            `/api/engines/v2/engine2-room-seating/status/${executionResponse.execution_id}`,
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

  const toggleRoom = (roomId: number) => {
    setFormData(prev => ({
      ...prev,
      available_room_ids: prev.available_room_ids.includes(roomId)
        ? prev.available_room_ids.filter(id => id !== roomId)
        : [...prev.available_room_ids, roomId]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Configuration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Engine 2: Smart Room & Seating Allocator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectItem value="allocate_rooms">Room Allocation Only</SelectItem>
                  <SelectItem value="allocate_seats">Seat Assignment Only</SelectItem>
                  <SelectItem value="both">Both Room & Seat Allocation</SelectItem>
                </SelectContent>
              </Select>
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
                        {new Date(exam.date).toLocaleDateString()} ({exam.session})
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

          {/* Room Selection (Optional) */}
          <div>
            <Label>Available Rooms (Optional - leave empty for auto-selection)</Label>
            <div className="max-h-40 overflow-y-auto border rounded-lg p-4 space-y-2">
              {rooms.map(room => (
                <div key={room.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`room-${room.id}`}
                      checked={formData.available_room_ids.includes(room.id)}
                      onCheckedChange={() => toggleRoom(room.id)}
                    />
                    <div className="text-sm">
                      <div className="font-medium">{room.name}</div>
                      <div className="text-gray-600">
                        {room.building} - {room.floor} ({room.layout})
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Cap: {room.capacity}
                  </Badge>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Selected: {formData.available_room_ids.length} rooms
            </p>
          </div>

          <Button
            onClick={handleExecute}
            disabled={executing || formData.scheduled_exam_ids.length === 0}
            className="w-full flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {executing ? 'Processing Allocation...' : 'Execute Room & Seating Engine'}
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
          {/* Room Allocation Results */}
          {result.room_allocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Room Allocation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${result.room_allocation.success ? 'text-green-600' : 'text-red-600'}`}>
                      {result.room_allocation.success ? 'SUCCESS' : 'FAILED'}
                    </div>
                    <div className="text-sm text-gray-600">Allocation Status</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {result.room_allocation.statistics.rooms_used}
                    </div>
                    <div className="text-sm text-gray-600">Rooms Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {result.room_allocation.statistics.avg_room_usage.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Room Usage</div>
                  </div>
                </div>

                {Object.keys(result.room_allocation.allocations).length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Room Assignments</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {Object.entries(result.room_allocation.allocations).map(([examId, roomId]) => {
                        const exam = scheduledExams.find(e => e.id === parseInt(examId));
                        const room = rooms.find(r => r.id === roomId);
                        return (
                          <div key={examId} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm font-mono">
                              {exam?.course_code || `Exam ${examId}`}
                            </span>
                            <Badge variant="outline">
                              {room?.name || `Room ${roomId}`}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          {/* Seat Allocation Results */}
          {result.seat_allocation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3X3 className="h-5 w-5" />
                  Seat Allocation Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {result.seat_allocation.summary.successful}
                    </div>
                    <div className="text-sm text-gray-600">Successful</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {result.seat_allocation.summary.failed}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {result.seat_allocation.summary.total_violations}
                    </div>
                    <div className="text-sm text-gray-600">Violations</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Detailed Results by Exam</h4>
                  {Object.entries(result.seat_allocation.results).map(([examId, examResult]) => {
                    const exam = scheduledExams.find(e => e.id === parseInt(examId));
                    return (
                      <div key={examId} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            {exam?.course_code || `Exam ${examId}`}
                          </span>
                          <Badge className={examResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {examResult.success ? 'Success' : 'Failed'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Assignments:</span>
                            <span className="ml-1 font-medium">{examResult.num_assignments}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Violations:</span>
                            <span className="ml-1 font-medium">{examResult.num_violations}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Success Rate:</span>
                            <span className="ml-1 font-medium">
                              {examResult.num_assignments > 0 
                                ? ((1 - examResult.num_violations / examResult.num_assignments) * 100).toFixed(1)
                                : 0}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
