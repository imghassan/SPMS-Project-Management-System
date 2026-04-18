import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Users, MessageSquare, Clock } from 'lucide-react';
import TeamHeader from '../components/Team/TeamHeader';
import FilterBar, { getWeekRange } from '../components/Team/FilterBar';
import WorkloadGrid from '../components/Team/WorkloadGrid';
import OverAllocatedAlerts from '../components/Team/BottomCards/OverAllocatedAlerts';
import DepartmentCapacity from '../components/Team/BottomCards/DepartmentCapacity';
import WeeklyEfficiency from '../components/Team/BottomCards/WeeklyEfficiency';
import LogTimeModal from '../components/Team/LogTimeModal';
import InviteMemberModal from '../components/Team/InviteMemberModal';
import TeamMembersList from '../components/Team/TeamMembersList';
import TeamChatInline from '../components/Team/TeamChatInline';
import api from '../api/apiClient';
import { useSocket } from '../context/SocketContext';
import useAuthStore from '../store/useAuthStore';
import '../styles/TeamWorkload.css'

/*  Tab definitions  */
const TABS = [
  { id: 'workload', label: 'Workload', icon: LayoutGrid },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'chat', label: 'Team Chat', icon: MessageSquare },
];

/*  Animated Tab Bar  */
const TabBar = ({ active, onChange, memberCount }) => (
  <div className="twp-tab-bar mb-8">
    {TABS.map(tab => {
      const Icon = tab.icon;
      const isActive = active === tab.id;
      return (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`twp-tab-btn ${isActive ? 'active' : ''}`}
        >
          {isActive && (
            <motion.div
              layoutId="twp-tab-pill"
              className="twp-tab-pill"
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            <Icon size={15} strokeWidth={2.5} />
            {tab.label}
            {tab.id === 'members' && memberCount > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black ${isActive ? 'bg-black/20 text-[#040911]' : 'bg-[#00D1FF]/10 text-[#00D1FF]'
                  }`}
              >
                {memberCount}
              </span>
            )}
          </span>
        </button>
      );
    })}
  </div>
);

/*  Tab content animation variants  */
const tabVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

const TeamPage = () => {
  const { setIsChatOpen, user: socketUser } = useSocket();
  const { user } = useAuthStore();
  const isSystemAdmin = user?.role?.toLowerCase() === 'admin';
  
  const [activeTab, setActiveTabLocal] = useState('workload');
  const setActiveTab = (tab) => {
    setActiveTabLocal(tab);
    setIsChatOpen(tab === 'chat');
  };
  const [showLogModal, setShowLogModal] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [weeklyData, setWeeklyData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptCapacity, setDeptCapacity] = useState([]);

  const [period, setPeriod] = useState(() => getWeekRange(0));
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedProject, setSelectedProject] = useState('All');

  /*  Fetch grid + efficiency  */
  const fetchGridData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: period.start,
        endDate: period.end,
        ...(selectedDept !== 'All' && { department: selectedDept }),
        ...(selectedProject !== 'All' && { project: selectedProject }),
      });

      const [gridRes, effRes] = await Promise.all([
        api.get(`/workload/grid?${params}`),
        api.get(`/workload/weekly-efficiency?startDate=${period.start}`),
      ]);

      const members = (gridRes.data?.data || gridRes.data || []).map(m => ({
        ...m,
        id: m.id || m._id,
        department: m.department || 'General',
        utilization: m.capacityPercentage,
        hours: Array.isArray(m.dailyHours) ? m.dailyHours.map(d => ({ hoursSpent: d.hoursSpent || 0 })) : [],
      }));
      setTeamMembers(members);

      const labels = (effRes.data || []).map(d => d.day);
      const counts = (effRes.data || []).map(d => d.hours);
      setWeeklyData({
        labels: labels.length > 0 ? labels : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          data: counts.length > 0 ? counts : [0, 0, 0, 0, 0, 0, 0],
          backgroundColor: (counts.length > 0 ? counts : []).map(c => c > 30 ? '#00d4ff' : '#0d9488'),
          borderRadius: 4,
        }],
      });
    } catch (err) {
      console.error('Error fetching workload grid data:', err);
      setTeamMembers([]);
      setWeeklyData({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: '#0d9488', borderRadius: 4 }],
      });
    } finally {
      setLoading(false);
    }
  }, [period, selectedDept, selectedProject]);

  /*  Listen for taskAdded custom event globally to automatically fetch data  */
  useEffect(() => {
    const handleTaskAdded = () => fetchGridData();
    window.addEventListener('taskAdded', handleTaskAdded);
    return () => window.removeEventListener('taskAdded', handleTaskAdded);
  }, [fetchGridData]);

  /*  Fetch static data once  */
  useEffect(() => {
    const fetchStaticData = async () => {
      try {
        const [projRes, alertsRes, deptRes] = await Promise.all([
          api.get('/projects'),
          api.get('/workload/alerts'),
          api.get('/workload/department-capacity'),
        ]);

        setProjects(projRes.data?.data || projRes.data || []);
        setAlerts(alertsRes.data || []);

        const deptList = (deptRes.data || []).map(d => d.department).filter(Boolean).sort();
        setDepartments(deptList);

        setDeptCapacity((deptRes.data || []).map(d => ({
          name: d.department,
          percentage: Math.min(Math.max(d.percentage || 0, 0), 100),
          isWarning: d.isWarning || (d.percentage > 90),
        })));
      } catch (err) {
        console.error('Error fetching static workload data:', err);
        setProjects([]);
        setAlerts([]);
        setDepartments([]);
        setDeptCapacity([]);
      }
    };
    fetchStaticData();
  }, []);

  useEffect(() => { fetchGridData(); }, [fetchGridData]);

  const projectOptions = useMemo(() => {
    if (isSystemAdmin) return projects;
    return projects.filter(p => {
      const adminId = (p.admin?._id || p.admin)?.toString();
      const leadId = (p.lead?._id || p.lead)?.toString();
      const currentUserId = (user?.id || user?._id)?.toString();
      return currentUserId && (adminId === currentUserId || leadId === currentUserId);
    });
  }, [projects, isSystemAdmin, user]);

  const canInvite = isSystemAdmin || projectOptions.length > 0;

  const fallbackWeeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ data: [0, 0, 0, 0, 0, 0, 0], backgroundColor: '#0d9488', borderRadius: 4 }],
  };

  /*  Render  */
  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-12 bg-bg-primary">
      {/*  Header  */}
      <div className="mb-8 sm:mb-10">
        <TeamHeader
          onInviteClick={() => setInviteOpen(true)}
          isAdmin={canInvite}
        />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        {/*  Tab Bar  */}
        <TabBar active={activeTab} onChange={setActiveTab} memberCount={teamMembers.length} />

        {activeTab === 'workload' && (
          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-[13px] font-black uppercase tracking-[0.1em] transition-all transform hover:scale-[1.02] active:scale-[0.98] bg-primary/10 border border-primary/20 text-primary"
          >
            <Clock size={16} strokeWidth={3} />
            Log Time
          </button>
        )}
      </div>

      {/*  Tab Content  */}
      <AnimatePresence mode="wait">

        {/* Tab 1 - Workload */}
        {activeTab === 'workload' && (
          <motion.div key="workload" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            {/* Filters */}
            <div className="mb-8 sm:mb-10">
              <FilterBar
                departments={departments}
                projects={projectOptions}
                selectedDepartment={selectedDept}
                onDepartmentChange={setSelectedDept}
                selectedProject={selectedProject}
                onProjectChange={setSelectedProject}
                period={period}
                onPeriodChange={setPeriod}
              />
            </div>

            {/* Grid */}
            <div className="mb-8 sm:mb-12 rounded-2xl overflow-hidden glass shadow-2xl">
              <WorkloadGrid teamMembers={teamMembers} loading={loading} period={period} />
            </div>

            {/* Bottom insight cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <OverAllocatedAlerts alerts={alerts} />
              <DepartmentCapacity departments={deptCapacity} />
              <WeeklyEfficiency data={weeklyData ?? fallbackWeeklyData} />
            </div>
          </motion.div>
        )}

        {/* Tab 2 - Members */}
        {activeTab === 'members' && (
          <motion.div key="members" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <TeamMembersList teamMembers={teamMembers} loading={loading} onRefresh={fetchGridData} isAdmin={isSystemAdmin} />
          </motion.div>
        )}

        {/* Tab 3 - Team Chat */}
        {activeTab === 'chat' && (
          <motion.div key="chat" variants={tabVariants} initial="initial" animate="animate" exit="exit">
            <TeamChatInline teamId="general" teamMembers={teamMembers} />
          </motion.div>
        )}

      </AnimatePresence>

      {/* Modals */}
      <InviteMemberModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        projectOptions={projectOptions}
      />

      {showLogModal && (
        <LogTimeModal
          onClose={() => setShowLogModal(false)}
          members={teamMembers}
          onLogged={fetchGridData}
          projects={projectOptions}
        />
      )}
    </div>
  );
};

export default TeamPage;
