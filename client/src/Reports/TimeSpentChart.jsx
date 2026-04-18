import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const TimeSpentChart = ({ data, loading, title = "Time Distribution" }) => {
  if (loading) {
    return (
      <div className="animate-pulse w-full h-full">
        <div className="h-6 w-32 bg-white/5 rounded mb-8" />
        <div className="flex justify-center items-center h-48">
          <div className="w-40 h-40 rounded-full border-4 border-white/5 border-t-[#00d4ff] animate-spin" />
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data?.map(item => item.name) || [],
    datasets: [
      {
        data: data?.map(item => item.value) || [],
        backgroundColor: [
          'rgba(0, 212, 255, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(249, 115, 22, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          '#00d4ff',
          '#10b981',
          '#f97316',
          '#8b5cf6',
          '#ec4899',
        ],
        borderWidth: 2,
        hoverOffset: 12,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#94A3B8',
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: '600',
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'rectRounded',
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#fff',
        bodyColor: '#94A3B8',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const hours = Math.floor(value / 60);
            const mins = value % 60;
            return ` ${context.label}: ${hours}h ${mins}m`;
          },
        },
      },
    },
    cutout: '70%',
  };

  return (
    <div className="group w-full h-full">
      <div className="reports-chart-header">
        <div className="reports-chart-title-group">
          <h2 className="text-lg font-bold text-slate-100">{title}</h2>
          <p className="reports-chart-subtitle">Based on logged task hours</p>
        </div>
      </div>
      <div className="h-64 relative">
        {data && data.length > 0 ? (
          <Doughnut data={chartData} options={options} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <span className="text-sm font-medium">No time data available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeSpentChart;
