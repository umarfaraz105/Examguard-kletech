'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Play, Square, Settings, Activity, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Engine {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
  progress?: number;
  last_execution?: string;
  execution_time?: number;
  error_message?: string;
  configuration: Record<string, any>;
}

interface ExecutionLog {
  id: string;
  engine_id: string;
  status: string;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  progress: number;
}

export default function EnginesPage() {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState<string | null>(null);

  useEffect(() => {
    fetchEngines();
    fetchExecutionLogs();
    
    // Poll for updates every 5 seconds when engines are running
    const interval = setInterval(() => {
      if (engines.some(e => e.status === 'running')) {
        fetchEngines();
        fetchExecutionLogs();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [engines]);

  const fetchEngines = async () => {
    try {
      const response = await fetch('/api/engines/v2', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEngines(data);
      }
    } catch (error) {
      console.error('Error fetching engines:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchExecutionLogs = async () => {
    try {
      const response = await fetch('/api/engines/executions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setExecutionLogs(data.slice(0, 10)); // Show last 10 executions
      }
    } catch (error) {
      console.error('Error fetching execution logs:', error);
    }
  };

  const handleExecuteEngine = async (engineId: string) => {
    setExecuting(engineId);
    try {
      const response = await fetch(`/api/engines/v2/${engineId}/execute`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        await fetchEngines();
        await fetchExecutionLogs();
      } else {
        console.error('Failed to execute engine');
      }
    } catch (error) {
      console.error('Error executing engine:', error);
    } finally {
      setExecuting(null);
    }
  };

  const handleStopEngine = async (engineId: string) => {
    try {
      const response = await fetch(`/api/engines/v2/${engineId}/stop`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (response.ok) {
        await fetchEngines();
      }
    } catch (error) {
      console.error('Error stopping engine:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
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
          <h1 className="text-3xl font-bold">Engine Management</h1>
          <p className="text-gray-600 mt-2">Monitor and control examination scheduling engines</p>
        </div>
        <Button onClick={() => { fetchEngines(); fetchExecutionLogs(); }} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Engine Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Engines</p>
                <p className="text-2xl font-bold">{engines.length}</p>
              </div>
              <Settings className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Running</p>
                <p className="text-2xl font-bold text-blue-600">
                  {engines.filter(e => e.status === 'running').length}
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">
                  {engines.filter(e => e.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">
                  {engines.filter(e => e.status === 'failed').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engines List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {engines.map((engine) => (
          <Card key={engine.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(engine.status)}
                    {engine.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{engine.description}</p>
                </div>
                <Badge className={getStatusColor(engine.status)}>
                  {engine.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{engine.version}</span>
                </div>

                {engine.status === 'running' && engine.progress !== undefined && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{engine.progress}%</span>
                    </div>
                    <Progress value={engine.progress} className="h-2" />
                  </div>
                )}

                {engine.last_execution && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Execution:</span>
                    <span className="font-medium">
                      {new Date(engine.last_execution).toLocaleString()}
                    </span>
                  </div>
                )}

                {engine.execution_time && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Execution Time:</span>
                    <span className="font-medium">{engine.execution_time}s</span>
                  </div>
                )}

                {engine.error_message && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {engine.error_message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between pt-4 border-t">
                  <div className="flex gap-2">
                    {engine.status === 'running' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStopEngine(engine.id)}
                        className="flex items-center gap-1"
                      >
                        <Square className="h-3 w-3" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleExecuteEngine(engine.id)}
                        disabled={executing === engine.id}
                        className="flex items-center gap-1"
                      >
                        <Play className="h-3 w-3" />
                        {executing === engine.id ? 'Starting...' : 'Execute'}
                      </Button>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Settings className="h-3 w-3" />
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Executions</CardTitle>
        </CardHeader>
        <CardContent>
          {executionLogs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No execution history available</p>
            </div>
          ) : (
            <div className="space-y-3">
              {executionLogs.map((log) => {
                const engine = engines.find(e => e.id === log.engine_id);
                return (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <p className="font-medium">{engine?.name || 'Unknown Engine'}</p>
                        <p className="text-sm text-gray-600">
                          Started: {new Date(log.started_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {log.status === 'running' && (
                        <div className="flex items-center gap-2">
                          <Progress value={log.progress} className="w-20 h-2" />
                          <span className="text-sm">{log.progress}%</span>
                        </div>
                      )}
                      <Badge className={getStatusColor(log.status)}>
                        {log.status}
                      </Badge>
                      {log.completed_at && (
                        <span className="text-sm text-gray-600">
                          {Math.round((new Date(log.completed_at).getTime() - new Date(log.started_at).getTime()) / 1000)}s
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
