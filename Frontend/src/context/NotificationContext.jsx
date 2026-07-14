import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import socketService from '../services/socket';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const userRole = String(typeof user.role === 'object' ? user.role?.role_name || '' : (user.role || user.role_name || '')).toUpperCase();
      const response = await api.get('/notifications', {
        params: { userId: user.id, role: userRole }
      });
      setNotifications(response.data.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      const token = localStorage.getItem('token');
      const userRole = String(typeof user.role === 'object' ? user.role?.role_name || '' : (user.role || user.role_name || '')).toUpperCase();
      const socket = socketService.connect(token, userRole);

      socketService.on('notification', (newNotif) => {
        // Only add if it's for this user or their role
        if (newNotif.targetRole === 'ALL' || newNotif.targetRole === userRole || newNotif.user_id === user.id) {
          setNotifications(prev => [newNotif, ...prev]);
          
          // Optional: Browser Notification
          if (Notification.permission === 'granted') {
             new Notification(newNotif.notification_type || 'System Alert', {
               body: newNotif.message,
               icon: '/logo.png'
             });
          }
        }
      });

      return () => {
        socketService.off('notification');
        socketService.disconnect();
      };
    }
  }, [user, fetchNotifications]);

  const addNotification = useCallback(async (notif) => {
    try {
      await api.post('/notifications', {
        user_id: notif.userId || user?.id,
        notification_type: notif.type || 'system',
        message: notif.message,
        targetRole: notif.targetRole?.toUpperCase() || 'ALL'
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error adding notification:', error);
      // Fallback to local state if backend fails
      setNotifications(prev => [{
        id: Date.now(),
        timestamp: new Date().toISOString(),
        read: false,
        ...notif
      }, ...prev]);
    }
  }, [user, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1, read: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  const markAllAsRead = useCallback(async (role) => {
    try {
      const userRole = role || String(typeof user?.role === 'object' ? user?.role?.role_name || '' : (user?.role || user?.role_name || '')).toUpperCase();
      await api.post('/notifications/mark-all-read', { userId: user?.id, role: userRole });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [user]);

  const deleteNotification = useCallback(async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const getUnreadCount = useCallback((role) => {
    const userRole = String(role || '').toUpperCase();
    return notifications.filter(n => 
      (!n.is_read && !n.read) && 
      (n.targetRole === userRole || n.targetRole === 'ALL')
    ).length;
  }, [notifications]);

  return (
    <NotificationContext.Provider value={{
      notifications: notifications.map(n => ({
        ...n,
        title: n.notification_type?.toUpperCase() || 'SYSTEM ALERT',
        read: n.is_read === 1 || n.read === true,
        timestamp: n.createdAt || n.timestamp
      })),
      addNotification,
      markAsRead,
      markAllAsRead,
      getUnreadCount,
      deleteNotification,
      refreshNotifications: fetchNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};


