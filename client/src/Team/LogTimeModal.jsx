import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Calendar, Clock, User, CheckCircle, ChevronDown, List } from 'lucide-react';
import { motion } from 'framer-motion';
import '../../styles/Components/LogTimeModal.css';
import api from '../../api/apiClient';
import useAuthStore from '../../store/useAuthStore';

const LogTimeModal = ({ onClose, members, onLogged, projects }) => {
  const { user } = useAuthStore();
  
  const [form, setForm] = useState({
    memberId: user?.id || user?._id || '',
    projectId: '',
    taskId: '',
    date: new Date().toISOString().split('T')[0],
    hoursSpent: '1',
  });

  useEffect(() => {
    if (user && !form.memberId) {
      setForm(prev => ({ ...prev, memberId: user.id || user._id }));
    }
  }, [user]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTasks, setFetchingTasks] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));

    if (field === 'projectId' && value) {
      fetchTasks(value);
    }
  };

  const fetchTasks = async (projectId) => {
    setFetchingTasks(true);
    try {
      const res = await api.get(`/tasks?project=${projectId}`);
      setTasks(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setFetchingTasks(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.memberId) { setError('Please select a team member'); return; }
    if (!form.projectId) { setError('Please select a project'); return; }
    if (!form.hoursSpent || Number(form.hoursSpent) <= 0) { setError('Please enter valid hours'); return; }

    setError(null);
    setLoading(true);
    try {
      await api.post('/workload/log-time', {
        userId: form.memberId,
        projectId: form.projectId,
        taskId: form.taskId || null,
        date: form.date,
        hoursSpent: Number(form.hoursSpent),
      });
      onLogged?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to log time. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040911]/60 backdrop-blur-md p-4 animate-in fade-in duration-300" style={{ zIndex: 9999 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#0A101C]/90 backdrop-blur-xl w-full max-w-md rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Log Time</h2>
            <p className="text-[#94A3B8] text-sm mt-1">Record actual hours spent on a task.</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-[#94A3B8] hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <form className="p-8 space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-400 text-[13px] bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {error}
            </div>
          )}

          {/* Member */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8] ml-1">
              Team Member
            </label>
            <div className="at-input-wrapper opacity-70 cursor-not-allowed bg-white/[0.03]">
              <User className="at-icon-left text-[#94A3B8]" size={16} />
              <input
                type="text"
                className="custom-input at-input-field cursor-not-allowed bg-transparent"
                value={user?.name || 'My Self'}
                readOnly
              />
            </div>
          </div>

          {/* Project */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8] ml-1">
              Project
            </label>
            <div className="at-input-wrapper">
              <CheckCircle className="at-icon-left" size={16} />
              <select
                className="custom-input at-input-field at-select appearance-none cursor-pointer"
                value={form.projectId}
                onChange={handleChange('projectId')}
                required
              >
                <option value="">Select Project</option>
                {projects.map((p) => (
                  <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                ))}
              </select>
              <ChevronDown className="at-select-chevron" size={18} strokeWidth={2.5} />
            </div>
          </div>

          {/* Task (Optional but recommended) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8] ml-1">
              Task (Optional)
            </label>
            <div className="at-input-wrapper">
              <List className="at-icon-left" size={16} />
              <select
                className="custom-input at-input-field at-select appearance-none cursor-pointer"
                value={form.taskId}
                onChange={handleChange('taskId')}
                disabled={!form.projectId || fetchingTasks}
              >
                <option value="">{fetchingTasks ? 'Loading tasks...' : 'Select Task'}</option>
                {tasks.map((t) => (
                  <option key={t._id} value={t._id}>{t.title}</option>
                ))}
              </select>
              <ChevronDown className="at-select-chevron" size={18} strokeWidth={2.5} />
            </div>
          </div>

          {/* Date + Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8] ml-1">
                Date
              </label>
              <div className="at-input-wrapper">
                <Calendar className="at-icon-left" size={16} />
                <input
                  type="date"
                  className="custom-input at-input-field"
                  value={form.date}
                  onChange={handleChange('date')}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8] ml-1">
                Hours Spent
              </label>
              <div className="at-input-wrapper">
                <Clock className="at-icon-left" size={16} />
                <input
                  type="number"
                  min="0.1"
                  max="24"
                  step="0.1"
                  placeholder="1"
                  className="custom-input at-input-field placeholder:text-white/20"
                  value={form.hoursSpent}
                  onChange={handleChange('hoursSpent')}
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-8">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-[#131B2A] border border-white/5 text-[#94A3B8] font-black py-4 rounded-xl text-xs uppercase tracking-[0.1em] hover:bg-[#1A2332] hover:text-white transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{ background: 'linear-gradient(135deg, #00D1FF 0%, #0099FF 100%)' }}
              className="flex-1 text-[#0A101C] font-black py-4 rounded-xl text-xs uppercase tracking-[0.1em] hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{loading ? 'Logging…' : 'Log Time'}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default LogTimeModal;
