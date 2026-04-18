import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

const AnimatedCounter = ({ value, duration = 1 }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value, { duration });
    return animation.stop;
  }, [value, duration, count]);

  return <motion.span>{rounded}</motion.span>;
};

const badgeStyles = {
  amber: { background: 'rgba(245,158,11,0.15)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)' },
  red: { background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' },
  emerald: { background: 'rgba(16,185,129,0.15)', color: '#10B981', border: '1px solid rgba(16,185,129,0.3)' },
  default: { background: 'rgba(255,255,255,0.05)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' },
};

const StatCard = ({ title, value, subtext, badge, badgeColor = 'amber' }) => {
  const bStyle = badgeStyles[badgeColor] ?? badgeStyles.default;

  return (
    <div
      className="relative overflow-hidden group transition-all duration-300"
      style={{
        background: 'rgba(13,21,32,0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        padding: '1.25rem',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(0,209,255,0.2)';
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3), 0 0 20px rgba(0,209,255,0.06)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Hover shimmer */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(0,209,255,0.04) 0%, transparent 60%)' }}
      />

      <h3
        className="relative z-10 mb-3"
        style={{ fontSize: '10px', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.12em' }}
      >
        {title}
      </h3>

      <div className="flex items-end justify-between relative z-10">
        <div style={{ fontSize: '2.25rem', fontWeight: 700, fontFamily: 'monospace', color: '#F8FAFC', lineHeight: 1 }}>
          {title === 'OVERDUE' && value < 10 ? '0' : ''}
          <AnimatedCounter value={value} />
        </div>

        <div className="pb-1 flex flex-col items-end gap-1.5">
          {subtext && (
            <span style={{ fontSize: '13px', color: subtext.includes('+') ? '#10B981' : '#94A3B8', fontWeight: 500 }}>
              {subtext}
            </span>
          )}
          {badge && (
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', ...bStyle }}>
              {badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
