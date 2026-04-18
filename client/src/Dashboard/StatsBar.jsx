import React, { useEffect, useState } from 'react';
import {
  LayoutGrid,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Animated counter hook
const useCountUp = (target, duration = 1.2) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const end = Number(target) || 0;
    if (start === end) { setDisplay(end); return; }
    const step = end / (duration * 60);
    let current = start;
    const timer = setInterval(() => {
      current += step;
      if (current >= end) { setDisplay(end); clearInterval(timer); }
      else setDisplay(Math.floor(current));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [target, duration]);
  return display;
};

const StatItem = ({ icon: Icon, label, value, color, highlight = false }) => {
  const count = useCountUp(value);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: highlight ? `${color}18` : 'rgba(255,255,255,0.05)',
          border: `1px solid ${highlight ? color + '30' : 'rgba(255,255,255,0.07)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: highlight ? `0 8px 20px ${color}15` : 'none',
        }}
      >
        <Icon size={18} style={{ color: highlight ? color : '#94A3B8' }} />
      </div>
      <div>
        <div
          style={{
            color: '#94A3B8',
            fontSize: 12,
            fontWeight: 700,
            lineHeight: 1,
            marginBottom: 6,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            opacity: 0.8
          }}
        >
          {label}
        </div>
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            color: 'white',
            fontSize: 24,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            fontFamily: "'Syne', sans-serif",
          }}
        >
          {count}
        </motion.div>
      </div>
    </div>
  );
};

const StatsBar = ({ stats = {} }) => {
  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1200,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: 'rgba(2, 6, 12, 0.9)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.3)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <StatItem
          icon={LayoutGrid}
          label="Total Projects"
          value={stats.total ?? 0}
          color="#94A3B8"
        />
        <StatItem
          icon={TrendingUp}
          label="Active Projects"
          value={stats.activeNow ?? 0}
          color="#00D1FF"
          highlight
        />
        <StatItem
          icon={Clock}
          label="Due This Week"
          value={stats.dueThisWeek ?? 0}
          color="#F59E0B"
          highlight
        />
        <StatItem
          icon={CheckCircle2}
          label="Done"
          value={stats.done ?? 0}
          color="#10B981"
          highlight
        />
      </div>
    </div>
  );
};

export default StatsBar;
