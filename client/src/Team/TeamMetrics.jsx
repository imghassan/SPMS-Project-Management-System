import React from 'react';
import { AlertTriangle, PieChart, BarChart } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import { getAvatarUrl } from '../../utils/getAvatarUrl';

const TeamMetrics = ({ alerts = [], departments = [], weeklyData = [] }) => {
  const { user } = useAuthStore();
  
  return (
    <div className="flex flex-col lg:flex-row gap-4 mt-8 text-white">
      {/* Over-allocated Alerts */}
      <div className="bg-[#131B2A] rounded-xl border border-white/5 p-5 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={18} className="text-[#FF4D4D]" />
          <h3 className="text-white font-bold text-[16px]">Over-allocated Alerts</h3>
        </div>
        
        <div className="space-y-4">
          {alerts.length === 0 && (
            <div className="text-[#94A3B8] text-[13px] py-4">No critical alerts for this week.</div>
          )}
          {alerts.map((alert, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex items-center justify-center">
                  {getAvatarUrl(alert.avatar) ? (
                    <img src={getAvatarUrl(alert.avatar)} alt={alert.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#00D1FF] font-bold text-xs uppercase">{alert.name?.charAt(0) || 'U'}</span>
                  )}
                </div>
                <span className="font-medium text-[14px]">{alert.name}</span>
              </div>
              <span className="text-[#FF4D4D] font-bold text-[14px]">+{alert.overHours} hrs/week</span>
            </div>
          ))}
        </div>
      </div>

      {/* Department Capacity */}
      <div className="bg-[#131B2A] rounded-xl border border-white/5 p-5 flex-1">
        <div className="flex items-center gap-2 mb-6">
          <PieChart size={18} className="text-[#00D1FF]" />
          <h3 className="text-white font-bold text-[16px]">Department Capacity</h3>
        </div>
        
        <div className="space-y-5">
          {departments.length === 0 && (
            <div className="text-[#94A3B8] text-[13px] py-4">No department data available.</div>
          )}
          {departments.map((dept, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#94A3B8] font-medium">{dept.name}</span>
                <span className="text-white font-bold">{dept.percentage}%</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${dept.isWarning ? 'bg-[#FF9966]' : 'bg-[#00D1FF]'}`} 
                  style={{ width: `${dept.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Efficiency */}
      <div className="bg-[#131B2A] rounded-xl border border-white/5 p-5 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <BarChart size={18} className="text-[#00bcd4]" />
          <h3 className="text-white font-bold text-[16px]">Weekly Efficiency</h3>
        </div>
        
        <div className="flex-1 flex items-end justify-between gap-1.5 px-1 min-h-[80px]">
          {weeklyData.length === 0 && (
             <div className="text-[#6b7280] text-[13px] w-full text-center py-4 self-center">No efficiency data.</div>
          )}
          {weeklyData.map((d, i) => (
             <div 
               key={i} 
               className={`flex-1 rounded-sm ${d.hours > 30 ? 'bg-[#00d4ff]' : d.hours > 0 ? 'bg-[#1e6b7a]' : 'bg-white/5'}`}
               style={{ height: `${Math.min(100, (d.hours / 40) * 100)}%` }}
               title={`${d.day}: ${d.hours} hrs`}
             ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeamMetrics;
