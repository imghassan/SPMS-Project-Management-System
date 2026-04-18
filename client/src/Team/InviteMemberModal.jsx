import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronDown } from 'lucide-react';
import '../../styles/Components/InviteMemberModal.css';
import api from '../../api/apiClient';
import { useToast } from '../ui/toast.jsx';
import useAuthStore from '../../store/useAuthStore';

const InviteMemberModal = ({ isOpen, onClose, projectOptions = [] }) => {
  const toast = useToast();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    role: 'member',
    projectId: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    setForm((prev) => ({
      ...prev,
      projectId: prev.projectId || projectOptions[0]?.id || projectOptions[0]?._id || ''
    }));
  }, [isOpen, projectOptions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) {
      toast.error('Email is required');
      return;
    }

    if (!form.projectId) {
      toast.error('Please select a project');
      return;
    }

    // Prevent self-invitation on the client side
    if (user?.email && form.email.trim().toLowerCase() === user.email.toLowerCase()) {
      toast.error('You cannot invite yourself - you are already part of your team.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/invitations', {
        email: form.email.trim(),
        role: form.role,
        ...(form.projectId ? { projectId: form.projectId } : {})
      });
      toast.success('Invitation sent! They will appear in your team members list.');
      onClose();
      setForm({ email: '', role: 'member', projectId: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              width: '100%',
              maxWidth: 560,
              background: '#0F1117',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 22,
              padding: 22,
              boxShadow: '0 30px 70px rgba(0,0,0,0.65)'
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ color: '#F8FAFC', fontWeight: 900, fontSize: 18 }}>Invite to Project</div>
                <div style={{ color: 'rgba(148,163,184,0.9)', fontSize: 12, marginTop: 4 }}>
                  Send an invitation by email. They'll appear in your project.
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'rgba(148,163,184,0.95)'
                }}
                aria-label="Close invite modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="im-form-grid">
              <div className="im-full-width">
                <label className="im-label">
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="custom-input"
                  placeholder="user@company.com"
                  style={{ width: '100%' }}
                  type="email"
                  required
                />
              </div>

              <div>
                <label className="im-label">
                  Role
                </label>
                <div className="im-input-wrapper">
                  <select
                    value={form.role}
                    onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                    className="custom-input im-select appearance-none"
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown className="im-select-chevron" size={18} strokeWidth={2.5} />
                </div>
              </div>

              <div>
                <label className="im-label">
                  Project
                </label>
                <div className="im-input-wrapper">
                  <select
                    value={form.projectId}
                    onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}
                    className="custom-input im-select appearance-none"
                    required
                  >
                    {projectOptions.length === 0 && (
                      <option value="">No projects available</option>
                    )}
                    {projectOptions.length > 0 && !form.projectId && (
                      <option value="" disabled>Select a project</option>
                    )}
                    {projectOptions.map((p) => (
                      <option key={p.id || p._id} value={p.id || p._id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="im-select-chevron" size={18} strokeWidth={2.5} />
                </div>
              </div>

              <div className="im-button-group im-full-width">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn btn-secondary"
                  style={{ borderRadius: 16 }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn im-btn-primary-cyan text-white"
                  disabled={loading}
                >
                  <Send size={16} strokeWidth={3} />
                  {loading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InviteMemberModal;

