import React from 'react';
import { motion } from 'framer-motion';
import ProjectCard, { cardVariants } from './ProjectCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const ProjectGrid = ({
  projects = [],
  loading = false,
  onEdit,
  onDelete,
  onArchiveToggle,
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      {loading &&
        Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`sk-${i}`}
            variants={cardVariants}
            style={{
              background: '#0f2020',
              border: '1px solid rgba(0,212,212,0.08)',
              borderRadius: 18,
              padding: 18,
              minHeight: 210,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(100deg, transparent 0%, rgba(0,212,212,0.04) 40%, transparent 70%)',
                animation: 'pd_skeleton 1.4s ease-in-out infinite',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 90, height: 22, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }} />
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.05)' }} />
            </div>
            <div style={{ width: '65%', height: 16, borderRadius: 8, background: 'rgba(255,255,255,0.07)', marginBottom: 10 }} />
            <div style={{ width: '100%', height: 11, borderRadius: 8, background: 'rgba(255,255,255,0.05)', marginBottom: 6 }} />
            <div style={{ width: '75%', height: 11, borderRadius: 8, background: 'rgba(255,255,255,0.04)' }} />
            <div style={{ marginTop: 14, width: '100%', height: 42, borderRadius: 8, background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ marginTop: 10, width: '100%', height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: -6 }}>
                {[0, 1, 2].map((j) => (
                  <div key={j} style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', marginLeft: j > 0 ? -8 : 0 }} />
                ))}
              </div>
              <div style={{ width: 64, height: 11, borderRadius: 8, background: 'rgba(255,255,255,0.05)' }} />
            </div>
          </motion.div>
        ))}

      {!loading &&
        projects.map((project, i) => (
          <ProjectCard
            key={project._id}
            project={project}
            index={i}
            onEdit={onEdit}
            onDelete={onDelete}
            onArchiveToggle={onArchiveToggle}
          />
        ))}
    </motion.div>
  );
};

export default ProjectGrid;
