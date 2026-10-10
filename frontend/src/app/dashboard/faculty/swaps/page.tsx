'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, RefreshCw, Calendar, Clock, MapPin, User, CheckCircle, XCircle, Clock as ClockIcon, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SwapRequest {
  id: string;
  requester_name: string;
  requester_duty: {
    subject: string;
    date: string;
    start_time: string;
    end_time: string;
    room: string;
    exam_type: string;
  };
  target_duty?: {
    subject: string;
    date: string;
    start_time: string;
    end_time: string;
    room: string;
    exam_type: string;
  };
  target_faculty?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  reason: string;
  created_at: string;
  response_date?: string;
  type: 'specific' | 'general';
}

interface MyDuty {
  id: string;
  subject: string;
  date: string;
  start_time: string;
  end_time: string;
  room: string;
  exam_type: string;
  can_swap: boolean;
}

export default function SwapsPage() {
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [myDuties, setMyDuties] = useState<MyDuty[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my_requests' | 'incoming' | 'available'>('my_requests');
  const [formData, setFormData] = useState({
    duty_id: '',
    target_faculty: '',
    target_duty_id: '',
    reason: '',
    type: 'general' as 'general' | 'specific'
  });

  useEffect(() => {
    fetchSwapRequests();
    fetchMyDuties();
  }, []);

  const fetchSwapRequests = async () => {
    // Mock data - replace with actual API call
    const mockRequests: SwapRequest[] = [
      {
        id: '1',
        requester_name: 'Dr. Sarah Johnson',
        requester_duty: {
          subject: 'Physics - I',
          date: '2026-10-20',
          start_time: '09:00',
          end_time: '12:00',
          room: 'Room 201',
          exam_type: 'Mid Term'
        },
        target_duty: {
          subject: 'Mathematics - II',
          date: '2026-10-25',
          start_time: '14:00',
          end_time: '17:00',
          room: 'Room 105',
          exam_type: 'Final'
        },
        status: 'pending',
        reason: 'Medical appointment conflict',
        created_at: '2026-10-01T10:30:00Z',
        type: 'specific'
      },
      {
        id: '2',
        requester_name: 'Prof. Michael Chen',
        requester_duty: {
          subject: 'Chemistry Lab',
          date: '2026-10-18',
          start_time: '10:00',
          end_time: '13:00',
          room: 'Lab 301',
          exam_type: 'Practical'
        },
        status: 'pending',
        reason: 'Conference attendance',
        created_at: '2026-10-02T14:15:00Z',
        type: 'general'
      }
    ];
    
    setSwapRequests(mockRequests);
  };

  const fetchMyDuties = async () => {
    // Mock data - replace with actual API call
    const mockDuties: MyDuty[] = [
      {
        id: '1',
        subject: 'Mathematics - I',
        date: '2026-10-15',
        start_time: '09:00',
        end_time: '12:00',
        room: 'Room 101',
        exam_type: 'Mid Term',
        can_swap: true
      },
      {
        id: '2',
        subject: 'Engineering Drawing',
        date: '2026-10-22',
        start_time: '09:30',
        end_time: '12:30',
        room: 'Room 150',
        exam_type: 'Mid Term',
        can_swap: true
      }
    ];
    
    setMyDuties(mockDuties);
    setLoading(false);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Mock API call
      console.log('Submitting swap request:', formData);
      
      // Reset form and close dialog
      setFormData({
        duty_id: '',
        target_faculty: '',
        target_duty_id: '',
        reason: '',
        type: 'general'
      });
      setIsDialogOpen(false);
      
      // Refresh data
      await fetchSwapRequests();
    } catch (error) {
      console.error('Error submitting swap request:', error);
    }
  };

  const handleRespondToRequest = async (requestId: string, action: 'accept' | 'reject') => {
    try {
      // Mock API call
      console.log(`${action}ing swap request:`, requestId);
      
      // Update local state
      setSwapRequests(requests => 
        requests.map(req => 
          req.id === requestId 
            ? { ...req, status: action === 'accept' ? 'accepted' : 'rejected', response_date: new Date().toISOString() }
            : req
        )
      );
    } catch (error) {
      console.error(`Error ${action}ing swap request:`, error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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

  const myRequests = swapRequests.filter(req => req.requester_name === 'Current User'); // Mock filter
  const incomingRequests = swapRequests.filter(req => req.requester_name !== 'Current User');
  const availableSwaps = swapRequests.filter(req => req.type === 'general' && req.status === 'pending');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Duty Swaps</h1>
          <p className="text-gray-600 mt-2">Manage duty swap requests and find available swaps</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { fetchSwapRequests(); fetchMyDuties(); }} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Request Duty Swap</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <Label htmlFor="duty_id">Your Duty to Swap</Label>
                  <Select value={formData.duty_id} onValueChange={(value) => setFormData({ ...formData, duty_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duty" />
                    </SelectTrigger>
                    <SelectContent>
                      {myDuties.filter(duty => duty.can_swap).map(duty => (
                        <SelectItem key={duty.id} value={duty.id}>
                          {duty.subject} - {new Date(duty.date).toLocaleDateString()} ({duty.start_time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Swap Type</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="general"
                        checked={formData.type === 'general'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'general' | 'specific' })}
                      />
                      <span className="text-sm">General Request</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="type"
                        value="specific"
                        checked={formData.type === 'specific'}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value as 'general' | 'specific' })}
                      />
                      <span className="text-sm">Specific Faculty</span>
                    </label>
                  </div>
                </div>

                {formData.type === 'specific' && (
                  <div>
                    <Label htmlFor="target_faculty">Target Faculty</Label>
                    <Input
                      id="target_faculty"
                      value={formData.target_faculty}
                      onChange={(e) => setFormData({ ...formData, target_faculty: e.target.value })}
                      placeholder="Faculty name or email"
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="reason">Reason for Swap</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Please explain why you need this swap..."
                    rows={3}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Request
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'my_requests' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('my_requests')}
        >
          My Requests ({myRequests.length})
        </Button>
        <Button
          variant={activeTab === 'incoming' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('incoming')}
        >
          Incoming ({incomingRequests.length})
        </Button>
        <Button
          variant={activeTab === 'available' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('available')}
        >
          Available Swaps ({availableSwaps.length})
        </Button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'my_requests' && (
        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No swap requests submitted yet</p>
              </CardContent>
            </Card>
          ) : (
            myRequests.map(request => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(request.status)}
                        <h3 className="font-semibold">Swap Request</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Your Duty:</p>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm">{request.requester_duty.subject}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(request.requester_duty.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {request.requester_duty.start_time} - {request.requester_duty.end_time}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {request.requester_duty.room}
                              </span>
                            </div>
                          </div>
                        </div>

                        {request.target_duty && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">Requested Duty:</p>
                            <div className="ml-4 space-y-1">
                              <p className="text-sm">{request.target_duty.subject}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(request.target_duty.date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {request.target_duty.start_time} - {request.target_duty.end_time}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {request.target_duty.room}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-medium text-gray-700">Reason:</p>
                          <p className="text-sm text-gray-600 ml-4">{request.reason}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No incoming swap requests</p>
              </CardContent>
            </Card>
          ) : (
            incomingRequests.map(request => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-blue-600" />
                        <h3 className="font-semibold">Request from {request.requester_name}</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Their Duty:</p>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm">{request.requester_duty.subject}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(request.requester_duty.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {request.requester_duty.start_time} - {request.requester_duty.end_time}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">Reason:</p>
                          <p className="text-sm text-gray-600 ml-4">{request.reason}</p>
                        </div>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => handleRespondToRequest(request.id, 'accept')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRespondToRequest(request.id, 'reject')}
                        >
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'available' && (
        <div className="space-y-4">
          {availableSwaps.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">No available swap opportunities at the moment</p>
              </CardContent>
            </Card>
          ) : (
            availableSwaps.map(request => (
              <Card key={request.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-purple-600" />
                        <h3 className="font-semibold">{request.requester_name} seeking swap</h3>
                        <Badge variant="outline">Available</Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Available Duty:</p>
                          <div className="ml-4 space-y-1">
                            <p className="text-sm">{request.requester_duty.subject}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(request.requester_duty.date).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {request.requester_duty.start_time} - {request.requester_duty.end_time}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700">Reason:</p>
                          <p className="text-sm text-gray-600 ml-4">{request.reason}</p>
                        </div>
                      </div>
                    </div>

                    <Button size="sm" className="ml-4">
                      Offer Swap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
