import React, { useState } from 'react';
import { Settings, Save, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import projectsApi from '../../api/projectsApi';
import { useNavigate } from 'react-router-dom';
import '../../styles/Components/ProjectSettings.css';

const ProjectSettings = ({ project, onUpdate, isAdmin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: project?.name || '',
    description: project?.description || '',
    status: project?.status || 'IN PROGRESS',
    startDate: project?.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
    dueDate: project?.dueDate ? new Date(project.dueDate).toISOString().slice(0, 10) : '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await projectsApi.updateProject(project._id, formData);
      onUpdate(res.data.data);
      setMessage({ type: 'success', text: 'Project updated successfully!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to update project.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await projectsApi.deleteProject(project._id);
        navigate('/projects');
      } catch (err) {
        console.error(err);
        alert('Failed to delete project.');
      }
    }
  };

  return (
    <div className="project-settings-container">
      <div className="settings-section">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Settings size={20} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">General Settings</h2>
            <p className="text-sm text-muted">Update project title, vision, and status</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Apollo Redesign"
              required
              disabled={!isAdmin}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Briefly describe the project goals..."
              rows={4}
              disabled={!isAdmin}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} disabled={!isAdmin}>
              <option value="IN PROGRESS">In Progress</option>
              <option value="ON HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                disabled={!isAdmin}
                style={{ colorScheme: 'dark', width: '100%' }}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Deadline Date</label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                disabled={!isAdmin}
                style={{ colorScheme: 'dark', width: '100%' }}
              />
            </div>
          </div>

          {message && (
            <div className={`message-banner ${message.type}`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {message.text}
            </div>
          )}

          {isAdmin && (
            <div className="form-actions mt-8 pt-6 border-t border-white/5">
              <button
                type="submit"
                disabled={loading}
                className="save-btn"
              >
                {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
              </button>
            </div>
          )}
        </form>
      </div>

      {isAdmin && (
        <div className="settings-section danger-zone mt-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertTriangle size={20} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Danger Zone</h2>
              <p className="text-sm text-muted">Irreversible actions for this project</p>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-red-500 mb-1">Delete this project</h4>
              <p className="text-xs text-[#94A3B8] max-w-md">Once you delete a project, there is no going back. All tasks, files, and members will be removed.</p>
            </div>
            <button onClick={handleDelete} className="delete-btn">
              <Trash2 size={18} />
              Delete Project
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectSettings;
