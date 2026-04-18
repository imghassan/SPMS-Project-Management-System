import api from './apiClient';

const API_URL = '/notifications';

const notificationsApi = {
  getNotifications: () => api.get(API_URL),
  markRead: (id) => api.patch(`${API_URL}/${id}/read`),
  markAllRead: () => api.patch(`${API_URL}/read-all`),
  deleteNotification: (id) => api.delete(`${API_URL}/${id}`),
  clearAll: () => api.delete(`${API_URL}/clear-all`)
};

export default notificationsApi;
