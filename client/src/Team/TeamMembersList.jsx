import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Trash2
} from 'lucide-react';
import api from '../../api/apiClient';
import { useToast } from '../../components/ui/toast.jsx';
import { getAvatarUrl } from '../../utils/getAvatarUrl';
import UserAvatar from '../ui/UserAvatar';

const getCapacityInfo = (pct) => {
  if (pct >= 100) return { label: 'Overloaded', color: '#FF4D4D', bg: 'rgba(255,77,77,0.1)', border: 'rgba(255,77,77,0.3)', icon: AlertTriangle };
  if (pct >= 90) return { label: 'High Load', color: '#FF9966', bg: 'rgba(255,153,102,0.1)', border: 'rgba(255,153,102,0.3)', icon: Clock };
  if (pct >= 50) return { label: 'Active', color: '#00D1FF', bg: 'rgba(0,209,255,0.1)', border: 'rgba(0,209,255,0.2)', icon: CheckCircle };
  return { label: 'Available', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', border: 'rgba(74,222,128,0.3)', icon: CheckCircle };
};

const MemberCard = ({ member, index, onDeleteMember, isAdmin }) => {
  const toast = useToast();
  const util = member.capacityPercentage || 0;
  const cap = getCapacityInfo(util);
  const CapIcon = cap.icon;
  const avatarUrl = getAvatarUrl(member.avatar);
  const initials = member.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className="group relative rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer"
      style={{
        background: 'rgba(15,23,42,0.7)',
        borderColor: 'rgba(255,255,255,0.07)',
        backdropFilter: 'blur(12px)',
      }}
      whileHover={{ y: -4, borderColor: 'rgba(0,209,255,0.3)' }}
    >
      {/* Glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"
        style={{ boxShadow: 'inset 0 0 40px rgba(0,209,255,0.04)' }}
      />

      <div className="p-6">
        {/* Avatar + Status badge */}
        <div className="flex items-start justify-between mb-5">
          <UserAvatar
            user={member}
            size="xl"
            className="rounded-2xl shadow-lg"
          />

          {/* Capacity badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider"
            style={{ background: cap.bg, border: `1px solid ${cap.border}`, color: cap.color }}
          >
            <CapIcon size={11} strokeWidth={3} />
            {cap.label}
          </div>

          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteMember(member.id || member._id);
              }}
              className="p-2 rounded-lg bg-red-500/10 text-red-500/60 hover:text-red-500 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-white font-black text-[16px] tracking-tight leading-tight">{member.name}</h3>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/5 mb-4" />

        {/* Utilization bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.15em]">Workload</span>
            <span className="text-[13px] font-black" style={{ color: cap.color }}>{util}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(util, 100)}%` }}
              transition={{ delay: index * 0.04 + 0.3, duration: 0.6, ease: 'easeOut' }}
              style={{ background: `linear-gradient(90deg, ${cap.color}99, ${cap.color})` }}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {member.department && (
            <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-[#94A3B8] bg-white/5 border border-white/5">
              {member.department}
            </span>
          )}
          <span
            className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
            style={{ background: 'rgba(0,209,255,0.08)', color: '#00D1FF', border: '1px solid rgba(0,209,255,0.15)' }}
          >
            {member.totalHoursSpentInWeek || 0}h / week
          </span>
        </div>
      </div>
    </motion.div>
  );
};

import { useLocation } from 'react-router-dom';

const TeamMembersList = ({ teamMembers = [], loading, onRefresh, isAdmin }) => {
  const location = useLocation();
  const [search, setSearch] = useState(location.state?.searchUser || '');
  const toast = useToast();

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member? This action cannot be undone.')) return;

    try {
      await api.delete(`/auth/users/${id}`);
      toast.success('Member deleted successfully');
      if (onRefresh) onRefresh();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete member');
    }
  };

  const filtered = teamMembers.filter(m => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.role || '').toLowerCase().includes(q) ||
      (m.department || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/5 p-6 animate-pulse"
            style={{ background: 'rgba(15,23,42,0.5)', height: 220 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Search bar */}
      <div className="relative mb-6 max-w-sm group">
        <Search
          size={18}
          className="absolute left-4 top-4 -translate-y-1/5 text-[#94A3B8] group-focus-within:text-[var(--primary)] transition-colors pointer-events-none"
        />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search members..."
          className="w-full pl-12 pr-4 py-3 rounded-xl text-[14px] text-white placeholder-white/25 font-medium focus:outline-none transition-all"
          style={{
            background: 'rgba(15,23,42,0.7)',
            border: '1px solid rgba(255,255,255,0.07)',
            paddingLeft: '3.2rem'
          }}
          onFocus={e => (e.target.style.borderColor = 'rgba(0,209,255,0.4)')}
          onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
        />
      </div>

      {/* Summary stat chips */}
      <div className="flex flex-wrap gap-3 mb-6">
        {[
          { label: 'Total Members', value: teamMembers.length, color: '#00D1FF' },
          { label: 'Available', value: teamMembers.filter(m => (m.utilization || 0) < 50).length, color: '#4ade80' },
          { label: 'High Load', value: teamMembers.filter(m => { const u = m.utilization || 0; return u >= 90 && u < 110; }).length, color: '#FF9966' },
          { label: 'Overloaded', value: teamMembers.filter(m => (m.utilization || 0) >= 110).length, color: '#FF4D4D' },
        ].map(chip => (
          <div
            key={chip.label}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-black"
            style={{ background: chip.color + '12', border: `1px solid ${chip.color}25`, color: chip.color }}
          >
            <span className="text-[16px] font-black">{chip.value}</span>
            <span className="font-bold opacity-70 uppercase tracking-wider text-[10px]">{chip.label}</span>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 opacity-30">
          <User size={48} className="text-white mb-4" />
          <p className="text-white font-medium text-sm">No members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((member, i) => (
            <MemberCard
              key={member.id || i}
              member={member}
              index={i}
              onDeleteMember={handleDeleteMember}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamMembersList;
