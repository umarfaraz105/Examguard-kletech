'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Filter, Search, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Duty {
  id: string;
  subject: string;
  exam_type: 'Mid Term' | 'Final' | 'Quiz' | 'Practical';
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  room_capacity: number;
  student_count: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  co_invigilators: string[];
  special_instructions?: string;
}

export default function DutiesPage() {
  const [duties, setDuties] = useState<Duty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    fetchDuties();
  }, []);

  const fetchDuties = async () => {
    try {
      // Mock data - replace with actual API call
      const mockDuties: Duty[] = [
        {
          id: '1',
          subject: 'Mathematics - I',
          exam_type: 'Mid Term',
          date: '2026-10-15',
          start_time: '09:00',
          end_time: '12:00',
          room: 'Room 101',
          room_capacity: 60,
          student_count: 45,
          status: 'scheduled',
          co_invigilators: ['Dr. Sarah Johnson'],
          special_instructions: 'Calculator allowed'
        },
        {
          id: '2',
          subject: 'Physics - II',
          exam_type: 'Final',
          date: '2026-10-18',
          start_time: '14:00',
          end_time: '17:00',
          room: 'Room 205',
          room_capacity: 80,
          student_count: 72,
          status: 'scheduled',
          co_invigilators: ['Prof. Michael Chen', 'Dr. Lisa Wang'],
        },
        {
          id: '3',
          subject: 'Chemistry Lab',
          exam_type: 'Practical',
          date: '2026-10-12',
          start_time: '10:00',
          end_time: '13:00',
          room: 'Lab 301',
          room_capacity: 30,
          student_count: 28,
          status: 'completed',
          co_invigilators: ['Dr. Emily Brown'],
        },
        {
          id: '4',
          subject: 'Computer Programming',
          exam_type: 'Quiz',
          date: '2026-10-08',
          start_time: '11:00',
          end_time: '12:00',
          room: 'Computer Lab 1',
          room_capacity: 40,
          student_count: 35,
          status: 'completed',
          co_invigilators: [],
        },
        {
          id: '5',
          subject: 'Engineering Drawing',
          exam_type: 'Mid Term',
          date: '2026-10-22',
          start_time: '09:30',
          end_time: '12:30',
          room: 'Room 150',
          room_capacity: 50,
          student_count: 42,
          status: 'scheduled',
          co_invigilators: ['Dr. Robert Lee'],
          special_instructions: 'Drawing instruments required'
        }
      ];
      
      setDuties(mockDuties);
    } catch (error) {
      console.error('Error fetching duties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapRequest = (dutyId: string) => {
    console.log('Requesting swap for duty:', dutyId);
    // Navigate to swap request page or open modal
  };

  const filteredDuties = duties.filter(duty => {
    const matchesSearch = 
      duty.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      duty.room.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || duty.status === statusFilter;
    const matchesType = typeFilter === 'all' || duty.exam_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Final':
        return 'bg-purple-100 text-purple-800';
      case 'Mid Term':
        return 'bg-blue-100 text-blue-800';
      case 'Quiz':
        return 'bg-yellow-100 text-yellow-800';
      case 'Practical':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="text-3xl font-bold">My Duties</h1>
          <p className="text-gray-600 mt-2">Manage your invigilation assignments</p>
        </div>
        <Button onClick={fetchDuties} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search duties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Final">Final</SelectItem>
                <SelectItem value="Mid Term">Mid Term</SelectItem>
                <SelectItem value="Quiz">Quiz</SelectItem>
                <SelectItem value="Practical">Practical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Duties List */}
      <div className="space-y-4">
        {filteredDuties.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'No duties found matching your filters' 
                  : 'No duties assigned yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredDuties.map((duty) => (
            <Card key={duty.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {getStatusIcon(duty.status)}
                      <h3 className="text-xl font-semibold">{duty.subject}</h3>
                      <Badge className={getTypeColor(duty.exam_type)}>
                        {duty.exam_type}
                      </Badge>
                      <Badge className={getStatusColor(duty.status)}>
                        {duty.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(duty.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{duty.start_time} - {duty.end_time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>{duty.room}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="h-4 w-4" />
                        <span>{duty.student_count}/{duty.room_capacity} students</span>
                      </div>
                    </div>

                    {duty.co_invigilators.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Co-invigilators:</p>
                        <div className="flex flex-wrap gap-2">
                          {duty.co_invigilators.map((name, index) => (
                            <Badge key={index} variant="secondary">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {duty.special_instructions && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">Special Instructions:</p>
                        <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded border-l-4 border-yellow-300">
                          {duty.special_instructions}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {duty.status === 'scheduled' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSwapRequest(duty.id)}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Request Swap
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Duty Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {duties.filter(d => d.status === 'scheduled').length}
              </p>
              <p className="text-sm text-gray-600">Scheduled</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {duties.filter(d => d.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {duties.filter(d => d.status === 'in_progress').length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {duties.reduce((sum, d) => sum + d.student_count, 0)}
              </p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}