import React from 'react';
import { AlertTriangle } from 'lucide-react';
import DayCell from './DayCell';
import { getAvatarUrl } from '../../utils/getAvatarUrl';
import UserAvatar from '../ui/UserAvatar';

const MemberRow = ({ member }) => {
  const utilization = member.utilization || 0;

  const getCapacityStyles = (pct) => {
    if (pct >= 110) return { class: 'util-warning', showWarning: true };
    if (pct >= 90) return { class: 'util-high', showWarning: false };
    if (pct >= 70) return { class: 'util-normal', showWarning: false };
    return { class: 'bg-[#1a2f36] text-[#94A3B8]', showWarning: false };
  };

  const capStyle = getCapacityStyles(utilization);

  return (
    <div
      className="grid border-b border-white/[0.03] hover:bg-white/[0.02] transition-all group relative"
      style={{ gridTemplateColumns: '280px repeat(7, minmax(100px, 1fr))' }}
    >
      {/* Col 1: Member Info */}
      <div className="sticky-member-col p-4 flex items-center justify-between sticky left-0 z-20 group-hover:bg-[#1A2332] border-r border-white/5 transition-colors shadow-[4px_0_12px_rgba(0,0,0,0.2)] h-[72px]">
        <div className="flex items-center gap-4">
          <UserAvatar 
            user={member} 
            size="md" 
          />
          <div>
            <div className="text-white font-bold text-[14px] leading-tight tracking-tight">{member.name}</div>
          </div>
        </div>

        <div
          className={`util-pill ${capStyle.class}`}
        >
          {capStyle.showWarning && <AlertTriangle size={12} strokeWidth={4} />}
          {utilization}%
        </div>
      </div>

      {/* Cols 2-9: Day Cells */}
      {member.hours.map((h, idx) => (
        <div key={idx} className={`flex items-center justify-center p-2 border-l border-transparent ${(idx === 5 || idx === 6) ? 'bg-white/[0.01]' : ''}`}>
          <div className="w-full">
            <DayCell data={h} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default MemberRow;
