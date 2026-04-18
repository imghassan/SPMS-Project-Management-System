import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  CheckCircle2,
  Calendar,
  MoreVertical,
  Paperclip,
  Check,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '../UI';

const TaskDetailsModal = ({ isOpen, onClose, task }) => {
  const [newComment, setNewComment] = useState('');

  if (!task) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
          onClick={handleBackdropClick}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            className="bg-[#1C212A] w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-white/5 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header section (Fixed) */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 text-primary p-2 rounded-full">
                  <CheckCircle2 size={20} />
                </div>
                <h2 className="text-xl font-semibold text-white">Task Details</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                  <MoreVertical size={20} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors bg-[#232936]"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 space-y-8">

              {/* Title & Meta Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{task.title}</h1>
                  <p className="text-primary font-medium flex items-center gap-2">
                    Project: {task.project || 'Q4 Brand Refresh'}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#141820] p-4 rounded-xl border border-white/5">
                  <div className="space-y-1">
                    <span className="text-xs text-muted uppercase font-semibold tracking-wider">Status</span>
                    <div className="relative">
                      <select className="appearance-none bg-transparent text-primary font-semibold pr-8 outline-none cursor-pointer w-full">
                        <option value="in_progress">In Progress</option>
                        <option value="todo">To Do</option>
                        <option value="done">Done</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-primary">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted uppercase font-semibold tracking-wider">Priority</span>
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-semibold tracking-wide flex items-center gap-1">
                        <span className="text-red-400">!</span> {task.priority || 'High'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted uppercase font-semibold tracking-wider">Assignee</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {task.assignees?.[0]?.initials || 'JD'}
                      </div>
                      <span className="text-sm font-medium text-white/90">
                        {task.assignees?.[0]?.name || 'Jane Doe'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs text-muted uppercase font-semibold tracking-wider">Due Date</span>
                    <div className="flex items-center gap-2 text-sm font-medium text-white/90">
                      <Calendar size={14} className="text-muted" />
                      {task.dueDate || 'Oct 30, 2023'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Description</h3>
                <p className="text-muted text-sm leading-relaxed whitespace-pre-line">
                  {task.description || "The current landing page has a high bounce rate. We need to overhaul the visual language and content hierarchy to focus on our new SaaS integration features. The design should be clean, modern, and utilize the updated brand color palette. Focus on the mobile-first experience."}
                </p>
              </div>

              {/* Subtasks */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Subtasks
                  </h3>
                  <div className="bg-[#2A313C] text-muted text-xs font-semibold px-2 py-1 rounded">
                    {completedSubtasks}/{totalSubtasks} Done
                  </div>
                </div>

                <div className="space-y-2">
                  {task.subtasks?.map((subtask) => (
                    <label key={subtask.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors
                          ${subtask.completed ? 'bg-primary border-primary text-[#1C212A]' : 'border-muted/40 group-hover:border-primary/50'}`}>
                        {subtask.completed && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span className={`text-sm ${subtask.completed ? 'text-muted line-through' : 'text-white/90'}`}>
                        {subtask.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Files & Attachments */}
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-white">Files & Attachments</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {task.attachments?.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#232936] border border-white/5 hover:border-white/10 transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        {file.type === 'pdf' ? <FileText size={20} /> : <ImageIcon size={20} />}
                      </div>
                      <div className="overflow-hidden flex-1">
                        <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{file.name}</p>
                        <p className="text-xs text-muted">{file.size}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add File Button */}
                  <button className="flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-white/10 text-muted hover:text-white hover:border-white/30 hover:bg-white/5 transition-all outline-none">
                    <div className="bg-white/10 rounded-full p-1"><X size={14} className="rotate-45" /></div>
                    <span className="text-sm font-semibold">Add File</span>
                  </button>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-6 pt-4 border-t border-white/10">
                <h3 className="text-lg font-bold text-white">Comments</h3>

                <div className="space-y-6">
                  {task.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <img src={comment.author.avatar} alt={comment.author.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      <div className="flex-1 space-y-1">
                        <div className="flex items-baseline gap-3">
                          <span className="text-sm font-bold text-white">{comment.author.name}</span>
                          <span className="text-xs text-muted">{comment.time}</span>
                        </div>
                        <div className="bg-[#2A313C] p-4 rounded-2xl rounded-tl-sm text-sm text-white/90 leading-relaxed max-w-[90%]">
                          {comment.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input */}
                <div className="flex gap-4 mt-8">
                  <div className="w-10 h-10 rounded-full bg-cyan-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                    JD
                  </div>
                  <div className="flex-1 relative">
                    <div className="bg-[#232936] border border-white/10 rounded-xl overflow-hidden focus-within:border-primary/50 transition-colors">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full bg-transparent text-sm text-white p-4 min-h-[100px] outline-none resize-y"
                      />
                      <div className="flex items-center justify-between p-2 ml-2">
                        <button className="p-2 text-muted hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                          <Paperclip size={18} className="-rotate-45" />
                        </button>
                        <Button
                          variant="primary"
                          className="px-4 py-2 h-auto text-sm font-semibold flex items-center gap-2 !rounded-lg"
                          disabled={!newComment.trim()}
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TaskDetailsModal;
