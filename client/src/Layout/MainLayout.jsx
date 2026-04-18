import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar';
import Topbar from '../Topbar';
import NewProjectModal from '../Dashboard/NewProjectModal';
import useModalStore from '../../store/useModalStore';

const MainLayout = ({ hideTopbar = false }) => {
  const { isCreateProjectModalOpen, closeCreateProjectModal } = useModalStore();

  return (
    <div className="min-h-screen bg-[#040911] text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {!hideTopbar && <Topbar />}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <NewProjectModal
        open={isCreateProjectModalOpen}
        onClose={closeCreateProjectModal}
      />
    </div>
  );
};

export default MainLayout;
