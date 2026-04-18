import React, { useState, useEffect, useRef } from 'react';
import { Mail, User, MoreHorizontal, UserCheck, Search, Plus, Trash2 } from 'lucide-react';
import AddMemberModal from './AddMemberModal';
import projectsApi from '../../api/projectsApi';
import { getAvatarUrl } from '../../utils/getAvatarUrl';
import '../../styles/Components/ProjectMembers.css';

const MemberAvatar = ({ member }) => {
  const [error, setError] = useState(false);
  const initials = member.name?.substring(0, 2).toUpperCase() || '??';

  if (!getAvatarUrl(member.avatar) || error) {
    return (
      <div className="w-10 h-10 rounded-full bg-[#112229] border border-[#00D1FF]/20 flex items-center justify-center text-[#00D1FF] font-black text-xs shadow-lg ring-1 ring-[#00D1FF]/10">
        {initials}
      </div>
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-[#112229] border border-white/5 flex items-center justify-center overflow-hidden shadow-lg ring-1 ring-white/5">
      <img
        src={getAvatarUrl(member.avatar)}
        alt={member.name}
        onError={() => setError(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

const ProjectMembers = ({ project, onUpdate, isAdmin }) => {
  const [localSearch, setLocalSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemoveMember = async (memberId) => {
    try {
      const currentMembers = project.members.map(m => m._id);
      const updatedMembers = currentMembers.filter(id => id !== memberId);

      const res = await projectsApi.updateProject(project._id, { members: updatedMembers });
      onUpdate(res.data.data);
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Failed to remove member', err);
    }
  };

  const members = project?.members || [];
  const owner = project?.admin || project?.lead;

  const allMembers = [];
  if (owner) {
    const ownerObj = typeof owner === 'object' ? owner : { _id: owner, name: 'Project Admin' };
    allMembers.push({ ...ownerObj, isAdmin: true });
  }

  const ownerId = (owner?._id || owner)?.toString();
  members.forEach(m => {
    const mid = (m._id || m.id || m)?.toString();
    if (mid && mid !== ownerId) {
      allMembers.push({ ...m, isAdmin: false });
    }
  });

  const filteredMembers = allMembers.filter(m => {
    const name = (m.name || '').toLowerCase();
    const email = (m.email || '').toLowerCase();
    const search = localSearch.toLowerCase();
    const mid = (m._id || m.id || m)?.toString();
    return (name.includes(search) || email.includes(search)) && mid;
  });

  return (
    <div className="project-members-container animate-fade-in">
      <div className="members-header">
        <div className="members-title-area">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <UserCheck size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Project Members</h2>
          </div>
          <p className="text-sm text-muted mt-2 ml-1">
            {allMembers.length} contributors are currently building this project
          </p>
        </div>

        <div className="members-actions flex items-center gap-4">
          <div className="relative group w-64 sm:w-72">
            <Search className="absolute left-3 top-4 -translate-y-1/5 text-muted/50 group-focus-within:text-[#00D1E8] transition-colors" size={16} />
            <input
              type="text"
              placeholder="Search members..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full h-10 bg-transparent border border-white/10 rounded-full pl-10 pr-4 text-[13px] text-white focus:border-[#00D1FF] outline-none transition-all placeholder:text-muted/40 hover:border-white/20 flex-1"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn-add-member"
            >
              <Plus size={18} strokeWidth={3} />
              <span>Add Member</span>
            </button>
          )}
        </div>
      </div>

      <div className="members-list mt-8">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 text-[11px] font-black uppercase tracking-wider text-muted/60">
              <th className="px-6 py-4">Full Name</th>
              <th className="px-6 py-4">Responsibility</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.map((member) => (
              <tr key={member._id} className="border-b border-white/[0.02] hover:bg-white/[0.03] transition-all group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-4">
                    <MemberAvatar member={member} />
                    <div>
                      <div className="text-[15px] font-bold text-white flex items-center gap-2 mb-0.5">
                        {member.name}
                        {member.isAdmin && (
                          <span className="bg-primary/10 text-primary text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border border-primary/20 shadow-[0_0_15px_rgba(0,209,255,0.1)]">
                            Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2.5 text-xs font-bold text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    {member.role || 'Unknown'}
                  </div>
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2.5 text-[13px] font-medium text-muted/80 hover:text-white transition-colors cursor-pointer group/email">
                    <Mail size={14} className="opacity-40 group-hover/email:opacity-100 transition-opacity" />
                    {member.email || 'no-email@example.com'}
                  </div>
                </td>
                <td className="px-6 py-5 text-right">
                  {isAdmin && !member.isAdmin && (
                    <div className="relative inline-block text-left" ref={openDropdownId === member._id ? dropdownRef : null}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDropdownId(openDropdownId === member._id ? null : member._id);
                        }}
                        className={`p-2.5 rounded-xl transition-all ${openDropdownId === member._id ? 'opacity-100 text-white bg-white/5' : 'opacity-0 group-hover:opacity-100 text-muted hover:text-white hover:bg-white/5'}`}
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {openDropdownId === member._id && (
                        <div
                          className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0B121E] border border-white/10 shadow-2xl z-50 py-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            className="w-full text-left px-4 py-2.5 text-[13px] text-red-500 hover:bg-white/[0.04] transition-colors flex items-center gap-2 font-medium"
                          >
                            <Trash2 size={15} />
                            Remove Member
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-4">
              <User size={24} className="text-muted/20" />
            </div>
            <h4 className="text-white font-bold text-md mb-1">No members found</h4>
            <p className="text-muted text-xs max-w-[200px] leading-relaxed">Adjust your search term to find contributors on this project.</p>
          </div>
        )}
      </div>

      <AddMemberModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        project={project}
        onMemberAdded={(updated) => {
          onUpdate(updated);
        }}
      />
    </div>
  );
};

export default ProjectMembers;
