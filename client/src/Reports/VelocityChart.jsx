import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const VelocityChart = ({ data, loading }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1A2332',
        titleColor: '#F8FAFC',
        bodyColor: '#94A3B8',
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        boxPadding: 6,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) label += context.parsed.y;
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: '#94A3B8',
          font: { size: 11, weight: '700', family: "'Inter', sans-serif" },
          padding: 16
        },
        border: { display: false }
      },
      y: {
        display: true,
        grid: { 
          display: true,
          color: 'rgba(255, 255, 255, 0.03)',
          drawBorder: false
        },
        ticks: {
          color: '#94A3B8',
          font: { size: 10, weight: '600' },
          stepSize: 1, // Velocity counts are usually integers
          beginAtZero: true
        },
        border: { display: false }
      },
    },
    interaction: { mode: 'index', intersect: false },
    barPercentage: 0.15,
    categoryPercentage: 0.8,
  };

  // Fallback labels / data while loading or when API hasn't returned yet
  // Fallback zeros while loading
  const labels  = data?.labels  || [];
  const planned = data?.planned || [];
  const actual  = data?.actual  || [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Planned',
        data: planned,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderRadius: 8,
        borderWidth: 0,
      },
      {
        label: 'Actual',
        data: actual,
        backgroundColor: loading ? 'rgba(0,209,255,0.2)' : '#00D1FF',
        borderRadius: 8,
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="group">
      <div className="reports-chart-header">
        <div className="reports-chart-title-group">
          <h2>Project Velocity</h2>
          <p className="reports-chart-subtitle">Task completion trends over the last 6 months</p>
        </div>
        <div className="reports-chart-legend">
          <div className="reports-legend-item group/item">
            <span className="reports-dot-planned group-hover/item:scale-125 transition-transform"></span>
            <span className="reports-legend-text">Planned</span>
          </div>
          <div className="reports-legend-item group/item">
            <span className="reports-dot-actual group-hover/item:scale-125 transition-transform"></span>
            <span className="reports-legend-text">Actual</span>
          </div>
        </div>
      </div>

      <div className={`h-72 px-2 w-full transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
        <Bar options={options} data={chartData} />
      </div>
    </div>
  );
};

export default VelocityChart;
