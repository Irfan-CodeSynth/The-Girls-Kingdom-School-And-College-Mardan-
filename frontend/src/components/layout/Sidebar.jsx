import React from 'react';
import { NavLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { SIDEBAR_ITEMS, ROLES } from '../../config/constants';
import notificationApi from '../../features/notifications/api/notificationApi';
import {
  LayoutDashboard,
  Home,
  Users,
  GraduationCap,
  BookOpen,
  FileQuestion,
  FileText,
  CheckCircle,
  CheckSquare,
  Award,
  Bell,
  LogOut,
  X,
  Wallet,
  Banknote,
  Receipt,
  Calendar,
  Settings,
  Mail,
  Megaphone,
  Edit3,
} from 'lucide-react';

const iconMap = {
  LayoutDashboard,
  Home,
  Users,
  GraduationCap,
  BookOpen,
  FileQuestion,
  FileText,
  CheckCircle,
  CheckSquare,
  Award,
  Bell,
  Wallet,
  Banknote,
  Receipt,
  Calendar,
  Settings,
  Mail,
  Megaphone,
  Edit3,
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role || ROLES.STUDENT;
  const navItems = SIDEBAR_ITEMS[role] || [];

  // Live unread count — refresh every 60s
  const { data: unreadData } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: () => notificationApi.getUnreadCount(),
    enabled: Boolean(user),
    refetchInterval: 60000,
    staleTime: 30000,
  });
  const unreadCount = unreadData?.unreadCount ?? 0;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 bg-[#5A0D1A] text-white
          border-r border-[#701422] transition-transform duration-300 ease-in-out lg:translate-x-0
          flex flex-col justify-between shadow-2xl select-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* ── Brand Crest Header ── */}
          <div className="pt-6 pb-4 px-4 text-center border-b border-white/10 relative">
            <button
              type="button"
              onClick={onClose}
              className="lg:hidden absolute top-4 right-4 p-1 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Golden Circular School Crest */}
            <div className="mx-auto w-16 h-16 rounded-full border-2 border-[#D4AF37] p-1 bg-[#460914] flex items-center justify-center shadow-lg relative group">
              <div className="w-full h-full rounded-full border border-[#D4AF37]/60 flex flex-col items-center justify-center p-1 bg-gradient-to-b from-[#5A0D1A] to-[#3B0710]">
                <GraduationCap className="w-6 h-6 text-[#EEDAA2] mb-0.5" />
                <span className="text-[6px] uppercase tracking-widest text-[#EEDAA2] font-bold">
                  TGK
                </span>
              </div>
            </div>

            {/* School Title Typography */}
            <h1 className="mt-2.5 font-serif text-lg font-bold tracking-tight text-white leading-tight">
              The Girls Kingdom
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#EEDAA2] mt-0.5">
              School & College
            </p>

            {/* Tagline with Gold Flourish Lines */}
            <div className="flex items-center justify-center gap-2 mt-1.5 px-3">
              <span className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent flex-1" />
              <span className="text-[9px] uppercase tracking-widest text-[#EEDAA2]/90 font-medium">
                A Project by TGK
              </span>
              <span className="h-px bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent flex-1" />
            </div>
          </div>

          {/* ── Navigation Links ── */}
          <nav className="p-3.5 space-y-1 overflow-y-auto flex-1 scrollbar-hide">
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
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-[#EEDAA2] via-[#E5C56D] to-[#DFBA74] text-[#5A0D1A] font-bold shadow-md shadow-black/20'
                        : 'text-white/80 hover:text-white hover:bg-white/10 font-medium'
                    }
                  `}
                >
                  <IconComponent className="w-4 h-4 shrink-0" />
                  <span className="flex-1 truncate">{item.name}</span>
                  {showBadge && (
                    <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-[#DFBA74] text-[#5A0D1A] text-[10px] font-black shadow-xs">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>

          {/* ── Botanical Flourish & Inspirational Quote Footer ── */}
          <div className="p-3.5 px-4 text-center border-t border-white/10 bg-[#460914]/80">
            {/* Delicate Botanical SVG */}
            <div className="flex justify-center mb-1 text-[#EEDAA2]/60">
              <svg width="32" height="20" viewBox="0 0 32 20" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M16 18C16 10 9 4 3 6C6 11 11 15 16 18Z" />
                <path d="M16 18C16 10 23 4 29 6C26 11 21 15 16 18Z" />
                <circle cx="16" cy="18" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <p className="font-serif italic text-[11px] text-[#EEDAA2] leading-tight max-w-[200px] mx-auto">
              “Educating Girls Today for a Brighter Tomorrow”
            </p>
          </div>
        </div>

        {/* ── User Profile & Logout Row ── */}
        <div className="p-3 px-4 border-t border-white/10 bg-[#3B0710] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-full bg-[#EEDAA2] text-[#5A0D1A] font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
              {user?.fullName?.split(' ').map((n) => n[0]).slice(0, 2).join('') || 'TG'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight">
                {user?.fullName}
              </p>
              <p className="text-[10px] text-[#EEDAA2]/80 truncate capitalize">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
