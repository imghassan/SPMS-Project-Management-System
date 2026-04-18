import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  LayoutGrid,
  ChevronDown,
  Users,
  AlertCircle,
  Calendar
} from 'lucide-react';

const FilterDropdown = ({ icon: Icon, label, value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = value === 'all' ? label : options.find(o => o.value === value)?.label || label;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#030712] border border-white/5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:border-primary/40 hover:bg-[#0B121E] transition-all"
      >
        <Icon size={16} className={value !== 'all' ? "text-primary" : "text-muted"} />
        <span className={value !== 'all' ? "text-primary" : ""}>{selectedLabel}</span>
        <ChevronDown size={14} className="text-muted ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-[#0B121E] border border-white/10 rounded-xl shadow-2xl z-50 py-1 min-w-[160px] max-h-64 overflow-y-auto custom-scrollbar">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`px-4 py-2.5 cursor-pointer text-[13px] transition-colors flex items-center justify-between ${value === opt.value ? 'bg-primary/10 text-primary font-bold' : 'text-white hover:bg-white/5'
                }`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
              {value === opt.value && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


const ProjectHeader = ({ project, onNewTask, showFilters = true, filters = {}, setFilters }) => {
  const title = project?.name || 'Project Board';
  const status = project?.status || 'In Progress';
  const owner = project?.admin || project?.lead;
  const membersList = project?.members || [];

  const members = [
    ...(owner ? [owner] : []),
    ...membersList.filter(m => {
      const mid = m._id?.toString() || m.toString();
      const oid = owner?._id?.toString() || owner?.toString();
      return mid !== oid;
    })
  ];

  const memberOptions = [
    { label: 'All Members', value: 'all' },
    ...members.map(m => ({ label: m.name, value: m._id }))
  ];

  const priorityOptions = [
    { label: 'All Priorities', value: 'all' },
    { label: 'Low', value: 'Low' },
    { label: 'Medium', value: 'Medium' },
    { label: 'High', value: 'High' },
    { label: 'Urgent', value: 'Urgent' }
  ];

  const dueDateOptions = [
    { label: 'Any Time', value: 'all' },
    { label: 'Overdue', value: 'overdue' },
    { label: 'Due Today', value: 'today' },
    { label: 'Due This Week', value: 'this_week' }
  ];

  return (
    <div className="flex flex-col gap-6 px-8 py-6 bg-[#040911]">
      {/* Top Row: Title and Main Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${status === 'DONE' ? 'bg-emerald-500' : 'bg-primary'}`}></span>
              <span className="text-sm text-muted">
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {onNewTask && (
            <button
              onClick={onNewTask}
              style={{ backgroundColor: '#00D1FF' }}
              className="h-11 flex items-center gap-2 hover:opacity-90 text-[#0B121E] px-6 py-2 rounded-xl font-black transition-all shadow-xl shadow-[#00D1FF]/20 hover:scale-[1.02] active:scale-[0.98] animate-in zoom-in duration-200"
            >
              <Plus size={20} strokeWidth={3} />
              <span className="text-[14px]">New Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Filters and Avatars */}
      {showFilters && (
        <div className="flex justify-between items-center animate-in fade-in slide-in-from-top-1 duration-300">
          <div className="flex items-center gap-3">
            <FilterDropdown
              icon={Users}
              label="All Members"
              value={filters?.member || 'all'}
              options={memberOptions}
              onChange={(val) => setFilters && setFilters(prev => ({ ...prev, member: val }))}
            />
            <FilterDropdown
              icon={AlertCircle}
              label="Priority"
              value={filters?.priority || 'all'}
              options={priorityOptions}
              onChange={(val) => setFilters && setFilters(prev => ({ ...prev, priority: val }))}
            />
            <FilterDropdown
              icon={Calendar}
              label="Due Date"
              value={filters?.dueDate || 'all'}
              options={dueDateOptions}
              onChange={(val) => setFilters && setFilters(prev => ({ ...prev, dueDate: val }))}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectHeader;
