import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCircle2 } from 'lucide-react';
import PriorityBadge from './PriorityBadge';
import { useTasks } from '../../hooks/useTasks';
import { getAvatarUrl } from '../../utils/getAvatarUrl';
import useAuthStore from '../../store/useAuthStore';
import TaskActionsMenu from '../ui/TaskActionsMenu';

const getStatusColor = (status) => {
  switch (status) {
    case 'In Progress': return 'text-[#F59E0B]';
    case 'In Review': return 'text-[#3B82F6]';
    case 'To Do': return 'text-[#94A3B8]';
    case 'Done': return 'text-[#10B981]';
    default: return 'text-[#6B7280]';
  }
};

const formatDate = (dateString, status) => {
  if (!dateString) return <span className="text-[#6B7280] text-sm italic">No date</span>;
  const date = new Date(dateString);
  const now = new Date();

  if (status !== 'Done' && status !== 'Done' && date < now) {
    return (
      <div className="flex flex-col">
        <span className="text-red-500 font-medium tracking-tight text-sm">Overdue</span>
        <span className="text-red-500/70 text-[11px] font-bold">
          ({date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })})
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <span className="text-white text-sm font-medium tracking-tight">
        {date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })},
      </span>
      <span className="text-[#6B7280] text-[11px] font-bold tracking-wider">
        {date.getFullYear()}
      </span>
    </div>
  );
};


//  Task Row 
const TaskRow = ({ task, index, onClick }) => {
  const { toggleTaskComplete, removeTask } = useTasks();
  const { user } = useAuthStore();

  const isCompleted = ['Done', 'Done'].includes(task.status);
  const isAssignee = task.assignee?._id === user?._id || task.assignee === user?._id;
  const projectAdmin = task.project?.admin?._id || task.project?.admin;
  const isAdmin = projectAdmin === user?._id;
  const canModify = isAdmin || isAssignee;

  const projectName = typeof task.project === 'object'
    ? (task.project?.name || 'Unknown Project')
    : (task.project || 'No Project');

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group transition-colors cursor-pointer"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      onClick={(e) => {
        // Don't trigger if clicking checkbox, actions or other buttons
        if (e.target.closest('button') || e.target.closest('.actions-trigger')) return;
        onClick && onClick(task._id);
      }}
    >
      {/* Checkbox */}
      <td className="py-4 px-6 w-12">
        <motion.button
          whileTap={canModify ? { scale: 0.85 } : {}}
          onClick={(e) => {
            e.stopPropagation();
            if (canModify) toggleTaskComplete(task._id);
          }}
          className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${isCompleted
            ? 'border-[#00D1FF] text-[#040911]'
            : 'border-[#6B7280] hover:border-[#00D1FF] bg-transparent'
            } ${!canModify ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          style={isCompleted ? { background: '#00D1FF' } : {}}
          title={!canModify ? 'Only the Admin or assignee can change status' : ''}
        >
          {isCompleted && <Check size={14} strokeWidth={3} />}
        </motion.button>
      </td>

      {/* Title */}
      <td className="py-4 px-2">
        <span className={`text-[15px] font-medium transition-colors ${isCompleted ? 'line-through text-[#6B7280]' : 'text-white'}`}>
          {task.title}
        </span>
      </td>

      {/* Project */}
      <td className="py-4 px-4 w-40">
        <span
          className="px-3 py-1 text-[11px] font-bold rounded-full truncate max-w-[130px] inline-block"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94A3B8' }}
        >
          {projectName}
        </span>
      </td>

      {/* Assignee */}
      <td className="py-4 px-4 w-48">
        <div className="flex items-center gap-3">
          {task.assignee ? (
            <>
              {getAvatarUrl(task.assignee.avatar) ? (
                <img
                  src={getAvatarUrl(task.assignee.avatar)}
                  alt={task.assignee.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover"
                  style={{ border: '2px solid rgba(255,255,255,0.1)' }}
                  onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : null}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#00D1FF] text-xs font-bold"
                style={{
                  background: 'rgba(0,209,255,0.15)',
                  border: '2px solid rgba(0,209,255,0.3)',
                  display: getAvatarUrl(task.assignee.avatar) ? 'none' : 'flex'
                }}
              >
                {task.assignee.name?.[0]?.toUpperCase() || '?'}
              </div>
              <span className="text-sm font-medium text-white truncate max-w-[100px]">
                {task.assignee.name || 'Unknown'}
              </span>
            </>
          ) : (
            <span className="text-sm text-[#6B7280] italic">Unassigned</span>
          )}
        </div>
      </td>

      {/* Due Date */}
      <td className="py-4 px-4 w-32">
        {formatDate(task.dueDate, task.status)}
      </td>

      {/* Priority */}
      <td className="py-4 px-4 w-32">
        <PriorityBadge priority={task.priority} />
      </td>

      {/* Status */}
      <td className="py-4 px-4 w-40">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <CheckCircle2 size={16} className="text-[#10B981]" />
          ) : (
            <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status).replace('text-', 'bg-')}`} />
          )}
          <span className={`text-[11px] font-bold tracking-wider ${getStatusColor(task.status)} uppercase`}>
            {task.status || 'UNKNOWN'}
          </span>
        </div>
      </td>
    </motion.tr>
  );
};

export default TaskRow;
