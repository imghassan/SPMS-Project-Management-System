import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Trash2, Edit, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TaskActionsMenu = ({ onDelete, onEdit, onToggle, isCompleted, isAdmin, className = "" }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* Trigger - styled to match th-icon-btn */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(!open);
        }}
        className={`th-icon-btn flex items-center justify-center transition-all duration-200 focus:outline-none ${open ? '!bg-white/10 !text-white !border-white/15' : ''
          }`}
        title="Task Actions"
      >
        <MoreVertical size={18} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 top-full mt-2 w-48 rounded-2xl z-[200] overflow-hidden"
            style={{
              background: 'rgba(11, 18, 30, 0.97)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-1.5 flex flex-col gap-0.5">

              {/* Status Toggle — visible if onToggle is provided */}
              {onToggle && (
                <button
                  onClick={() => {
                    setOpen(false);
                    onToggle();
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold rounded-xl transition-all group/toggle ${isCompleted ? 'text-amber-400 hover:bg-amber-500/10 hover:text-amber-300' : 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                    }`}
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-colors shrink-0 ${isCompleted ? 'bg-amber-500/10 border-amber-500/20 group-hover/toggle:bg-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20 group-hover/toggle:bg-emerald-500/20'
                    }`}>
                    {isCompleted ? <Clock size={13} /> : <CheckCircle2 size={13} />}
                  </div>
                  <span className="group-hover/toggle:translate-x-0.5 transition-transform duration-200">
                    {isCompleted ? 'Mark as Pending' : 'Mark as Done'}
                  </span>
                </button>
              )}

              {/* Edit — visible to admin & assignee (canEdit gates the whole menu) */}
              <button
                onClick={() => {
                  setOpen(false);
                  onEdit && onEdit();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-slate-200 hover:bg-white/[0.07] hover:text-white rounded-xl transition-all group/edit"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover/edit:bg-emerald-500/20 transition-colors shrink-0">
                  <Edit size={13} className="text-emerald-400" />
                </div>
                <span className="group-hover/edit:translate-x-0.5 transition-transform duration-200">
                  Edit Task
                </span>
              </button>

              {/* Delete — admin only */}
              {isAdmin && (
                <>
                  <div className="h-px mx-2 my-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
                        onDelete && onDelete();
                        setOpen(false);
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all group/del"
                  >
                    <div className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover/del:bg-red-500/20 transition-colors shrink-0">
                      <Trash2 size={13} />
                    </div>
                    <span className="group-hover/del:translate-x-0.5 transition-transform duration-200">
                      Delete Task
                    </span>
                  </button>
                </>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TaskActionsMenu;
