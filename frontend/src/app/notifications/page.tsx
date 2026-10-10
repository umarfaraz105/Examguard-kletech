'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import { Button } from '@/components/ui/button';
import { Bell, Check, Trash2, AlertCircle, Info, CheckCircle } from 'lucide-react';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  timestamp: string;
  read: boolean;
  action_url?: string;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');

  const fetchNotifications = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const mockData: Notification[] = [
      {
        id: 1,
        title: 'Exam Schedule Published',
        message: 'ISA-1 December 2024 examination schedule has been published. Please check your hall ticket.',
        type: 'INFO',
        timestamp: '2024-12-10T10:30:00',
        read: false,
        action_url: '/hall-tickets'
      },
      {
        id: 2,
        title: 'Hall Ticket Available',
        message: 'Your hall ticket for ISA-1 December 2024 is now available for download.',
        type: 'SUCCESS',
        timestamp: '2024-12-12T14:20:00',
        read: false,
        action_url: '/hall-tickets'
      },
      {
        id: 3,
        title: 'Seating Arrangement Updated',
        message: 'Seating arrangement for CS301 Data Structures exam has been updated. Room changed to 102.',
        type: 'WARNING',
        timestamp: '2024-12-13T09:15:00',
        read: true,
        action_url: '/seating'
      },
      {
        id: 4,
        title: 'Results Published',
        message: 'ISA-1 results for CS301 Data Structures have been published. Check your marks now.',
        type: 'SUCCESS',
        timestamp: '2024-12-20T16:45:00',
        read: false,
        action_url: '/marks'
      },
      {
        id: 5,
        title: 'Revaluation Deadline',
        message: 'Last date to apply for revaluation is December 25, 2024. Apply now if needed.',
        type: 'WARNING',
        timestamp: '2024-12-21T11:00:00',
        read: false,
        action_url: '/revaluation'
      },
      {
        id: 6,
        title: 'Invigilator Duty Assigned',
        message: 'You have been assigned as Chief Invigilator for Database Systems exam on Dec 16, Room 102.',
        type: 'INFO',
        timestamp: '2024-12-08T08:30:00',
        read: true,
        action_url: '/invigilators'
      },
      {
        id: 7,
        title: 'Attendance Submission Reminder',
        message: 'Please submit attendance for CS301 exam held on Dec 15. Deadline: Today 6:00 PM.',
        type: 'ERROR',
        timestamp: '2024-12-15T15:00:00',
        read: false,
        action_url: '/attendance'
      },
      {
        id: 8,
        title: 'Revaluation Request Approved',
        message: 'Your revaluation request for CS302 Database Systems has been approved. Updated marks: 32/50.',
        type: 'SUCCESS',
        timestamp: '2024-12-24T10:00:00',
        read: false,
        action_url: '/revaluation'
      }
    ];
    
    // Filter based on user role
    let filteredData = mockData;
    if (user?.role === 'STUDENT') {
      filteredData = mockData.filter(n => 
        n.title.includes('Hall Ticket') || 
        n.title.includes('Results') || 
        n.title.includes('Revaluation') ||
        n.title.includes('Schedule')
      );
    } else if (user?.role === 'FACULTY') {
      filteredData = mockData.filter(n => 
        n.title.includes('Invigilator') || 
        n.title.includes('Attendance') ||
        n.title.includes('Schedule')
      );
    }
    
    setNotifications(filteredData);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'UNREAD') return !notification.read;
    if (filter === 'READ') return notification.read;
    return true;
  });

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete all notifications?')) {
      setNotifications([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const typeIcons = {
    INFO: <Info className="w-5 h-5 text-primary" />,
    SUCCESS: <CheckCircle className="w-5 h-5 text-success" />,
    WARNING: <AlertCircle className="w-5 h-5 text-warning" />,
    ERROR: <AlertCircle className="w-5 h-5 text-primary" />
  };

  const typeColors = {
    INFO: 'bg-primary-light border-primary/20',
    SUCCESS: 'bg-success/10 border-success/20',
    WARNING: 'bg-warning/10 border-warning/20',
    ERROR: 'bg-primary-light border-primary/20'
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-text">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-primary text-surface text-sm font-semibold rounded-full">
                {unreadCount} new
              </span>
            )}
          </div>
          <p className="text-text-muted mt-1">Stay updated with exam-related announcements</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="secondary" onClick={handleMarkAllAsRead}>
              <Check className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="secondary" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Total Notifications</p>
              <p className="text-3xl font-bold text-text">{notifications.length}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Unread</p>
              <p className="text-3xl font-bold text-primary">{unreadCount}</p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <Bell className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="!p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-muted">Read</p>
              <p className="text-3xl font-bold text-success">
                {notifications.filter(n => n.read).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center">
              <Check className="w-6 h-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-3 mb-6">
        {['ALL', 'UNREAD', 'READ'].map((status) => (
          <Button
            key={status}
            variant={filter === status ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(status)}
          >
            {status === 'ALL' ? 'All Notifications' : status}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-text-muted mx-auto mb-4" />
              <p className="text-text-muted text-lg">
                {filter === 'UNREAD' ? 'No unread notifications' : 'No notifications yet'}
              </p>
              <p className="text-sm text-text-muted mt-1">
                You&apos;ll be notified about important exam updates here
              </p>
            </div>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${!notification.read ? 'border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex gap-4">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border ${typeColors[notification.type]}`}>
                  {typeIcons[notification.type]}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-text">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-primary rounded-full"></span>
                        )}
                      </div>
                      <p className="text-text-muted mb-2">{notification.message}</p>
                      <div className="flex items-center gap-4 text-sm text-text-muted">
                        <span>
                          {new Date(notification.timestamp).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {notification.action_url && (
                          <a 
                            href={notification.action_url} 
                            className="text-primary hover:text-primary-dark font-medium"
                          >
                            View Details →
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {!notification.read && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-primary-light rounded-lg border border-primary/20">
        <h3 className="font-semibold text-primary mb-2">🔔 Notification Settings</h3>
        <ul className="text-sm text-text space-y-1">
          <li>• Notifications are sent for exam schedules, results, and important updates</li>
          <li>• You&apos;ll also receive email notifications for critical announcements</li>
          <li>• Mark notifications as read to keep your inbox organized</li>
          <li>• Old notifications are automatically archived after 30 days</li>
        </ul>
      </div>
    </div>
  );
}
