import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Hash, HashIcon, ListTodo, Plus, Send } from 'lucide-react';

const SubtaskList = ({ subtasks = [], onToggle, onAddSubtask, canEdit }) => {
  const [newSubtask, setNewSubtask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completedCount = subtasks.filter(s => s.completed).length;
  const totalCount = subtasks.length;
  const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newSubtask.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onAddSubtask(newSubtask.trim());
        setNewSubtask('');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <ListTodo size={16} className="text-indigo-400" />
          </div>
          <h3 className="text-lg font-black text-white tracking-tight">Subtasks</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-[10px] font-black text-white/40 tracking-widest uppercase">
            {completedCount} / {totalCount} DONE
          </div>
          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        <AnimatePresence mode="popLayout">
          {subtasks.map((subtask, index) => (
            <motion.div
              key={subtask._id || index}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05, type: 'spring', damping: 20, stiffness: 300 }}
              onClick={() => canEdit && onToggle(subtask._id || index)}
              className={`td-subtask-item group ${!canEdit ? 'cursor-not-allowed opacity-80' : ''}`}
            >
              <div className={`td-checkbox ${subtask.completed ? 'checked' : (canEdit ? 'group-hover:border-indigo-400/50' : '')} ${!canEdit ? 'cursor-not-allowed' : ''}`}>
                {subtask.completed && (
                  <motion.div
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: 0 }}
                  >
                    <Check size={14} className="text-[#040911] stroke-[4]" />
                  </motion.div>
                )}
              </div>

              <div className="flex-1 flex items-center justify-between">
                <span className={`text-sm font-bold transition-all ${subtask.completed ? 'text-white/40 line-through decoration-white/10' : 'text-white'
                  }`}>
                  {subtask.label}
                </span>

                <span className="h-full text-[10px] font-black text-white/10 uppercase tracking-widest group-hover:text-white/30 transition-colors flex justify-center align-center">
                  Subtask <HashIcon size={10} /> {index + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Add Subtask Input */}
        {canEdit && (
          <motion.form
            layout
            onSubmit={handleSubmit}
            className="relative mt-2"
          >
            <div className="absolute left-4 top-5 -translate-y-1/5 text-indigo-400/40">
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-indigo-500/40 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus size={16} />
              )}
            </div>
            <input
              type="text"
              placeholder={isSubmitting ? "Adding Milestone..." : "Add Subtask..."}
              disabled={isSubmitting}
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              className="w-full bg-white/[0.02] border border-dashed border-white/10 rounded-2xl py-4 pl-12 pr-12 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 focus:bg-white/[0.04] transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newSubtask.trim() || isSubmitting}
              className="absolute right-3 top-5 -translate-y-1/5 p-2 rounded-xl bg-indigo-500 text-white disabled:opacity-0 disabled:scale-90 transition-all hover:bg-indigo-400"
            >
              <Send size={14} className={isSubmitting ? 'animate-pulse' : ''} />
            </button>
          </motion.form>
        )}

        {subtasks.length === 0 && !newSubtask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-12 border border-dashed border-white/5 rounded-[24px] bg-white/[0.01]"
          >
            <Hash size={32} className="text-white/10 mb-2" />
            <p className="text-sm text-white/30 font-bold italic">No subtasks defined for this task.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubtaskList;
