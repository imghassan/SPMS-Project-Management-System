import { AlertCircle, ArrowUp, ArrowDown, Zap } from 'lucide-react';

const PriorityBadge = ({ priority }) => {
  // Normalise — backend sends 'High'/'Medium'/'Low'/'Urgent'
  const normalised = priority?.toLowerCase();

  switch (normalised) {
    case 'urgent':
    case 'urget':
      return (
        <div className="flex items-center gap-1.5 font-bold text-[11px] tracking-wider text-priority-urgent">
          <Zap size={14} className="stroke-[2.5] fill-current shadow-[0_0_10px_rgba(139,92,246,0.3)] anim-pulse" />
          <span>URGENT</span>
        </div>
      );
    case 'high':
      return (
        <div className="flex items-center gap-1.5 font-bold text-[11px] tracking-wider text-priority-high">
          <AlertCircle size={14} className="stroke-[2.5]" />
          <span>HIGH</span>
        </div>
      );
    case 'medium':
// ...
      return (
        <div className="flex items-center gap-1.5 font-bold text-[11px] tracking-wider text-priority-medium">
          <ArrowUp size={14} className="stroke-[2.5]" />
          <span>MEDIUM</span>
        </div>
      );
    case 'low':
      return (
        <div className="flex items-center gap-1.5 font-bold text-[11px] tracking-wider text-priority-low">
          <ArrowDown size={14} className="stroke-[2.5]" />
          <span>LOW</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center gap-1.5 font-bold text-[11px] tracking-wider text-text-muted">
          <span>-</span>
        </div>
      );
  }
};

export default PriorityBadge;
