import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import UserAvatar from '../ui/UserAvatar';
import TaskActionsMenu from '../ui/TaskActionsMenu';
import { useTasks } from '../../hooks/useTasks';

const KanbanCard = ({ task, index, onTaskClick, onUpdate }) => {
  const { toggleTaskComplete, removeTask } = useTasks();

  const isCompleted = ['Completed', 'Done'].includes(task.status);

  const getPriorityClass = (priority) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'priority-urgent';
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      case 'completed':
        return 'priority-completed';
      default:
        return 'priority-medium';
    }
  };

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`kanban-card cursor-pointer ${snapshot.isDragging ? 'shadow-2xl scale-[1.02] border-primary z-50' : ''}`}
          onClick={() => onTaskClick && onTaskClick(task)}
        >
          <div className="flex justify-between items-start mb-2">
            <span className={`priority-tag ${getPriorityClass(task.priority)}`}>
              {task.priority}
            </span>
            <div className="flex items-center gap-1">
              <TaskActionsMenu
                isCompleted={isCompleted}
                onToggle={async () => {
                  await toggleTaskComplete(task.id);
                  onUpdate && onUpdate();
                }}
                onDelete={async () => {
                  await removeTask(task.id);
                  onUpdate && onUpdate();
                }}
              />
            </div>
          </div>

          <h3 className="kanban-card-title">{task.title}</h3>

          <div className="kanban-card-footer">
            <div className={`kanban-card-date ${task.isToday ? 'text-red-500' : ''}`}>
              <Calendar size={14} />
              <span>{task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No date'}</span>
            </div>
            <div className="avatar-stack">
              {task.assignees && task.assignees.map((assignee, idx) => (
                <UserAvatar
                  key={idx}
                  user={assignee}
                  size="xs"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
