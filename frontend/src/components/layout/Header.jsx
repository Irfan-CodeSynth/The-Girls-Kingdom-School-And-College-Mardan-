import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Avatar, Dropdown } from '../ui';
import { Menu, Sun, Moon, Bell, LogOut, Key, User } from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-800/80 px-4 sm:px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden rounded-lg p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 focus:outline-none"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <span className="text-sm font-medium text-surface-500 dark:text-surface-400 capitalize">
            {user?.role} Portal
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-lg p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-surface-600" />
          )}
        </button>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-600" />
        </button>

        {/* User avatar dropdown */}
        <Dropdown
          trigger={
            <div className="flex items-center gap-2 pl-2">
              <Avatar
                src={user?.profilePhoto}
                name={user?.fullName || 'User'}
                size="sm"
              />
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-surface-800 dark:text-surface-100 leading-tight">
                  {user?.fullName}
                </span>
                <span className="text-[10px] text-surface-400 capitalize">
                  {user?.role}
                </span>
              </div>
            </div>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
};

export default Header;
