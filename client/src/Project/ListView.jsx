import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import TaskDetails from '../TaskDetails/TaskDetails';
import taskApi from '../../api/taskApi';
import { useTasks } from '../../hooks/useTasks';
import UserAvatar from '../ui/UserAvatar';
import '../../styles/Components/ListView.css';

const ListView = ({ projectId, searchTerm, filters }) => {
  const [groupedTasks, setGroupedTasks] = useState(null);
  const [loading, setLoading] = useState(true);
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchGroupedTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await taskApi.getTasks({ project: projectId, grouped: true });
      setGroupedTasks(res.data.data);
    } catch (err) {
      console.error('Error fetching grouped tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchGroupedTasks();

    const handleTaskAdded = () => {
      fetchGroupedTasks();
    };

    window.addEventListener('taskAdded', handleTaskAdded);
    return () => window.removeEventListener('taskAdded', handleTaskAdded);
  }, [fetchGroupedTasks]);

  const toggleGroup = (status) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const handleTaskClick = (taskId) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  if (loading && !groupedTasks) {
    return <div className="p-8 text-muted">Loading tasks...</div>;
  }

  if (!groupedTasks) return null;

  const statuses = [
    { label: 'To Do', color: 'var(--lv-accent-todo)' },
    { label: 'In Progress', color: 'var(--lv-accent-prog)' },
    { label: 'In Review', color: 'var(--lv-accent-review)' },
    { label: 'Done', color: 'var(--lv-accent-done)' }
  ];

  return (
    <div className="list-view-container">
      {statuses.map(status => {
        let statusTasks = groupedTasks[status.label] || [];

        statusTasks = statusTasks.filter(task => {
          if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = task.title?.toLowerCase().includes(searchLower) ||
              task.description?.toLowerCase().includes(searchLower) ||
              task._id?.toLowerCase().includes(searchLower);
            if (!matchesSearch) return false;
          }

          if (filters) {
            if (filters.member !== 'all') {
              const assigneeId = task.assignee?._id || task.assignee;
              if (assigneeId !== filters.member) return false;
            }
            if (filters.priority !== 'all') {
              if (task.priority !== filters.priority) return false;
            }
            if (filters.dueDate !== 'all') {
              if (!task.dueDate) return false;
              const due = new Date(task.dueDate);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const dueTime = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
              const todayTime = today.getTime();

              if (filters.dueDate === 'overdue') {
                if (dueTime >= todayTime || task.status === 'Completed' || task.status === 'Done') return false;
              } else if (filters.dueDate === 'today') {
                if (dueTime !== todayTime) return false;
              } else if (filters.dueDate === 'this_week') {
                const nextWeek = new Date(today);
                nextWeek.setDate(today.getDate() + 7);
                if (dueTime < todayTime || dueTime > nextWeek.getTime()) return false;
              }
            }
          }
          return true;
        });

        return (
          <StatusGroup
            key={status.label}
            status={status}
            tasks={statusTasks}
            isCollapsed={collapsedGroups[status.label]}
            onToggle={() => toggleGroup(status.label)}
            onUpdate={fetchGroupedTasks}
            onTaskClick={handleTaskClick}
            projectId={projectId}
          />
        );
      })}

      <TaskDetails
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={selectedTaskId}
      />
    </div>
  );
};

const StatusGroup = ({ status, tasks, isCollapsed, onToggle, onUpdate, onTaskClick, projectId }) => {
  return (
    <div className="status-group">
      <div className="status-group-header" onClick={onToggle}>
        {isCollapsed ? <ChevronRight size={16} className="text-muted" /> : <ChevronDown size={16} className="text-muted" />}
        <div className="status-dot" style={{ backgroundColor: status.color }} />
        <span className="status-label">{status.label}</span>
        <span className="status-count">{tasks.length}</span>
      </div>

      {!isCollapsed && (
        <table className="list-view-table">
          <thead>
            <tr>
              <th className="list-view-th">Task Name</th>
              <th className="list-view-th" style={{ width: '100px' }}>Priority</th>
              <th className="list-view-th" style={{ width: '150px' }}>Assignee</th>
              <th className="list-view-th" style={{ width: '120px' }}>Due Date</th>
              <th className="list-view-th" style={{ width: '140px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => (
              <TaskRow
                key={task._id}
                task={task}
                onUpdate={onUpdate}
                onClick={() => onTaskClick(task._id)}
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const TaskRow = ({ task, onUpdate, onClick }) => {
  const { toggleTaskComplete, removeTask } = useTasks();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const isCompleted = ['Completed', 'Done'].includes(task.status);

  const handleTitleBlur = async () => {
    setIsEditing(false);
    if (title !== task.title) {
      try {
        await taskApi.updateTask(task._id, { title });
        onUpdate();
      } catch (err) {
        setTitle(task.title);
        console.error('Update failed:', err);
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await taskApi.patchStatus(task._id, newStatus);
      onUpdate();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this task?')) {
      try {
        await taskApi.deleteTask(task._id);
        onUpdate();
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
  };

  const priorityClass = `priority-pill priority-${task.priority?.toLowerCase()}`;
  const statusColor = getStatusColor(task.status);
  const isDone = task.status === 'Completed';

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return format(date, 'MMM dd, yyyy');
  };

  const isOverdue = !isDone && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));

  return (
    <tr className={`task-row ${isDone ? 'done' : ''}`} style={{ '--status-color': statusColor }}>
      <td className="task-title-cell">
        <div className="status-accent-bar" style={{ backgroundColor: statusColor }} />
        {isEditing ? (
          <input
            autoFocus
            className="task-title-text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => e.key === 'Enter' && handleTitleBlur()}
          />
        ) : (
          <div className="task-title-text group/title flex items-center gap-2">
            <span
              className="cursor-pointer hover:text-[#00D1FF] transition-colors flex-1 select-none"
              onClick={onClick}
              onDoubleClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              {task.title}
            </span>
          </div>
        )}
      </td>
      <td>
        <span className={priorityClass}>{task.priority}</span>
      </td>
      <td className="assignee-cell">
        <div className="assignee-content">
          <UserAvatar
            user={task.assignee}
            size="sm"
          />
          <span className="assignee-name">{task.assignee?.name || 'Unassigned'}</span>
        </div>
      </td>
      <td className={`due-date-cell ${isOverdue ? 'due-date-overdue' : ''}`}>
        {formatDate(task.dueDate)}
      </td>
      <td className="status-cell">
        <div className="status-pill-badge">
          <div className="status-dot-inner" style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
          <span style={{ color: statusColor }}>{task.status}</span>
        </div>
      </td>
    </tr>
  );
};




const getStatusColor = (status) => {
  switch (status) {
    case 'To Do': return 'var(--lv-accent-todo)';
    case 'In Progress': return 'var(--lv-accent-prog)';
    case 'In Review': return 'var(--lv-accent-review)';
    case 'Done':
    case 'Completed': return 'var(--lv-accent-done)';
    default: return '#64748b';
  }
};

export default ListView;
