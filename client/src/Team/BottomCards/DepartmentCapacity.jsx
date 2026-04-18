import React from 'react';
import { Layers } from 'lucide-react';

const DepartmentCapacity = ({ departments }) => {
  return (
    <div 
      className="workload-card p-6 flex flex-col h-full rounded-[20px]"
      style={{
        background: '#0d131f',
        border: '1px solid rgba(255, 255, 255, 0.03)'
      }}
    >
      <div className="flex items-center gap-4 mb-10">
        <div 
          className="w-[46px] h-[46px] rounded-[14px] flex items-center justify-center"
          style={{
            background: 'rgba(0, 209, 255, 0.06)',
            boxShadow: 'inset 0 0 0 1px rgba(0, 209, 255, 0.15)'
          }}
        >
          <Layers className="text-[#00D1FF]" size={22} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-[17px] font-bold text-white tracking-tight leading-none">Department Capacity</h3>
          <p className="text-[13px] text-[#94A3B8] font-medium leading-none">Resource distribution</p>
        </div>
      </div>

      <div className="space-y-6">
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <Layers size={20} className="text-[#94A3B8]" />
            </div>
            <p className="text-[13px] text-[#94A3B8] font-medium">No departments</p>
            <p className="text-[12px] text-[#94A3B8]/50 mt-1">Department data unavailable</p>
          </div>
        ) : (
          departments.map((dept, idx) => (
          <div key={idx} className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <span className="text-[13px] font-bold text-white">{dept.name}</span>
              <span className={`text-[12px] font-black ${dept.isWarning ? 'text-[#ef5350]' : 'text-[#94A3B8]'}`}>
                {dept.percentage}%
              </span>
            </div>
            <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden border border-white/5">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${dept.isWarning ? 'bg-[#ef5350]' : 'bg-[#00D1FF] shadow-[0_0_10px_rgba(0,209,255,0.3)]'}`}
                style={{ width: `${dept.percentage}%` }}
              ></div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );};

export default DepartmentCapacity;
