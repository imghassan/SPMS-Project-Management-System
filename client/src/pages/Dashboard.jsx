import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../api/apiClient';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import {
  Rocket,
  CheckCircle2,
  Pause,
  MessageSquare,
  Check,
  FileText,
  ChevronDown,
  LayoutGrid,
  Folder,
  BarChart,
  Users
} from 'lucide-react';
import useProjectStore from '../store/useProjectStore';

const getInitials = (name) => {
  if (!name) return '??';
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.map(word => word[0]).slice(0, 3).join('').toUpperCase();
};

const iconMap = {
  Rocket,
  CheckCircle2,
  Pause,
  MessageSquare,
  Check,
  FileText,
  LayoutGrid,
  Folder,
  BarChart,
  Users
};

const HealthCard = ({ icon: Icon, iconColor, iconBg, title, value, highlight, highlightColor, highlightBg }) => (
  <div className="health-card group shadow-lg">
    <div className="flex justify-between items-start mb-6">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${iconBg}`}>
        <Icon size={20} className={iconColor} />
      </div>
      <span className={`insight-pill ${highlightColor} ${highlightBg}`}>
        {highlight}
      </span>
    </div>
    <div className="flex flex-col gap-1">
      <h4 className="text-[#94A3B8] text-[13px] font-semibold tracking-tight">{title}</h4>
      <p className="text-[32px] font-bold tracking-tight text-white leading-none">{value}</p>
    </div>
  </div>
);

const DeadlineCard = ({ date, title, sub, dot, onClick }) => (
  <div onClick={onClick} className="flex items-center gap-4 p-4 group cursor-pointer bg-[#1A2332]/50 hover:bg-[#1A2332] rounded-xl border border-white/[0.02] hover:border-white/10 transition-all">
    <div className="bg-[#131B2A] rounded-xl w-[50px] h-[50px] flex flex-col items-center justify-center border border-white/5 group-hover:border-[#00D1FF]/40 transition-all shrink-0">
      <span className="text-[9px] font-bold text-[#94A3B8] uppercase leading-none mb-1 tracking-widest">{date.split(' ')[0]}</span>
      <span className="text-[17px] font-bold leading-none text-white">{date.split(' ')[1]}</span>
    </div>
    <div className="flex-1 min-w-0">
      <h5 className="font-bold text-[14px] text-white mb-0.5 group-hover:text-[#00D1FF] transition-colors truncate">{title}</h5>
      <p className="text-[11px] text-[#94A3B8] font-medium truncate">{sub}</p>
    </div>
    <div className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${dot}`}></div>
  </div>
);



