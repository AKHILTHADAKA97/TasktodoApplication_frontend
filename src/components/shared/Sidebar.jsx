import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CheckSquare, 
  User, 
  LogOut, 
  X, 
  Activity
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { DEFAULT_AVATAR } from '../../constants';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Returns user's avatar or the backend default image
  const getAvatarUrl = (userObj) => {
    if (userObj?.avatar) return userObj.avatar;
    return DEFAULT_AVATAR;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/tasks', label: 'My Tasks', icon: CheckSquare },
    { to: '/profile', label: 'Profile & Settings', icon: User },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-6">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-250">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="font-outfit text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              TaskFlow
            </span>
          </div>
          {/* Mobile close button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* User Card */}
        <div className="mt-8 flex items-center gap-4 rounded-xl border border-slate-100 bg-white/50 p-4 dark:border-slate-800 dark:bg-slate-900/30">
          <img
            src={getAvatarUrl(user)}
            alt={user?.name || 'User'}
            className="h-10 w-10 rounded-lg object-cover ring-2 ring-indigo-500/20"
          />
          <div className="overflow-hidden">
            <h4 className="truncate font-outfit text-sm font-semibold text-slate-900 dark:text-white">
              {user?.name}
            </h4>
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">
              {user?.email}
            </p>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-4.5 rounded-xl px-4.5 py-3.5 text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-100 text-indigo-600 dark:bg-slate-900/60 dark:text-white border border-slate-200/40 dark:border-slate-800/40 shadow-xs'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/30 dark:hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="space-y-4">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-4.5 rounded-xl px-4.5 py-3.5 text-sm font-bold text-rose-500 transition-all hover:bg-rose-50 dark:hover:bg-rose-950/20"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar - Desktop Layout */}
      <aside className="hidden w-70 flex-shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0f1422] md:block">
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile Layout */}
      <div className={`fixed inset-0 z-50 md:hidden transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Backdrop overlay */}
        <div 
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Drawer slide panel */}
        <div className={`absolute top-0 bottom-0 left-0 w-70 bg-white dark:bg-[#0f1422] transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {sidebarContent}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
