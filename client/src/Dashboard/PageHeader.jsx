import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, ArrowUpDown, LayoutGrid, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dropdown = ({ label, icon: Icon, options, value, onChange, activeValue }) => {
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

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 16px',
          borderRadius: 14,
          background: activeValue !== 'ALL' && activeValue !== 'dueDate'
            ? 'rgba(0,209,255,0.1)'
            : '#131B2A',
          border: activeValue !== 'ALL' && activeValue !== 'dueDate'
            ? '1px solid rgba(0,209,255,0.3)'
            : '1px solid rgba(255,255,255,0.05)',
          color: activeValue !== 'ALL' && activeValue !== 'dueDate' ? '#00D1FF' : '#94A3B8',
          fontWeight: 700,
          fontSize: 13,
          cursor: 'pointer',
          transition: 'all 0.2s',
          fontFamily: "'DM Sans', sans-serif",
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = (activeValue !== 'ALL' && activeValue !== 'dueDate') ? 'rgba(0,209,255,0.15)' : '#1A2332';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = (activeValue !== 'ALL' && activeValue !== 'dueDate') ? 'rgba(0,209,255,0.1)' : '#131B2A';
          e.currentTarget.style.color = (activeValue !== 'ALL' && activeValue !== 'dueDate') ? '#00D1FF' : '#94A3B8';
        }}
      >
        <Icon size={15} />
        {label}
        <ChevronDown size={14} style={{ opacity: 0.5, transform: isOpen ? 'rotate(180)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16,
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              zIndex: 1000,
              minWidth: 180,
              padding: 8,
              overflow: 'hidden',
              backdropFilter: 'blur(20px)',
            }}
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: value === opt.value ? 'rgba(0,209,255,0.08)' : 'transparent',
                  border: 'none',
                  color: value === opt.value ? '#00D1FF' : '#94A3B8',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => {
                  if (value !== opt.value) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseLeave={(e) => {
                  if (value !== opt.value) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#94A3B8';
                  }
                }}
              >
                {opt.label}
                {value === opt.value && <Check size={14} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const PageHeader = ({
  searchQuery,
  setSearch,
  filterStatus,
  setFilter,
  sortBy,
  setSortBy
}) => {
  const filterOptions = [
    { label: 'All Projects', value: 'ALL' },
    { label: 'In Progress', value: 'IN PROGRESS' },
    { label: 'On Hold', value: 'ON HOLD' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Archived', value: 'ARCHIVED' },
  ];

  const sortOptions = [
    { label: 'Due Date', value: 'dueDate' },
    { label: 'Progress', value: 'progress' },
    { label: 'Alphabetical', value: 'alpha' },
    { label: 'Created At', value: 'createdAt' },
  ];

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        marginBottom: 32,
      }}
    >
      {/* Left: title + search */}
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
          <LayoutGrid size={24} style={{ color: '#00D1FF', flexShrink: 0 }} />
          <h1
            style={{
              color: 'white',
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              fontFamily: "'Syne', sans-serif",
              margin: 0,
            }}
          >
            Project Dashboard
          </h1>
        </div>
        <p
          style={{
            color: '#94A3B8',
            fontSize: 15,
            fontWeight: 500,
            marginBottom: 20,
            marginLeft: 38,
            opacity: 0.8
          }}
        >
          Track and manage your organization's projects and progress.
        </p>

        {/* Search Bar */}
        <div
          style={{
            position: 'relative',
            maxWidth: 400,
            marginLeft: 38,
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94A3B8',
              opacity: 0.6,
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              background: '#0F172A',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16,
              padding: '13px 18px 13px 48px',
              color: 'white',
              fontSize: 14,
              fontWeight: 500,
              outline: 'none',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(0,209,255,0.4)';
              e.target.style.background = '#131B2E';
              e.target.style.boxShadow = '0 0 0 1px rgba(0,209,255,0.1), inset 0 2px 4px rgba(0,0,0,0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255,255,255,0.06)';
              e.target.style.background = '#0F172A';
              e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.1)';
            }}
          />
        </div>
      </div>

      {/* Right: Filter + Sort controls */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', paddingTop: 8 }}>
        <Dropdown
          label="Filter"
          icon={Filter}
          options={filterOptions}
          value={filterStatus}
          activeValue={filterStatus}
          onChange={setFilter}
        />
        <Dropdown
          label="Sort"
          icon={ArrowUpDown}
          options={sortOptions}
          value={sortBy}
          activeValue={sortBy}
          onChange={setSortBy}
        />
      </div>
    </header>
  );
};

export default PageHeader;
