import React from 'react';
import { Zap } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
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

const WeeklyEfficiency = ({ data }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#112229',
        titleColor: '#6b7280',
        bodyColor: '#ffffff',
        bodyFont: {
          weight: 'bold'
        },
        padding: 12,
        borderColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 11,
            weight: 'bold'
          }
        }
      },
      y: {
        display: false,
        grid: {
          display: false,
        }
      }
    }
  };

  return (
    <div className="workload-card p-6 flex flex-col">
      <div className="flex items-center gap-3.5 mb-8">
        <div className="w-11 h-11 rounded-xl bg-[#26a69a]/10 flex items-center justify-center border border-[#26a69a]/20 shadow-[0_0_15px_rgba(38,166,154,0.1)]">
          <Zap className="text-[#26a69a]" size={22} />
        </div>
        <div>
          <h3 className="text-[17px] font-extrabold text-[#e6edf3] tracking-tight">Weekly Efficiency</h3>
          <p className="text-[12px] text-[#94A3B8] font-bold mt-0.5">Average output stats </p>
        </div>
      </div>

      <div className="flex-1 min-h-[140px] flex items-end justify-between px-2 pb-2">
        {data.labels.map((label, idx) => {
          const hours = data.datasets[0].data[idx];
          const height = Math.min((hours / 40) * 100, 100);
          return (
            <div key={label} className="flex flex-col items-center gap-3 group">
              <div className="relative w-7 bg-white/[0.03] rounded-t-lg border border-white/5 overflow-hidden flex flex-col justify-end h-24 transition-all hover:border-[#00D1FF]/30">
                <div
                  className={`w-full rounded-t-[3px] transition-all duration-700 ${hours > 30 ? 'bg-[#00D1FF] shadow-[0_0_12px_rgba(0,209,255,0.4)]' : 'bg-[#26a69a]'}`}
                  style={{ height: `${height}%` }}
                ></div>
              </div>
              <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-tighter group-hover:text-white transition-colors">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyEfficiency;
