/**
 * Real-time Engine Status Monitor Component
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useNotifications, type EngineStatus } from '@/contexts/NotificationContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Activity,
  Zap,
  Eye,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';

// ============================================================================
// Engine Status Card
// ============================================================================

interface EngineStatusCardProps {
  status: EngineStatus;
  onViewDetails?: (executionId: string) => void;
  onCancel?: (executionId: string) => void;
  compact?: boolean;
}

function EngineStatusCard({ status, onViewDetails, onCancel, compact = false }: EngineStatusCardProps) {
  const getStatusIcon = () => {
    const iconClass = "h-4 w-4";
    switch (status.status) {
      case 'running':
        return <Activity className={cn(iconClass, "text-blue-500 animate-pulse")} />;
      case 'completed':
        return <CheckCircle className={cn(iconClass, "text-success-500")} />;
      case 'failed':
        return <XCircle className={cn(iconClass, "text-error-500")} />;
      case 'cancelled':
        return <Square className={cn(iconClass, "text-warning-500")} />;
      case 'pending':
      default:
        return <Clock className={cn(iconClass, "text-gray-500")} />;
    }
  };

  const getStatusBadge = () => {
    const badgeProps = {
      pending: { variant: 'secondary' as const, className: 'bg-gray-100 text-gray-700' },
      running: { variant: 'secondary' as const, className: 'bg-blue-100 text-blue-700' },
      completed: { variant: 'secondary' as const, className: 'bg-success-100 text-success-700' },
      failed: { variant: 'secondary' as const, className: 'bg-error-100 text-error-700' },
      cancelled: { variant: 'secondary' as const, className: 'bg-warning-100 text-warning-700' },
    };

    const props = badgeProps[status.status] || badgeProps.pending;
    
    return (
      <Badge {...props}>
        {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
      </Badge>
    );
  };

  const executionTime = status.completedAt 
    ? Math.round((status.completedAt.getTime() - status.startedAt.getTime()) / 1000)
    : Math.round((Date.now() - status.startedAt.getTime()) / 1000);

  return (
    <Card className={cn("transition-all hover:shadow-md", compact && "p-2")}>
      <CardHeader className={cn("pb-3", compact && "pb-2")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className={cn("font-medium", compact ? "text-sm" : "text-base")}>
              {status.engineName}
            </CardTitle>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className={cn("pt-0", compact && "py-2")}>
        <div className="space-y-3">
          {/* Progress Bar */}
          {status.status === 'running' && typeof status.progress === 'number' && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Progress</span>
                <span>{Math.round(status.progress)}%</span>
              </div>
              <Progress value={status.progress} className="h-2" />
            </div>
          )}

          {/* Status Message */}
          {status.message && (
            <p className={cn("text-gray-600", compact ? "text-xs" : "text-sm")}>
              {status.message}
            </p>
          )}

          {/* Execution Details */}
          <div className={cn("text-gray-500 space-y-1", compact ? "text-xs" : "text-sm")}>
            <div className="flex justify-between">
              <span>Execution ID:</span>
              <span className="font-mono text-xs">{status.executionId.slice(0, 8)}...</span>
            </div>
            
            <div className="flex justify-between">
              <span>Started:</span>
              <span>{formatDistanceToNow(status.startedAt, { addSuffix: true })}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Duration:</span>
              <span>
                {executionTime < 60 
                  ? `${executionTime}s`
                  : `${Math.floor(executionTime / 60)}m ${executionTime % 60}s`
                }
              </span>
            </div>
            
            {status.completedAt && (
              <div className="flex justify-between">
                <span>Completed:</span>
                <span>{format(status.completedAt, 'HH:mm:ss')}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            {onViewDetails && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onViewDetails(status.executionId)}
                className="flex-1"
              >
                <Eye className="mr-1 h-3 w-3" />
                View Details
              </Button>
            )}
            
            {status.status === 'running' && onCancel && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onCancel(status.executionId)}
                className="text-red-600 hover:text-red-700"
              >
                <Square className="mr-1 h-3 w-3" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Engine Status Summary
