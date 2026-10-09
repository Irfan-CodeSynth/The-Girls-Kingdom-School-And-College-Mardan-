import React from 'react';
import { Calendar, GraduationCap } from 'lucide-react';

export const DashboardHero = ({
  name = 'User',
  roleTitle = 'Portal Dashboard',
  subtitle = "Here's what's happening today.",
  quote = '“Empowering Young Minds for a Brighter Future”',
  dateFormatted,
}) => {
  // Fallback to today's date if not passed
  const displayDate =
    dateFormatted ||
    new Date().toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#FAF6F4] via-[#FDFBF7] to-[#F5ECE8] dark:from-surface-900 dark:via-surface-850 dark:to-surface-800 p-6 sm:p-8 border border-[#EFE5E0] dark:border-surface-700/60 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left: Greeting & Typography */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-5 h-0.5 bg-[#C59B27]" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-[#9E781B] dark:text-[#EEDAA2]">
              Welcome back,
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#5A0D1A] dark:text-[#F5CCD6] leading-tight">
            {name}
          </h1>

          <h2 className="text-base sm:text-lg font-semibold text-surface-900 dark:text-white mt-1">
            {roleTitle}
          </h2>

          <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Center: Inspirational Serif Quote */}
        {quote && (
          <div className="hidden xl:flex flex-col justify-center px-6 border-l border-r border-[#EFE5E0] dark:border-surface-700/60 text-center max-w-xs">
            <p className="font-serif italic text-base sm:text-lg text-[#5A0D1A] dark:text-[#EEDAA2] leading-snug">
              {quote}
            </p>
          </div>
        )}

        {/* Right: Academic Graphic & Floating Date Widget */}
        <div className="flex items-center gap-4 self-start lg:self-auto">
          {/* Visual Graduation Motif */}
          <div className="hidden sm:flex w-24 h-24 rounded-2xl bg-gradient-to-br from-[#5A0D1A] to-[#3B0710] items-center justify-center shadow-lg relative overflow-hidden group shrink-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/30 to-transparent pointer-events-none" />
            <GraduationCap className="w-12 h-12 text-[#EEDAA2] drop-shadow-md group-hover:scale-110 transition-transform duration-300" />
          </div>

          {/* Date Widget Card */}
          <div className="bg-white dark:bg-surface-800/90 rounded-2xl p-4 shadow-sm border border-[#EFE5E0] dark:border-surface-700/80 flex items-start gap-3 min-w-[210px]">
            <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] dark:bg-rose-950/60 text-[#BE123C] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-surface-900 dark:text-white leading-tight">
                {displayDate}
              </p>
              <p className="text-[11px] text-surface-400 mt-0.5">
                Have a productive day!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHero;
