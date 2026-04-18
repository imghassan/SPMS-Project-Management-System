import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { useTasks } from '../../hooks/useTasks';

ChartJS.register(ArcElement, Tooltip, Legend);

const STATUS_COLORS = {
  'To Do': { bg: '#94A3B8', label: 'To Do' },
  'In Progress': { bg: '#F59E0B', label: 'In Progress' },
  'In Review': { bg: '#3B82F6', label: 'In Review' },
  'Done': { bg: '#10B981', label: 'Done' },
};

const TaskOverviewChart = () => {
  const { tasks, loading } = useTasks();

  if (loading) {
    return (
      <div
        className="w-full rounded-2xl animate-pulse"
        style={{
          height: 340,
          background: 'rgba(13,21,32,0.55)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
        }}
      />
    );
  }

  const statusCounts = tasks.reduce((acc, task) => {
    let s = task.status;
    if (s === 'Under Review') s = 'In Review';
    if (s === 'Completed') s = 'Done';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const statuses = Object.keys(STATUS_COLORS);
  const counts = statuses.map(s => statusCounts[s] || 0);
  const colors = statuses.map(s => STATUS_COLORS[s].bg);
  const total = counts.reduce((a, b) => a + b, 0);

  const data = {
    labels: statuses,
    datasets: [{
      data: counts,
      backgroundColor: colors,
      borderColor: Array(statuses.length).fill('#0B121E'),
      borderWidth: 4,
      hoverOffset: 6,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1A2332',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6,
      },
    },
  };

  return (
    <div
      className="rounded-2xl p-6 flex flex-col"
      style={{
        height: '100%',
        minHeight: 340,
        background: 'rgba(13,21,32,0.6)',
        border: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* Title */}
      <h3
        className="mb-5 font-black tracking-tight"
        style={{ fontSize: '15px', color: '#F8FAFC', fontFamily: "'Outfit', sans-serif" }}
      >
        Task Distribution
      </h3>

      {total > 0 ? (
        <>
          {/* Doughnut */}
          <div className="relative flex items-center justify-center" style={{ height: 180 }}>
            <Doughnut data={data} options={options} />
            {/* Center label */}
            <div className="absolute flex flex-col items-center pointer-events-none">
              <span style={{ fontSize: '28px', fontWeight: 900, color: '#F8FAFC', lineHeight: 1, fontFamily: 'monospace' }}>
                {total}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 4 }}>
                Total
              </span>
            </div>
          </div>

          {/* Custom legend */}
          <div className="flex flex-col gap-2.5 mt-5">
            {statuses.map((s, i) => (
              <div key={s} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: STATUS_COLORS[s].bg, flexShrink: 0 }} />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>{s}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 900, color: '#F8FAFC', fontFamily: 'monospace' }}>
                  {counts[i]}
                </span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <div
            style={{
              width: 48, height: 48, borderRadius: 16,
              background: 'rgba(0,209,255,0.08)',
              border: '1px solid rgba(0,209,255,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00D1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>No tasks yet</p>
        </div>
      )}
    </div>
  );
};

export default TaskOverviewChart;
