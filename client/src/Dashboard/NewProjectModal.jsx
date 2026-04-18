import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Plus,
    CalendarDays,
    Rocket,
    Search,
    Users,
    ChevronDown,
    UserPlus,
    Shield,
    Activity,
    Target
} from 'lucide-react';
import projectsApi from '../../api/projectsApi';
import api from '../../api/apiClient';
import useProjectStore from '../../store/useProjectStore';
import useAuthStore from '../../store/useAuthStore';
import { useToast } from '../ui/toast.jsx';
import UserAvatar from '../ui/UserAvatar';

const NewProjectModal = ({ open, onClose }) => {
    const toast = useToast();
    const { triggerRefresh } = useProjectStore();
    const { user } = useAuthStore();
    const [form, setForm] = useState({
        name: '',
        description: '',
        status: 'IN PROGRESS',
        progress: 0,
        dueDate: '',
        startDate: '',
        members: user ? [user.id || user._id] : [],
        lead: user ? user.id || user._id : ''
    });
    const [saving, setSaving] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [showMemberPicker, setShowMemberPicker] = useState(false);
    const [memberSearch, setMemberSearch] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(false);
    const pickerRef = useRef(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const res = await projectsApi.getMyTeam();
                setAvailableUsers(res.data.data || res.data || []);
            } catch (err) {
                console.error('Failed to fetch team members:', err);
            } finally {
                setLoadingUsers(false);
            }
        };
        if (open) fetchUsers();
    }, [open]);

    useEffect(() => {
        if (open) {
            setForm({
                name: '',
                description: '',
                status: 'IN PROGRESS',
                progress: 0,
                dueDate: '',
                startDate: '',
                members: user ? [user.id || user._id] : [],
                lead: user ? user.id || user._id : ''
            });
            setShowMemberPicker(false);
            setMemberSearch('');
        }
    }, [open, user]);

    useEffect(() => {
        const handler = (e) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target)) {
                setShowMemberPicker(false);
                setMemberSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            await projectsApi.createProject({
                name: form.name.trim(),
                description: form.description.trim(),
                status: form.status,
                progress: Number(form.progress || 0),
                startDate: form.startDate,
                dueDate: form.dueDate,
                members: form.members,
                lead: form.lead || undefined,
                isArchived: form.status === 'COMPLETED',
            });
            toast.success('Project Created Successfully!');
            triggerRefresh();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || 'Project Creation Failed';
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const toggleMember = (userId) => {
        setForm(p => ({
            ...p,
            members: p.members.includes(userId)
                ? p.members.filter(id => id !== userId)
                : [...p.members, userId]
        }));
    };

    const filteredUsers = availableUsers.filter(u =>
        !form.members.includes(u._id) &&
        u._id !== form.lead &&
        (u.name.toLowerCase().includes(memberSearch.toLowerCase()) ||
            u.email?.toLowerCase().includes(memberSearch.toLowerCase()))
    );

    return (
        <AnimatePresence>
            {open && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#040911]/85 backdrop-blur-xl"
                        onMouseDown={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95, rotateX: 10 }}
                        animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative z-[110] w-full max-w-2xl bg-[#0b121e]/80 border border-white/5 shadow-2xl rounded-[32px] overflow-hidden flex flex-col max-h-[85vh] backdrop-blur-2xl"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        {/* Operational Glow */}
                        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-teal-500/10 blur-[120px] pointer-events-none" />

                        {/* Header */}
                        <div className="flex items-center justify-between px-8 py-8 border-b border-white/5 relative bg-white/[0.02]">
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-50" />
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                                    <Target className="text-teal-400" size={24} />
                                    Create Project
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-white/20 hover:text-white hover:bg-white/5 transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-8 relative z-10">
                            {/* Project Name */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Project Name</label>
                                <input
                                    value={form.name}
                                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                    placeholder="Enter project name..."
                                    required
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-white text-base font-bold focus:outline-none focus:border-teal-400/50 focus:ring-4 focus:ring-teal-400/5 transition-all placeholder:text-white/10"
                                />
                            </div>

                            {/* Briefing */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Project Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                    placeholder="Describe the project..."
                                    rows={3}
                                    className="w-full bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4 text-white text-sm font-medium focus:outline-none focus:border-teal-400/50 focus:ring-4 focus:ring-teal-400/5 transition-all placeholder:text-white/10 resize-none leading-relaxed"
                                />
                            </div>

                            {/* Parameters Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Status Phase</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['IN PROGRESS', 'ON HOLD', 'COMPLETED'].map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                onClick={() => setForm((p) => ({ ...p, status }))}
                                                className={`py-3.5 rounded-2xl text-[10px] font-black tracking-widest transition-all ${form.status === status
                                                    ? 'bg-teal-400/10 border border-teal-400/40 text-teal-400 shadow-[0_0_15px_rgba(0,209,255,0.1)]'
                                                    : 'bg-white/[0.02] border border-white/5 text-white/20 hover:text-white/40 hover:bg-white/[0.04]'
                                                    }`}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Initial Progress (%)</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-0 bottom-0 flex items-center pointer-events-none">
                                            <Activity className="text-teal-400/40" size={16} />
                                        </div>
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={form.progress}
                                            onChange={(e) => setForm((p) => ({ ...p, progress: e.target.value }))}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-teal-400/50 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Window */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Start Date</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-0 bottom-0 flex items-center pointer-events-none">
                                            <CalendarDays className="text-white/20 group-focus-within:text-teal-400 transition-colors" size={16} />
                                        </div>
                                        <input
                                            type="date"
                                            value={form.startDate}
                                            onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-teal-400/50 transition-all [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Deadline Date</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-0 bottom-0 flex items-center pointer-events-none">
                                            <CalendarDays className="text-white/20 group-focus-within:text-teal-400 transition-colors" size={16} />
                                        </div>
                                        <input
                                            type="date"
                                            value={form.dueDate}
                                            onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                                            className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-5 py-4 text-white text-sm font-bold focus:outline-none focus:border-teal-400/50 transition-all [color-scheme:dark]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Lead Selection */}
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Project Lead</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-0 bottom-0 flex items-center pointer-events-none">
                                        <Shield className="text-teal-400/40" size={16} />
                                    </div>
                                    <select
                                        value={form.lead}
                                        onChange={(e) => setForm((p) => ({ ...p, lead: e.target.value }))}
                                        required
                                        className="w-full bg-white/[0.02] border border-white/10 rounded-2xl pl-12 pr-12 py-4 text-white text-sm font-bold focus:outline-none focus:border-teal-400/50 appearance-none cursor-pointer disabled:opacity-50"
                                        disabled={loadingUsers}
                                    >
                                        <option value="" disabled className="bg-[#0b121e]">
                                            {loadingUsers ? 'Loading data...' : 'Select Project Lead'}
                                        </option>
                                        {availableUsers.map(u => (
                                            <option key={u._id} value={u._id} className="bg-[#0b121e]">{u.name} {u._id === (user?.id || user?._id) ? '(You)' : ''}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-5 top-0 bottom-0 flex items-center pointer-events-none">
                                        <ChevronDown size={16} className="text-white/20 group-hover:text-teal-400 transition-colors" />
                                    </div>
                                </div>
                            </div>

                            {/* Team Selection */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] block ml-1">Team Members</label>
                                    <span className="text-[9px] font-black text-teal-400/40 tracking-widest">{form.members.length} Members</span>
                                </div>

                                <div className="p-4 bg-white/[0.01] border border-white/5 rounded-2xl min-h-[64px] flex flex-wrap gap-2.5 relative">
                                    <AnimatePresence>
                                        {form.members.map(memberId => {
                                            const member = availableUsers.find(u => u._id === memberId) || (memberId === (user?.id || user?._id) ? user : null);
                                            if (!member) return null;
                                            return (
                                                <motion.div
                                                    key={memberId}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.5 }}
                                                    className="flex items-center gap-2.5 px-3 py-1.5 bg-teal-400/10 border border-teal-400/20 rounded-xl"
                                                >
                                                    <UserAvatar
                                                        user={member}
                                                        size="xs"
                                                        className="rounded-md"
                                                    />
                                                    <span className="text-xs font-bold text-teal-400">{member.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleMember(memberId)}
                                                        className="p-0.5 hover:bg-teal-400/20 rounded-md transition-colors text-teal-400"
                                                    >
                                                        <X size={12} strokeWidth={3} />
                                                    </button>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>

                                    <button
                                        type="button"
                                        onClick={() => setShowMemberPicker(!showMemberPicker)}
                                        className="h-9 px-5 flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-teal-400 hover:border-teal-400/40 hover:bg-teal-400/5 transition-all active:scale-95"
                                    >
                                        <UserPlus size={14} />
                                        Add Member
                                    </button>

                                    <AnimatePresence>
                                        {showMemberPicker && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                ref={pickerRef}
                                                className="absolute top-full left-0 right-0 mt-3 z-[120] bg-[#0b121e]/95 backdrop-blur-2xl border border-white/5 rounded-[24px] shadow-2xl overflow-hidden"
                                            >
                                                <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
                                                    <Search size={16} className="text-teal-400" />
                                                    <input
                                                        value={memberSearch}
                                                        onChange={(e) => setMemberSearch(e.target.value)}
                                                        placeholder="Search Members..."
                                                        className="flex-1 bg-transparent border-none outline-none text-white text-sm font-medium placeholder:text-white/10"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="max-h-[220px] overflow-y-auto custom-scrollbar">
                                                    {filteredUsers.map(user => (
                                                        <div
                                                            key={user._id}
                                                            onClick={() => {
                                                                toggleMember(user._id);
                                                                setShowMemberPicker(false);
                                                                setMemberSearch('');
                                                            }}
                                                            className="flex items-center gap-4 p-4 hover:bg-teal-400/5 cursor-pointer group transition-all"
                                                        >
                                                            <UserAvatar
                                                                user={user}
                                                                size="md"
                                                                className="rounded-xl"
                                                            />
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-white group-hover:text-teal-400 transition-colors">{user.name}</span>
                                                                <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">{user.role || 'Member'}</span>
                                                            </div>
                                                            <Plus size={14} className="ml-auto opacity-0 group-hover:opacity-100 text-teal-400 transition-all" />
                                                        </div>
                                                    ))}
                                                    {filteredUsers.length === 0 && (
                                                        <div className="p-10 text-center flex flex-col items-center">
                                                            <Users size={32} className="text-white/5 mb-3" />
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">No matching users found</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            {/* Footer Section */}
                            <div className="flex items-center gap-6 pt-8 border-t border-white/5 pb-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-8 py-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-black text-white/30 uppercase tracking-[0.2em] hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !form.name.trim() || !form.lead}
                                    className={`flex-1 py-4 rounded-2xl text-[11px] font-black tracking-[0.3em] uppercase flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${saving || !form.name.trim() || !form.lead ? 'bg-white/5 text-white/10 cursor-not-allowed shadow-none' : 'bg-teal-400/90 text-white hover:bg-teal-300 hover:shadow-[0_0_40px_rgba(0,209,255,0.3)] shadow-[0_8px_32px_rgba(0,209,255,0.2)]'}`}
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-[#040911] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Rocket size={18} />
                                            <span>Create Project</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default NewProjectModal;
