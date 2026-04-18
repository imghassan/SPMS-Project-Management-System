import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart2,
  Layout,
  CheckSquare,
  Users,
  Layers,
  Folder,
  Menu
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import UserAvatar from './ui/UserAvatar';
import '../styles/Components/Sidebar.css'
const Sidebar = ({ activeItem }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', icon: Layout, path: '/dashboard' },
    { label: 'Projects', icon: Folder, path: '/projects' },
    { label: 'Tasks', icon: CheckSquare, path: '/tasks' },
    { label: 'Team', icon: Users, path: '/team' },
    { label: 'Reports', icon: BarChart2, path: '/report' },
  ];

  return (
    <aside
      className={`bg-bg-sidebar border-r border-white/5 flex flex-col h-full pt-8 pb-4 transition-all duration-300 ease-in-out relative shrink-0 ${isCollapsed ? 'w-[80px]' : 'w-[270px]'}`}
    >
      {/* Brand & Toggle */}
      <div className={`px-4 mb-8 select-none flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} min-h-[44px]`}>
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-6">
            <div className="sidebar-brand-icon w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <Layers size={21} className="text-white" />
            </div>
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-2.5 hover:bg-white/10 rounded-xl text-text-secondary hover:text-white transition-colors flex items-center justify-center shrink-0"
            >
              <Menu size={22} />
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3.5 overflow-hidden">
              <div className="sidebar-brand-icon w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                <Layers size={20} className="text-white" />
              </div>
              <div className="flex flex-col justify-center whitespace-nowrap overflow-hidden pr-2">
                <h1 className="font-bold text-white tracking-tight text-[18px] leading-none font-outfit">SPMS</h1>
              </div>
            </div>

            <button
              onClick={() => setIsCollapsed(true)}
              className="p-2 hover:bg-white/10 rounded-xl text-text-secondary hover:text-white transition-colors shrink-0"
            >
              <Menu size={20} />
            </button>
          </>
        )}
      </div>

      {/* Nav Items */}
      <nav className={`flex-1 overflow-visible flex flex-col ${isCollapsed ? 'px-4 space-y-3' : 'px-4 space-y-1.5'}`}>
        {navItems.map((item) => {
          const isActive = activeItem
            ? activeItem === item.label
            : location.pathname.startsWith(item.path);

          return (
            <motion.button
              key={item.label}
              whileHover={{ x: isCollapsed ? 0 : 4 }}
              onClick={() => navigate(item.path)}
              title={isCollapsed ? item.label : undefined}
              className={`nav-item-container w-full flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-4 px-5 py-3'} rounded-xl transition-colors group relative ${isActive
                ? (isCollapsed ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary shadow-sm')
                : 'text-text-secondary hover:text-white hover:bg-white/5'
                }`}
            >
              {isActive && (
                <div className="active-pill-indicator"></div>
              )}
              <item.icon
                size={20}
                className={`sidebar-icon shrink-0 ${isActive ? 'text-primary' : 'text-text-secondary group-hover:text-white transition-colors'}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              {!isCollapsed && (
                <span className={`text-[14px] whitespace-nowrap overflow-hidden ${isActive ? 'font-bold' : 'font-semibold tracking-wide'}`}>
                  {item.label}
                </span>
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom Profile Section */}
      <div className="mt-auto border-t border-white/[0.05] bg-bg-sidebar/80 backdrop-blur-md sticky bottom-0">
        <div
          onClick={() => navigate('/profile')}
          className={`flex items-center ${isCollapsed ? 'justify-center py-4' : 'justify-between p-5'} hover:bg-white/5 transition-colors group cursor-pointer select-none`}
          title={isCollapsed ? 'Profile' : undefined}
        >
          <div className={`flex items-center overflow-hidden ${isCollapsed ? 'justify-center' : 'gap-3.5'}`}>
            <UserAvatar
              user={user}
              size="md"
              className="shrink-0"
            />
            {!isCollapsed && (
              <div className="text-left whitespace-nowrap overflow-hidden">
                <div className="text-white font-bold text-[13px] leading-tight truncate w-24">
                  {user?.name || 'User'}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
