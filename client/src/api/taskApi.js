import api from './apiClient';

export const getTasks = (filters) => api.get('/tasks', { params: filters });
export const getTaskById = (id) => api.get(`/tasks/${id}`);
export const getStats = () => api.get('/tasks/stats');
export const createTask = (taskData) => api.post('/tasks', taskData);
export const updateTask = (id, taskData) => api.put(`/tasks/${id}`, taskData);
export const patchStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });
export const reorderTasks = (tasks) => api.patch('/tasks/reorder', { tasks });
export const toggleComplete = (id) => api.patch(`/tasks/${id}/complete`);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
export const autoAssignTask = (id) => api.post(`/tasks/${id}/auto-assign`);
export const suggestAssignee = (taskData) => api.post('/tasks/suggest-assignee', taskData);
export const uploadAttachment = (formData) => api.post('/tasks/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export default {
  getTasks,
  getTaskById,
  getStats,
  createTask,
  updateTask,
  patchStatus,
  reorderTasks,
  toggleComplete,
  deleteTask,
  autoAssignTask,
  suggestAssignee,
  uploadAttachment
};
