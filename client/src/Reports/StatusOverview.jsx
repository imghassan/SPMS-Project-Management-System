import React from 'react';
import { Rocket, CheckCircle2, Pause, FileText } from 'lucide-react';

const StatusCard = ({ icon: Icon, iconColor, iconBg, title, value, highlight, highlightColor, highlightBg }) => (
  <div className="bg-[#131B2A]/60 backdrop-blur-md border border-white/[0.05] rounded-2xl p-6 relative overflow-hidden group hover:border-primary/20 transition-all shadow-xl shadow-black/20">
    <div className="flex justify-between items-start mb-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${highlightColor} ${highlightBg}`}>
        {highlight}
      </span>
    </div>
    <div className="space-y-1 relative z-10">
      <h4 className="text-muted text-[13px] font-bold tracking-wider uppercase opacity-80 group-hover:opacity-100 transition-opacity">{title}</h4>
      <p className="text-3xl font-black text-white tracking-tight leading-none group-hover:text-primary transition-colors">{value}</p>
    </div>
    
    {/* Subtle Glow Accent */}
    <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full blur-[60px] opacity-10 group-hover:opacity-30 transition-all duration-700 pointer-events-none ${iconColor.replace('text-', 'bg-')}`}></div>
  </div>
);

const StatusOverview = () => {
  const stats = [
    { 
      icon: Rocket, iconColor: 'text-primary', iconBg: 'bg-primary/10', 
      title: 'Active Projects', value: '12', 
      highlight: '+12% growth', highlightColor: 'text-emerald-400', highlightBg: 'bg-emerald-400/10' 
    },
    { 
      icon: CheckCircle2, iconColor: 'text-emerald-400', iconBg: 'bg-emerald-400/10', 
      title: 'Completed', value: '284', 
      highlight: 'On Track', highlightColor: 'text-primary', highlightBg: 'bg-primary/10' 
    },
    { 
      icon: Pause, iconColor: 'text-orange-400', iconBg: 'bg-orange-400/10', 
      title: 'On Hold', value: '3', 
      highlight: 'Attention', highlightColor: 'text-orange-400', highlightBg: 'bg-orange-400/10' 
    },
    { 
      icon: FileText, iconColor: 'text-blue-400', iconBg: 'bg-blue-400/10', 
      title: 'Pending Review', value: '8', 
      highlight: 'Critical', highlightColor: 'text-blue-400', highlightBg: 'bg-blue-400/10' 
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <h2 className="text-sm font-black text-muted uppercase tracking-[0.3em]">Project Health Overview</h2>
        <span className="text-[10px] text-muted/30 font-bold uppercase tracking-widest">Real-time Data</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatusCard key={idx} {...stat} />
        ))}
      </div>
    </section>
  );
};

export default StatusOverview;
