import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { isOfflineMode } from '../lib/supabase';

export type NotificationType = 'teacher_approval' | 'system_alert' | 'data_sync';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  requestId?: string;
  email?: string;
  priority: 'low' | 'medium' | 'high';
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  pendingRolesRefreshTrigger: number;
  triggerPendingRolesRefresh: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [pendingRolesRefreshTrigger, setPendingRolesRefreshTrigger] = useState(0);

  const triggerPendingRolesRefresh = useCallback(() => {
    setPendingRolesRefreshTrigger(prev => prev + 1);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch pending teacher requests
      const { requests } = await api.listRequests();
      
      // Convert teacher requests to notifications
      const teacherNotifications: Notification[] = requests
        .filter(r => r.status === 'pending')
        .map(request => ({
          id: `teacher_${request.id}`,
          type: 'teacher_approval' as NotificationType,
          title: 'Teacher Registration Request',
          message: `${request.full_name} is requesting approval as a ${request.request_type}`,
          timestamp: new Date(request.created_at),
          isRead: false,
          actionUrl: '/settings',
          requestId: request.id,
          email: request.email,
          priority: 'high' as const,
        }));

      // Add system alerts
      const systemNotifications: Notification[] = [];

      if (isOfflineMode) {
        systemNotifications.push({
          id: 'system_offline',
          type: 'data_sync',
          title: 'Offline Mode Active',
          message: 'Running in offline mode. Data changes will not be saved to Supabase.',
          timestamp: new Date(),
          isRead: false,
          priority: 'medium' as const,
        });
      }

      setNotifications([...teacherNotifications, ...systemNotifications]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, []);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Fetch notifications on mount and every 5 minutes
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Handle Escape key to close panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPanelOpen) {
        setIsPanelOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        addNotification,
        isPanelOpen,
        setIsPanelOpen,
        pendingRolesRefreshTrigger,
        triggerPendingRolesRefresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}