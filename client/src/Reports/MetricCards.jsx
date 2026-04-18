import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import '../../styles/reports.css';

const Skeleton = () => (
  <div className="animate-pulse bg-white/5 rounded-lg h-8 w-24" />
);

const MetricCard = ({ title, value, trend, isPositive, loading }) => (
  <div className="reports-kpi-card group">
    <div className="reports-kpi-header">
      <h3 className="reports-kpi-title">{title}</h3>
      <div className={`reports-kpi-trend-icon ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      </div>
    </div>

    <div className="reports-kpi-content">
      {loading ? (
        <Skeleton />
      ) : (
        <>
          <span className="reports-kpi-value">{value}</span>
          <div className={`reports-kpi-badge ${isPositive
              ? 'bg-emerald-500/5 text-emerald-400 border border-emerald-500/10'
              : 'bg-red-500/5 text-red-400 border border-red-500/10'
            }`}>
            <span className="tabular-nums">{trend}</span>
          </div>
        </>
      )}
    </div>
  </div>
);

const MetricCards = ({ data, loading }) => {
  const metrics = [
    {
      title: 'Total Projects',
      value: data?.totalProjects ?? '—',
      trend: data ? `${data.totalProjects} Total` : '—',
      isPositive: true,
    },
    {
      title: 'On-track Percentage',
      value: data ? `${data.onTrackPercentage ?? 0}%` : '—',
      trend: data ? ((data.onTrackPercentage ?? 0) >= 50 ? `+${data.onTrackPercentage}%` : `-${100 - (data.onTrackPercentage ?? 0)}%`) : '—',
      isPositive: data ? (data.onTrackPercentage ?? 0) >= 50 : true,
    },
    {
      title: 'Total Time Logged',
      value: data ? `${Math.round(data.totalTimeSpent / 60)}h` : '—',
      trend: data ? `${data.totalTimeSpent}m total` : '—',
      isPositive: true,
    },
    {
      title: 'Avg. Time / Task',
      value: data ? `${((data.avgTimePerTask ?? 0) / 60).toFixed(1)}h` : '—',
      trend: data ? `${(data.avgTimePerTask ?? 0).toFixed(0)}m avg` : '—',
      isPositive: true,
    },
  ];

  return (
    <div className="reports-kpi-grid">
      {metrics.map((metric, idx) => (
        <MetricCard key={idx} {...metric} loading={loading} />
      ))}
    </div>
  );
};

export default MetricCards;
