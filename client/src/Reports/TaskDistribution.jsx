import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const TaskDistribution = ({ data, loading }) => {
  // Real counts from API, or show zeros while loading
  const completed = data?.Completed ?? data?.Done ?? 0;
  const inProgress = data?.['In Progress'] ?? 0;
  const toDo = data?.['To Do'] ?? 0;

  const chartData = {
    labels: ['Completed', 'In Progress', 'To Do'],
    datasets: [
      {
        data: [completed, inProgress, toDo],
        backgroundColor: ['#00d4ff', '#4f6ef7', '#4a4a6a'],
        borderColor: ['#12151f', '#12151f', '#12151f'],
        borderWidth: 4,
        hoverOffset: 4
      },
    ],
  };

  const options = {
    cutout: '75%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1A2332',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 4
      }
    },
  };

  const customLegendData = [
    { label: 'Completed', value: completed, color: '#00d4ff' },
    { label: 'In Progress', value: inProgress, color: '#4f6ef7' },
    { label: 'To Do', value: toDo, color: '#4a4a6a' },
  ];

  const total = completed + inProgress + toDo;

  return (
    <div className="group w-full h-full">
      <div className="reports-chart-header">
        <div className="reports-chart-title-group">
          <h2>Task Distribution</h2>
          <p className="reports-chart-subtitle">Breakdown by current status</p>
        </div>
      </div>

      <div className={`reports-chart-inner transition-opacity duration-300 ${loading ? 'opacity-40' : 'opacity-100'}`}>
        <div className="reports-doughnut-wrapper mt-4">
          <Doughnut data={chartData} options={options} />
          <div className="reports-chart-center">
            <span className="reports-center-value">{total}</span>
            <span className="reports-center-label">TOTAL</span>
          </div>
        </div>

        {/* Custom Legend */}
        <div className="reports-legend">
          {customLegendData.map((item, idx) => (
            <div key={idx} className="reports-legend-row">
              <div className="reports-legend-left">
                <span className="reports-dot" style={{ backgroundColor: item.color }}></span>
                <span className="reports-dept-name">{item.label}</span>
              </div>
              <span className="reports-legend-value">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskDistribution;
