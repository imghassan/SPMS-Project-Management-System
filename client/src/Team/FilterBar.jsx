import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Calendar, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Reusable Dropdown 
const CustomDropdown = ({ label, options, selected, onSelect }) => {
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

  // Find display name for selected value
  const selectedLabel = options.find(o => (o.value ?? o) === selected)?.label ?? selected;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="custom-dropdown-btn flex items-center gap-3 px-5 py-2.5 rounded-xl text-[#94A3B8] hover:text-white font-bold text-[13px] transition-all justify-between group h-[44px] min-w-[160px]"
      >
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap italic opacity-60 font-medium mr-1">{label}</span>
          <span className="whitespace-nowrap">{selectedLabel}</span>
        </div>
        <ChevronDown size={14} className={`text-[#94A3B8] transition-transform duration-300 ml-2 ${isOpen ? 'rotate-180 text-white' : 'group-hover:text-white'}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute top-full left-0 w-full min-w-[180px] bg-[var(--bg-card)] border border-[var(--border)] rounded-xl mt-2 py-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[1000] max-h-60 overflow-y-auto"
          >
            {options.map((opt) => {
              const value = opt.value ?? opt;
              const label_text = opt.label ?? opt;
              return (
                <button
                  key={value}
                  onClick={() => { onSelect(value); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] font-bold transition-all hover:bg-white/5 text-left ${selected === value ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[#94A3B8] hover:text-white'
                    }`}
                >
                  {label_text}
                  {selected === value && <Check size={14} strokeWidth={3} />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Period Picker 
const PERIOD_PRESETS = [
  { label: 'This Week', getValue: () => getWeekRange(0) },
  { label: 'Next Week', getValue: () => getWeekRange(1) },
  { label: 'Last Week', getValue: () => getWeekRange(-1) },
  { label: 'This Month', getValue: () => getMonthRange(0) },
  { label: 'Last Month', getValue: () => getMonthRange(-1) },
  { label: 'Next 2 Weeks', getValue: () => getNWeeks(2) },
];

function getWeekRange(offset = 0) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + offset * 7);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { start: fmtDate(monday), end: fmtDate(sunday) };
}

function getMonthRange(offset = 0) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { start: fmtDate(start), end: fmtDate(end) };
}

function getNWeeks(n) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const end = new Date(monday);
  end.setDate(monday.getDate() + n * 7 - 1);
  return { start: fmtDate(monday), end: fmtDate(end) };
}

function fmtDate(d) {
  return d.toISOString().split('T')[0];
}

