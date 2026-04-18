import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ProjectNavbar from '../components/Project/ProjectNavbar';
import ProjectHeader from '../components/Project/ProjectHeader';
import KanbanBoard from '../components/Project/KanbanBoard';
import ListView from '../components/Project/ListView';
import ProjectMembers from '../components/Project/ProjectMembers';
import ProjectSettings from '../components/Project/ProjectSettings';
import NewTaskModal from '../components/tasks/NewTaskModal';
import projectsApi from '../api/projectsApi';
import TaskDetails from '../components/TaskDetails/TaskDetails';
import { Loader2 } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const ProjectBoard = () => {
  const { projectId } = useParams();
  const location = useLocation();
  const { user } = useAuthStore();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'Kanban View');
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [filters, setFilters] = useState({ member: 'all', priority: 'all', dueDate: 'all' });

  // Deep-linking for tasks
  const [selectedDeepTaskId, setSelectedDeepTaskId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const taskId = params.get('taskId');
    if (taskId) {
      setSelectedDeepTaskId(taskId);
      setIsDetailsModalOpen(true);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const response = await projectsApi.getProjectById(projectId);
        setProject(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError(err.response?.data?.message || 'Failed to load project details.');
      } finally {
        setLoading(false);
      }
    };
    if (projectId) fetchProject();
  }, [projectId]);

  const isAdmin = (project?.admin?._id || project?.admin) === (user?.id || user?._id) ||
    (project?.lead?._id || project?.lead) === (user?.id || user?._id);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#040911]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#040911] p-8 text-center">
        <div className="bg-[#112229] p-8 rounded-2xl border border-red-500/20 shadow-2xl max-w-md w-full">
          <h2 className="text-xl font-bold text-white mb-2">Oops!</h2>
          <p className="text-red-400 text-[14px] mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-[#0A101C] font-bold rounded-lg hover:opacity-90 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-0 overflow-hidden bg-[#040911]">
      <ProjectNavbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOwner={isAdmin}
      />
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <ProjectHeader
          project={project}
          onNewTask={isAdmin && (activeTab === 'Kanban View' || activeTab === 'List View') ? () => setIsNewTaskModalOpen(true) : null}
          showFilters={activeTab === 'Kanban View' || activeTab === 'List View'}
          filters={filters}
          setFilters={setFilters}
          isOwner={isAdmin}
        />
        <div className="flex-1 min-h-0 overflow-y-auto px-8 pb-8">
          {activeTab === 'Kanban View' ? (
            <KanbanBoard projectId={projectId} searchTerm={searchTerm} filters={filters} />
          ) : activeTab === 'List View' ? (
            <ListView projectId={projectId} searchTerm={searchTerm} filters={filters} isAdmin={isAdmin} />
          ) : activeTab === 'Members' ? (
            <ProjectMembers
              project={project}
              onUpdate={(updated) => setProject(updated)}
              isAdmin={isAdmin}
            />
          ) : activeTab === 'Settings' ? (
            <ProjectSettings
              project={project}
              onUpdate={(updated) => setProject(updated)}
              isAdmin={isAdmin}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="bg-[#112229] p-6 rounded-2xl border border-white/5 shadow-2xl max-w-md w-full">
                <h2 className="text-xl font-bold text-white mb-2">{activeTab}</h2>
                <p className="text-muted text-[14px]">This section is currently under development. Stay tuned for updates!</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
        defaultProjectId={projectId}
      />

      <TaskDetails
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        taskId={selectedDeepTaskId}
      />
    </div>
  );
};

export default ProjectBoard;
