import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ProjectBoard from './pages/ProjectBoard';
import ProjectsDashboard from './pages/ProjectsDashboard';
import ReportsPage from './pages/ReportsPage';
import TeamPage from './pages/TeamPage';
import useAuthStore from './store/useAuthStore';
import MainLayout from './components/Layout/MainLayout';
import AllTasks from './pages/AllTasks';
import MyTasks from './pages/MyTasks';
// import DueSoon from './pages/DueSoon';
import { TaskProvider } from './context/TaskContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-main flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      <Route element={
        <ProtectedRoute>
          <TaskProvider>
            <MainLayout />
          </TaskProvider>
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectsDashboard />} />
        <Route path="/project/:projectId" element={<ProjectBoard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/report" element={<ReportsPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/team-workload" element={<Navigate to="/team" replace />} />
        <Route path="/tasks">
          <Route path="all" element={<AllTasks />} />
          <Route path="my" element={<MyTasks />} />
          {/* <Route path="soon" element={<DueSoon />} /> */}
          <Route index element={<Navigate to="all" replace />} />
          <Route path="*" element={<Navigate to="all" replace />} />
        </Route>
        <Route path="/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">Settings Page</h1><p className="text-muted mt-2">Coming Soon...</p></div>} />
      </Route>

      <Route path="/reports" element={<Navigate to="/report" replace />} />
      <Route path="/task/all" element={<Navigate to="/tasks/all" replace />} />
      <Route path="/task/*" element={<Navigate to="/tasks/all" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
