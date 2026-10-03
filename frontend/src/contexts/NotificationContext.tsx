/**
 * Notification Context for real-time notifications and status updates
 */
'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from '@/lib/toast';

// ============================================================================
// Types
// ============================================================================

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'engine_status' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  persistent?: boolean;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
}

export interface EngineStatus {
  engineName: string;
  executionId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress?: number;
  message?: string;
  startedAt: Date;
  completedAt?: Date;
  result?: any;
}

// ============================================================================
// Context Interface
// ============================================================================

interface NotificationContextType {
  // Notifications
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Engine Status
  engineStatuses: Map<string, EngineStatus>;
  subscribeToEngine: (executionId: string) => void;
  unsubscribeFromEngine: (executionId: string) => void;
  
  // Connection Status
  isConnected: boolean;
  connectionError: string | null;
  
  // Settings
  settings: NotificationSettings;
  updateSettings: (settings: Partial<NotificationSettings>) => void;
}

interface NotificationSettings {
  enabled: boolean;
  showToasts: boolean;
  soundEnabled: boolean;
  types: {
    success: boolean;
    error: boolean;
    warning: boolean;
    info: boolean;
    engine_status: boolean;
    system: boolean;
  };
}

const defaultSettings: NotificationSettings = {
  enabled: true,
  showToasts: true,
  soundEnabled: false,
  types: {
    success: true,
    error: true,
    warning: true,
    info: true,
    engine_status: true,
    system: true,
  },
};

