import React from 'react';
import { Search } from 'lucide-react';
import '../../styles/Components/ProjectNavbar.css';

const ProjectNavbar = ({ searchTerm, setSearchTerm, activeTab, setActiveTab, isOwner }) => {
  const tabs = ['Kanban View', 'List View', 'Members', 'Settings'];

  return (
    <nav className="project-navbar">
      {/* Left: Logo and Nav */}
      <div className="project-navbar-left">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg text-white tracking-tight">
            Project Board
          </span>
        </div>

        <div className="project-navbar-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`project-navbar-tab ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Middle: Search */}
      <div className="search-input-container">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tasks..."
            className="search-input"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-5 w-[100px] justify-end">
      </div>
    </nav>
  );
};

export default ProjectNavbar;
