'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, Download, RefreshCw, Navigation, Building, Users } from 'lucide-react';

interface SeatingAssignment {
  id: string;
  subject_code: string;
  subject_name: string;
  exam_type: string;
  date: string;
  start_time: string;
  building: string;
  room: string;
  floor: string;
  block: string;
  row: string;
  seat_number: string;
  nearby_students?: {
    left?: string;
    right?: string;
    front?: string;
    back?: string;
  };
  room_capacity: number;
  room_layout: string; // 'auditorium' | 'classroom' | 'lab'
  accessibility_features?: string[];
  directions?: string;
}

export default function SeatingPage() {
  const [seatingAssignments, setSeatingAssignments] = useState<SeatingAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState<SeatingAssignment | null>(null);

  useEffect(() => {
    fetchSeatingAssignments();
  }, []);

  const fetchSeatingAssignments = async () => {
    try {
      // Mock data - replace with actual API call
      const mockAssignments: SeatingAssignment[] = [
        {
          id: '1',
          subject_code: 'MATH101',
          subject_name: 'Mathematics - I',
          exam_type: 'ISA-1',
          date: '2026-10-15',
          start_time: '09:00',
          building: 'Academic Block A',
          room: 'Room 101',
          floor: '1st Floor',
          block: 'A',
          row: '3',
          seat_number: '15',
          nearby_students: {
            left: 'Alice Johnson (A-14)',
            right: 'Bob Smith (A-16)',
            front: 'Carol Brown (A-05)',
            back: 'David Wilson (A-25)'
          },
          room_capacity: 60,
          room_layout: 'classroom',
          directions: 'Enter through Main Gate, take left corridor, first room on right'
        },
        {
          id: '2',
          subject_code: 'PHY102',
          subject_name: 'Physics - II',
          exam_type: 'ISA-1',
          date: '2026-10-18',
          start_time: '14:00',
          building: 'Science Block B',
          room: 'Room 205',
          floor: '2nd Floor',
          block: 'B',
          row: '4',
          seat_number: '22',
          nearby_students: {
            left: 'Emma Davis (B-21)',
            right: 'Frank Miller (B-23)',
            front: 'Grace Taylor (B-12)',
            back: 'Henry Anderson (B-32)'
          },
          room_capacity: 80,
          room_layout: 'auditorium',
          accessibility_features: ['Elevator Access', 'Wheelchair Accessible'],
          directions: 'Enter through Science Block entrance, take elevator to 2nd floor, turn right'
        },
        {
          id: '3',
          subject_code: 'CHEM103',
          subject_name: 'Chemistry',
          exam_type: 'ISA-1',
          date: '2026-10-20',
          start_time: '10:00',
          building: 'Laboratory Block C',
          room: 'Lab 301',
          floor: '3rd Floor',
          block: 'C',
          row: '2',
          seat_number: '08',
          nearby_students: {
            left: 'Ivy Chen (C-07)',
            right: 'Jack Roberts (C-09)',
            front: 'Kelly White (C-03)',
            back: 'Liam Garcia (C-13)'
          },
          room_capacity: 30,
          room_layout: 'lab',
          directions: 'Laboratory Block, 3rd floor, Chemical Engineering Lab section'
        },
        {
          id: '4',
          subject_code: 'ENG104',
          subject_name: 'Engineering Graphics',
          exam_type: 'ISA-1',
          date: '2026-10-22',
          start_time: '09:30',
          building: 'Academic Block A',
          room: 'Room 150',
          floor: '1st Floor',
          block: 'A',
          row: '5',
          seat_number: '30',
          nearby_students: {
            left: 'Mia Lopez (A-29)',
            right: 'Noah Martinez (A-31)',
            front: 'Olivia Clark (A-20)',
            back: 'Paul Lewis (A-40)'
          },
          room_capacity: 50,
          room_layout: 'classroom',
          directions: 'Academic Block A, 1st floor, end of the corridor'
        }
      ];
      
      setSeatingAssignments(mockAssignments);
    } catch (error) {
      console.error('Error fetching seating assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSeatingChart = () => {
    console.log('Downloading seating chart...');
    // In real implementation, generate and download PDF
  };

  const getRoomLayoutIcon = (layout: string) => {
    switch (layout) {
      case 'auditorium':
        return '🏛️';
      case 'lab':
        return '🔬';
      default:
        return '🏫';
    }
  };

  const upcomingAssignments = seatingAssignments.filter(
    assignment => new Date(assignment.date) >= new Date()
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
          <h1 className="text-3xl font-bold">My Seating Assignments</h1>
          <p className="text-gray-600 mt-2">Hall, block, and seat details for all examinations</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchSeatingAssignments} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleDownloadSeatingChart} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download Chart
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold">{seatingAssignments.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Buildings</p>
                <p className="text-2xl font-bold">
                  {new Set(seatingAssignments.map(a => a.building)).size}
                </p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-orange-600">{upcomingAssignments.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Capacity</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(seatingAssignments.reduce((sum, a) => sum + a.room_capacity, 0) / seatingAssignments.length)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seating Assignments */}
      <div className="space-y-4">
        {upcomingAssignments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No upcoming seating assignments</p>
            </CardContent>
          </Card>
        ) : (
          upcomingAssignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {assignment.subject_code} - {assignment.subject_name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(assignment.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{assignment.start_time}</span>
                      </div>
                      <Badge variant="outline">
                        {assignment.exam_type}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl mb-1">{getRoomLayoutIcon(assignment.room_layout)}</div>
                    <Badge variant="secondary" className="text-xs">
                      {assignment.room_layout}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Location Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Location Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Building:</span>
                        <span className="font-medium">{assignment.building}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Room:</span>
                        <span className="font-medium">{assignment.room}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Floor:</span>
                        <span className="font-medium">{assignment.floor}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{assignment.room_capacity} students</span>
                      </div>
                    </div>

                    {assignment.accessibility_features && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-1">Accessibility:</h5>
                        <div className="flex flex-wrap gap-1">
                          {assignment.accessibility_features.map((feature, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Seat Details */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-800">Seat Assignment</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-blue-600">
                          {assignment.block}-{assignment.seat_number}
                        </div>
                        <div className="text-sm text-gray-600">
                          Block {assignment.block}, Row {assignment.row}, Seat {assignment.seat_number}
                        </div>
                      </div>
                      
                      {assignment.nearby_students && (
                        <div>
                          <h5 className="font-medium text-gray-700 mb-2">Nearby Students:</h5>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div></div>
                            <div className="text-center bg-white p-1 rounded">
                              {assignment.nearby_students.front || 'N/A'}
                            </div>
                            <div></div>
                            
                            <div className="text-center bg-white p-1 rounded">
                              {assignment.nearby_students.left || 'N/A'}
                            </div>
                            <div className="text-center bg-blue-100 p-1 rounded font-medium">
                              YOU
                            </div>
                            <div className="text-center bg-white p-1 rounded">
                              {assignment.nearby_students.right || 'N/A'}
                            </div>
                            
                            <div></div>
                            <div className="text-center bg-white p-1 rounded">
                              {assignment.nearby_students.back || 'N/A'}
                            </div>
                            <div></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {assignment.directions && (
                  <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-300 rounded">
                    <div className="flex items-start gap-2">
                      <Navigation className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">Directions:</p>
                        <p className="text-sm text-blue-700 mt-1">{assignment.directions}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Campus Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Campus Map Reference
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 h-64 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Building className="h-12 w-12 mx-auto mb-2" />
              <p>Interactive campus map would be displayed here</p>
              <p className="text-sm">Showing exam hall locations and directions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seating Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Finding Your Seat:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Check your seat number carefully on arrival</li>
                <li>• Look for block and row markers in the hall</li>
                <li>• Arrive early to locate your seat comfortably</li>
                <li>• Ask invigilators if you need assistance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Seating Rules:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Sit only in your assigned seat</li>
                <li>• Do not change seats without permission</li>
                <li>• Keep personal items under your seat</li>
                <li>• Maintain proper exam hall decorum</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
