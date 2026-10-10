/**
 * Notification Panel Component for displaying real-time notifications
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotifications, type Notification, type NotificationType } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  X, 
  Settings, 
  MoreVertical,
  ExternalLink,
  Check,
  Trash2,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// Notification Item Component
// ============================================================================

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onRemove: (id: string) => void;
  compact?: boolean;
}

function NotificationItem({ notification, onMarkAsRead, onRemove, compact = false }: NotificationItemProps) {
  const getIcon = (type: NotificationType) => {
    const iconClass = "h-4 w-4";
    switch (type) {
      case 'success':
        return <CheckCircle className={cn(iconClass, "text-success-500")} aria-label="Success notification" />;
      case 'error':
        return <X className={cn(iconClass, "text-error-500")} aria-label="Error notification" />;
      case 'warning':
        return <AlertTriangle className={cn(iconClass, "text-warning-500")} aria-label="Warning notification" />;
      case 'engine_status':
        return <Settings className={cn(iconClass, "text-info-500")} aria-label="Engine status notification" />;
      default:
        return <Info className={cn(iconClass, "text-info-500")} aria-label="Information notification" />;
    }
  };

  const getBorderColor = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'border-l-success-500';
      case 'error':
        return 'border-l-error-500';
      case 'warning':
        return 'border-l-warning-500';
      case 'engine_status':
        return 'border-l-info-500';
      default:
        return 'border-l-info-500';
    }
  };

  const formatNotificationForScreenReader = (notification: Notification) => {
    const priority = notification.type === 'error' ? 'Error' : 
                    notification.type === 'warning' ? 'Warning' : 
                    notification.type === 'success' ? 'Success' : 'Information';
    const readStatus = notification.read ? 'read' : 'unread';
    const timeAgo = formatDistanceToNow(notification.timestamp, { addSuffix: true });
    return `${priority} notification, ${readStatus}. ${notification.title}. ${notification.message}. ${timeAgo}.`;
  };

  return (
    <article
      className={cn(
        'border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-md',
        getBorderColor(notification.type),
        !notification.read && 'bg-gray-50',
        compact && 'p-3'
      )}
      role="article"
      aria-labelledby={`notification-title-${notification.id}`}
      aria-describedby={`notification-content-${notification.id} notification-time-${notification.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 
                id={`notification-title-${notification.id}`}
                className={cn(
                  "font-medium text-gray-900 truncate",
                  compact ? "text-sm" : "text-base"
                )}
              >
                {notification.title}
              </h4>
              {!notification.read && (
                <Badge 
                  variant="secondary" 
                  className="text-xs bg-primary-100 text-primary-700"
                  aria-label="New notification"
                >
                  New
                </Badge>
              )}
            </div>
            
            <p 
              id={`notification-content-${notification.id}`}
              className={cn(
                "text-gray-600 leading-relaxed",
                compact ? "text-xs" : "text-sm"
              )}
            >
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span 
                id={`notification-time-${notification.id}`}
                className="text-xs text-gray-500"
              >
                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
              </span>
              
              {notification.actionUrl && notification.actionText && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2 text-primary-600 hover:text-primary-700"
                  onClick={() => window.open(notification.actionUrl, '_blank')}
                  aria-label={`${notification.actionText} for ${notification.title}`}
                >
                  {notification.actionText}
                  <ExternalLink className="ml-1 h-3 w-3" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              aria-label={`Actions for notification: ${notification.title}`}
            >
              <MoreVertical className="h-4 w-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!notification.read && (
              <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                Mark as Read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onRemove(notification.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Screen reader only announcement */}
      <span className="sr-only">
        {formatNotificationForScreenReader(notification)}
      </span>
    </article>
  );
}

// ============================================================================
// Filter Controls
// ============================================================================

interface FilterControlsProps {
  activeFilter: NotificationType | 'all';
  onFilterChange: (filter: NotificationType | 'all') => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  unreadCount: number;
}

function FilterControls({ 
  activeFilter, 
  onFilterChange, 
  onMarkAllAsRead, 
  onClearAll, 
  unreadCount 
}: FilterControlsProps) {
  const filterOptions: Array<{ value: NotificationType | 'all'; label: string; icon: React.ReactNode }> = [
    { value: 'all', label: 'All', icon: <Bell className="h-4 w-4" aria-hidden="true" /> },
    { value: 'success', label: 'Success', icon: <CheckCircle className="h-4 w-4" aria-hidden="true" /> },
    { value: 'error', label: 'Errors', icon: <X className="h-4 w-4" aria-hidden="true" /> },
    { value: 'warning', label: 'Warnings', icon: <AlertTriangle className="h-4 w-4" aria-hidden="true" /> },
    { value: 'engine_status', label: 'Engine Status', icon: <Settings className="h-4 w-4" aria-hidden="true" /> },
    { value: 'info', label: 'Info', icon: <Info className="h-4 w-4" aria-hidden="true" /> },
  ];

  return (
    <div 
      className="flex items-center justify-between border-b border-gray-200 pb-4"
      role="toolbar"
      aria-label="Notification filters and actions"
    >
      <fieldset className="flex items-center gap-2 flex-wrap">
        <legend className="sr-only">Filter notifications by type</legend>
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={activeFilter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(option.value)}
            className="text-xs"
            aria-pressed={activeFilter === option.value}
            aria-label={`Filter by ${option.label} notifications${
              activeFilter === option.value ? ' (currently active)' : ''
            }`}
          >
            {option.icon}
            <span className="ml-1">{option.label}</span>
          </Button>
        ))}
      </fieldset>
      
      <div className="flex items-center gap-2" role="group" aria-label="Notification actions">
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs"
            aria-label={`Mark all ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'} as read`}
          >
            <Check className="mr-1 h-3 w-3" aria-hidden="true" />
            Mark All Read
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-red-600 hover:text-red-700"
          aria-label="Clear all notifications"
        >
          <Trash2 className="mr-1 h-3 w-3" aria-hidden="true" />
          Clear All
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Main Notification Panel
// ============================================================================

