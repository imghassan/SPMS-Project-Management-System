import api from './apiClient';

export const getProjects = () => api.get('/projects');
export const getMyTeam = () => api.get('/projects/my-team');
export const getProjectStats = () => api.get('/projects/stats');
export const getProjectById = (id) => api.get(`/projects/${id}`);
export const createProject = (payload) => api.post('/projects', payload);
export const updateProject = (id, payload) => api.put(`/projects/${id}`, payload);
export const deleteProject = (id) => api.delete(`/projects/${id}`);

export default {
  getProjects,
  getMyTeam,
  getProjectStats,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
};

