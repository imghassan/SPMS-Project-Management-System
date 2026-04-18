import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  MoreVertical,
  X,
  ChevronDown,
  AlertCircle,
  Calendar,
  Plus,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Send,
  Check,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import taskApi from '../../api/taskApi';
import { toast } from 'react-hot-toast';

const TaskDetailsPanel = ({ isOpen, onClose, taskId, onTaskUpdate }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const fileInputRef = useRef(null);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, taskId]);

  const fetchTaskDetails = async () => {
    try {
      setLoading(true);
      const res = await taskApi.getTaskById(taskId);
      const taskData = res.data.data || res.data;

      setTask({
        ...taskData,
        id: taskData._id,
        project: taskData.project?.name || taskData.project?.title || 'Project',
        assignee: taskData.assignee ? {
          name: taskData.assignee.name,
          initials: taskData.assignee.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??',
          avatar: taskData.assignee.avatar,
          _id: taskData.assignee._id
        } : { name: 'Unassigned', initials: '??' },
        subtasks: taskData.subtasks || [],
        attachments: taskData.attachments || [],
        comments: (taskData.comments || []).map(c => ({
          ...c,
          id: c._id || c.id,
          time: new Date(c.createdAt || c.time)
        }))
      });
      setIsCompleted(taskData.status === 'Done' || taskData.status === 'Done');
    } catch (err) {
      console.error('Error fetching task:', err);
      toast.error('Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  const toggleSubtask = async (subId) => {
    try {
      await taskApi.updateTask(task.id, {
        subtasks: task.subtasks.map(st =>
          (st._id === subId || st.id === subId) ? { ...st, completed: !st.completed } : st
        )
      });
      fetchTaskDetails();
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      toast.error('Failed to update subtask');
    }
  };

  const handleAddSubtask = async (e) => {
    if (e.key === 'Enter' && newSubtask.trim()) {
      try {
        await taskApi.updateTask(task.id, {
          subtasks: [...task.subtasks, { label: newSubtask, completed: false }]
        });
        setNewSubtask('');
        fetchTaskDetails();
        if (onTaskUpdate) onTaskUpdate();
      } catch (err) {
        toast.error('Failed to add subtask');
      }
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await taskApi.updateTask(task.id, {
        $push: { comments: { text: newComment, author: 'You', initials: 'JD' } }
      });
      setNewComment('');
      fetchTaskDetails();
    } catch (err) {
      toast.error('Failed to add comment');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await taskApi.uploadAttachment(formData);
      await taskApi.updateTask(task.id, {
        $push: { attachments: res.data.data }
      });
      fetchTaskDetails();
      toast.success('File attached');
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleComplete = async () => {
    try {
      const newStatus = isCompleted ? 'In Progress' : 'Done';
      await taskApi.updateTask(task.id, { status: newStatus });
      setIsCompleted(!isCompleted);
      fetchTaskDetails();
      if (onTaskUpdate) onTaskUpdate();
      toast.success(isCompleted ? 'Task reopened' : 'Task Done!');
    } catch (err) {
      toast.error('Update failed');
    }
  };

  const handleDescriptionUpdate = async () => {
    setIsEditingDescription(false);
    try {
      await taskApi.updateTask(task.id, { description: task.description });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      toast.error('Failed to save');
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return <AlertCircle className="w-4 h-4 text-[#EF4444]" />;
      case 'medium': return <ArrowUp className="w-4 h-4 text-[#F59E0B]" />;
      case 'low': return <ArrowDown className="w-4 h-4 text-[#10B981]" />;
      default: return null;
    }
  };

  if (!isOpen) return null;

  const completedCount = task?.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task?.subtasks?.length || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#040911]/80 backdrop-blur-md z-[100]"
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-[#0d1117] text-[#e6edf3] z-[101] shadow-2xl flex flex-col border-l border-white/5"
          >
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <div className="w-10 h-10 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : !task ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[#94A3B8]">Task not found</div>
            ) : (
              <>
                {/* Header Row */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-[#161b22]/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#00D1FF]/10 flex items-center justify-center border border-[#00D1FF]/20">
                      <CheckCircle2 className="w-5 h-5 text-[#00D1FF]" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">Task Details</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-[#94A3B8] border border-transparent hover:border-white/5">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    <button onClick={onClose} className="p-2.5 hover:bg-white/5 rounded-xl transition-all text-[#94A3B8] border border-transparent hover:border-white/5">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-10 space-y-12">
                  {/* Task Title Area */}
                  <div className="flex justify-between items-start gap-8">
                    <div className="flex-1 space-y-2">
                      <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight">
                        {task.title}
                      </h1>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-[#94A3B8]">Project:</span>
                        <span className="text-[#00D1FF] font-semibold hover:underline cursor-pointer">{task.project}</span>
                      </div>
                    </div>
                    <button
                      onClick={toggleComplete}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-bold text-sm shadow-lg ${isCompleted
                          ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                          : 'bg-[#00D1FF] text-[#040911] hover:bg-[#00D1FF]/90'
                        }`}
                    >
                      {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : <CheckCircle2 className="w-4 h-4" strokeWidth={2.5} />}
                      {isCompleted ? 'DONE' : 'Mark Done'}
                    </button>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-4 gap-4 bg-white/5 p-1 rounded-2xl border border-white/5">
                    <div className="bg-[#161b22] px-6 py-5 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">Status</span>
                      <div className="flex items-center justify-between text-[#00D1FF] group cursor-pointer">
                        <span className="text-sm font-bold">{task.status}</span>
                        <ChevronDown className="w-4 h-4 text-[#94A3B8] group-hover:text-white transition-colors" />
                      </div>
                    </div>
                    <div className="bg-[#161b22] px-6 py-5 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">Priority</span>
                      <div className="flex items-center gap-2 font-bold">
                        {getPriorityIcon(task.priority)}
                        <span className="text-sm text-white">{task.priority}</span>
                      </div>
                    </div>
                    <div className="bg-[#161b22] px-6 py-5 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">Assignee</span>
                      <div className="flex items-center gap-2.5">
                        {task.assignee.avatar ? (
                          <img src={task.assignee.avatar} className="w-6 h-6 rounded-full border border-white/10" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#00D1FF]/20 flex items-center justify-center text-[10px] text-[#00D1FF] font-black border border-[#00D1FF]/30">
                            {task.assignee.initials}
                          </div>
                        )}
                        <span className="text-sm font-bold text-white truncate">{task.assignee.name}</span>
                      </div>
                    </div>
                    <div className="bg-[#161b22] px-6 py-5 rounded-xl space-y-1">
                      <span className="text-[10px] uppercase tracking-widest text-[#94A3B8] font-black">Due Date</span>
                      <div className="flex items-center gap-2.5 text-white/90 font-bold">
                        <Calendar className="w-4 h-4 text-[#94A3B8]" />
                        <span className="text-sm">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-[#94A3B8] text-xs uppercase tracking-[0.2em]">Description</h3>
                      {showSaved && <span className="text-[10px] text-green-500 font-bold">SAVED ✓</span>}
                    </div>
                    <div
                      onClick={() => !isEditingDescription && setIsEditingDescription(true)}
                      className={`group relative rounded-2xl border transition-all p-1 ${isEditingDescription ? 'border-[#00D1FF] bg-[#0d1117]' : 'border-transparent hover:border-white/10 hover:bg-white/5'
                        }`}
                    >
                      {isEditingDescription ? (
                        <textarea
                          autoFocus
                          rows={4}
                          className="w-full bg-transparent p-4 text-[#94A3B8] text-sm leading-relaxed focus:outline-none resize-none"
                          value={task.description}
                          onChange={(e) => setTask(prev => ({ ...prev, description: e.target.value }))}
                          onBlur={handleDescriptionUpdate}
                        />
                      ) : (
                        <div className="p-4 text-[#94A3B8] text-sm leading-relaxed min-h-[60px]">
                          {task.description || "No description provided."}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subtasks */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-black text-[#94A3B8] text-xs uppercase tracking-[0.2em]">Subtasks</h3>
                      <div className="px-3 py-1 bg-[#161b22] border border-white/5 rounded-full text-[10px] font-black text-[#94A3B8] tracking-widest">
                        {completedCount}/{totalSubtasks} DONE
                      </div>
                    </div>
                    <div className="space-y-3">
                      {task.subtasks.map((st) => (
                        <div
                          key={st._id || st.id}
                          onClick={() => toggleSubtask(st._id || st.id)}
                          className="group flex items-center gap-4 p-4 bg-[#161b22] border border-white/5 rounded-2xl cursor-pointer hover:border-[#00D1FF]/40 transition-all hover:translate-x-1"
                        >
                          <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${st.completed
                              ? 'bg-[#00D1FF] border-[#00D1FF] shadow-[0_0_10px_rgba(0,209,255,0.4)]'
                              : 'border-white/10 group-hover:border-[#00D1FF]/50'
                            }`}>
                            {st.completed && <Check className="w-4 h-4 text-[#0d1117] stroke-[3.5]" />}
                          </div>
                          <span className={`text-sm font-bold transition-all ${st.completed ? 'text-[#94A3B8] line-through decoration-white/20 font-medium' : 'text-white'
                            }`}>
                            {st.label}
                          </span>
                        </div>
                      ))}
                      <div className="relative">
                        <Plus className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] group-focus-within:text-[#00D1FF]" />
                        <input
                          type="text"
                          placeholder="Add more stages..."
                          className="w-full bg-[#161b22] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:border-[#00D1FF] focus:bg-[#0d1117] transition-all placeholder:text-[#94A3B8]/40"
                          value={newSubtask}
                          onChange={(e) => setNewSubtask(e.target.value)}
                          onKeyDown={handleAddSubtask}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Files */}
                  <div className="space-y-6">
                    <h3 className="font-black text-[#94A3B8] text-xs uppercase tracking-[0.2em]">Files & Attachments</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {task.attachments.map((file) => (
                        <div key={file._id || file.id} className="p-4 bg-[#161b22] border border-white/5 rounded-2xl flex items-center gap-4 group hover:border-[#00D1FF]/40 hover:bg-[#00D1FF]/5 transition-all cursor-pointer">
                          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                            {file.type === 'image' ? (
                              <ImageIcon className="w-6 h-6 text-[#00D1FF]" />
                            ) : (
                              <FileText className="w-6 h-6 text-[#00D1FF]" />
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-black text-white truncate">{file.name}</span>
                            <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{file.size}</span>
                          </div>
                        </div>
                      ))}

                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-4 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#00D1FF]/40 hover:bg-[#00D1FF]/5 transition-all text-[#94A3B8] hover:text-[#00D1FF] ${isUploading ? 'opacity-50' : ''}`}
                      >
                        {isUploading ? (
                          <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Plus className="w-6 h-6" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Add File</span>
                          </>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>

                  {/* Comments */}
                  <div className="space-y-8 pb-10 border-t border-white/5 pt-10">
                    <h3 className="font-black text-[#94A3B8] text-xs uppercase tracking-[0.2em]">Activity Feed</h3>
                    <div className="space-y-8">
                      {task.comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 items-start">
                          {comment.avatar ? (
                            <img src={comment.avatar} alt={comment.author} className="w-10 h-10 rounded-xl border border-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-[#161b22] flex items-center justify-center text-xs font-black text-[#94A3B8] border border-white/5">
                              {comment.initials}
                            </div>
                          )}
                          <div className="space-y-1.5 flex-1 mt-1">
                            <div className="flex items-center gap-2.5">
                              <span className="text-sm font-black text-white">{comment.author} {comment.isYou && <span className="text-[#94A3B8] font-medium ml-1">(You)</span>}</span>
                              <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">{comment.time ? formatDistanceToNow(comment.time) + ' ago' : ''}</span>
                            </div>
                            <div className="bg-[#161b22] border border-white/5 rounded-2xl rounded-tl-none px-5 py-4 text-sm text-[#94A3B8]/90 leading-relaxed inline-block max-w-[95%]">
                              {comment.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* New Comment Input */}
                    <div className="flex gap-4 items-start bg-[#161b22] p-2 rounded-2xl border border-white/5 focus-within:border-[#00D1FF]/40 transition-all">
                      <div className="w-10 h-10 rounded-xl bg-[#00D1FF]/10 flex items-center justify-center text-xs font-black text-[#00D1FF] ml-2 mt-2">
                        JD
                      </div>
                      <div className="flex-1">
                        <textarea
                          placeholder="Your message..."
                          className="w-full bg-transparent p-4 text-sm text-white focus:outline-none min-h-[100px] resize-none placeholder:text-[#94A3B8]/30"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="px-4 py-3 flex items-center justify-between border-t border-white/5 mt-1">
                          <button className="p-2 text-[#94A3B8] hover:text-[#00D1FF] transition-colors rounded-lg hover:bg-white/5">
                            <Paperclip className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleAddComment}
                            className="flex items-center gap-2.5 px-6 py-2 bg-[#00D1FF] hover:bg-[#00D1FF]/90 text-[#0d1117] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                            disabled={!newComment.trim()}
                          >
                            <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            Send Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailsPanel;
