import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'reminder' | 'progress' | 'streak';
  date: string;
  read: boolean;
  data?: any;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  markAllAsRead: () => void; 
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveNotifications = async (newNotifications: Notification[]) => {
    try {
      await AsyncStorage.setItem('notifications', JSON.stringify(newNotifications));
    } catch (error) {
      console.error('Error saving notifications:', error);
    }
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'date' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      read: false,
    };

    const updated = [newNotification, ...notifications];
    setNotifications(updated);
    saveNotifications(updated);
  };

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    saveNotifications(updated);
  };

  const clearNotifications = () => {
    setNotifications([]);
    saveNotifications([]);
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        addNotification, 
        markAsRead, 
        clearNotifications,
        markAllAsRead, // Add this line
        unreadCount 
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};