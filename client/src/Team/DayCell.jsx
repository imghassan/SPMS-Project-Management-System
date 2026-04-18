import React from 'react';

const DayCell = ({ data }) => {
  const spent = typeof data === 'object' ? data.hoursSpent || 0 : 0;

  const getBgColor = (h) => {
    if (!h || h === 0) return 'bg-transparent border-white/[0.02]';
    if (h >= 12) return 'bg-[#ef5350] shadow-[0_0_15px_rgba(239,83,80,0.3)]'; 
    if (h >= 9) return 'bg-[#ffa726] shadow-[0_0_15px_rgba(255,167,38,0.2)]';  
    if (h >= 7) return 'bg-[#00D1FF] shadow-[0_0_15px_rgba(0,209,255,0.2)]';  
    return 'bg-[#26a69a] shadow-[0_0_15px_rgba(38,166,154,0.15)]';               
  };

  return (
    <div 
      className={`day-cell w-full h-11 flex flex-col items-center justify-center rounded-xl border border-white/5 ${getBgColor(spent)} transition-all cursor-default relative overflow-hidden group`}
      title={`Logged: ${spent}h`}
    >
      {spent > 0 && (
        <span className="relative z-10 text-[13px] font-black tracking-tight text-white leading-none">
          {spent}h
        </span>
      )}
    </div>
  );
};

export default DayCell;
