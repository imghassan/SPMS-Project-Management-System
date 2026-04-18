import React from 'react';
import StatCard from './StatCard';
import { useTasks } from '../../hooks/useTasks';

const StatsGrid = () => {
  const { stats, loading } = useTasks();

  if (loading) {
    return (
      <div className="flex flex-row gap-6 overflow-x-auto pb-4 hide-scrollbar mt-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 min-w-[280px] h-28 bg-bg-card animate-pulse rounded-xl border border-border" />
        ))}
      </div>
    );
  }

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="flex flex-row gap-6 overflow-x-auto pb-4 hide-scrollbar mt-6">
      <div className="flex-1 min-w-[280px]">
        <StatCard 
          title="TOTAL TASKS" 
          value={stats.total} 
        />
      </div>
      <div className="flex-1 min-w-[280px]">
        <StatCard 
          title="DONE" 
          value={stats.done} 
          subtext={`${completionRate}% of total`} 
        />
      </div>
      <div className="flex-1 min-w-[280px]">
        <StatCard 
          title="ACTIVE" 
          value={stats.active} 
          badge={stats.active > 10 ? "High Load" : "Normal"}
          badgeColor={stats.active > 10 ? "amber" : "emerald"}
        />
      </div>
      <div className="flex-1 min-w-[280px]">
        <StatCard 
          title="OVERDUE" 
          value={stats.overdue} 
          badge={stats.overdue > 0 ? "Attention" : "Clear"}
          badgeColor={stats.overdue > 0 ? "red" : "emerald"}
        />
      </div>
    </div>
  );
};

export default StatsGrid;
