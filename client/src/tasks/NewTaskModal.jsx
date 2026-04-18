import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  Check,
  Sparkles,
  Plus,
  Trash2,
  Paperclip,
  FileText,
  Image as ImageIcon,
  Zap,
  Send,
  Hash
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useTasks } from '../../hooks/useTasks';
import useAuthStore from '../../store/useAuthStore';
import projectsApi from '../../api/projectsApi';
import api from '../../api/apiClient';
import taskApi from '../../api/taskApi';

const NewTaskModal = ({ isOpen, onClose, defaultProjectId }) => {
  const { addTask } = useTasks();
  const { user: currentUser } = useAuthStore();
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignee: '',
    dueDate: '',
    priority: 'Medium',
    status: 'To Do',
    subtasks: [],
    attachments: []
  });
  const [newSubtask, setNewSubtask] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projRes, memberRes] = await Promise.all([
          projectsApi.getProjects(),
          api.get('/auth/users')
        ]);

        const fetchedProjects = (projRes.data.data || projRes.data || []).filter(p => {
          const projectAdmin = (p.admin?._id || p.admin)?.toString();
          const projectLead = (p.lead?._id || p.lead)?.toString();
          const currentUserId = (currentUser?.id || currentUser?._id)?.toString();
          return currentUserId && (projectAdmin === currentUserId || projectLead === currentUserId);
        });
        const fetchedMembers = memberRes.data.data || memberRes.data || [];

        setProjects(fetchedProjects);
        setMembers(fetchedMembers);

        setFormData(prev => ({
          ...prev,
          project: defaultProjectId || fetchedProjects[0]?._id || prev.project,
        }));

      } catch (err) {
        console.error('[NewTaskModal] Failed to load initial data:', err);
      }
    };

    if (isOpen) {
      setError(null);
      setFormData({
        title: '',
        description: '',
        project: defaultProjectId || '',
        assignee: '',
        dueDate: '',
        priority: 'Medium',
        status: 'To Do',
        subtasks: [],
        attachments: []
      });
      loadData();
    }
  }, [isOpen, defaultProjectId, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || !formData.title.trim()) return;

    setIsSubmitting(true);
    try {
      await addTask(formData);
      toast.success('Task created successfully!');
      window.dispatchEvent(new CustomEvent('taskAdded'));
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!formData.title.trim()) {
      toast.error('Enter a task title first');
      return;
    }

    try {
      setIsSuggesting(true);
      const res = await taskApi.suggestAssignee({
        title: formData.title,
        description: formData.description
      });

      const recommendations = res.data.recommendations || [];
      if (recommendations.length > 0) {
        const best = recommendations[0];
        setFormData(prev => ({ ...prev, assignee: best.user._id }));
        toast.success(`Recommended: ${best.user.name} (${best.score}% Match)`, {
          icon: '✨',
          duration: 4000
        });
      } else {
        toast.error('No suitable members found');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to get recommendation';
      toast.error(msg);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return;
    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, { label: newSubtask, completed: false }]
    }));
    setNewSubtask('');
  };

  const handleRemoveSubtask = (index) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    try {
      setIsUploading(true);
      const res = await taskApi.uploadAttachment(uploadFormData);
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, res.data.data]
      }));
      toast.success('File uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#040911]/85 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, rotateX: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative z-[20010] w-full max-w-2xl bg-[#0b121e]/80 border border-white/5 shadow-2xl rounded-[32px] overflow-hidden flex flex-col max-h-[90vh] backdrop-blur-2xl"
          >
            {/* Operational Glow */}
            <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-teal-500/10 blur-[120px] pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-8 py-8 border-b border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400/50 to-transparent"></div>
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">Create New Task</h2>
                <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Define a new objective for your team.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-white/20 hover:text-white p-3 rounded-2xl hover:bg-white/5 transition-all border border-white/5 bg-white/[0.02]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col min-h-0 relative z-10">
              <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar max-h-[calc(90vh-180px)]">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-3 backdrop-blur-md"
                  >
                    <AlertCircle size={16} />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Title Section */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Task Title</label>
                  <input
                    autoFocus
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Enter objective title..."
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-white text-base font-bold focus:outline-none focus:border-teal-400/50 focus:ring-4 focus:ring-teal-400/5 transition-all placeholder:text-white/10"
                  />
                </div>

                {/* Description Section */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Task Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Provide detailed execution steps..."
                    rows={4}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-medium focus:outline-none focus:border-teal-400/50 focus:ring-4 focus:ring-teal-400/5 transition-all placeholder:text-white/10 resize-none leading-relaxed"
                  />
                </div>

                {/* Grid Section for Selects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Project</label>
                    <div className="relative group">
                      <select
                        name="project"
                        required
                        value={formData.project}
                        onChange={handleChange}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-teal-400/50 appearance-none transition-all cursor-pointer"
                      >
                        <option value="" disabled className="bg-[#0b121e]">Select Project</option>
                        {projects.map(project => (
                          <option key={project._id} value={project._id} className="bg-[#0b121e]">
                            {project.name || project.title}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-teal-400 transition-colors pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block">Assignee</label>
                      <button
                        type="button"
                        onClick={handleAutoAssign}
                        disabled={isSuggesting || !formData.title.trim()}
                        className={`flex items-center gap-1.5 text-[9px] font-black transition-all px-2.5 py-1 rounded-lg border
                                ${isSuggesting ? 'animate-pulse text-teal-400 border-teal-400/30' :
                            !formData.title.trim() ? 'text-white/10 border-transparent opacity-50 cursor-not-allowed' :
                              'text-teal-400 border-teal-400/20 hover:bg-teal-400/5 hover:border-teal-400/40'}`}
                      >
                        <Sparkles size={12} className={isSuggesting ? 'animate-spin' : ''} />
                        <span>AUTO ASSIGN</span>
                      </button>
                    </div>
                    <div className="relative group">
                      <select
                        name="assignee"
                        required
                        onChange={handleChange}
                        value={formData.assignee}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-teal-400/50 appearance-none transition-all cursor-pointer"
                      >
                        <option value="" disabled className="bg-[#0b121e]">Select Assignee</option>
                        {(() => {
                          const currentUserId = (currentUser?._id || currentUser?.id)?.toString();
                          
                          // Filter members that belong to the selected project
                          const projectMembers = members.filter(u => {
                            const selectedProject = projects.find(p => p._id === formData.project);
                            if (!selectedProject) return false;
                            
                            const pMembers = selectedProject.members || [];
                            const pAdmin = (selectedProject.admin?._id || selectedProject.admin)?.toString();
                            const uId = (u._id || u.id)?.toString();
                            
                            return pMembers.some(m => (m._id || m)?.toString() === uId) || pAdmin === uId;
                          });

                          // Deduplicate by ID and include current user
                          const uniqueMembersMap = new Map();
                          projectMembers.forEach(m => uniqueMembersMap.set((m._id || m.id)?.toString(), m));
                          if (currentUser) {
                            uniqueMembersMap.set(currentUserId, currentUser);
                          }

                          return Array.from(uniqueMembersMap.values()).map(member => {
                            const memberId = (member._id || member.id)?.toString();
                            const isSelf = memberId === currentUserId;
                            return (
                              <option key={memberId} value={memberId} className="bg-[#0b121e]">
                                {member.name} {isSelf ? '(Self)' : ''}
                              </option>
                            );
                          });
                        })()}
                      </select>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-teal-400 transition-colors pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Grid Section for Date & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Due Date</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-0 bottom-0 flex items-center pointer-events-none">
                        <Calendar className="text-white/20 group-focus-within:text-teal-400 transition-colors" size={16} />
                      </div>
                      <input
                        type="date"
                        name="dueDate"
                        required
                        value={formData.dueDate}
                        onChange={handleChange}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-teal-400/50 transition-all [color-scheme:dark] cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Initial Status</label>
                    <div className="relative group">
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-teal-400/50 appearance-none transition-all cursor-pointer"
                      >
                        <option value="To Do" className="bg-[#0b121e]">To Do</option>
                        <option value="In Progress" className="bg-[#0b121e]">In Progress</option>
                        <option value="In Review" className="bg-[#0b121e]">In Review</option>
                        <option value="Done" className="bg-[#0b121e]">Done</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-teal-400 transition-colors pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Subtasks Section */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Subtasks</label>
                  <div className="space-y-2.5">
                    <AnimatePresence>
                      {formData.subtasks.map((st, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="flex items-center gap-3 bg-white/[0.01] border border-white/5 rounded-2xl px-4 py-3 group hover:border-white/10 transition-all"
                        >
                          <Hash size={12} className="text-teal-400/40" />
                          <span className="text-sm font-bold text-white/80 flex-1">{st.label}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSubtask(index)}
                            className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div className="flex gap-2.5 relative">
                      <input
                        type="text"
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())}
                        placeholder="Add Subtask..."
                        className="flex-1 bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-teal-400/50 transition-all placeholder:text-white/5"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubtask}
                        className="bg-white/5 hover:bg-teal-400 hover:text-[#040911] text-white p-3 rounded-2xl transition-all border border-white/5 active:scale-95"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Attachments</label>
                  <div className="flex flex-wrap gap-3">
                    <AnimatePresence>
                      {formData.attachments.map((file, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-3 bg-white/[0.03] border border-teal-400/10 rounded-xl px-4 py-2.5 group"
                        >
                          {file.type === 'image' ? <ImageIcon size={14} className="text-teal-400" /> : <FileText size={14} className="text-teal-400" />}
                          <span className="text-[11px] font-bold text-white/60 max-w-[150px] truncate">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-white/20 hover:text-red-400 transition-colors p-0.5"
                          >
                            <Trash2 size={12} />
                          </button>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <label className={`flex items-center gap-3 px-5 py-2.5 rounded-xl border-2 border-dashed border-white/5 hover:border-teal-400/40 hover:bg-teal-400/[0.02] transition-all cursor-pointer text-white/20 hover:text-teal-400 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                      {isUploading ? (
                        <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Paperclip size={16} />
                      )}
                      <span className="text-[11px] font-black uppercase tracking-widest">{isUploading ? 'Uploading...' : 'Add Resource'}</span>
                    </label>
                  </div>
                </div>

                {/* Priority Selection */}
                <div className="space-y-4 pb-4">
                  <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Priority Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { val: 'Low', icon: ArrowDown, label: 'Low', color: '#10B981' },
                      { val: 'Medium', icon: ArrowUp, label: 'Medium', color: '#F59E0B' },
                      { val: 'High', icon: AlertCircle, label: 'High', color: '#EF4444' },
                      { val: 'Urgent', icon: Zap, label: 'Urgent', color: '#8B5CF6' }
                    ].map(({ val, icon: Icon, label, color }) => (
                      <label key={val} className={`group relative flex flex-col items-center gap-3 p-4 rounded-2xl border cursor-pointer transition-all duration-300 ${formData.priority === val ? 'bg-teal-400/10 border-teal-400/50 shadow-[0_0_15px_rgba(0,209,255,0.1)]' : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'}`}>
                        <input type="radio" name="priority" value={val} checked={formData.priority === val} onChange={handleChange} className="hidden" />
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all group-active:scale-90`} style={{ backgroundColor: `${color}15`, color: color }}>
                          <Icon size={18} strokeWidth={3} />
                        </div>
                        <span className="text-[9px] font-black tracking-[0.15em] uppercase" style={{ color: formData.priority === val ? '#00D1FF' : 'rgba(255,255,255,0.3)' }}>{label}</span>
                        {formData.priority === val && (
                          <motion.div
                            layoutId="active-priority"
                            className="absolute top-2 right-2 w-4 h-4 bg-teal-400 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(0,209,255,0.4)]"
                          >
                            <Check size={10} className="text-[#040911]" strokeWidth={4} />
                          </motion.div>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-8 border-t border-white/5 bg-white/[0.02] flex items-center gap-4 relative">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 py-4 rounded-2xl font-black text-[11px] text-white/30 tracking-[0.2em] uppercase hover:text-white hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title.trim() || !formData.project || !formData.assignee || !formData.dueDate}
                  className={`flex-1 py-4 rounded-2xl text-[11px] font-black tracking-[0.2em] uppercase flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-[0.98] ${isSubmitting || !formData.title.trim() || !formData.project || !formData.assignee || !formData.dueDate ? 'bg-white/5 text-white/20 cursor-not-allowed shadow-none' : 'bg-teal-400/90 text-white hover:bg-teal-300 hover:shadow-[0_0_30px_rgba(0,209,255,0.3)]'}`}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-[#040911] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Create Task</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewTaskModal;
