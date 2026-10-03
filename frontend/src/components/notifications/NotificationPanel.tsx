/**
 * Notification Panel Component for displaying real-time notifications
 */
'use client';

import React, { useState } from 'react';
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
        return <CheckCircle className={cn(iconClass, "text-success-500")} />;
      case 'error':
        return <X className={cn(iconClass, "text-error-500")} />;
      case 'warning':
        return <AlertTriangle className={cn(iconClass, "text-warning-500")} />;
      case 'engine_status':
        return <Settings className={cn(iconClass, "text-info-500")} />;
      default:
        return <Info className={cn(iconClass, "text-info-500")} />;
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

  return (
    <div
      className={cn(
        'border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-md',
        getBorderColor(notification.type),
        !notification.read && 'bg-gray-50',
        compact && 'p-3'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={cn(
                "font-medium text-gray-900 truncate",
                compact ? "text-sm" : "text-base"
              )}>
                {notification.title}
              </h4>
              {!notification.read && (
                <Badge variant="secondary" className="text-xs bg-primary-100 text-primary-700">
                  New
                </Badge>
              )}
            </div>
            
            <p className={cn(
              "text-gray-600 leading-relaxed",
              compact ? "text-xs" : "text-sm"
            )}>
              {notification.message}
            </p>
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
              </span>
              
              {notification.actionUrl && notification.actionText && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-6 px-2 text-primary-600 hover:text-primary-700"
                  onClick={() => window.open(notification.actionUrl, '_blank')}
                >
                  {notification.actionText}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!notification.read && (
              <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)}>
                <Check className="mr-2 h-4 w-4" />
                Mark as Read
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => onRemove(notification.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
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
    { value: 'all', label: 'All', icon: <Bell className="h-4 w-4" /> },
    { value: 'success', label: 'Success', icon: <CheckCircle className="h-4 w-4" /> },
    { value: 'error', label: 'Errors', icon: <X className="h-4 w-4" /> },
    { value: 'warning', label: 'Warnings', icon: <AlertTriangle className="h-4 w-4" /> },
    { value: 'engine_status', label: 'Engine Status', icon: <Settings className="h-4 w-4" /> },
    { value: 'info', label: 'Info', icon: <Info className="h-4 w-4" /> },
  ];

  return (
    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
      <div className="flex items-center gap-2 flex-wrap">
        {filterOptions.map((option) => (
          <Button
            key={option.value}
            variant={activeFilter === option.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(option.value)}
            className="text-xs"
          >
            {option.icon}
            <span className="ml-1">{option.label}</span>
          </Button>
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllAsRead}
            className="text-xs"
          >
            <Check className="mr-1 h-3 w-3" />
            Mark All Read
          </Button>
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-red-600 hover:text-red-700"
        >
          <Trash2 className="mr-1 h-3 w-3" />
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

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => 
    activeFilter === 'all' || notification.type === activeFilter
  );

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-primary-100 text-primary-700">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
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
        <ScrollArea className="h-full" style={{ maxHeight }}>
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-sm text-gray-500">
                {activeFilter === 'all' 
                  ? "You're all caught up!" 
                  : `No ${activeFilter} notifications at the moment.`
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
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
        <Button variant="ghost" size="sm" className={cn("relative", className)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary-500 text-white"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-96 p-0" align="end">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary-100 text-primary-700">
                {unreadCount} new
              </Badge>
            )}
          </div>
        </div>
        
        <ScrollArea className="max-h-96">
          {recentNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications</p>
            </div>
          ) : (
            <div>
              {recentNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onRemove={removeNotification}
                  compact={true}
                />
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
            >
              View All Notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}