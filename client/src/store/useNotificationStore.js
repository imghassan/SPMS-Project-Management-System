import { create } from 'zustand';
import api from '../api/apiClient';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/notifications');
      const notifications = res.data.data;
      set({ 
        notifications, 
        unreadCount: notifications.filter(n => !n.isRead).length,
        loading: false 
      });
    } catch (err) {
      console.error('Error fetching notifications:', err);
      set({ loading: false });
    }
  },

  markAsRead: async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      set((state) => {
        const notifications = state.notifications.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        );
        return {
          notifications,
          unreadCount: notifications.filter((n) => !n.isRead).length,
        };
      });
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  },

  markAllAsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      }));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  },

  clearNotifications: async () => {
    try {
      await api.delete('/notifications/clear-all');
      set({ notifications: [], unreadCount: 0 });
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  },

  addNotification: (notification) => {
    set((state) => {
      const notifications = [notification, ...state.notifications].slice(0, 50);
      return {
        notifications,
        unreadCount: notifications.filter((n) => !n.isRead).length,
      };
    });
  }
}));

export default useNotificationStore;