// ============================================================================

interface EngineStatusSummaryProps {
  statuses: EngineStatus[];
  className?: string;
}

function EngineStatusSummary({ statuses, className }: EngineStatusSummaryProps) {
  const counts = statuses.reduce((acc, status) => {
    acc[status.status] = (acc[status.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const summaryItems = [
    { status: 'running', label: 'Running', icon: Activity, className: 'text-blue-600' },
    { status: 'completed', label: 'Completed', icon: CheckCircle, className: 'text-success-600' },
    { status: 'failed', label: 'Failed', icon: XCircle, className: 'text-error-600' },
    { status: 'pending', label: 'Pending', icon: Clock, className: 'text-gray-600' },
  ];

  return (
    <div className={cn("grid grid-cols-4 gap-4", className)}>
      {summaryItems.map(({ status, label, icon: Icon, className: iconClassName }) => (
        <Card key={status} className="p-4">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-full bg-opacity-10", iconClassName.replace('text-', 'bg-'))}>
              <Icon className={cn("h-5 w-5", iconClassName)} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {counts[status] || 0}
              </div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ============================================================================
// Main Engine Status Monitor
// ============================================================================

interface EngineStatusMonitorProps {
  className?: string;
  showSummary?: boolean;
  maxHeight?: string;
  onViewDetails?: (executionId: string) => void;
  onCancel?: (executionId: string) => void;
}

export function EngineStatusMonitor({ 
  className, 
  showSummary = true,
  maxHeight = "600px",
  onViewDetails,
  onCancel 
}: EngineStatusMonitorProps) {
  const { engineStatuses, isConnected, connectionError } = useNotifications();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Convert Map to Array and sort by start time (newest first)
  const statusArray = Array.from(engineStatuses.values()).sort(
    (a, b) => b.startedAt.getTime() - a.startedAt.getTime()
  );

  // Filter statuses
  const filteredStatuses = statusArray.filter(status =>
    filterStatus === 'all' || status.status === filterStatus
  );

  const filterOptions = [
    { value: 'all', label: 'All Engines' },
    { value: 'running', label: 'Running' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Cards */}
      {showSummary && <EngineStatusSummary statuses={statusArray} />}

      {/* Main Monitor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">Engine Status Monitor</CardTitle>
              <div className="flex items-center gap-1">
                <div className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected ? "bg-success-500" : "bg-error-500"
                )} />
                <span className="text-xs text-gray-500">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Status Filter */}
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-2 py-1"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {connectionError && (
            <div className="flex items-center gap-2 text-sm text-error-600 bg-error-50 p-2 rounded-md">
              <AlertTriangle className="h-4 w-4" />
              <span>Connection Error: {connectionError}</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="p-0">
          <ScrollArea style={{ maxHeight }}>
            {filteredStatuses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Zap className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No engine executions</h3>
                <p className="text-sm text-gray-500">
                  {filterStatus === 'all' 
                    ? "No engines have been executed yet." 
                    : `No ${filterStatus} executions found.`
                  }
                </p>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {filteredStatuses.map((status) => (
                  <EngineStatusCard
                    key={status.executionId}
                    status={status}
                    onViewDetails={onViewDetails}
                    onCancel={onCancel}
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
// Compact Engine Status Widget
// ============================================================================

interface EngineStatusWidgetProps {
  className?: string;
  limit?: number;
}

export function EngineStatusWidget({ className, limit = 3 }: EngineStatusWidgetProps) {
  const { engineStatuses, subscribeToEngine } = useNotifications();

  // Get recent active engines
  const recentStatuses = Array.from(engineStatuses.values())
    .filter(status => status.status === 'running' || status.status === 'pending')
    .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
    .slice(0, limit);

  if (recentStatuses.length === 0) {
    return null;
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Active Engines
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentStatuses.map((status) => (
          <EngineStatusCard
            key={status.executionId}
            status={status}
            compact={true}
          />
        ))}
      </CardContent>
    </Card>
  );
}