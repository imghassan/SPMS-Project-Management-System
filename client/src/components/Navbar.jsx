import { Link } from 'react-router-dom';
import { Button } from './UI';
import useAuthStore from '../store/useAuthStore';
import {
  Layout,
  LogOut,
  Layers
} from 'lucide-react';
import { getAvatarUrl } from '../utils/getAvatarUrl';
import UserAvatar from './ui/UserAvatar';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2">
        <div className='p-3 bg-[#00D1FF] rounded-md'>
          <Layers size={24} className=" bg-[#00D1FF]" />
        </div>
        <span className="font-bold text-xl tracking-tight uppercase text-primary">SPMS</span>
      </Link>

      <div className="hidden md:flex items-center gap-4">
        <a href="#features" className="nav-link">Features</a>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard">
              <Button variant="ghost" className="hidden sm:flex items-center gap-2">
                <Layout size={16} />
                Dashboard
              </Button>
            </Link>
            <div className="flex items-center gap-3 pl-2 border-l border-white/10">
              <Link to="/dashboard" className="flex items-center gap-2 group">
                <UserAvatar user={user} size="sm" className="group-hover:border-primary/50 transition-all" />
                <span className="hidden lg:block text-[14px] font-bold text-white group-hover:text-primary transition-colors">
                  {user?.name?.split(' ')[0] || 'Profile'}
                </span>
              </Link>

              <button
                onClick={logout}
                className="w-9 h-9 flex items-center justify-center text-muted hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" className="hidden sm:block">Log in</Button>
            </Link>
            <Link to="/signup">
              <Button variant="primary">Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};
