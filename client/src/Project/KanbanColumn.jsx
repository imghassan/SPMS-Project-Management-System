import React from 'react';
import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';

const KanbanColumn = ({ id, title, tasks, badgeVariant, onTaskClick, onUpdate }) => {
  return (
    <div className="kanban-column flex-shrink-0">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="kanban-column-title">{title}</h2>
          <span className={`kanban-badge ${badgeVariant}`}>{tasks.length}</span>
        </div>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[150px] transition-colors rounded-xl p-1
              ${snapshot.isDraggingOver ? 'bg-white/5' : ''}`}
          >
            {tasks.map((task, index) => (
              <KanbanCard key={task.id} task={task} index={index} onTaskClick={onTaskClick} onUpdate={onUpdate} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
