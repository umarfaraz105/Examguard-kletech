/**
 * Real-time Dashboard Component with live updates and notifications
 */
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationPanel, NotificationBell } from '@/components/notifications/NotificationPanel';
import { EngineStatusMonitor, EngineStatusWidget } from '@/components/engines/EngineStatusMonitor';
import { useDashboardUpdates, useConnectionStatus, useLiveCounter } from '@/lib/hooks/useRealTime';
import { useNotifications } from '@/contexts/NotificationContext';
import { 
  Activity,
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

// ============================================================================
// Real-time Stats Cards
// ============================================================================

interface StatsCardProps {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  loading?: boolean;
  trend?: 'up' | 'down' | 'neutral';
}

function StatsCard({ title, value, change, icon, loading, trend = 'neutral' }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-50 rounded-lg">
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <div className="flex items-center gap-2">
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                )}
                {change !== undefined && (
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'text-xs',
                      trend === 'up' && 'bg-success-100 text-success-700',
                      trend === 'down' && 'bg-error-100 text-error-700'
                    )}
                  >
                    {change > 0 ? '+' : ''}{change}%
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {trend !== 'neutral' && (
            <TrendingUp className={cn(
              'h-4 w-4',
              trend === 'up' ? 'text-success-500' : 'text-error-500',
              trend === 'down' && 'rotate-180'
            )} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Connection Status Indicator
// ============================================================================

function ConnectionStatusIndicator() {
  const { isConnected, isOnline, hasWebSocketConnection, error } = useConnectionStatus();

  const getStatusColor = () => {
    if (!isOnline) return 'text-error-500';
    if (!hasWebSocketConnection) return 'text-warning-500';
    return 'text-success-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (!hasWebSocketConnection) return 'Connecting...';
    return 'Live';
  };

  const getIcon = () => {
    if (!isOnline || !hasWebSocketConnection) {
      return <WifiOff className="h-4 w-4" />;
    }
    return <Wifi className="h-4 w-4" />;
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={cn("flex items-center gap-1", getStatusColor())}>
        {getIcon()}
        <span className="font-medium">{getStatusText()}</span>
      </div>
      {error && (
        <Badge variant="destructive" className="text-xs">
          {error}
        </Badge>
      )}
    </div>
  );
}

// ============================================================================
// Live Activity Feed
// ============================================================================

interface ActivityFeedProps {
  activities: string[];
  className?: string;
}

function ActivityFeed({ activities, className }: ActivityFeedProps) {
  const { count: refreshCount, start, reset } = useLiveCounter({
    initialValue: 0,
    increment: 1,
    interval: 1000,
    max: 30,
  });

  React.useEffect(() => {
    start();
    return () => reset();
  }, [start, reset]);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Live
            </Badge>
            <Button variant="ghost" size="sm" onClick={reset}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activities.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No recent activity
          </p>
        ) : (
          activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 text-sm">
              <div className="h-2 w-2 bg-primary-500 rounded-full mt-2" />
              <div className="flex-1">
                <p className="text-gray-900">{activity}</p>
                <p className="text-gray-500 text-xs">
                  {refreshCount > index ? `${refreshCount - index}s ago` : 'Just now'}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// System Health Monitor
// ============================================================================

interface SystemHealthProps {
  health: 'healthy' | 'warning' | 'critical';
  className?: string;
}

function SystemHealthMonitor({ health, className }: SystemHealthProps) {
  const getHealthColor = () => {
    switch (health) {
      case 'healthy': return 'text-success-500';
      case 'warning': return 'text-warning-500';
      case 'critical': return 'text-error-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = () => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'warning': return <AlertTriangle className="h-5 w-5" />;
      case 'critical': return <AlertTriangle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getHealthBadge = () => {
    switch (health) {
      case 'healthy': 
        return <Badge className="bg-success-100 text-success-700">All Systems Operational</Badge>;
      case 'warning': 
        return <Badge className="bg-warning-100 text-warning-700">Minor Issues Detected</Badge>;
      case 'critical': 
        return <Badge variant="destructive">Critical Issues</Badge>;
      default: 
        return <Badge variant="secondary">Status Unknown</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <div className={getHealthColor()}>
            {getHealthIcon()}
          </div>
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {getHealthBadge()}
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Database</span>
              <Badge className="bg-success-100 text-success-700 text-xs">Online</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>API Server</span>
              <Badge className="bg-success-100 text-success-700 text-xs">Healthy</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>WebSocket</span>
              <Badge className="bg-success-100 text-success-700 text-xs">Connected</Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>Engine Queue</span>
              <Badge className="bg-warning-100 text-warning-700 text-xs">2 Pending</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Real-time Dashboard
// ============================================================================

interface RealTimeDashboardProps {
  userId?: number;
  className?: string;
}

export function RealTimeDashboard({ userId, className }: RealTimeDashboardProps) {
  const { stats, recentActivity } = useDashboardUpdates({ userId });
  const { unreadCount, addNotification } = useNotifications();
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock stats if none loaded yet
  const displayStats = stats || {
    totalExams: 156,
    activeEngines: 2,
    upcomingExams: 8,
    systemHealth: 'healthy' as const,
  };

  // Test notification function
  const sendTestNotification = () => {
    addNotification({
      type: 'info',
      title: 'Test Notification',
      message: 'This is a test notification to verify the real-time system is working.',
      actionUrl: '/dashboard',
      actionText: 'View Dashboard',
    });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with Connection Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Real-time Dashboard</h1>
          <p className="text-gray-600">Live monitoring and notifications</p>
        </div>
        
        <div className="flex items-center gap-4">
          <ConnectionStatusIndicator />
          <Button variant="outline" size="sm" onClick={sendTestNotification}>
            <Bell className="mr-2 h-4 w-4" />
            Test Notification
          </Button>
          <NotificationBell />
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Exams"
          value={displayStats.totalExams}
          icon={<BookOpen className="h-5 w-5 text-primary-500" />}
          change={5}
          trend="up"
        />
        <StatsCard
          title="Active Engines"
          value={displayStats.activeEngines}
          icon={<Zap className="h-5 w-5 text-primary-500" />}
        />
        <StatsCard
          title="Upcoming Exams"
          value={displayStats.upcomingExams}
          icon={<Calendar className="h-5 w-5 text-primary-500" />}
          change={-2}
          trend="down"
        />
        <StatsCard
          title="Active Users"
          value={247}
          icon={<Users className="h-5 w-5 text-primary-500" />}
          change={12}
          trend="up"
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="engines">
            Engines
            {displayStats.activeEngines > 0 && (
              <Badge className="ml-2 bg-blue-100 text-blue-700">
                {displayStats.activeEngines}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-primary-100 text-primary-700">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Activity Feed */}
            <ActivityFeed activities={recentActivity || []} />
            
            {/* Engine Status Widget */}
            <EngineStatusWidget />
            
            {/* System Health */}
            <SystemHealthMonitor health={displayStats.systemHealth} />
          </div>
        </TabsContent>

        <TabsContent value="engines">
          <EngineStatusMonitor
            showSummary={true}
            onViewDetails={(executionId) => {
              console.log('View engine details:', executionId);
            }}
            onCancel={(executionId) => {
              console.log('Cancel engine:', executionId);
            }}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationPanel />
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SystemHealthMonitor health={displayStats.systemHealth} />
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Response Time</span>
                    <span className="font-medium">45ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Database Queries/sec</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span className="font-medium">23%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
