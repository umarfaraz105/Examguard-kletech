'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users } from 'lucide-react';

interface CalendarEvent {
  id: string;
  subject: string;
  exam_type: 'Mid Term' | 'Final' | 'Quiz' | 'Practical';
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  student_count: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week'>('month');

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    // Mock data - replace with actual API call
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        subject: 'Mathematics - I',
        exam_type: 'Mid Term',
        date: '2026-10-15',
        start_time: '09:00',
        end_time: '12:00',
        room: 'Room 101',
        student_count: 45,
        status: 'scheduled'
      },
      {
        id: '2',
        subject: 'Physics - II',
        exam_type: 'Final',
        date: '2026-10-18',
        start_time: '14:00',
        end_time: '17:00',
        room: 'Room 205',
        student_count: 72,
        status: 'scheduled'
      },
      {
        id: '3',
        subject: 'Chemistry Lab',
        exam_type: 'Practical',
        date: '2026-10-12',
        start_time: '10:00',
        end_time: '13:00',
        room: 'Lab 301',
        student_count: 28,
        status: 'completed'
      },
      {
        id: '4',
        subject: 'Engineering Drawing',
        exam_type: 'Mid Term',
        date: '2026-10-22',
        start_time: '09:30',
        end_time: '12:30',
        room: 'Room 150',
        student_count: 42,
        status: 'scheduled'
      },
      {
        id: '5',
        subject: 'Computer Programming',
        exam_type: 'Quiz',
        date: '2026-10-25',
        start_time: '11:00',
        end_time: '12:00',
        room: 'Computer Lab 1',
        student_count: 35,
        status: 'scheduled'
      }
    ];
    
    setEvents(mockEvents);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateStr);
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventColor = (event: CalendarEvent) => {
    if (event.status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (event.status === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
    
    switch (event.exam_type) {
      case 'Final': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Mid Term': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Quiz': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Practical': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Duty Calendar</h1>
          <p className="text-gray-600 mt-2">View your examination duties in calendar format</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === 'month' ? 'default' : 'outline'}
            onClick={() => setView('month')}
          >
            Month
          </Button>
          <Button
            variant={view === 'week' ? 'default' : 'outline'}
            onClick={() => setView('week')}
          >
            Week
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  {formatMonthYear(currentDate)}
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map(day => (
                  <div key={day} className="text-center font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-colors ${
                      day ? 'hover:bg-gray-50' : ''
                    } ${
                      day && isToday(day) ? 'bg-blue-50 border-blue-300' : 'border-gray-200'
                    }`}
                    onClick={() => day && setSelectedDate(day)}
                  >
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday(day) ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {day.getDate()}
                        </div>
                        <div className="space-y-1">
                          {getEventsForDate(day).map(event => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded border ${getEventColor(event)}`}
                            >
                              <div className="font-medium truncate">{event.subject}</div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{event.start_time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Details Sidebar */}
        <div className="space-y-4">
          {/* Legend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legend</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200"></div>
                <span className="text-sm">Final Exam</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200"></div>
                <span className="text-sm">Mid Term</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-200"></div>
                <span className="text-sm">Quiz</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-200"></div>
                <span className="text-sm">Practical/Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-100 border border-red-200"></div>
                <span className="text-sm">Cancelled</span>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {getEventsForDate(selectedDate).length === 0 ? (
                  <p className="text-gray-500 text-sm">No duties scheduled</p>
                ) : (
                  <div className="space-y-3">
                    {getEventsForDate(selectedDate).map(event => (
                      <div key={event.id} className="p-3 border rounded-lg">
                        <h4 className="font-semibold text-sm">{event.subject}</h4>
                        <div className="space-y-1 mt-2">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Clock className="h-3 w-3" />
                            <span>{event.start_time} - {event.end_time}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{event.room}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <Users className="h-3 w-3" />
                            <span>{event.student_count} students</span>
                          </div>
                        </div>
                        <Badge className={`mt-2 text-xs ${getEventColor(event)}`}>
                          {event.exam_type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Duties</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events
                  .filter(event => new Date(event.date) >= new Date() && event.status === 'scheduled')
                  .slice(0, 3)
                  .map(event => (
                    <div key={event.id} className="p-2 border rounded">
                      <div className="font-medium text-sm">{event.subject}</div>
                      <div className="text-xs text-gray-600">
                        {new Date(event.date).toLocaleDateString()} at {event.start_time}
                      </div>
                      <Badge className={`mt-1 text-xs ${getEventColor(event)}`}>
                        {event.exam_type}
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}