function fmtDisplay(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

const PeriodPicker = ({ period, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const shiftWeek = (dir) => {
    const start = new Date(period.start + 'T00:00:00');
    const end = new Date(period.end + 'T00:00:00');
    start.setDate(start.getDate() + dir * 7);
    end.setDate(end.getDate() + dir * 7);
    onChange({ start: fmtDate(start), end: fmtDate(end) });
  };

  return (
    <div className="relative flex items-center gap-2" ref={containerRef}>
      {/* Prev week arrow */}
      <button
        onClick={() => shiftWeek(-1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#131B2A]/60 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all"
        title="Previous period"
      >
        <ChevronLeft size={15} />
      </button>

      {/* Period label / dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#131B2A]/40 border border-white/5 text-[#94A3B8] font-bold text-[13px] transition-all h-[44px] hover:border-white/20 hover:text-white"
      >
        <Calendar size={16} className="text-[#00D1FF]" />
        <span className="opacity-80">Period:</span>
        <span className="text-white">{fmtDisplay(period.start)} – {fmtDisplay(period.end)}</span>
        <ChevronDown size={13} className={`ml-1 text-[#94A3B8] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Next week arrow */}
      <button
        onClick={() => shiftWeek(1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#131B2A]/60 border border-white/10 text-[#94A3B8] hover:text-white hover:bg-white/5 transition-all"
        title="Next period"
      >
        <ChevronRight size={15} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-10 mt-2 w-[340px] bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl py-4 shadow-[0_22px_60px_rgba(0,0,0,0.65)] z-[1000] backdrop-blur-xl"
          >
            <p className="px-5 py-2 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] opacity-50">Quick Select</p>
            {PERIOD_PRESETS.map((p) => {
              const range = p.getValue();
              const isActive = range.start === period.start && range.end === period.end;
              return (
                <button
                  key={p.label}
                  onClick={() => { onChange(range); setIsOpen(false); }}
                  className={`w-full flex items-center justify-between px-5 py-3 text-[13px] font-bold transition-all hover:bg-white/5 text-left ${isActive ? 'text-[var(--primary)] bg-[var(--primary)]/10' : 'text-[#94A3B8] hover:text-white'
                    }`}
                >
                  <div className="flex items-center justify-between flex-1 pr-3">
                    <span className="whitespace-nowrap">{p.label}</span>
                    <span className="text-[11px] opacity-60 font-normal whitespace-nowrap">{fmtDisplay(range.start)} – {fmtDisplay(range.end)}</span>
                  </div>
                  {isActive ? <Check size={14} strokeWidth={3} className="shrink-0 text-[var(--primary)]" /> : <div className="w-[14px]" />}
                </button>
              );
            })}

            {/* Custom date inputs */}
            <div className="border-t border-white/5 mt-4 pt-4 pb-4">
              <p className="px-6 text-[10px] font-black text-[#94A3B8] uppercase tracking-[0.2em] mb-4 opacity-50">Custom Range</p>
              <div className="flex gap-3 items-center text-[#94A3B8] px-5">
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={period.start}
                    onChange={(e) => onChange({ ...period, start: e.target.value })}
                    className="w-full text-[12px] bg-black/40 border border-white/10 rounded-xl flex items-center justify-center py-2.5 text-white outline-none focus:border-[var(--primary)] transition-all [color-scheme:dark] hover:bg-black/60 font-bold"
                  />
                </div>
                <span className="text-white/10 font-bold text-[11px] uppercase tracking-tighter shrink-0">to</span>
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={period.end}
                    onChange={(e) => onChange({ ...period, end: e.target.value })}
                    className="w-full text-[12px] bg-black/40 border border-white/10 rounded-xl flex items-center justify-center py-2.5 text-white outline-none focus:border-[var(--primary)] transition-all [color-scheme:dark] hover:bg-black/60 font-bold"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

//  FilterBar 
const FilterBar = ({
  onDepartmentChange = () => { },
  onProjectChange = () => { },
  onPeriodChange = () => { },
  selectedDepartment = 'All',
  selectedProject = 'All',
  period,
  departments = [],
  projects = [],
}) => {
  const deptOptions = [{ value: 'All', label: 'All' }, ...departments.map(d => ({ value: d, label: d }))];
  const projectOptions = [{ value: 'All', label: 'All Active' }, ...projects.map(p => ({ value: p._id, label: p.name }))];

  return (
    <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
      <div className="flex items-center gap-4">
        <CustomDropdown
          label="Department"
          options={deptOptions}
          selected={selectedDepartment}
          onSelect={onDepartmentChange}
        />

        <CustomDropdown
          label="Project"
          options={projectOptions}
          selected={selectedProject}
          onSelect={onProjectChange}
        />

        <PeriodPicker period={period} onChange={onPeriodChange} />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-8 bg-black/20 backdrop-blur-md px-8 py-3 rounded-2xl border border-white/5 shadow-inner">
        {[
          { color: '#1e6b7a', label: 'Under' },
          { color: '#00D1FF', label: 'Normal' },
          { color: '#f5820a', label: 'Full' },
          { color: '#e53935', label: 'Overload' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)]" style={{ backgroundColor: item.color }}></div>
            <span className="text-[#94A3B8] text-[11px] font-black uppercase tracking-[0.1em]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { fmtDate, getWeekRange };
export default FilterBar;
