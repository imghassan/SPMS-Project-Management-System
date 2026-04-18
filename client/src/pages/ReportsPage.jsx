import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, Folder, Users, ChevronDown, Check, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportsHeader from '../components/Reports/ReportsHeader';
import MetricCards from '../components/Reports/MetricCards';
import VelocityChart from '../components/Reports/VelocityChart';
import TaskDistribution from '../components/Reports/TaskDistribution';
import TimeSpentChart from '../components/Reports/TimeSpentChart';
import '../styles/reports.css';

const ReportsDropdown = ({ label, options, selected, onSelect, icon: Icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="reports-pill-filter group flex items-center gap-2"
      >
        <Icon size={16} className="text-text-secondary group-hover:text-white transition-colors" />
        <span className="reports-pill-label text-[13px] font-semibold text-slate-300">
          {label}: <span className="text-primary ml-1">{selected}</span>
        </span>
        <ChevronDown size={14} className={`text-text-secondary transition-transform duration-300 ml-1 ${isOpen ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 w-full min-w-[200px] bg-bg-card border border-white/10 rounded-xl mt-2 py-2 shadow-2xl z-[100] backdrop-blur-xl"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  onSelect(opt);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-bold transition-all hover:bg-white/5 text-left ${selected === opt ? 'text-primary bg-primary/5' : 'text-text-secondary hover:text-white'}`}
              >
                {opt}
                {selected === opt && <Check size={14} strokeWidth={3} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [project, setProject] = useState('All Projects');
  const [team, setTeam] = useState('All Members');


  const [reportData, setReportData] = useState(null);
  const [availableFilters, setAvailableFilters] = useState({ projects: [], teams: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchReports = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ dateRange, project, team });
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/dashboard/reports?${params}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) {
          setReportData(json.data);
          if (json.data.availableProjects && json.data.availableTeams) {
            setAvailableFilters({
              projects: ["All Projects", ...json.data.availableProjects.map(p => p.name)],
              teams: ["All Members", ...json.data.availableTeams]
            });
          }
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchReports();
    return () => { cancelled = true; };
  }, [dateRange, project, team]);

  // Local filtering for some metrics
  const filteredTimeByMember = useMemo(() => {
    return reportData?.timeByMember || [];
  }, [reportData]);

  const filteredTimeByProject = useMemo(() => {
    return reportData?.timeByProject || [];
  }, [reportData]);

  return (
    <div className="reports-container min-h-screen bg-bg-primary text-text-primary">
      <ReportsHeader
        filters={{ dateRange, project, team }}
      />

      <div className="reports-content p-6 lg:p-10 space-y-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto w-full space-y-10">

          {/* Header Action Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
            <div className="reports-filter-bar flex flex-wrap items-center gap-3">
              <div className="p-2.5 bg-bg-secondary rounded-xl border border-white/5 mr-1 shadow-lg">
                <Filter size={16} className="text-primary" />
              </div>
              <ReportsDropdown
                label="Timeline"
                icon={Calendar}
                options={["Last 7 Days", "Last 30 Days", "This Quarter", "This Year"]}
                selected={dateRange}
                onSelect={setDateRange}
              />
              <ReportsDropdown
                label="Project"
                icon={Folder}
                options={availableFilters.projects.length > 0 ? availableFilters.projects : ["All Projects"]}
                selected={project}
                onSelect={setProject}
              />
              <ReportsDropdown
                label="Team"
                icon={Users}
                options={availableFilters.teams.length > 0 ? availableFilters.teams : ["All Members"]}
                selected={team}
                onSelect={setTeam}
              />
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-4 flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Failed to sync productivity data: {error}</span>
            </motion.div>
          )}

          {/* Main sections with staggered animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            {/* Phase 1: KPIs */}
            <MetricCards data={reportData} loading={loading} />

            {/* Phase 2: Performance Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 reports-chart-card">
                <VelocityChart data={reportData?.velocity} loading={loading} />
              </div>
              <div className="reports-chart-card">
                <TaskDistribution data={reportData?.distribution} loading={loading} />
              </div>
            </div>

            {/* Phase 3: Time Tracking Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
              <div className="reports-chart-card">
                <TimeSpentChart
                  title="Time by Project"
                  data={filteredTimeByProject}
                  loading={loading}
                />
              </div>
              <div className="reports-chart-card">
                <TimeSpentChart
                  title="Team Member Performance"
                  data={filteredTimeByMember}
                  loading={loading}
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
