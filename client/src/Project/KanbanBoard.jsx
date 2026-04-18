import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import TaskDetails from '../TaskDetails/TaskDetails';
import taskApi from '../../api/taskApi';
import { Loader2 } from 'lucide-react';
import { getAvatarUrl } from '../../utils/getAvatarUrl';

const COLUMNS = {
  'To Do': { id: 'To Do', title: 'To Do', badgeVariant: 'badge-todo' },
  'In Progress': { id: 'In Progress', title: 'In Progress', badgeVariant: 'badge-inprogress' },
  'In Review': { id: 'In Review', title: 'In Review', badgeVariant: 'badge-review' },
  'Done': { id: 'Done', title: 'Done', badgeVariant: 'badge-done' }
};

const COLUMN_ORDER = ['To Do', 'In Progress', 'In Review', 'Done'];

const KanbanBoard = ({ projectId, searchTerm, filters }) => {
  const [tasks, setTasks] = useState({});
  const [columns, setColumns] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await taskApi.getTasks({ project: projectId });
      const fetchedTasks = response.data.data || [];

      const tasksMap = {};
      const columnsMap = {
        'To Do': { ...COLUMNS['To Do'], taskIds: [] },
        'In Progress': { ...COLUMNS['In Progress'], taskIds: [] },
        'In Review': { ...COLUMNS['In Review'], taskIds: [] },
        'Done': { ...COLUMNS['Done'], taskIds: [] }
      };

      fetchedTasks.forEach(task => {
        tasksMap[task._id] = {
          ...task,
          id: task._id, // Map _id to id for DnD
          assignees: task.assignee ? [{
            initials: task.assignee.name?.substring(0, 2).toUpperCase() || '??',
            name: task.assignee.name,
            avatar: getAvatarUrl(task.assignee.avatar)
          }] : []
        };

        // Map status to column, handling 'Completed' as 'Done'
        let targetColumn = task.status;
        if (targetColumn === 'Completed') targetColumn = 'Done';
        if (targetColumn === 'In Review') targetColumn = 'In Review'; // Match case if needed

        if (columnsMap[targetColumn]) {
          columnsMap[targetColumn].taskIds.push(task._id);
        } else {
          columnsMap['To Do'].taskIds.push(task._id);
        }
      });

      setTasks(tasksMap);
      setColumns(columnsMap);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) fetchTasks();

    const handleTaskAdded = () => {
      if (projectId) fetchTasks();
    };

    window.addEventListener('taskAdded', handleTaskAdded);
    return () => window.removeEventListener('taskAdded', handleTaskAdded);
  }, [projectId, fetchTasks]);

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    // Optimistic update
    const newColumns = { ...columns };

    if (start === finish) {
      const newTaskIds = Array.from(start.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);
      newColumns[start.id] = { ...start, taskIds: newTaskIds };
      setColumns(newColumns);
      return;
    }

    const startTaskIds = Array.from(start.taskIds);
    startTaskIds.splice(source.index, 1);
    const finishTaskIds = Array.from(finish.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);

    newColumns[start.id] = { ...start, taskIds: startTaskIds };
    newColumns[finish.id] = { ...finish, taskIds: finishTaskIds };

    setColumns(newColumns);

    // Persist change
    try {
      await taskApi.updateTask(draggableId, { status: finish.id });
    } catch (error) {
      console.error('Error updating task status:', error);
      fetchTasks(); // Revert on failure
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-[#040911]">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full min-h-0 bg-[#040911]">
        <div className="kanban-container h-full custom-scrollbar">
          {COLUMN_ORDER.map((columnId) => {
            const column = columns[columnId];
            if (!column) return null;
            const columnTasks = column.taskIds
              .map((taskId) => tasks[taskId])
              .filter(Boolean)
              .filter((task) => {
                // Search filter
                if (searchTerm) {
                  const searchLower = searchTerm.toLowerCase();
                  const matchesSearch = task.title?.toLowerCase().includes(searchLower) ||
                    task.description?.toLowerCase().includes(searchLower) ||
                    task._id?.toLowerCase().includes(searchLower);
                  if (!matchesSearch) return false;
                }

                // Dropdown filters
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
              <KanbanColumn
                key={column.id}
                id={column.id}
                title={column.title}
                tasks={columnTasks}
                badgeVariant={column.badgeVariant}
                onTaskClick={handleTaskClick}
                onUpdate={fetchTasks}
              />
            );
          })}
        </div>
      </div>

      <TaskDetails
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        taskId={selectedTask?.id}
        onTaskUpdate={fetchTasks}
      />
    </DragDropContext>
  );
};

export default KanbanBoard;
