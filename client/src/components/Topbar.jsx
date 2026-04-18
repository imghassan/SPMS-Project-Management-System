import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Loader2, LayoutGrid, FileText, User as UserIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import useModalStore from '../store/useModalStore';
import useNotificationStore from '../store/useNotificationStore';
import NotificationDropdown from './NotificationDropdown';
import UserAvatar from './ui/UserAvatar';
import api from '../api/apiClient';
import '../styles/Components/Topbar.css';

const Topbar = () => {
  const navigate = useNavigate();
  const { openCreateProjectModal } = useModalStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  // Poll for new notifications in the background
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults(null);
      setLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get(`/dashboard/search?q=${encodeURIComponent(searchTerm)}`);
        setResults(res.data.data);
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleResultClick = (type, item) => {
    setShowDropdown(false);
    setSearchTerm('');
    if (type === 'project') {
      navigate(`/project/${item._id}`);
    } else if (type === 'task') {
      navigate(`/project/${item.project?._id || item.project}?taskId=${item._id}`);
    } else if (type === 'user') {
      navigate('/team', { state: { searchUser: item.name } });
    }
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
  };

  const hasResults = results && (results.projects.length > 0 || results.tasks.length > 0 || results.users.length > 0);

  return (
    <header className="topbar-header z-[1000] relative">
      {/* Search Bar Area */}
      <div className="topbar-search-container group relative" ref={searchRef}>
        <Search className="topbar-search-icon" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search projects, tasks, or profiles..."
          className="topbar-search-input"
          spellCheck="false"
        />

        {showDropdown && searchTerm.length >= 2 && (
          <div className="absolute top-full left-0 mt-2 w-full bg-bg-card border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden z-[100] search-dropdown-animate">
            {loading ? (
              <div className="py-8 flex justify-center items-center gap-3">
                <Loader2 className="animate-spin text-primary" size={20} />
                <span className="text-text-secondary text-sm font-medium">Searching...</span>
              </div>
            ) : !hasResults ? (
              <div className="py-8 text-center text-text-secondary text-sm">
                No results found for "{searchTerm}"
              </div>
            ) : (
              <div className="search-results-list custom-scrollbar">
                {/* Projects */}
                {results.projects.length > 0 && (
                  <div className="mb-4">
                    <h4 className="search-category-title">Projects</h4>
                    {results.projects.map(p => (
                      <div key={p._id} onClick={() => handleResultClick('project', p)} className="search-item group">
                        <div className="search-item-icon bg-primary/10 text-primary border-primary/20 transition-all group-hover:scale-110">
                          <LayoutGrid size={16} />
                        </div>
                        <div className="search-item-info">
                          <div className="search-item-name text-primary">{p.name}</div>
                          <div className="search-item-meta">{p.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tasks */}
                {results.tasks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="search-category-title">Tasks</h4>
                    {results.tasks.map(t => (
                      <div key={t._id} onClick={() => handleResultClick('task', t)} className="search-item group">
                        <div className="search-item-icon bg-emerald-500/10 text-emerald-500 border-emerald-500/20 transition-all group-hover:scale-110">
                          <FileText size={16} />
                        </div>
                        <div className="search-item-info">
                          <div className="search-item-name text-emerald">{t.title}</div>
                          <div className="search-item-meta">{t.project?.name || 'Task'} • {t.status}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Users */}
                {results.users.length > 0 && (
                  <div className="mb-2">
                    <h4 className="search-category-title">People</h4>
                    {results.users.map(u => (
                      <div key={u._id} onClick={() => handleResultClick('user', u)} className="search-item group">
                        <div className="transition-all group-hover:scale-110">
                          <UserAvatar user={u} size="sm" />
                        </div>
                        <div className="search-item-info">
                          <div className="search-item-name text-indigo">{u.name}</div>
                          <div className="search-item-meta">{u.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Global Actions */}
      <div className="topbar-actions" ref={containerRef}>
        <div className="relative">
          <button
            className={`topbar-notification-btn ${isNotificationsOpen ? 'active' : ''}`}
            onClick={toggleNotifications}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="topbar-notification-dot"></span>}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <NotificationDropdown
                isOpen={isNotificationsOpen}
                onClose={() => setIsNotificationsOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={openCreateProjectModal}
          className="topbar-btn-new"
        >
          <Plus size={16} strokeWidth={3} className="topbar-plus-icon" />
          <span>New Project</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;




