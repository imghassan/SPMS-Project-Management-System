import { create } from 'zustand';
import api from '../api/apiClient';

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        loading: false
      });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Login failed',
        loading: false
      });
      return false;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      set({
        user: res.data.user,
        token: res.data.token,
        isAuthenticated: true,
        loading: false
      });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Registration failed',
        loading: false
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ loading: true });
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, isAuthenticated: true, loading: false });
    } catch (err) {
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  updateProfile: async (profileData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.put('/auth/profile', profileData);
      set({
        user: res.data.user,
        loading: false
      });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Update failed',
        loading: false
      });
      return false;
    }
  },

  uploadAvatar: async (file) => {
    set({ loading: true, error: null });
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set({
        user: res.data.user,
        loading: false
      });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Upload failed',
        loading: false
      });
      return false;
    }
  },
  
  removeAvatar: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.delete('/auth/avatar');
      set({
        user: res.data.user,
        loading: false
      });
      return true;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Avatar removal failed',
        loading: false
      });
      return false;
    }
  },

  changePassword: async (passwordData) => {
    set({ loading: true, error: null });
    try {
      await api.put('/auth/change-password', passwordData);
      set({ loading: false });
      return { success: true, message: 'Password changed successfully' };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Password change failed';
      set({
        error: errorMessage,
        loading: false
      });
      return { success: false, message: errorMessage };
    }
  }
}));

export default useAuthStore;