const ActivityItem = ({ name, avatar, action, target, time, snippet, icon, iconBg, projectId, taskId }) => {
  const Icon = iconMap[icon] || FileText;
  const navigate = useNavigate();

  const avatarUrl = avatar ? getAvatarUrl(avatar) : null;

  return (
    <div
      className="flex gap-4 group cursor-pointer mb-7 last:mb-0"
      onClick={() => projectId && navigate(`/project/${projectId}`)}
    >
      <div className="relative shrink-0 pt-0.5" onClick={(e) => {
        e.stopPropagation();
        navigate('/team', { state: { searchUser: name } });
      }}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold border transition-all duration-300 group-hover:scale-105 overflow-hidden
          ${avatarUrl ? 'border-[#00D1FF]/30 bg-transparent shadow-lg shadow-[#00D1FF]/5' : 'bg-gradient-to-br from-[#1E293B] to-[#0F172A] border-white/5 shadow-inner'}`}>
          {avatarUrl ? (
            <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm">{name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className={`absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-[#131B2A] shadow-lg ${iconBg}`}>
          <Icon size={9} className="text-white" strokeWidth={4} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13.5px] leading-relaxed">
          <span className="font-bold text-white hover:text-[#00D1FF] transition-colors" onClick={(e) => {
            e.stopPropagation();
            navigate('/team', { state: { searchUser: name } });
          }}>{name}</span>{' '}
          <span className="text-[#94A3B8]">{action === 'Done the task' ? 'Done the task' : action}</span>{' '}
          <span className="font-bold text-[#00D1FF] hover:underline decoration-2 transition-all">{target}</span>
        </div>
        {snippet && (
          <div className="mt-3 relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#00D1FF]/30 rounded-full"></div>
            <p className="text-[13px] text-[#94A3B8] pl-4 py-1 italic leading-relaxed">
              {snippet}
            </p>
          </div>
        )}
        <p className="text-[9px] font-bold text-[#94A3B8]/60 uppercase tracking-[0.1em] mt-2 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-[#94A3B8]/40"></span>
          {time}
        </p>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { refreshTrigger } = useProjectStore();
  const [stats, setStats] = useState(null);
  const [userChartData, setUserChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState(7);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get(`/dashboard/user-stats?days=${timeframe}`)
        ]);
        setStats({
          ...statsRes.data.data,
          recentActivity: statsRes.data.data?.recentActivity?.filter(a => a.action !== 'Done the task') || []
        });
        setUserChartData(chartRes.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [refreshTrigger, timeframe]);

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setStats(prev => ({
        ...prev,
        recentActivity: []
      }));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getTimeframeLabel = (val) => {
    if (val === 7) return 'Last 7 Days';
    if (val === 30) return 'Last 30 Days';
    if (val === 60) return 'Last 60 Days';
    return `${val} Days`;
  };

  // Convert userStats to the format expected by the chart
  const activeChartData = userChartData.map((project, idx) => ({
    n: project.initials || getInitials(project.name),
    fullName: project.name,
    h: `${project.completionRate}%`,
    rawPercentage: project.completionRate,
    active: idx === 0 // Make the first one active by default or find highest
  }));

  if (activeChartData.length > 0) {
    let highestIdx = 0;
    let highestVal = -1;
    activeChartData.forEach((item, idx) => {
      if (item.rawPercentage > highestVal) {
        highestVal = item.rawPercentage;
        highestIdx = idx;
      }
      item.active = false;
    });
    activeChartData[highestIdx].active = true;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040911] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#00D1FF] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#94A3B8] font-bold animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center mb-10 pt-2">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold tracking-tight text-white m-0 leading-none">Dashboard</h1>
          <p className="text-[15px] text-[#94A3B8] font-medium m-0 flex items-center gap-2 opacity-80">
            Welcome back, <span className="text-[#00D1FF] font-bold">{user?.name || 'Hassan'}</span>! Here's what's happening today.
          </p>
        </div>
      </header>
      {/* Project Health Overview */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold tracking-tight">Project Health Overview</h2>
        </div>
        <div className="flex flex-row gap-6 overflow-x-auto pb-4 hide-scrollbar">
          <div className="flex-1 min-w-[280px]">
            <HealthCard
              icon={Rocket} iconColor="text-[#00D1FF]" iconBg="bg-[#00D1FF]/10"
              title="Active Projects" value={stats?.activeProjects}
              highlight={stats?.activeProjectsDelta || "0 Trend"} highlightColor="text-emerald-400" highlightBg="bg-emerald-400/10"
            />
          </div>
          <div className="flex-1 min-w-[280px]">
            <HealthCard
              icon={CheckCircle2} iconColor="text-white/80" iconBg="bg-[#1F2937]"
              title="Done" value={stats?.doneProjects}
              highlight={stats?.doneProjectsDelta || "0 Trend"} highlightColor="text-[#00D1FF]" highlightBg="bg-[#00D1FF]/10"
            />
          </div>
          <div className="flex-1 min-w-[280px]">
            <HealthCard
              icon={Pause} iconColor="text-white/80" iconBg="bg-[#1F2937]"
              title="On Hold" value={stats?.onHold}
              highlight="Requires review" highlightColor="text-amber-400" highlightBg="bg-amber-400/10"
            />
          </div>
          <div className="flex-1 min-w-[280px]">
            <HealthCard
              icon={FileText} iconColor="text-white/80" iconBg="bg-[#1F2937]"
              title="Total Tasks" value={stats?.totalTasks}
              highlight={stats?.efficiency || "0% Efficiency"} highlightColor="text-emerald-400" highlightBg="bg-emerald-400/10"
            />
          </div>
        </div>
      </section>

      {/* Middle Row */}
      <section className="middle-row">
        {/* Task Completion Status */}
        <div className="bg-[#131B2A] border border-white/5 rounded-2xl p-7 flex flex-col min-h-[400px] shadow-2xl shadow-black/20">
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="font-bold text-[18px] text-white">Task Completion Status</h3>
              <p className="text-[13px] text-[#94A3B8] mt-1">Weekly progress across top projects</p>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="group flex items-center gap-2 bg-[#1A2332] border border-white/5 px-4 py-2 rounded-xl text-[11px] font-bold hover:bg-[#1A2332]/80 transition-all text-[#94A3B8] hover:text-white"
              >
                <span>{getTimeframeLabel(timeframe)}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-white' : 'group-hover:translate-y-0.5'}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-36 bg-[#1A2332] border border-white/10 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                  {[7, 30, 60].map(days => (
                    <button
                      key={days}
                      onClick={() => {
                        setTimeframe(days);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[11px] font-bold transition-colors ${timeframe === days ? 'bg-[#00D1FF]/10 text-[#00D1FF]' : 'text-[#94A3B8] hover:bg-white/5 hover:text-white'}`}
                    >
                      {getTimeframeLabel(days)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 mt-4 flex items-end justify-between gap-2 px-4 sm:px-10 border-b border-white/[0.05] pb-8 relative group/chart">
            {/* Chart Grid Lines */}
            <div className="absolute inset-0 px-4 sm:px-10 pb-8 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-t border-white/10 w-full h-0"></div>
              <div className="border-t border-white/10 w-full h-0"></div>
              <div className="border-t border-white/10 w-full h-0"></div>
            </div>

            {activeChartData.map(bar => (
              <div key={bar.n} className="flex flex-col items-center gap-6 group/bar relative z-10 w-full" title={bar.fullName}>
                <div className="w-full max-w-[44px] relative h-[220px] flex items-end justify-center overflow-visible">
                  <div
                    className={`w-full rounded-lg transition-all duration-500 cursor-pointer relative group-hover/bar:shadow-[0_0_25px_rgba(0,209,255,0.2)] 
                      ${bar.active ? 'bg-[#00D1FF] shadow-[0_4px_20px_rgba(0,209,255,0.4)]' : 'bg-[#1F2937] hover:bg-[#2D3748]'}`}
                    style={{ height: `${Math.max(bar.rawPercentage, 2)}%` }}
                  >
                    <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-white text-[#0A101C] text-[10px] font-black px-2 py-1 rounded shadow-xl pointer-events-none transition-all duration-300 ${bar.active ? 'opacity-100 animate-bounce' : 'opacity-0 group-hover/bar:opacity-100 -translate-y-2'}`}>
                      {bar.h}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activeChartData.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-[13px] text-[#94A3B8] font-medium opacity-60">No project activity found for this timeframe.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-4 sm:px-10 pt-6">
            {activeChartData.map(bar => (
              <span key={`label-${bar.n}`} className={`text-[10px] font-bold tracking-[0.2em] transition-colors duration-300 w-full text-center truncate
                 ${bar.active ? 'text-[#00D1FF]' : 'text-[#94A3B8]/60'}`}>
                {bar.n}
              </span>
            ))}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-[#131B2A] border border-white/5 rounded-2xl p-7 flex flex-col shadow-2xl shadow-black/20 h-full">
          <h3 className="font-bold text-[18px] text-white mb-6">Upcoming Deadlines</h3>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {stats?.upcomingDeadlines?.map((d, i) => (
              <DeadlineCard
                key={i}
                date={d.date}
                title={d.title}
                sub={d.sub}
                dot={d.dot}
                onClick={() => {
                  if (d.projectId) navigate(`/project/${d.projectId}?taskId=${d.taskId}`);
                }}
              />
            ))}
            {!stats?.upcomingDeadlines?.length && (
              <p className="text-[13px] text-[#94A3B8] opacity-60 text-center py-10">No upcoming deadlines.</p>
            )}
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="bg-[#131B2A] border border-white/5 rounded-2xl p-7 shadow-2xl shadow-black/20">
        <div className="flex justify-between items-center mb-10">
          <h3 className="font-bold text-[18px] text-white">Recent Activity</h3>
          <button
            onClick={handleMarkAllRead}
            className="text-[12px] font-bold text-[#94A3B8] hover:text-[#00D1FF] transition-all flex items-center gap-2"
          >
            Mark all as read
          </button>
        </div>
        <div className="max-w-4xl">
          {stats?.recentActivity?.map((a, i) => (
            <ActivityItem
              key={i}
              name={a.name}
              avatar={a.avatar}
              projectId={a.projectId}
              taskId={a.taskId}
              action={a.action}
              target={a.target}
              time={a.time}
              icon={a.icon}
              iconBg={a.iconBg}
            />
          ))}
          {!stats?.recentActivity?.length && (
            <p className="text-[13px] text-[#94A3B8] opacity-60 text-center py-10">No recent activity.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;