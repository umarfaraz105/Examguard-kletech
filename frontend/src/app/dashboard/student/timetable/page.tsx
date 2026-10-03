'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, Clock, MapPin, BookOpen, RefreshCw, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExamSchedule {
  id: string;
  subject_code: string;
  subject_name: string;
  exam_type: 'ISA-1' | 'ISA-2' | 'ESA' | 'Supplementary';
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  room: string;
  seat_number: string;
  block: string;
  special_instructions?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function TimetablePage() {
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      // Mock data - replace with actual API call
      const mockSchedules: ExamSchedule[] = [
        {
          id: '1',
          subject_code: 'MATH101',
          subject_name: 'Mathematics - I',
          exam_type: 'ISA-1',
          date: '2026-10-15',
          start_time: '09:00',
          end_time: '12:00',
          duration_hours: 3,
          room: 'Room 101',
          seat_number: 'A-15',
          block: 'Block A',
          status: 'scheduled'
        },
        {
          id: '2',
          subject_code: 'PHY102',
          subject_name: 'Physics - II',
          exam_type: 'ISA-1',
          date: '2026-10-18',
          start_time: '14:00',
          end_time: '17:00',
          duration_hours: 3,
          room: 'Room 205',
          seat_number: 'B-22',
          block: 'Block B',
          status: 'scheduled'
        },
        {
          id: '3',
          subject_code: 'CHEM103',
          subject_name: 'Chemistry',
          exam_type: 'ISA-1',
          date: '2026-10-20',
          start_time: '10:00',
          end_time: '13:00',
          duration_hours: 3,
          room: 'Lab 301',
          seat_number: 'C-08',
          block: 'Block C',
          special_instructions: 'Calculator allowed, bring drawing instruments',
          status: 'scheduled'
        },
        {
          id: '4',
          subject_code: 'ENG104',
          subject_name: 'Engineering Graphics',
          exam_type: 'ISA-1',
          date: '2026-10-22',
          start_time: '09:30',
          end_time: '12:30',
          duration_hours: 3,
          room: 'Room 150',
          seat_number: 'A-30',
          block: 'Block A',
          special_instructions: 'Drawing instruments required',
          status: 'scheduled'
        },
        {
          id: '5',
          subject_code: 'CS105',
          subject_name: 'Computer Programming',
          exam_type: 'ISA-1',
          date: '2026-10-08',
          start_time: '11:00',
          end_time: '12:00',
          duration_hours: 1,
          room: 'Computer Lab 1',
          seat_number: 'PC-15',
          block: 'Block D',
          status: 'completed'
        },
        {
          id: '6',
          subject_code: 'ELEC106',
          subject_name: 'Electrical Circuits',
          exam_type: 'ISA-1',
          date: '2026-10-25',
          start_time: '14:30',
          end_time: '17:30',
          duration_hours: 3,
          room: 'Room 302',
          seat_number: 'B-45',
          block: 'Block B',
          status: 'scheduled'
        }
      ];
      
      setExamSchedules(mockSchedules);
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTimetable = () => {
    // Mock download functionality
    console.log('Downloading timetable PDF...');
    // In real implementation, generate and download PDF
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getExamTypeColor = (examType: string) => {
    switch (examType) {
      case 'ISA-1':
        return 'bg-blue-100 text-blue-800';
      case 'ISA-2':
        return 'bg-green-100 text-green-800';
      case 'ESA':
        return 'bg-purple-100 text-purple-800';
      case 'Supplementary':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredSchedules = examSchedules.filter(schedule => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return schedule.status === 'scheduled' && new Date(schedule.date) >= new Date();
    if (filter === 'completed') return schedule.status === 'completed';
    return schedule.exam_type === filter;
  });

  const sortedSchedules = [...filteredSchedules].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

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
          <h1 className="text-3xl font-bold">My Examination Timetable</h1>
          <p className="text-gray-600 mt-2">Your complete examination schedule and seating information</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTimetable} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleDownloadTimetable} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold">{examSchedules.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-orange-600">
                  {examSchedules.filter(e => e.status === 'scheduled' && new Date(e.date) >= new Date()).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {examSchedules.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Duration</p>
                <p className="text-2xl font-bold">
                  {examSchedules.reduce((sum, e) => sum + e.duration_hours, 0)} hrs
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filter:</span>
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Exams</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="ISA-1">ISA-1</SelectItem>
                <SelectItem value="ISA-2">ISA-2</SelectItem>
                <SelectItem value="ESA">ESA</SelectItem>
                <SelectItem value="Supplementary">Supplementary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Timetable */}
      <div className="space-y-4">
        {sortedSchedules.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No examinations found for the selected filter</p>
            </CardContent>
          </Card>
        ) : (
          sortedSchedules.map((schedule) => (
            <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-semibold">
                        {schedule.subject_code} - {schedule.subject_name}
                      </h3>
                      <Badge className={getExamTypeColor(schedule.exam_type)}>
                        {schedule.exam_type}
                      </Badge>
                      <Badge className={getStatusColor(schedule.status)}>
                        {schedule.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
                          {new Date(schedule.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          {schedule.start_time} - {schedule.end_time} ({schedule.duration_hours}h)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{schedule.room}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-medium">Seat:</span>
                        <span>{schedule.block} - {schedule.seat_number}</span>
                      </div>
                    </div>

                    {schedule.special_instructions && (
                      <div className="bg-yellow-50 border-l-4 border-yellow-300 p-3 rounded">
                        <div className="flex items-start gap-2">
                          <div className="text-yellow-600 mt-0.5">⚠️</div>
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Special Instructions:</p>
                            <p className="text-sm text-yellow-700 mt-1">
                              {schedule.special_instructions}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {schedule.status === 'scheduled' && new Date(schedule.date) <= new Date(Date.now() + 24 * 60 * 60 * 1000) && (
                      <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded mt-4">
                        <div className="flex items-start gap-2">
                          <div className="text-blue-600 mt-0.5">ℹ️</div>
                          <div>
                            <p className="text-sm font-medium text-blue-800">Reminder:</p>
                            <p className="text-sm text-blue-700 mt-1">
                              Your exam is {new Date(schedule.date) < new Date() ? 'today' : 'tomorrow'}! 
                              Please arrive at least 30 minutes before the scheduled time.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Examination Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Before the Exam:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Arrive at least 30 minutes before start time</li>
                <li>• Bring your ID card and hall ticket</li>
                <li>• Check your seat number carefully</li>
                <li>• Review special instructions for each exam</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">During the Exam:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Follow all invigilation instructions</li>
                <li>• Mobile phones strictly prohibited</li>
                <li>• No communication with other students</li>
                <li>• Raise your hand for any queries</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}