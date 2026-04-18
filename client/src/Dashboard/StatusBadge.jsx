import React from 'react';
import { motion } from 'framer-motion';
import { CircleDot } from 'lucide-react';

export const STATUS_META = {
  'IN PROGRESS': {
    label: 'IN PROGRESS',
    badgeBg: 'rgba(0,212,212,0.10)',
    badgeBorder: 'rgba(0,212,212,0.22)',
    badgeText: '#00d4d4',
    bar: '#00d4d4',
    dot: '#00d4d4',
    pulse: true,
  },
  'ON HOLD': {
    label: 'ON HOLD',
    badgeBg: 'rgba(245,166,35,0.10)',
    badgeBorder: 'rgba(245,166,35,0.22)',
    badgeText: '#f5a623',
    bar: '#f5a623',
    dot: '#f5a623',
    pulse: false,
  },
  COMPLETED: {
    label: 'COMPLETED',
    badgeBg: 'rgba(76,175,80,0.10)',
    badgeBorder: 'rgba(76,175,80,0.22)',
    badgeText: '#4caf50',
    bar: '#4caf50',
    dot: '#4caf50',
    pulse: false,
  },
  DONE: {
    label: 'COMPLETED',
    badgeBg: 'rgba(76,175,80,0.10)',
    badgeBorder: 'rgba(76,175,80,0.22)',
    badgeText: '#4caf50',
    bar: '#4caf50',
    dot: '#4caf50',
    pulse: false,
  },
};

const StatusBadge = ({ status, index = 0 }) => {
  const meta = STATUS_META[status] || STATUS_META['IN PROGRESS'];
  return (
    <motion.span
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.07 + 0.2 }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '5px 10px',
        borderRadius: 999,
        background: meta.badgeBg,
        border: `1px solid ${meta.badgeBorder}`,
        color: meta.badgeText,
        fontSize: 9.5,
        fontWeight: 800,
        letterSpacing: '0.12em',
        lineHeight: 1,
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      <motion.span
        animate={meta.pulse ? { opacity: [1, 0.3, 1], scale: [1, 1.2, 1] } : undefined}
        transition={meta.pulse ? { duration: 1.8, repeat: Infinity, ease: 'easeInOut' } : undefined}
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: meta.dot,
          display: 'inline-block',
          flexShrink: 0,
          boxShadow: meta.pulse ? `0 0 6px ${meta.dot}` : 'none',
        }}
      />
      {meta.label}
    </motion.span>
  );
};

export default StatusBadge;
