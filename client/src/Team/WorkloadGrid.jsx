import React, { useMemo } from 'react';
import MemberRow from './MemberRow';

const WorkloadGrid = ({ teamMembers, loading, period }) => {
  const dates = useMemo(() => {
    if (!period?.start) return [];
    const start = new Date(period.start + 'T00:00:00');
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
      const dayNum = d.getDate();
      return `${dayName} ${dayNum}`;
    });
  }, [period]);

  if (loading) {
    return <div className="h-64 flex items-center justify-center bg-[#112229] rounded-2xl border border-white/5 text-[#6b7280]">Loading workload...</div>;
  }

  return (
    <div className="bg-transparent overflow-hidden mt-6">
      <div className="overflow-x-auto">
        <div className="min-w-[1080px]">
          {/* Header */}
          <div
            className="grid sticky top-0 z-30"
            style={{ gridTemplateColumns: '280px repeat(7, minmax(100px, 1fr))' }}
          >
            <div className="label-caps grid-header-cell sticky-member-col p-5 sticky left-0 z-40 border-b-2 border-white/5 flex items-center shadow-[4px_0_12px_rgba(0,0,0,0.3)] bg-[#0B111D]">
              Team Member
            </div>
            {dates.map((date) => (
              <div key={date} className="grid-header-cell p-5 text-[11px] font-black uppercase tracking-[0.1em] text-[#94A3B8] text-center flex items-center justify-center border-l border-white/5 bg-[#0B111D]">
                {date}
              </div>
            ))}
          </div>

          {/* Rows */}
          <div className="flex flex-col">
            {teamMembers?.map((member, idx) => (
              <MemberRow key={idx} member={member} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkloadGrid;
