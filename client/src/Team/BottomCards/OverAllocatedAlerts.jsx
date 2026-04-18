import React from 'react';
import { AlertCircle } from 'lucide-react';
import { getAvatarUrl } from '../../../utils/getAvatarUrl';

const OverAllocatedAlerts = ({ alerts }) => {
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
            background: 'rgba(239, 83, 80, 0.06)',
            boxShadow: 'inset 0 0 0 1px rgba(239, 83, 80, 0.15)'
          }}
        >
          <AlertCircle className="text-[#ef5350]" size={22} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-[17px] font-bold text-white tracking-tight leading-none">Over-allocated Alerts</h3>
          <p className="text-[13px] text-[#94A3B8] font-medium leading-none">Members exceeding capacity</p>
        </div>
      </div>

      <div className="space-y-2">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <AlertCircle size={20} className="text-[#94A3B8]" />
            </div>
            <p className="text-[13px] text-[#94A3B8] font-medium">No over-allocations</p>
            <p className="text-[12px] text-[#94A3B8]/50 mt-1">All members are within capacity</p>
          </div>
        ) : (
          alerts.map((alert, idx) => (
          <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl hover:bg-white/[0.04] transition-all border border-transparent hover:border-white/5 group">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                {getAvatarUrl(alert.avatar) ? (
                  <img 
                    src={getAvatarUrl(alert.avatar)} 
                    alt={alert.name} 
                    className="w-10 h-10 rounded-full border-2 border-white/5 object-cover" 
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#112229] border-2 border-white/5 flex items-center justify-center text-[#00D1FF] font-black text-xs">
                    {alert.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                )}
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#ef5350] rounded-full border-2 border-[#131B2A] shadow-[0_0_8px_rgba(239,83,80,0.4)]"></div>
              </div>
              <span className="text-[14px] font-bold text-white group-hover:text-[#00D1FF] transition-colors">{alert.name}</span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-[12px] font-black ${alert.overHours > 10 ? 'bg-[#ef5350]/10 text-[#ef5350]' : 'bg-[#ffa726]/10 text-[#ffa726]'}`}>
              +{alert.overHours} hrs
            </div>
          </div>
        )))}
      
      </div>
    </div>
  ); 
};

export default OverAllocatedAlerts;
