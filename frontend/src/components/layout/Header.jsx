import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Dropdown } from '../ui';
import { Menu, Sun, Moon, Bell, LogOut, User, Search, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router';

export const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const userMenuItems = [
    {
      label: user?.fullName || 'My Account',
      icon: <User className="w-4 h-4 text-surface-500" />,
      onClick: () => {},
    },
    {
      type: 'divider',
    },
    {
      label: 'Log out',
      icon: <LogOut className="w-4 h-4 text-danger-500" />,
      danger: true,
      onClick: logout,
    },
  ];

  // User monogram initials (e.g. Irfan Ullah -> IU)
  const initials = user?.fullName
    ? user.fullName
        .split(' ')
        .filter(Boolean)
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'TG';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 font-sans">
      {/* ── Left: Hamburger Menu & Global Search ── */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 focus:outline-none"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search classes, quizzes, students..."
            className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-full bg-[#F8F9FA] border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A] transition-all"
          />
        </div>
      </div>

      {/* ── Right Actions: Dark Mode, Notifications, User Monogram ── */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light mode toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-amber-500" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-gray-600" />
          )}
        </button>

        {/* Notification bell with numeric counter badge */}
        <button
          type="button"
          className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4.5 h-4.5" />
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E11D48] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
            3
          </span>
        </button>

        {/* User Monogram Profile Dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2.5 pl-2 cursor-pointer group">
              {/* Circular Crimson Avatar with Monogram */}
              <div className="w-8.5 h-8.5 rounded-full bg-gradient-to-br from-[#701422] to-[#4A0914] text-[#EEDAA2] border-1.5 border-[#D4AF37] flex items-center justify-center text-xs font-black shadow-xs group-hover:scale-105 transition-transform">
                {initials}
              </div>

              {/* User details */}
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[#111827] leading-tight font-sans">
                  {user?.fullName || 'User Account'}
                </span>
                <span className="text-[10px] font-medium text-[#6B7280] capitalize font-sans">
                  {user?.role || 'Member'}
                </span>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
};

export default Header;
