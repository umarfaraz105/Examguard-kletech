'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing, Calendar, RefreshCw, AlertCircle, CheckCircle, Info, X, Trash2 } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'duty_assignment' | 'duty_change' | 'swap_request' | 'system' | 'reminder';
  is_read: boolean;
  created_at: string;
  action_url?: string;
  expires_at?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'New Duty Assignment',
          message: 'You have been assigned invigilation duty for Mathematics - I exam on October 15, 2026 from 9:00 AM to 12:00 PM in Room 101.',
          type: 'info',
          category: 'duty_assignment',
          is_read: false,
          created_at: '2026-10-01T09:00:00Z',
          action_url: '/dashboard/faculty/duties'
        },
        {
          id: '2',
          title: 'Duty Swap Request Accepted',
          message: 'Your swap request for Chemistry Lab exam has been accepted by Dr. Sarah Johnson. The swap will take effect immediately.',
          type: 'success',
          category: 'swap_request',
          is_read: false,
          created_at: '2026-10-01T14:30:00Z',
          action_url: '/dashboard/faculty/swaps'
        },
        {
          id: '3',
          title: 'Room Change Notice',
          message: 'The venue for Physics - II exam on October 18, 2026 has been changed from Room 205 to Auditorium A. Please note the new location.',
          type: 'warning',
          category: 'duty_change',
          is_read: true,
          created_at: '2026-09-28T11:15:00Z',
          action_url: '/dashboard/faculty/duties'
        },
        {
          id: '4',
          title: 'Examination Guidelines Updated',
          message: 'New examination invigilation guidelines have been published. Please review the updated procedures before your next duty.',
          type: 'info',
          category: 'system',
          is_read: false,
          created_at: '2026-09-25T16:45:00Z'
        },
        {
          id: '5',
          title: 'Reminder: Duty Tomorrow',
          message: 'You have invigilation duty tomorrow (October 2, 2026) for Computer Programming quiz from 11:00 AM to 12:00 PM.',
          type: 'warning',
          category: 'reminder',
          is_read: true,
          created_at: '2026-10-01T18:00:00Z',
          expires_at: '2026-10-02T12:00:00Z'
        },
        {
          id: '6',
          title: 'System Maintenance Notice',
          message: 'The ExamGuard system will undergo scheduled maintenance on October 5, 2026 from 2:00 AM to 4:00 AM. Limited functionality may be available.',
          type: 'info',
          category: 'system',
          is_read: true,
          created_at: '2026-09-30T10:00:00Z',
          expires_at: '2026-10-05T04:00:00Z'
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
      // Mock API call
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mock API call
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Mock API call
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'duty_assignment':
      case 'duty_change':
        return <Calendar className="h-4 w-4" />;
      case 'swap_request':
        return <RefreshCw className="h-4 w-4" />;
      case 'reminder':
        return <BellRing className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesReadFilter = 
      filter === 'all' || 
      (filter === 'read' && notif.is_read) || 
      (filter === 'unread' && !notif.is_read);
    
    const matchesCategory = categoryFilter === 'all' || notif.category === categoryFilter;
    
    return matchesReadFilter && matchesCategory;
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
          <p className="text-gray-600 mt-2">Stay updated with duty assignments and system announcements</p>
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
      <div className="flex flex-wrap gap-2">
        <div className="flex bg-gray-100 p-1 rounded-lg">
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

        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['all', 'duty_assignment', 'duty_change', 'swap_request', 'system', 'reminder'].map(category => (
            <Button
              key={category}
              variant={categoryFilter === category ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCategoryFilter(category)}
            >
              {category === 'all' ? 'All Categories' : 
               category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </Button>
          ))}
        </div>
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
                          {getCategoryIcon(notification.category)}
                          <span className="capitalize">
                            {notification.category.replace('_', ' ')}
                          </span>
                        </div>
                        <span>•</span>
                        <span>
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                        {notification.expires_at && (
                          <>
                            <span>•</span>
                            <span className="text-yellow-600">
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
              <p className="text-sm text-gray-600">Success</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {notifications.filter(n => n.category === 'reminder').length}
              </p>
              <p className="text-sm text-gray-600">Reminders</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}