import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../store/useAuthStore';
import taskApi from '../../api/taskApi';
import TaskHeader from './TaskHeader';
import TaskMeta from './TaskMeta';
import SubtaskList from './SubtaskList';
import ProgressChart from './ProgressChart';
import AttachmentGrid from './AttachmentGrid';
import CommentFeed from './CommentFeed';
import '../../styles/Components/TaskDetails.css';

const TaskDetails = ({ isOpen, onClose, taskId, onTaskUpdate }) => {
  const { user } = useAuthStore();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [isAutoAssigning, setIsAutoAssigning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const fetchTaskDetails = useCallback(async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      const res = await taskApi.getTaskById(taskId);
      setTask(res.data.data || res.data);
    } catch (err) {
      console.error('Error fetching task details:', err);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    } else if (!isOpen) {
      setTask(null);
    }
  }, [isOpen, taskId, fetchTaskDetails]);

  const handleMetadataChange = async (updates) => {
    try {
      setTask(prev => prev ? { ...prev, ...updates } : null);
      const res = await taskApi.updateTask(taskId, updates);
      setTask(res.data.data || res.data);
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update task';
      toast.error(msg);
      fetchTaskDetails();
    }
  };

  const handleAutoAssign = async () => {
    try {
      setIsAutoAssigning(true);
      const res = await taskApi.autoAssignTask(taskId);
      setTask(res.data.task || res.data.data || res.data);
      toast.success(res.data.message || 'Task auto-assigned successfully!');
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      const msg = err.response?.data?.message || 'Auto-assignment failed';
      toast.error(msg);
    } finally {
      setIsAutoAssigning(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await taskApi.updateTask(taskId, { status: newStatus });
      setTask(res.data.data || res.data);
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleToggleSubtask = async (subId) => {
    if (!task) return;
    const updatedSubtasks = task.subtasks.map(st =>
      st._id === subId ? { ...st, completed: !st.completed } : st
    );

    const allCompleted = updatedSubtasks.length > 0 && updatedSubtasks.every(st => st.completed);
    const updates = { subtasks: updatedSubtasks };

    // Auto-Done task if all milestones are hit
    if (allCompleted && task.status !== 'Done' && task.status !== 'Done') {
      updates.status = 'Done';
    }

    setTask({ ...task, ...updates });

    try {
      const res = await taskApi.updateTask(taskId, updates);
      const updatedData = res.data.data || res.data;
      setTask(prev => {
        const merged = { ...prev, ...updatedData, project: prev?.project };
        if (isEditing) {
          merged.title = prev.title;
          merged.description = prev.description;
        }
        return merged;
      });
      if (allCompleted) {
        toast.success('All milestones achieved! Task Done.');
      }
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      toast.error('Failed to update subtask');
      fetchTaskDetails();
    }
  };

  const handleAddSubtask = async (label) => {
    if (!task || !label.trim()) return;
    
    // Functional update to avoid race conditions
    let updates;
    setTask(prev => {
      const updatedSubtasks = [...(prev.subtasks || []), { label, completed: false }];
      updates = { subtasks: updatedSubtasks };
      
      // Auto-transition from Done if a new milestone is added
      if (prev.status === 'Done' || prev.status === 'DONE') {
        updates.status = 'In Progress';
      }
      
      return { ...prev, ...updates };
    });

    try {
      const res = await taskApi.updateTask(taskId, updates);
      const updatedData = res.data.data || res.data;
      
      setTask(prev => {
        const merged = { ...prev, ...updatedData, project: prev?.project };
        // CRITICAL: Preserve unsaved edits if in Editing Mode
        if (isEditing) {
          merged.title = prev.title;
          merged.description = prev.description;
        }
        return merged;
      });
      
      toast.success('Milestone added');
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      toast.error('Failed to add milestone');
      fetchTaskDetails();
    }
  };

  const handleUploadFile = async (file) => {
    if (!task || !file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const uploadRes = await taskApi.uploadAttachment(formData);
      const fileData = uploadRes.data.data;

      const updatedAttachments = [...(task.attachments || []), fileData];
      const res = await taskApi.updateTask(taskId, { attachments: updatedAttachments });

      setTask(res.data.data || res.data);
      toast.success('Document uploaded');
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await taskApi.updateTask(taskId, {
        $push: {
          comments: {
            text: newComment,
            author: user.name,
            avatar: user.avatar,
            createdAt: new Date()
          }
        }
      });
      setTask(res.data.data || res.data);
      setNewComment('');
      toast.success('Comment shared');
    } catch (err) {
      toast.error('Failed to post comment');
    }
  };

  const handleMarkComplete = async () => {
    if (!task || task.status === 'Done' || task.status === 'Done') return;

    try {
      setIsCompleting(true);
      const res = await taskApi.toggleComplete(taskId);
      setTask(res.data.data || res.data);
      toast.success('Task finalized!');
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      toast.error('Phase transition failed');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!task) return;
    try {
      await taskApi.deleteTask(taskId);
      toast.success('Task deleted successfully');
      if (onTaskUpdate) onTaskUpdate();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete task';
      toast.error(msg);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const adminField = task?.project?.admin;
  const projectAdminId = adminField?._id
    ? adminField._id.toString()
    : (typeof adminField === 'string' ? adminField : adminField?.toString?.() ?? null);
  const userId = user?.id?.toString() || user?._id?.toString() || null;
  const isAdmin = !!(projectAdminId && userId && projectAdminId === userId);
  const isAssignee = !!(task?.assignee?._id && userId && task.assignee._id.toString() === userId);
  const canEdit = isAdmin || isAssignee;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[20000] td-backdrop p-4 md:p-8"
          onClick={handleBackdropClick}
        >
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-[1100px] max-h-[92vh] td-card flex flex-col relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Dynamic Accent Background */}
            <div className="td-accent-glow-bg" />

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#00D1FF]/10 rounded-full" />
                  <div className="absolute top-0 w-16 h-16 border-4 border-[#00D1FF] border-t-transparent rounded-full animate-spin" />
                </div>
                <div className="text-center">
                  <p className="text-white font-black tracking-[0.3em] text-[11px] uppercase td-animate-pulse">Accessing Server...</p>
                </div>
              </div>
            ) : task ? (
              <div className="flex-1 overflow-y-auto td-scrollbar p-10 md:p-14">

                <TaskHeader
                  task={task}
                  onComplete={handleMarkComplete}
                  onEdit={() => {
                    if (isEditing) {
                      handleMetadataChange({ title: task.title, description: task.description });
                    }
                    setIsEditing(!isEditing);
                  }}
                  onDelete={handleDeleteTask}
                  onClose={onClose}
                  isCompleting={isCompleting}
                  isCompleted={task.status === 'Done' || task.status === 'Done'}
                  isAdmin={isAdmin}
                  canEdit={canEdit}
                  isEditing={isEditing}
                  setIsEditing={(val) => {
                    if (!val && isEditing) {
                      handleMetadataChange({ title: task.title, description: task.description });
                    }
                    setIsEditing(val);
                  }}
                  onTitleChange={(title) => setTask(prev => ({ ...prev, title }))}
                />

                <div className="mt-8">
                  <TaskMeta
                    task={task}
                    users={(() => {
                      const members = task.project?.members || [];
                      const admin = typeof task.project?.admin === 'object' ? task.project.admin : null;
                      const list = [...members];
                      if (admin && !members.some(m => m._id === admin._id)) {
                        list.push(admin);
                      }
                      return list;
                    })()}
                    onStatusChange={handleStatusChange}
                    onMetadataChange={handleMetadataChange}
                    onAutoAssign={handleAutoAssign}
                    isAutoAssigning={isAutoAssigning}
                    canEdit={canEdit}
                  />
                </div>

                <div className="space-y-16">
                  {/* Summary Section */}
                  <section className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1.5 h-6 bg-[#00D1FF] rounded-full shadow-[0_0_15px_rgba(0,209,255,0.4)]" />
                      <h3 className="text-[13px] font-black text-white/90 uppercase tracking-[0.2em]">Objectives</h3>
                    </div>
                    <div className={`${isEditing ? '' : 'bg-white/[0.02] border border-white/5 rounded-[28px] p-8'} relative overflow-hidden group`}>
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {isEditing ? (
                        <textarea
                          value={task.description || ""}
                          onChange={(e) => setTask(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the objectives..."
                          className="w-full td-edit-area-active text-white/90 text-base leading-[1.8] outline-none min-h-[160px] resize-none font-medium placeholder:text-white/20"
                          autoFocus
                        />
                      ) : (
                        <p className="text-white/60 text-base leading-[1.8] max-w-4xl whitespace-pre-wrap font-medium">
                          {task.description || "No Description Provided."}
                        </p>
                      )}
                    </div>
                  </section>

                  {/* Tasks & Analytics Grid */}
                  <div className="grid grid-cols-1 gap-16">
                    <SubtaskList
                      subtasks={task.subtasks || []}
                      onToggle={handleToggleSubtask}
                      onAddSubtask={handleAddSubtask}
                      canEdit={canEdit}
                    />
                    <ProgressChart subtasks={task.subtasks || []} />
                    <AttachmentGrid
                      attachments={task.attachments || []}
                      onUpload={handleUploadFile}
                      isUploading={isUploading}
                      canEdit={canEdit}
                    />
                    <CommentFeed
                      comments={task.comments || []}
                      newComment={newComment}
                      setNewComment={setNewComment}
                      onAddComment={handleAddComment}
                      canEdit={canEdit}
                      onAttach={handleUploadFile}
                      isUploading={isUploading}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 border-dashed animate-spin-slow" />
                </div>
                <p className="text-white font-black tracking-widest text-[10px] uppercase opacity-40">Verification Required</p>
                <button onClick={onClose} className="px-10 py-3 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest transition-all">Close Instance</button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetails;
