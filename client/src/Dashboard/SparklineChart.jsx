import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js';
import { STATUS_META } from './StatusBadge';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

// Generate deterministic sparkline data from progress value
const generateSparkline = (progress, status) => {
  if (progress === 0) {
    return [0, 0, 0, 0, 0, 0, 0];
  }
  const base = Math.max(5, progress - 30);
  const vals = [];
  for (let i = 0; i < 7; i++) {
    const noise = (Math.sin(progress * 0.7 + i * 2.3) * 12) + (Math.cos(i * 1.7 + progress * 0.3) * 8);
    vals.push(Math.max(0, Math.min(100, base + (progress - base) * (i / 6) + noise)));
  }
  return vals;
};

const SparklineChart = ({ progress = 0, status = 'IN PROGRESS', sparkline }) => {
  const meta = STATUS_META[status] || STATUS_META['IN PROGRESS'];
  const color = meta.bar;

  const values = useMemo(() => {
    if (sparkline && Array.isArray(sparkline) && sparkline.length > 0) {
      return sparkline.map((s) => (typeof s === 'object' ? s.value : s));
    }
    return generateSparkline(progress, status);
  }, [progress, status, sparkline]);

  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, values.length);

  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: color,
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.5,
        fill: true,
        backgroundColor: (ctx) => {
          if (!ctx.chart.chartArea) return 'transparent';
          const { top, bottom } = ctx.chart.chartArea;
          const gradient = ctx.chart.ctx.createLinearGradient(0, top, 0, bottom);
          gradient.addColorStop(0, `${color}33`);
          gradient.addColorStop(1, `${color}00`);
          return gradient;
        },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: '#0f2020',
        borderColor: `${color}44`,
        borderWidth: 1,
        titleColor: '#6a9090',
        bodyColor: color,
        callbacks: {
          title: (items) => labels[items[0].dataIndex],
          label: (item) => `${Math.round(item.raw)}%`,
        },
        padding: 6,
        displayColors: false,
      },
    },
    scales: {
      x: { display: false },
      y: { display: false },
    },
    animation: { duration: 600 },
  };

  return (
    <div style={{ height: 40, marginTop: 8, marginBottom: 4 }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default SparklineChart;
