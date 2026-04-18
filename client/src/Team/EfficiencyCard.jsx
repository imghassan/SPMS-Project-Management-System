import React from 'react';
import { BarChart as BarIcon } from 'lucide-react';
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

const EfficiencyCard = ({ efficiency }) => {
    const data = {
        labels: efficiency.map(e => e.day),
        datasets: [
            {
                data: efficiency.map(e => e.hours),
                backgroundColor: efficiency.map(e => (e.day === 'Sat' || e.day === 'Sun') ? '#1e293b' : '#00D1FF'),
                borderRadius: 4,
                borderSkipped: false,
                barThickness: 12,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            x: {
                display: false,
                grid: { display: false },
            },
            y: {
                display: false,
                grid: { display: false },
                beginAtZero: true,
            },
        },
    };

    return (
        <div className="bg-[#0f1117] p-6 rounded-2xl border border-white/5 shadow-xl h-full flex flex-col">
            <div className="flex items-center gap-3 mb-6">
                <BarIcon className="text-[#00D1FF]" size={20} />
                <h3 className="font-bold text-white uppercase tracking-wider text-[12px]">Weekly Efficiency</h3>
            </div>
            
            <div className="flex-1 min-h-[120px]">
                <Bar data={data} options={options} />
            </div>
        </div>
    );
};

export default EfficiencyCard;
