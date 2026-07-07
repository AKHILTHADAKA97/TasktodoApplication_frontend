import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Menu, Calendar, User, LogOut, Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { DEFAULT_AVATAR } from '../../constants';

const Navbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Overview';
      case '/tasks':
        return 'Task Workflow';
      case '/profile':
        return 'Settings & Profile';
      default:
        return 'TaskFlow';
    }
  };

  const getTodayDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    if (!name) return 'TF';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Returns the user's avatar or the backend default image
  const getAvatarUrl = (userObj) => {
    if (userObj?.avatar) return userObj.avatar;
    return DEFAULT_AVATAR;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials = getInitials(user?.name);

  return (
    <header className="relative z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/70 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-[#0f1422]/70 md:px-8">
      {/* Dynamic page title & Hamburger */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-100 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800 md:hidden"
        >
          <Menu className="h-5 w-5 text-slate-500 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="font-outfit text-xl font-bold tracking-tight text-slate-900 dark:text-white md:text-2xl">
            {getPageTitle()}
          </h1>
          <p className="hidden text-xs text-slate-400 dark:text-slate-500 md:block">
            Welcome back, {user?.name?.split(' ')[0]}!
          </p>
        </div>
      </div>

      {/* Date, Theme & Profile dropdown widget */}
      <div className="flex items-center gap-3">
        {/* Calendar date badge */}
        <div className="hidden items-center gap-2 rounded-xl bg-slate-50 px-4.5 py-2.5 dark:bg-slate-900/50 md:flex">
          <Calendar className="h-4.5 w-4.5 text-indigo-500" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {getTodayDate()}
          </span>
        </div>

        {/* Theme Switcher Button */}
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 cursor-pointer"
          title="Toggle Theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-500" />}
        </button>

        {/* Profile Dropdown Anchor Button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center justify-center h-10 w-10 overflow-hidden rounded-xl bg-indigo-600 text-white font-outfit font-bold text-sm tracking-tight ring-2 ring-indigo-600/10 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <img
              src={getAvatarUrl(user)}
              alt={user?.name || 'User'}
              className="h-full w-full object-cover"
            />
          </button>

          {/* Dropdown Menu Container */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-3.5 w-76 origin-top-right rounded-2xl border border-slate-200 bg-white p-4 shadow-xl backdrop-blur-md dark:border-slate-800/80 dark:bg-[#0f1422] z-50">
              
              {/* Profile Card details (styled exact matching the requested AT card) */}
              <div className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-white/70 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-950/40">
                {/* Always show avatar image (auto-generated if not set) */}
                <img
                  src={getAvatarUrl(user)}
                  alt={user?.name || 'User'}
                  className="h-11 w-11 rounded-xl object-cover shadow-sm flex-shrink-0"
                />
                {/* Name and email fields */}
                <div className="overflow-hidden text-left">
                  <h4 className="truncate font-outfit text-sm font-bold text-slate-900 dark:text-white">
                    {user?.name || 'User Name'}
                  </h4>
                  <p className="truncate text-2xs text-slate-400 dark:text-slate-500">
                    {user?.email || 'email@example.com'}
                  </p>
                </div>
              </div>

              <div className="my-3 border-t border-slate-100 dark:border-slate-800" />

              {/* Navigation Options list */}
              <div className="space-y-1.5">
                {/* Profile Link */}
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                >
                  <User className="h-4 w-4 text-slate-400" />
                  <span>My Profile & Settings</span>
                </Link>

                {/* Theme Toggle Button */}
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4 text-amber-500" />
                    ) : (
                      <Moon className="h-4 w-4 text-slate-400" />
                    )}
                    <span>Theme: {theme === 'dark' ? 'Light' : 'Dark'}</span>
                  </div>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-3xs font-bold text-slate-400 dark:bg-slate-800 dark:text-slate-500 uppercase">
                    {theme}
                  </span>
                </button>
              </div>

              <div className="my-3 border-t border-slate-100 dark:border-slate-800" />

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-rose-500 transition hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
