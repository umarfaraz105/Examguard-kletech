'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing, Calendar, RefreshCw, AlertCircle, CheckCircle, Info, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'exam' | 'attendance' | 'result' | 'general' | 'fee' | 'registration';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  expires_at?: string;
}

export default function StudentNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'ISA-1 Examination Schedule Released',
          message: 'The ISA-1 examination schedule for 5th semester has been published. Please check your timetable for exam dates and timings.',
          type: 'info',
          category: 'exam',
          is_read: false,
          created_at: '2026-10-01T09:00:00Z',
          action_url: '/dashboard/student/timetable'
        },
        {
          id: '2',
          title: 'Hall Ticket Available',
          message: 'Your hall ticket for ISA-1 examinations is now available for download. Please download and print it before the examination.',
          type: 'success',
          category: 'exam',
          is_read: false,
          created_at: '2026-10-01T14:30:00Z',
          action_url: '/dashboard/student/hall-ticket'
        },
        {
          id: '3',
          title: 'Low Attendance Alert - Chemistry',
          message: 'Your attendance in Chemistry (CHEM103) is 78%, which is below the required 75% threshold. Please attend classes regularly.',
          type: 'warning',
          category: 'attendance',
          is_read: true,
          created_at: '2026-09-28T11:15:00Z'
        },
        {
          id: '4',
          title: 'Semester Fee Payment Reminder',
          message: 'Reminder: Semester fee payment deadline is October 10, 2026. Please complete the payment to avoid late fees.',
          type: 'warning',
          category: 'fee',
          is_read: false,
          created_at: '2026-09-25T16:45:00Z',
          expires_at: '2026-10-10T23:59:59Z'
        },
        {
          id: '5',
          title: 'Previous Semester Results Published',
          message: 'Results for 4th semester examinations have been published. You can view your grades and download the marksheet.',
          type: 'success',
          category: 'result',
          is_read: true,
          created_at: '2026-09-20T10:00:00Z',
          action_url: '/dashboard/student/results'
        },
        {
          id: '6',
          title: 'Seating Arrangement Published',
          message: 'Seating arrangements for ISA-1 examinations have been published. Check your seat number and hall location.',
          type: 'info',
          category: 'exam',
          is_read: false,
          created_at: '2026-10-02T09:00:00Z',
          action_url: '/dashboard/student/seating'
        },
        {
          id: '7',
          title: 'Course Registration Open',
          message: 'Course registration for next semester is now open. Please complete your registration before the deadline.',
          type: 'info',
          category: 'registration',
          is_read: true,
          created_at: '2026-09-15T08:00:00Z'
        },
        {
          id: '8',
          title: 'Library Book Return Reminder',
          message: 'You have 2 books due for return by October 5, 2026. Please return them to avoid fines.',
          type: 'warning',
          category: 'general',
          is_read: false,
          created_at: '2026-09-30T10:00:00Z',
          expires_at: '2026-10-05T23:59:59Z'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setNotifications(notifications.filter(notif => notif.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'exam':
        return '📝';
      case 'attendance':
        return '📊';
      case 'result':
        return '🎓';
      case 'fee':
        return '💰';
      case 'registration':
        return '📋';
      default:
        return '📢';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'read') return notif.is_read;
    if (filter === 'unread') return !notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bell className="h-8 w-8" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 mt-2">Stay updated with important announcements and alerts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchNotifications} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Mark All Read
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={filter === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread ({unreadCount})
        </Button>
        <Button
          variant={filter === 'read' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilter('read')}
        >
          Read ({notifications.length - unreadCount})
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 text-lg">No notifications found</p>
              <p className="text-gray-400">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map(notification => (
            <Card 
              key={notification.id} 
              className={`hover:shadow-md transition-shadow ${
                !notification.is_read ? 'ring-2 ring-blue-100 bg-blue-50/30' : ''
              }`}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{getCategoryIcon(notification.category)}</span>
                        <h3 className={`font-semibold ${!notification.is_read ? 'text-blue-900' : 'text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(notification.created_at).toLocaleString()}</span>
                        </div>
                        <span className="capitalize">{notification.category}</span>
                        {notification.expires_at && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-600 font-medium">
                              Expires: {new Date(notification.expires_at).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>

                      {notification.action_url && (
                        <div className="mt-3">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 ml-4">
                    {!notification.is_read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(notification.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
          <CardTitle className="text-lg">Notification Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{notifications.length}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              <p className="text-sm text-gray-600">Unread</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {notifications.filter(n => n.type === 'success').length}
              </p>
              <p className="text-sm text-gray-600">Good News</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {notifications.filter(n => n.type === 'warning').length}
              </p>
              <p className="text-sm text-gray-600">Alerts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
