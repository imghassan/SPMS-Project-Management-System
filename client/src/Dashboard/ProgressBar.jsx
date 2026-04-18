import React from 'react';
import { motion } from 'framer-motion';
import { STATUS_META } from './StatusBadge';

const ProgressBar = ({ progress = 0, status = 'IN PROGRESS', index = 0, interactive = false, onChange, onCommit }) => {
  const meta = STATUS_META[status] || STATUS_META['IN PROGRESS'];
  const pct = status === 'COMPLETED' ? 100 : Math.max(0, Math.min(100, Number(progress) || 0));

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span
          style={{
            color: '#6a9090',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
          }}
        >
          Progress
        </span>
        <span
          style={{
            color: meta.badgeText,
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          {pct}%
        </span>
      </div>
      <div style={{ position: 'relative' }}>
        <div
          style={{
            height: 6,
            borderRadius: 999,
            background: 'rgba(255,255,255,0.06)',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{
              duration: 0.9,
              ease: 'easeOut',
              delay: index * 0.05,
            }}
            style={{
              height: '100%',
              borderRadius: 999,
              background: `linear-gradient(90deg, ${meta.bar}, ${meta.bar}99)`,
              boxShadow: `0 0 8px ${meta.bar}55`,
            }}
          />
        </div>
        
        {interactive && (
          <input
            type="range"
            min="0"
            max="100"
            value={pct}
            onChange={(e) => onChange && onChange(parseInt(e.target.value, 10))}
            onMouseUp={(e) => onCommit && onCommit(parseInt(e.target.value, 10))}
            onTouchEnd={(e) => onCommit && onCommit(parseInt(e.target.value, 10))}
            title="Drag to update project progress"
            style={{
              position: 'absolute',
              top: -10,
              left: 0,
              right: 0,
              height: 26,
              width: '100%',
              opacity: 0,
              cursor: 'ew-resize',
              pointerEvents: 'auto',
              margin: 0,
              padding: 0
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProgressBar;