// ============================================================================
// Context
// ============================================================================

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// ============================================================================
// Provider Component
// ============================================================================

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [engineStatuses, setEngineStatuses] = useState<Map<string, EngineStatus>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [subscribedEngines, setSubscribedEngines] = useState<Set<string>>(new Set());

  // ============================================================================
  // WebSocket Connection
  // ============================================================================

  const connectWebSocket = useCallback(() => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.log('No access token available for WebSocket connection');
        return;
      }

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
      const socket = new WebSocket(`${wsUrl}?token=${token}`);

      socket.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        setConnectionError(null);
        
        // Resubscribe to engines
        subscribedEngines.forEach(executionId => {
          socket.send(JSON.stringify({
            type: 'subscribe_engine',
            executionId,
          }));
        });
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      socket.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setWs(null);
        
        // Attempt to reconnect after a delay (exponential backoff could be implemented)
        if (!event.wasClean) {
          setTimeout(connectWebSocket, 3000);
        }
      };

      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionError('Connection failed');
      };

      setWs(socket);
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionError('Failed to connect');
    }
  }, [subscribedEngines]);

  // ============================================================================
  // Message Handling
  // ============================================================================

  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'notification':
        handleNotificationMessage(message.data);
        break;
      case 'engine_status':
        handleEngineStatusMessage(message.data);
        break;
      case 'system_status':
        handleSystemStatusMessage(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }, [settings]);

  const handleNotificationMessage = useCallback((data: any) => {
    const notification: Notification = {
      id: data.id || `notif_${Date.now()}_${Math.random()}`,
      type: data.type || 'info',
      title: data.title,
      message: data.message,
      timestamp: new Date(data.timestamp || Date.now()),
      read: false,
      persistent: data.persistent,
      actionUrl: data.actionUrl,
      actionText: data.actionText,
      metadata: data.metadata,
    };

    // Check if this notification type is enabled
    if (!settings.types[notification.type]) {
      return;
    }

    addNotification(notification);
  }, [settings.types]);

  const handleEngineStatusMessage = useCallback((data: any) => {
    const status: EngineStatus = {
      engineName: data.engineName,
      executionId: data.executionId,
      status: data.status,
      progress: data.progress,
      message: data.message,
      startedAt: new Date(data.startedAt),
      completedAt: data.completedAt ? new Date(data.completedAt) : undefined,
      result: data.result,
    };

    setEngineStatuses(prev => new Map(prev).set(data.executionId, status));

    // Create notification for status changes
    if (settings.types.engine_status) {
      let title = '';
      let type: NotificationType = 'info';

      switch (status.status) {
        case 'running':
          title = `${status.engineName} Started`;
          type = 'info';
          break;
        case 'completed':
          title = `${status.engineName} Completed`;
          type = 'success';
          break;
        case 'failed':
          title = `${status.engineName} Failed`;
          type = 'error';
          break;
        case 'cancelled':
          title = `${status.engineName} Cancelled`;
          type = 'warning';
          break;
      }

      if (title) {
        const notification: Notification = {
          id: `engine_${data.executionId}_${status.status}`,
          type,
          title,
          message: status.message || `Engine execution ${status.status}`,
          timestamp: new Date(),
          read: false,
          actionUrl: `/dashboard/admin/engine-control?execution=${data.executionId}`,
          actionText: 'View Details',
          metadata: { engineName: status.engineName, executionId: data.executionId },
        };

        addNotification(notification);
      }
    }
  }, [settings.types.engine_status]);

  const handleSystemStatusMessage = useCallback((data: any) => {
    if (settings.types.system) {
      const notification: Notification = {
        id: `system_${Date.now()}`,
        type: data.severity || 'info',
        title: data.title || 'System Notification',
        message: data.message,
        timestamp: new Date(),
        read: false,
        persistent: data.persistent,
      };

      addNotification(notification);
    }
  }, [settings.types.system]);

  // ============================================================================
  // Notification Management
  // ============================================================================

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const fullNotification: Notification = {
      id: `notif_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      read: false,
      ...notification,
    };

    setNotifications(prev => [fullNotification, ...prev].slice(0, 100)); // Keep last 100

    // Show toast if enabled
    if (settings.showToasts && settings.enabled) {
      switch (fullNotification.type) {
        case 'success':
          toast.success(fullNotification.message);
          break;
        case 'error':
          toast.error(fullNotification.message);
          break;
        case 'warning':
          toast.warning(fullNotification.message);
          break;
        default:
          toast.info(fullNotification.message);
      }
    }

    // Play sound if enabled
    if (settings.soundEnabled && settings.enabled) {
      playNotificationSound(fullNotification.type);
    }
  }, [settings]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ============================================================================
  // Engine Subscription Management
  // ============================================================================

  const subscribeToEngine = useCallback((executionId: string) => {
    setSubscribedEngines(prev => new Set(prev).add(executionId));
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'subscribe_engine',
        executionId,
      }));
    }
  }, [ws]);

  const unsubscribeFromEngine = useCallback((executionId: string) => {
    setSubscribedEngines(prev => {
      const newSet = new Set(prev);
      newSet.delete(executionId);
      return newSet;
    });
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'unsubscribe_engine',
        executionId,
      }));
    }
  }, [ws]);

  // ============================================================================
  // Settings Management
  // ============================================================================

  const updateSettings = useCallback((newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Persist to localStorage
    localStorage.setItem('notification_settings', JSON.stringify({ ...settings, ...newSettings }));
  }, [settings]);

  // ============================================================================
  // Sound Effects
  // ============================================================================

  const playNotificationSound = useCallback((type: NotificationType) => {
    try {
      // Create audio context if not exists
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();

      // Create different tones for different notification types
      const frequency = {
        success: 800,
        error: 400,
        warning: 600,
        info: 500,
        engine_status: 700,
        system: 550,
      }[type] || 500;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      // Silently fail if audio is not supported
      console.log('Audio notification not supported');
    }
  }, []);

  // ============================================================================
  // Effects
  // ============================================================================

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('notification_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error('Failed to parse notification settings:', error);
      }
    }
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  // ============================================================================
  // Computed Values
  // ============================================================================

  const unreadCount = notifications.filter(n => !n.read).length;

  // ============================================================================
  // Context Value
  // ============================================================================

  const contextValue: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearNotifications,
    engineStatuses,
    subscribeToEngine,
    unsubscribeFromEngine,
    isConnected,
    connectionError,
    settings,
    updateSettings,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
}