interface NotificationPanelProps {
  className?: string;
  compact?: boolean;
  maxHeight?: string;
}

export function NotificationPanel({ className, compact = false, maxHeight = "600px" }: NotificationPanelProps) {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearNotifications 
  } = useNotifications();
  
  const [activeFilter, setActiveFilter] = useState<NotificationType | 'all'>('all');
  const [previousNotificationCount, setPreviousNotificationCount] = useState(0);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const statusRegionRef = useRef<HTMLDivElement>(null);

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => 
    activeFilter === 'all' || notification.type === activeFilter
  );

  // Handle notification count changes for screen reader announcements
  useEffect(() => {
    if (notifications.length > previousNotificationCount) {
      const newNotifications = notifications.slice(0, notifications.length - previousNotificationCount);
      newNotifications.forEach((notification) => {
        // Announce new notifications based on their type
        const priority = notification.type === 'error' || notification.type === 'warning' ? 'assertive' : 'polite';
        const announcement = `New ${notification.type} notification: ${notification.title}. ${notification.message}`;
        
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = announcement;
          liveRegionRef.current.setAttribute('aria-live', priority);
          
          // Clear announcement after a delay to allow for new ones
          setTimeout(() => {
            if (liveRegionRef.current) {
              liveRegionRef.current.textContent = '';
            }
          }, 2000);
        }
      });
    }
    setPreviousNotificationCount(notifications.length);
  }, [notifications.length, previousNotificationCount]);

  // Handle unread count changes
  useEffect(() => {
    if (unreadCount !== previousUnreadCount && statusRegionRef.current) {
      if (unreadCount > previousUnreadCount) {
        statusRegionRef.current.textContent = `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`;
      } else if (unreadCount === 0 && previousUnreadCount > 0) {
        statusRegionRef.current.textContent = 'All notifications have been read';
      }
      
      // Clear status announcement after delay
      setTimeout(() => {
        if (statusRegionRef.current) {
          statusRegionRef.current.textContent = '';
        }
      }, 3000);
    }
    setPreviousUnreadCount(unreadCount);
  }, [unreadCount, previousUnreadCount]);

  return (
    <div className={cn("w-full", className)}>
      {/* Live regions for screen reader announcements */}
      <div 
        ref={liveRegionRef}
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
      <div 
        ref={statusRegionRef}
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
        role="status"
      />
      
      <Card role="region" aria-label="Notifications panel">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Notifications
              {unreadCount > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-2 bg-primary-100 text-primary-700"
                  aria-label={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
                >
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            
            <Button 
              variant="ghost" 
              size="sm"
              aria-label="Notification settings"
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          
          <FilterControls
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            onMarkAllAsRead={markAllAsRead}
            onClearAll={clearNotifications}
            unreadCount={unreadCount}
          />
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea 
            className="h-full" 
            style={{ maxHeight }}
            role="log"
            aria-label="Notification list"
          >
            {filteredNotifications.length === 0 ? (
              <div 
                className="flex flex-col items-center justify-center py-12 text-center"
                role="status"
                aria-label={activeFilter === 'all' 
                  ? "No notifications available" 
                  : `No ${activeFilter} notifications available`
                }
              >
                <Bell className="h-12 w-12 text-gray-300 mb-4" aria-hidden="true" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-sm text-gray-500">
                  {activeFilter === 'all' 
                    ? "You're all caught up!" 
                    : `No ${activeFilter} notifications at the moment.`
                  }
                </p>
              </div>
            ) : (
              <div 
                className="divide-y divide-gray-100"
                role="feed" 
                aria-label={`${filteredNotifications.length} notification${filteredNotifications.length === 1 ? '' : 's'}`}
              >
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onRemove={removeNotification}
                    compact={compact}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================================================
// Notification Bell Dropdown
// ============================================================================

interface NotificationBellProps {
  className?: string;
}

export function NotificationBell({ className }: NotificationBellProps) {
  const { notifications, unreadCount, markAsRead, removeNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Get recent notifications (last 5)
  const recentNotifications = notifications.slice(0, 5);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("relative", className)}
          aria-label={
            unreadCount > 0 
              ? `Notifications - ${unreadCount} unread` 
              : "Notifications - no unread notifications"
          }
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <Bell className="h-5 w-5" aria-hidden="true" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary-500 text-white"
              aria-label={`${unreadCount > 99 ? '99 plus' : unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-96 p-0" 
        align="end"
        role="dialog"
        aria-label="Recent notifications"
      >
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge 
                variant="secondary" 
                className="bg-primary-100 text-primary-700"
                aria-label={`${unreadCount} new notification${unreadCount === 1 ? '' : 's'}`}
              >
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
        
        <ScrollArea className="max-h-96">
          {recentNotifications.length === 0 ? (
            <div 
              className="p-8 text-center"
              role="status"
              aria-label="No notifications available"
            >
              <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" aria-hidden="true" />
              <p className="text-sm text-gray-500">No notifications</p>
            </div>
          ) : (
            <div role="list" aria-label="Recent notifications">
              {recentNotifications.map((notification) => (
                <div key={notification.id} role="listitem">
                  <NotificationItem
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onRemove={removeNotification}
                    compact={true}
                  />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        {notifications.length > 5 && (
          <div className="p-4 border-t border-gray-100">
            <Button 
              variant="outline" 
              className="w-full text-sm"
              onClick={() => setIsOpen(false)}
              aria-label="View all notifications - opens notifications panel"
            >
              View All Notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
