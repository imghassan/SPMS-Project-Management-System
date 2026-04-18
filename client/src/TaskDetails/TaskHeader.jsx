import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';
import TaskActionsMenu from '../ui/TaskActionsMenu';
import '../../styles/Components/TaskHeader.css';

const TaskHeader = ({
  task,
  onComplete,
  onEdit,
  onDelete,
  onClose,
  isCompleting,
  isCompleted,
  isAdmin,
  canEdit,
  isEditing,
  setIsEditing,
  onTitleChange
}) => {
  const isDone = isCompleted || task.status === 'Done' || task.status === 'DONE';

  return (
    <header className="th-container">
      <div className="th-info flex-1 min-w-0">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="th-project-wrap group"
        >
          <div className="th-project-dot"></div>
          <span className="th-project-name">
            {task.project?.name || 'Q4 BRAND REFRESH'}
          </span>
        </motion.div>
        {isEditing ? (
          <input
            type="text"
            value={task.title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="th-title-input td-edit-input-active w-full"
            autoFocus
          />
        ) : (
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="th-title"
          >
            {task.title}
          </motion.h1>
        )}
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          onClick={onComplete}
          whileHover={canEdit && !isCompleting ? { y: -2, scale: 1.02 } : {}}
          whileTap={canEdit && !isCompleting ? { scale: 0.98 } : {}}
          disabled={isCompleting || !canEdit}
          className={`th-btn-complete ${isDone ? 'done' : 'pending'} group ${!canEdit ? 'opacity-40 cursor-not-allowed grayscale' : ''}`}
          title={!canEdit ? 'Only Admin or assignee can Done tasks' : ''}
        >
          {isCompleting ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          ) : isDone ? (
            <CheckCircle2 size={16} strokeWidth={3} className="text-current" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-current animate-pulse mr-1"></div>
          )}
          <span className="font-extrabold text-[11px] tracking-widest uppercase">
            {isDone ? 'DONE' : 'Finish Task'}
          </span>
        </motion.button>

        {isEditing && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={() => setIsEditing(false)}
            className="th-icon-btn !bg-emerald-500/10 !text-emerald-500 !border-emerald-500/20"
            title="Save Changes"
          >
            <CheckCircle2 size={18} />
          </motion.button>
        )}

        <div className="th-controls">
          {canEdit && (
            <TaskActionsMenu
              onEdit={onEdit}
              onDelete={onDelete}
              isAdmin={isAdmin}
            />
          )}
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="th-icon-btn hover:!bg-red-500/10 hover:!text-red-500 hover:!border-red-500/20"
          >
            <X size={18} />
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default TaskHeader;
