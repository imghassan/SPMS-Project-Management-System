import React, { useState, useRef, useEffect } from 'react';
import { Filter, Calendar, ChevronDown, Check, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../../styles/Components/TaskFilters.css';
import projectsApi from '../../api/projectsApi';
import { useTasks } from '../../hooks/useTasks';
import api from '../../api/apiClient';
import useAuthStore from '../../store/useAuthStore';

//  Time period helpers 
const getDateRange = (period) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  switch (period) {
    case 'Today': {
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { startDate: now.toISOString(), endDate: end.toISOString() };
    }
    case 'This Week': {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'Next Week': {
      const start = new Date(now);
      start.setDate(now.getDate() - now.getDay() + 7);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    case 'This Month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { startDate: start.toISOString(), endDate: end.toISOString() };
    }
    default:
      return {};
  }
};

const TIME_OPTIONS = ['All Time', 'Today', 'This Week', 'Next Week', 'This Month'];

//  Generic dropdown 
const Dropdown = ({ trigger, isOpen, onClose, children }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div className="tf-dropdown-wrapper" style={{ position: 'relative', zIndex: 10 }}>
      {trigger}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="tf-dropdown-menu"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

//  Main component 
const TaskFilters = ({ onFiltersChange }) => {
  const { user: currentUser } = useAuthStore();
  const { fetchTasks } = useTasks();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState({ id: 'all', name: 'All Projects' });
  const [selectedTime, setSelectedTime] = useState('All Time');
  const [selectedMember, setSelectedMember] = useState({ id: 'all', name: 'All Members' });

  // Load users projects on mount
  useEffect(() => {
    Promise.all([
      projectsApi.getProjects(),
      api.get('/auth/users')
    ]).then(([projRes, memberRes]) => {
      const pData = projRes.data.data || projRes.data || [];
      const mData = memberRes.data.data || memberRes.data || [];
      setProjects(pData.filter(p => p && p._id && p.name));
      setMembers(mData);
    }).catch(err => console.error('[TaskFilters] Failed to load filters data:', err));
  }, []);

  const toggle = (name) => setOpenDropdown(prev => prev === name ? null : name);
  const close = () => setOpenDropdown(null);

  const handleProjectSelect = (id, name) => {
    setSelectedProject({ id, name });
    close();
    const dateRange = getDateRange(selectedTime);
    const filters = { ...dateRange };
    if (id !== 'all') filters.project = id;
    if (selectedMember.id !== 'all') filters.assignee = selectedMember.id;
    if (onFiltersChange) onFiltersChange(filters);
  };

  const handleTimeSelect = (period) => {
    setSelectedTime(period);
    close();
    const dateRange = getDateRange(period);
    const filters = { ...dateRange };
    if (selectedProject.id !== 'all') filters.project = selectedProject.id;
    if (selectedMember.id !== 'all') filters.assignee = selectedMember.id;
    if (onFiltersChange) onFiltersChange(filters);
  };

  const handleMemberSelect = (id, name) => {
    setSelectedMember({ id, name });
    close();
    const dateRange = getDateRange(selectedTime);
    const filters = { ...dateRange };
    if (selectedProject.id !== 'all') filters.project = selectedProject.id;
    if (id !== 'all') filters.assignee = id;
    if (onFiltersChange) onFiltersChange(filters);
  };

  return (
    <div className="tf-container">
      {/*  Project filter  */}
      <Dropdown
        isOpen={openDropdown === 'projects'}
        onClose={close}
        trigger={
          <button onClick={() => toggle('projects')} className="tf-dropdown-trigger">
            <Filter size={16} className="tf-icon-accent" />
            <span>{selectedProject.name}</span>
            <ChevronDown className={`tf-chevron ${openDropdown === 'projects' ? 'open' : ''}`} size={14} strokeWidth={3} />
          </button>
        }
      >
        <div className="tf-dropdown-content overflow-y-auto custom-scrollbar">
          <span className="tf-dropdown-label">Projects</span>

          <button
            onClick={() => handleProjectSelect('all', 'All Projects')}
            className={`tf-dropdown-item ${selectedProject.id === 'all' ? 'active' : ''}`}
          >
            <Filter size={13} className="opacity-50 shrink-0" />
            <span>All Projects</span>
            {selectedProject.id === 'all' && <Check size={13} className="ml-auto" strokeWidth={3} />}
          </button>

          {projects.length === 0 && (
            <p className="px-3 py-2 text-[12px] text-text-muted italic">No projects found</p>
          )}

          {projects.map(project => (
            <button
              key={project._id}
              onClick={() => handleProjectSelect(project._id, project.name)}
              className={`tf-dropdown-item ${selectedProject.id === project._id ? 'active' : ''}`}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color || '#00D1FF' }} />
              <span className="truncate">{project.name}</span>
              {selectedProject.id === project._id && <Check size={13} className="ml-auto" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </Dropdown>

      {/*  Time period filter  */}
      <Dropdown
        isOpen={openDropdown === 'week'}
        onClose={close}
        trigger={
          <button onClick={() => toggle('week')} className="tf-dropdown-trigger">
            <Calendar size={16} className="tf-icon-accent" />
            <span>{selectedTime}</span>
            <ChevronDown className={`tf-chevron ${openDropdown === 'week' ? 'open' : ''}`} size={14} strokeWidth={3} />
          </button>
        }
      >
        <div className="tf-dropdown-content">
          <span className="tf-dropdown-label">Time Period</span>
          {TIME_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => handleTimeSelect(opt)}
              className={`tf-dropdown-item ${selectedTime === opt ? 'active' : ''}`}
            >
              {opt}
              {selectedTime === opt && <Check size={13} className="ml-auto" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </Dropdown>

      {/*  Member filter  */}
      <Dropdown
        isOpen={openDropdown === 'members'}
        onClose={close}
        trigger={
          <button onClick={() => toggle('members')} className="tf-dropdown-trigger">
            <Users size={16} className="tf-icon-accent" />
            <span>{selectedMember.name}</span>
            <ChevronDown className={`tf-chevron ${openDropdown === 'members' ? 'open' : ''}`} size={14} strokeWidth={3} />
          </button>
        }
      >
        <div className="tf-dropdown-content overflow-y-auto custom-scrollbar">
          <span className="tf-dropdown-label">Team Members</span>

          <button
            onClick={() => handleMemberSelect('all', 'All Members')}
            className={`tf-dropdown-item ${selectedMember.id === 'all' ? 'active' : ''}`}
          >
            <Users size={13} className="opacity-50 shrink-0" />
            <span>All Members</span>
            {selectedMember.id === 'all' && <Check size={13} className="ml-auto" strokeWidth={3} />}
          </button>

          {members.map(member => (
            <button
              key={member._id}
              onClick={() => handleMemberSelect(member._id, member.name + (member._id === currentUser?.id ? ' (Self)' : ''))}
              className={`tf-dropdown-item ${selectedMember.id === member._id ? 'active' : ''}`}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black shrink-0"
                style={{ background: 'rgba(0,209,255,0.1)', border: '1px solid rgba(0,209,255,0.2)', color: '#00D1FF' }}
              >
                {member.name?.[0]?.toUpperCase()}
              </div>
              <span className="truncate">{member.name} {member._id === currentUser?.id ? '(Self)' : ''}</span>
              {selectedMember.id === member._id && <Check size={13} className="ml-auto" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </Dropdown>
    </div>
  );
};

export default TaskFilters;
