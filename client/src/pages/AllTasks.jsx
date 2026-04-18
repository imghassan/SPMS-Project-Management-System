import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ClipboardList, Plus, LayoutGrid } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskTable from '../components/tasks/TaskTable';
import StatsGrid from '../components/stats/StatsGrid';
import TaskOverviewChart from '../components/tasks/TaskOverviewChart';
import NewTaskModal from '../components/tasks/NewTaskModal';
import TaskDetails from '../components/TaskDetails/TaskDetails';
import '../styles/AllTasks.css';

const AllTasks = () => {
  const { fetchTasks, fetchStats } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});

  // States for Task Details
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const applyFilters = useCallback((filters) => {
    setActiveFilters(filters);
    fetchTasks(filters);
    fetchStats();
  }, [fetchTasks, fetchStats]);
  
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get('taskId');
    if (taskId) {
      setSelectedTaskId(taskId);
      setIsDetailsOpen(true);
    }
  }, [location.search]);

  useEffect(() => {
    fetchTasks();
    fetchStats();

    const handleOpenModal = () => setIsModalOpen(true);
    document.addEventListener('open-new-task', handleOpenModal);

    const handleTaskAdded = () => {
      fetchTasks(activeFilters);
      fetchStats();
    };
    window.addEventListener('taskAdded', handleTaskAdded);

    return () => {
      document.removeEventListener('open-new-task', handleOpenModal);
      window.removeEventListener('taskAdded', handleTaskAdded);
    };
  }, []);
  const handleTaskClick = (id) => {
    setSelectedTaskId(id);
    setIsDetailsOpen(true);
  };

  const handleRefresh = () => {
    fetchTasks(activeFilters);
    fetchStats();
  };

  return (
    <div className="all-tasks-container">
      {/*  Page Header  */}
      <div className="all-tasks-header">
        <div className="at-title-wrap">
          <div className="at-icon-box">
            <ClipboardList size={20} strokeWidth={2} />
          </div>
          <div>
            <h1 className="at-title">All Tasks</h1>
            <p className="at-subtitle">
              Manage and track your collective project milestones.
            </p>
          </div>
        </div>

        {/* Right: Filters + New Task button */}
        <div className="at-actions">
          <TaskFilters onFiltersChange={applyFilters} />
          <button
            onClick={() => setIsModalOpen(true)}
            className="at-btn-primary"
          >
            <Plus size={16} strokeWidth={3} />
            New Task
          </button>
        </div>
      </div>

      {/*  Stats Row  */}
      <StatsGrid />

      {/*  Main Content: Table + Chart  */}
      <div className="at-content-grid">
        {/* Table */}
        <div className="min-w-0">
          <div className="at-glass-panel">
            {/* Table header accent bar */}
            <div className="at-panel-header">
              <div className="at-panel-title">
                <LayoutGrid size={16} className="text-[#00D1FF]" strokeWidth={2.5} />
                <span>Task List</span>
              </div>
            </div>
            <TaskTable onTaskClick={handleTaskClick} />
          </div>
        </div>

        {/* Chart */}
        <div className="min-w-0">
          <TaskOverviewChart />
        </div>
      </div>

      {/*  Modals  */}
      <NewTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <TaskDetails
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        taskId={selectedTaskId}
        onTaskUpdate={handleRefresh}
      />
    </div>
  );
};

export default AllTasks;
