import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import taskApi from '../api/taskApi';

const TaskContext = createContext();

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, done: 0, active: 0, overdue: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const response = await taskApi.getTasks(filters);
      setTasks(response.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tasks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await taskApi.getStats();
      // Stats endpoint returns the object directly as per controller
      setStats(response.data || { total: 0, done: 0, active: 0, overdue: 0 });
    } catch (err) {
      console.error('Failed to fetch stats', err);
    }
  }, []);

  const addTask = async (taskData) => {
    try {
      const response = await taskApi.createTask(taskData);
      const newTask = response.data.data || response.data;
      setTasks(prev => [newTask, ...prev]);
      fetchStats();
      return newTask;
    } catch (err) {
      setError('Failed to add task');
      throw err;
    }
  };

  const updateTask = async (id, taskData) => {
    try {
      const response = await taskApi.updateTask(id, taskData);
      const updated = response.data.data || response.data;
      setTasks(prev => {
        if (Array.isArray(prev)) {
          return prev.map(t => t._id === id ? updated : t);
        }
        return prev;
      });
      fetchStats();
      return updated;
    } catch (err) {
      setError('Failed to update task');
      throw err;
    }
  };

  const toggleTaskComplete = async (id) => {
    try {
      const response = await taskApi.toggleComplete(id);
      const updated = response.data.data || response.data;
      setTasks(prev => {
        if (Array.isArray(prev)) {
          return prev.map(t => t._id === id ? updated : t);
        }
        return prev;
      });
      fetchStats();
    } catch (err) {
      setError('Failed to toggle task Done status');
    }
  };

  const removeTask = async (id) => {
    try {
      await taskApi.deleteTask(id);
      setTasks(prev => {
        if (Array.isArray(prev)) {
          return prev.filter(t => t._id !== id);
        }
        return prev;
      });
      fetchStats();
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  const value = {
    tasks,
    stats,
    loading,
    error,
    fetchTasks,
    fetchStats,
    addTask,
    updateTask,
    toggleTaskComplete,
    removeTask
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
