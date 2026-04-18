import React from 'react';
import {
  Flag,
  User,
  CalendarDays,
  CheckCircle2,
  AlertTriangle,
  Zap
} from 'lucide-react';
import UserAvatar from '../ui/UserAvatar';

const TaskMeta = ({ task, users = [], onStatusChange, onMetadataChange, canEdit }) => {
  const priorityColors = {
    Urgent: 'text-priority-urgent',
    High: 'text-priority-high',
    Medium: 'text-priority-medium',
    Low: 'text-priority-low'
  };

  const statusOptions = ['To Do', 'In Progress', 'In Review', 'Done'];

  return (
    <div className="mb-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Status */}
        <div className="td-meta-card group">
          <label className="td-label flex items-center gap-2 mb-2">
            <CheckCircle2 size={10} className="text-accent-teal" />
            Status
          </label>
          <div className="flex items-center h-[32px]">
            <select
              value={task.status}
              onChange={(e) => onStatusChange(e.target.value)}
              disabled={!canEdit}
              className={`td-select-native font-bold ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {statusOptions.map(opt => (
                <option key={opt} value={opt} className="bg-[#0b121e] text-white">{opt}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Priority */}
        <div className="td-meta-card group">
          <label className="td-label flex items-center gap-2 mb-2">
            <AlertTriangle size={10} className="text-priority-high" />
            Priority
          </label>
          <div className="flex items-center gap-2.5 h-[32px]">
            {task.priority === 'Urgent' ? (
              <Zap size={14} className={`${priorityColors[task.priority] || 'text-white/40'} fill-current`} />
            ) : (
              <Flag size={14} className={`${priorityColors[task.priority] || 'text-white/40'}`} fill="currentColor" />
            )}
            <select
              value={task.priority || 'Medium'}
              onChange={(e) => onMetadataChange({ priority: e.target.value })}
              disabled={!canEdit}
              className={`td-select-native font-bold text-[13px] ${priorityColors[task.priority] || 'text-white'} ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {['Low', 'Medium', 'High', 'Urgent'].map(p => (
                <option key={p} value={p} className="bg-[#0b121e] text-white">{p}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Assignee */}
        <div className="td-meta-card group">
          <label className="td-label flex items-center gap-2 mb-2">
            <User size={10} className="text-emerald-400" />
            Assignee
          </label>
          <div className="flex items-center gap-2.5 h-[32px]">
            <UserAvatar
              user={task.assignee}
              size="xs"
              className="rounded-lg shrink-0 border border-white/5"
            />
            <select
              value={task.assignee?._id || task.assignee || ''}
              onChange={(e) => onMetadataChange({ assignee: e.target.value })}
              disabled={!canEdit}
              className={`td-select-native truncate font-bold text-[13px] ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="" disabled>Unassigned</option>
              {users.map(u => (
                <option key={u._id} value={u._id} className="bg-[#0b121e] text-white">
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Due Date */}
        <div className="td-meta-card group">
          <label className="td-label flex items-center gap-2 mb-2">
            <CalendarDays size={10} className="text-indigo-400" />
            Deadlines
          </label>
          <div className="flex items-center h-[32px]">
            <input
              type="date"
              value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
              onChange={(e) => onMetadataChange({ dueDate: e.target.value || null })}
              disabled={!canEdit}
              className={`td-date-input bg-transparent border-none text-white font-bold text-[13px] outline-none w-full color-scheme-dark hover:text-indigo-400 transition-colors ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            />
          </div>
        </div>
      </div>
    </div>

  );
};

export default TaskMeta;
