import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, Zap } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const ProgressChart = ({ subtasks = [] }) => {
  const chartData = useMemo(() => {
    const total = subtasks?.length || 0;
    const completed = subtasks?.filter(s => s.completed).length || 0;
    const currentPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

    let labels = [];
    let dataPoints = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }

    const start = Math.min(10, currentPercent);
    dataPoints = [
        start,
        start + (currentPercent - start) * 0.15,
        start + (currentPercent - start) * 0.30,
        start + (currentPercent - start) * 0.45,
        start + (currentPercent - start) * 0.60,
        start + (currentPercent - start) * 0.80,
        currentPercent
      ].map(Math.round);
    return {
      labels,
      datasets: [
        {
          fill: true,
          label: 'Progress',
          data: dataPoints,
          borderColor: '#00d1ff',
          borderWidth: 2,
          backgroundColor: (context) => {
            const ctx = context.chart.ctx;
            const gradient = ctx.createLinearGradient(0, 0, 0, 200);
            gradient.addColorStop(0, 'rgba(0, 209, 255, 0.15)');
            gradient.addColorStop(1, 'rgba(0, 209, 255, 0)');
            return gradient;
          },
          tension: 0.4,
          pointBackgroundColor: '#00d1ff',
          pointBorderColor: '#0b121e',
          pointBorderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#00d1ff',
          pointHoverBorderWidth: 4,
        },
      ],
    };
  }, [subtasks]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(11, 18, 30, 0.95)',
        titleColor: '#00d1ff',
        bodyColor: '#fff',
        titleFont: { size: 10, weight: '900', family: "'Orbitron', sans-serif" },
        bodyFont: { size: 12, weight: 'bold' },
        borderColor: 'rgba(0, 209, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
        caretSize: 6,
        callbacks: {
          label: (context) => `${context.parsed.y}% COMPLETION`,
          title: (context) => context[0].label.toUpperCase(),
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.15)',
          font: {
            size: 9,
            weight: '800'
          },
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: 'rgba(255, 255, 255, 0.02)',
          drawBorder: false,
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.15)',
          font: {
            size: 9,
            weight: '800'
          },
          stepSize: 25,
          callback: (value) => `${value}%`,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const total = subtasks?.length || 0;
  const completed = subtasks?.filter(s => s.completed).length || 0;
  const currentPercent = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div className="space-y-6 pt-10 border-t border-white/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20 text-teal-400">
            <Activity size={16} />
          </div>
          <h3 className="text-lg font-black text-white tracking-tight uppercase">Analytics</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[10px] font-black text-teal-400/60 uppercase tracking-widest">LIVE Tracking</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Chart Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 h-64 w-full bg-white/[0.01] p-6 rounded-[32px] border border-white/5 relative overflow-hidden group hover:border-teal-400/20 transition-all"
        >
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="relative z-10 h-full">
            <Line data={chartData} options={options} />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="flex flex-col gap-4">
          <motion.div
            whileHover={{ y: -4, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
            className="flex-1 p-6 rounded-[28px] border border-white/5 bg-white/[0.01] flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-teal-400/5 flex items-center justify-center text-teal-400 border border-teal-400/10">
                <TrendingUp size={20} />
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Efficiency</h4>
              <div className="text-3xl font-black text-white tracking-tighter">
                {currentPercent}<span className="text-teal-400 opacity-40">%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div >
  );
};

export default ProgressChart;
