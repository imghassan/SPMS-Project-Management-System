import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import 'chart.js/auto';
import { useNavigate } from 'react-router-dom';
import projectsApi from '../api/projectsApi';
import { useToast } from '../components/ui/toast.jsx';
import PageHeader from '../components/Dashboard/PageHeader';
import ProjectGrid from '../components/Dashboard/ProjectGrid';
import StatsBar from '../components/Dashboard/StatsBar';
import useModalStore from '../store/useModalStore';
import useProjectStore from '../store/useProjectStore';
import useSearchStore from '../store/useSearchStore';
import "../styles/ProjectsDashboard.css";

// Sort logic
const sortProjects = (projects, sortBy) => {
  return [...projects].sort((a, b) => {
    if (sortBy === 'dueDate') {
      const da = a.dueDate ? new Date(a.dueDate) : new Date('9999-01-01');
      const db = b.dueDate ? new Date(b.dueDate) : new Date('9999-01-01');
      return da - db;
    }
    if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
    if (sortBy === 'alpha') return (a.name || a.title || '').localeCompare(b.name || b.title || '');
    if (sortBy === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
    return 0;
  });
};

const ProjectsDashboard = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { openCreateProjectModal } = useModalStore();
  const { refreshTrigger, triggerRefresh } = useProjectStore();
  const { searchQuery, clearSearch, setSearchQuery } = useSearchStore();

  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, activeNow: 0, dueThisWeek: 0, done: 0 });
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('dueDate');

  // Status distribution for charts
  const distribution = useMemo(() =>
    projects.reduce(
      (acc, p) => {
        if (p) {
          if (p.isArchived) {
            acc['ARCHIVED'] = (acc['ARCHIVED'] || 0) + 1;
          } else if (p.status) {
            acc[p.status] = (acc[p.status] || 0) + 1;
          }
        }
        return acc;
      },
      { 'IN PROGRESS': 0, 'ON HOLD': 0, COMPLETED: 0, ARCHIVED: 0 }
    ),
    [projects]
  );

  // Filtered + sorted + searched projects
  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const filtered = projects
      .filter((p) => {
        if (!p) return false;
        
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const titleMatch = (p.title || '').toLowerCase().includes(q);
        const matchesQuery = !q || nameMatch || titleMatch;
        if (!matchesQuery) return false;

        if (filterStatus === 'ARCHIVED') {
          return p.isArchived === true;
        }

        // Hide archived projects in the default 'ALL' view or other specific active status views.
        // The only exception is the 'COMPLETED' view, which purposely shows auto-archived completed projects.
        if (p.isArchived && filterStatus !== 'COMPLETED') return false;

        return filterStatus === 'ALL' || 
               p.status === filterStatus || 
               (filterStatus === 'COMPLETED' && p.status === 'DONE');
      });
    return sortProjects(filtered, sortBy);
  }, [projects, filterStatus, sortBy, searchQuery]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        projectsApi.getProjects(),
        projectsApi.getProjectStats(),
      ]);
      setProjects(pRes.data.data || []);
      setStats(sRes.data.data || { total: 0, activeNow: 0, dueThisWeek: 0, done: 0 });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 401 ? 'Not authorized. Please login again.' : null) ||
        err?.message ||
        'Failed to load projects';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll, refreshTrigger]);

  const refreshStats = async () => {
    try {
      const sRes = await projectsApi.getProjectStats();
      setStats(sRes.data.data || stats);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        (err?.response?.status === 401 ? 'Not authorized. Please login again.' : null) ||
        err?.message ||
        'Failed to load project stats';
      toast.error(msg);
    }
  };

  const handleEdit = (project) => {
    navigate(`/project/${project._id}`, { state: { activeTab: 'Settings' } });
  };

  const handleDelete = async (id) => {
    try {
      await projectsApi.deleteProject(id);
      setProjects((prev) => prev.filter((p) => p._id !== id));
      await refreshStats();
      triggerRefresh();
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete project');
    }
  };

  const handleArchiveToggle = async (project) => {
    try {
      const res = await projectsApi.updateProject(project._id, {
        isArchived: !project.isArchived,
      });
      setProjects((prev) => prev.map((p) => (p._id === project._id ? res.data.data : p)));
      triggerRefresh();
      toast.success(project.isArchived ? 'Project unarchived' : 'Project archived');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update project');
    }
  };

  return (
    <>
      <div className="pd-main-container">
        <div className="pd-content-wrapper">
          <PageHeader
            searchQuery={searchQuery}
            setSearch={setSearchQuery}
            filterStatus={filterStatus}
            setFilter={setFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          <div className="pd-grid-section">
            <ProjectGrid
              key={loading ? 'loading' : 'ready'}
              projects={filteredProjects}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onArchiveToggle={handleArchiveToggle}
            />
          </div>

          {/* Empty states */}
          {!loading && projects.length === 0 && (
            <div className="pd-empty-state pd-empty-initial">
              <div className="pd-empty-icon">🚀</div>
              <div className="pd-empty-title">Ready to build something great?</div>
              <p className="pd-empty-subtitle">You haven't created any projects yet. Start by adding your first one!</p>
              <button
                onClick={openCreateProjectModal}
                className="pd-btn-primary mt-4"
              >
                Create Project
              </button>
            </div>
          )}

          {!loading && projects.length > 0 && filteredProjects.length === 0 && (
            <div className="pd-empty-state">
              <div className="pd-empty-icon">🔍</div>
              <div className="pd-empty-title">No projects match your filters.</div>
              <p className="pd-empty-subtitle">Try adjusting your search or status filters to find what you're looking for.</p>
              <button
                onClick={() => { 
                  setFilter('ALL'); 
                  setSearchQuery(''); // Direct set for certainty
                  clearSearch(); 
                }}
                className="pd-btn-clear"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Bar */}
      <StatsBar stats={stats} distribution={distribution} />

      {/* Floating Action Button */}
      <motion.button
        onClick={openCreateProjectModal}
        whileHover={{ scale: 1.08, boxShadow: '0 20px 48px rgba(0,209,255,0.35)' }}
        whileTap={{ scale: 0.96 }}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
        className="pd-fab"
        aria-label="New Project"
      >
        <Plus size={22} strokeWidth={2.8} />
      </motion.button>


    </>
  );
};

export default ProjectsDashboard;