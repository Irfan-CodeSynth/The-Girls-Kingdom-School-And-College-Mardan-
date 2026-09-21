import React from 'react';
import { NavLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { SIDEBAR_ITEMS, ROLES } from '../../config/constants';
import notificationApi from '../../features/notifications/api/notificationApi';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileQuestion,
  CheckCircle,
  Award,
  Bell,
  LogOut,
  X,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileQuestion,
  CheckCircle,
  Award,
  Bell,
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role || ROLES.STUDENT;
  const navItems = SIDEBAR_ITEMS[role] || [];

  // Live unread count — students only, refresh every 60s
  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationApi.getUnreadCount(),
    enabled: role === ROLES.STUDENT,
    refetchInterval: 60000,
    staleTime: 30000,
  });
  const unreadCount = unreadData?.unreadCount ?? 0;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 border-r border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col justify-between
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div>
          {/* Brand header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src="/logo.png"
                alt="The Girls Kingdom School and College Mardan Logo"
                className="h-9 w-9 shrink-0 object-contain rounded-full shadow-xs"
              />
              <div className="min-w-0">
                <span className="text-sm font-bold text-surface-900 dark:text-white tracking-tight leading-tight block truncate">
                  The Girls Kingdom
                </span>
                <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 tracking-wider uppercase block truncate">
                  School & College Mardan
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden p-1 text-surface-400 hover:text-surface-600 shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="p-4 space-y-1.5 overflow-y-auto">
            {navItems.map((item) => {
              const IconComponent = iconMap[item.icon] || BookOpen;
              const isBellItem = item.icon === 'Bell';
              const showBadge = isBellItem && unreadCount > 0;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all
                    ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 shadow-xs font-semibold'
                        : 'text-surface-600 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50 hover:text-surface-900 dark:hover:text-white'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {showBadge && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-primary-600 text-white text-[10px] font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User profile info & logout */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-900/30">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-semibold text-surface-900 dark:text-white truncate">
                {user?.fullName}
              </p>
              <p className="text-[11px] text-surface-400 truncate capitalize">
                {user?.role}
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-2 rounded-lg text-surface-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

