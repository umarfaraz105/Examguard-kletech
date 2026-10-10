'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Play, RefreshCw, Clock, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import Engine1Scheduler from '@/components/engines/Engine1Scheduler';
import Engine2RoomSeating from '@/components/engines/Engine2RoomSeating';
import Engine3Invigilator from '@/components/engines/Engine3Invigilator';

interface Engine {
  name: string;
  display_name: string;
  version: string;
  description: string;
  capabilities: string[];
  dependencies: string[];
  execution_order: number;
  configured: boolean;
  enabled: boolean;
  health: {
    status: string;
    checks: Record<string, string>;
    message: string;
  };
}

export default function EngineControlPage() {
  const [engines, setEngines] = useState<Engine[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEngine, setActiveEngine] = useState('engine1-scheduling');

  useEffect(() => {
    fetchEngines();
  }, []);

  const fetchEngines = async () => {
    try {
      const response = await fetch('/api/engines/v2/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEngines(data.engines);
      }
    } catch (error) {
      console.error('Error fetching engines:', error);
    } finally {
      setLoading(false);
    }
  };
  const getHealthIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'unhealthy':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'unhealthy':
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
          <h1 className="text-3xl font-bold">Engine Control Center</h1>
          <p className="text-gray-600 mt-2">Manage and execute examination scheduling engines</p>
        </div>
        <Button onClick={fetchEngines} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </Button>
      </div>
      {/* Engine Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {engines.map((engine) => (
          <Card key={engine.name} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{engine.display_name}</h3>
                  <p className="text-sm text-gray-600">v{engine.version}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getHealthIcon(engine.health.status)}
                  <Badge className={getHealthColor(engine.health.status)}>
                    {engine.health.status}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-4">{engine.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Order: {engine.execution_order}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveEngine(engine.name)}
                  className="flex items-center gap-1"
                >
                  <Settings className="h-3 w-3" />
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Engine Interface Tabs */}
      <Tabs value={activeEngine} onValueChange={setActiveEngine} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="engine1-scheduling">
            <Clock className="h-4 w-4 mr-2" />
            Scheduler
          </TabsTrigger>
          <TabsTrigger value="engine2-room-seating">
            <Settings className="h-4 w-4 mr-2" />
            Room & Seating
          </TabsTrigger>
          <TabsTrigger value="engine3-invigilator">
            <CheckCircle className="h-4 w-4 mr-2" />
            Invigilators
          </TabsTrigger>
        </TabsList>
        <TabsContent value="engine1-scheduling">
          <Engine1Scheduler />
        </TabsContent>
        
        <TabsContent value="engine2-room-seating">
          <Engine2RoomSeating />
        </TabsContent>
        
        <TabsContent value="engine3-invigilator">
          <Engine3Invigilator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
