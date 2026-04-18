import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MoreVertical,
  CalendarDays,
  Edit2,
  Archive,
  Trash2,
} from 'lucide-react';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import MemberAvatars from './MemberAvatars';
import SparklineChart from './SparklineChart';
import api from '../../api/apiClient';
import useProjectStore from '../../store/useProjectStore';
import useAuthStore from '../../store/useAuthStore';

const formatDue = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isDueSoon = (date) => {
  if (!date) return false;
  const d = new Date(date);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  const diffMs = d - now;
  return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
};

const isOverdue = (date, status) => {
  if (!date || status === 'COMPLETED') return false;
  return new Date(date) < new Date();
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
};

const ProjectCard = ({ project, index = 0, onEdit, onDelete, onArchiveToggle }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRefresh = useProjectStore(state => state.triggerRefresh);
  const [localProgress, setLocalProgress] = useState(Math.max(0, Math.min(100, Number(project.progress) || 0)));

  const isAdmin = (project.admin?._id || project.admin) === (user?.id || user?._id) ||
    (project.lead?._id || project.lead) === (user?.id || user?._id);

  useEffect(() => {
    setLocalProgress(Math.max(0, Math.min(100, Number(project.progress) || 0)));
  }, [project.progress]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const due = formatDue(project.dueDate);
  const overdue = isOverdue(project.dueDate, project.status);
  const dueSoon = isDueSoon(project.dueDate);

  const handleProgressChange = (newVal) => {
    setLocalProgress(newVal);
  };

  const handleProgressCommit = async (newVal) => {
    try {
      await api.put(`/projects/${project._id}`, { progress: newVal });
      triggerRefresh();
    } catch (err) {
      console.error("Failed to update project progress", err);
      // Revert to original
      setLocalProgress(Math.max(0, Math.min(100, Number(project.progress) || 0)));
    }
  };

  const projectUrl = `/project/${String(project._id)}`;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(0,212,212,0.12)' }}
      transition={{ duration: 0.2 }}
      onClick={() => navigate(projectUrl)}
      style={{
        background: '#131B2A',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 20,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        minHeight: 220,
        boxShadow: '0 10px 40px rgba(0,0,0,0.25)',
        willChange: 'transform, opacity',
        cursor: 'pointer',
      }}
    >
      <div style={{ padding: '22px', position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Top Row: badge + kebab */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
          <div onClick={(e) => e.stopPropagation()}>
            <StatusBadge status={project.status} index={index} />
          </div>
          {isAdmin && (
            <div ref={menuRef} style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
              <button
                onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: '#6a9090',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(0,212,212,0.08)';
                  e.currentTarget.style.color = '#00d4d4';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#6a9090';
                }}
                aria-label="Options"
              >
                < MoreVertical size={15} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: 36,
                      right: 0,
                      background: '#122525',
                      border: '1px solid rgba(0,212,212,0.14)',
                      borderRadius: 12,
                      padding: '6px',
                      minWidth: 148,
                      zIndex: 100,
                      boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
                    }}
                  >
                    {[
                      { icon: Edit2, label: 'Edit', action: () => { onEdit?.(project); setMenuOpen(false); }, color: '#dff0f0' },
                      {
                        icon: Archive,
                        label: project.isArchived ? 'Unarchive' : 'Archive',
                        action: () => { onArchiveToggle?.(project); setMenuOpen(false); },
                        color: '#f5a623',
                      },
                      { icon: Trash2, label: 'Delete', action: () => { onDelete?.(project._id); setMenuOpen(false); }, color: '#f87171' },
                    ].map(({ icon: Icon, label, action, color }) => (
                      <button
                        key={label}
                        onClick={action}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: 'transparent',
                          border: 'none',
                          color,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background 0.12s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Icon size={14} />
                        {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Title */}
        <div
          style={{
            color: 'white',
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            marginBottom: 6,
            lineHeight: 1.2,
            fontFamily: "'DM Sans', sans-serif"
          }}
        >
          {project.name || project.title}
        </div>

        {/* Description */}
        <div
          style={{
            color: '#94A3B8',
            fontSize: 13,
            lineHeight: 1.5,
            fontWeight: 500,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 39,
            marginBottom: 12
          }}
        >
          {project.description || 'No description yet.'}
        </div>

        {/* Sparkline */}
        <div>
          <SparklineChart
            progress={localProgress}
            status={project.status}
            sparkline={project.sparkline}
          />
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
          <ProgressBar
            progress={localProgress}
            status={project.status}
            index={index}
            interactive={false}
            onChange={handleProgressChange}
            onCommit={handleProgressCommit}
          />
        </div>

        {/* Bottom row: avatars + due date / archived */}
        <div
          style={{
            marginTop: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8
          }}
        >
          <MemberAvatars assignees={[
            ...(project.admin ? [project.admin] : []),
            ...(project.lead && (project.lead._id || project.lead) !== (project.admin?._id || project.admin) ? [project.lead] : []),
            ...(project.members || [])
          ].filter((v, i, a) => a.findIndex(t => (t._id || t) === (v._id || v)) === i)} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {project.isArchived && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'rgba(245,166,35,0.10)',
                  border: '1px solid rgba(245,166,35,0.20)',
                  color: '#f5a623',
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: '0.10em',
                }}
              >
                <Archive size={10} />
                Archived
              </span>
            )}
            {due && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  color: overdue ? '#f87171' : dueSoon ? '#f5a623' : '#94A3B8',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <CalendarDays size={14} />
                <span>{due}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export { cardVariants };
export default ProjectCard;
