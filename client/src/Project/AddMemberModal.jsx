import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  UserPlus,
  Loader2,
  User
} from 'lucide-react';
import api from '../../api/apiClient';
import { getAvatarUrl } from '../../utils/getAvatarUrl';
import { useToast } from '../ui/toast.jsx';
import '../../styles/Components/AddMemberModal.css';

const AddMemberModal = ({ isOpen, onClose, project, onMemberAdded }) => {
  const toast = useToast();
  const [allUsers, setAllUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [addingId, setAddingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAllUsers();
    }
  }, [isOpen]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const [allRes, teamRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/workload/grid')
      ]);
      setAllUsers(allRes.data?.data || allRes.data || []);
      setTeamMembers(teamRes.data?.data || teamRes.data || []);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (user) => {
    try {
      setAddingId(user.id || user._id);

      await api.post('/invitations', {
        email: user.email,
        role: 'member',
        projectId: project._id
      });

      toast.success(`Invitation sent to ${user.name}!`);
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      console.error('Failed to send invitation', err);
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setAddingId(null);
    }
  };

  const currentMembersSet = new Set(
    [
      project.admin?._id || project.admin,
      project.lead?._id || project.lead,
      ...(project.members || []).map((m) => m._id || m.id || m),
    ]
      .map((id) => id?.toString())
      .filter(Boolean)
  );

  const filterUserList = (list, isSearching) => {
    return list.filter((user) => {
      const userId = (user._id || user.id)?.toString();
      if (currentMembersSet.has(userId)) return false;

      if (isSearching) {
        return (
          (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    });
  };

  const filteredUsers = searchTerm.trim()
    ? filterUserList(allUsers, true)
    : filterUserList(teamMembers, false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[3000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#040911]/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-[#0F1117] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <UserPlus size={20} />
              </div>
              <h2 className="text-xl font-bold text-white">Add Member</h2>
            </div>
            <button onClick={onClose} className="text-muted hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-4 -translate-y-1/5 text-muted" size={16} />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#030712] border border-white/5 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-primary/50 outline-none transition-all"
                autoFocus
              />
            </div>

            <div className="max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <Loader2 className="animate-spin text-primary" size={24} />
                  <span className="text-xs text-muted">Finding users...</span>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {!searchTerm.trim() && (
                    <div className="text-[10px] font-black text-muted/50 uppercase tracking-[0.1em] mb-2 pl-2 mt-2">
                      Suggested from your team
                    </div>
                  )}
                  {filteredUsers.map((user) => {
                    const userId = user._id || user.id;
                    return (
                      <div
                        key={userId}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] border border-transparent hover:border-white/5 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#112229] border border-white/5 flex items-center justify-center overflow-hidden">
                            {getAvatarUrl(user.avatar) ? (
                              <img src={getAvatarUrl(user.avatar)} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <User size={18} className="text-primary/40" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white">{user.name}</div>
                            <div className="text-[11px] text-muted">{user.email}</div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleAddMember(user)}
                          disabled={addingId === userId}
                          className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${addingId === userId
                            ? 'bg-[#00D1FF] text-primary cursor-not-allowed'
                            : 'bg-[#00D1FF] text-white hover:scale-105 active:scale-95'
                            }`}
                        >
                          {addingId === userId ? (
                            <Loader2 className="animate-spin" size={14} />
                          ) : 'Invite'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-sm text-muted">No users found.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddMemberModal;
