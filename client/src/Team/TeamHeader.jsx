import { UserPlus } from 'lucide-react';

const TeamHeader = ({ onInviteClick, isAdmin }) => {
  return (
    <header className="flex justify-between items-start mb-8 text-white">
      <div>
        <h1 className="workload-title text-[32px] font-extrabold mb-1 tracking-tight">Team</h1>
        <p className="text-[#94A3B8] text-[15px] font-medium font-inter">Real-time resource allocation and capacity monitoring.</p>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <button
            onClick={onInviteClick}
            className="flex items-center gap-2.5 bg-[#131B2A]/60 border border-white/5 text-[#94A3B8] font-bold px-6 py-2.5 rounded-xl text-[13px] hover:bg-[#1A2332] hover:text-white hover:border-white/10 transition-all active:scale-95 shadow-lg h-[44px]"
          >
            <UserPlus size={18} strokeWidth={2.5} />
            <span>Invite Member</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default TeamHeader;
