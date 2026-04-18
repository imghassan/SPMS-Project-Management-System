import { useState, useEffect, useCallback } from 'react';
import notificationsApi from '../api/notificationsApi';

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsApi.getNotifications();
      const unread = res.data.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      setNotifications(res.data.data);
    } catch (err) {
      console.error('Failed to fetch notifications count', err);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  return {
    unreadCount,
    notifications,
    loading,
    refresh: fetchUnreadCount,
    markAllAsRead
  };
};

export default useNotifications;
