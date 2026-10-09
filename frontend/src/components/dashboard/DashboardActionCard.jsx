import React from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

export const DashboardActionCard = ({
  title = 'Action Title',
  description = 'Brief action description text.',
  to = '#',
  theme = 'crimson', // 'crimson' | 'slate' | 'gold' | 'emerald'
  watermarkIcon: WatermarkIcon,
}) => {
  // Theme color definitions
  const themeStyles = {
    crimson: {
      bg: 'bg-[#FAF5F5] dark:bg-surface-800/80',
      border: 'border-[#F3E3E3] dark:border-surface-700/60',
      title: 'text-[#5A0D1A] dark:text-[#F5CCD6]',
      button: 'bg-[#5A0D1A] text-white',
      watermark: 'text-[#5A0D1A]/5 dark:text-white/5',
    },
    slate: {
      bg: 'bg-[#F8F9FA] dark:bg-surface-800/80',
      border: 'border-surface-200 dark:border-surface-700/60',
      title: 'text-surface-900 dark:text-white',
      button: 'bg-surface-800 text-white',
      watermark: 'text-surface-900/5 dark:text-white/5',
    },
    gold: {
      bg: 'bg-[#FDFBF7] dark:bg-surface-800/80',
      border: 'border-[#F5EED9] dark:border-surface-700/60',
      title: 'text-[#966A1E] dark:text-[#EEDAA2]',
      button: 'bg-[#B48318] text-white',
      watermark: 'text-[#C59B27]/10 dark:text-[#EEDAA2]/5',
    },
    emerald: {
      bg: 'bg-[#F0FDF4] dark:bg-surface-800/80',
      border: 'border-[#DCFCE7] dark:border-surface-700/60',
      title: 'text-[#166534] dark:text-[#86EFAC]',
      button: 'bg-[#15803D] text-white',
      watermark: 'text-[#16A34A]/10 dark:text-white/5',
    },
  };

  const style = themeStyles[theme] || themeStyles.crimson;

  return (
    <Link
      to={to}
      className={`relative overflow-hidden rounded-2xl p-6 ${style.bg} border ${style.border} shadow-xs hover:shadow-md transition-all group flex flex-col justify-between min-h-[140px] cursor-pointer`}
    >
      {/* Background Watermark Icon */}
      {WatermarkIcon && (
        <WatermarkIcon
          className={`absolute -right-2 -bottom-2 w-28 h-28 ${style.watermark} pointer-events-none transition-transform group-hover:scale-105 duration-300`}
        />
      )}

      <div className="relative z-10">
        <h3 className={`font-serif text-lg font-bold ${style.title}`}>
          {title}
        </h3>
        <p className="text-xs text-surface-600 dark:text-surface-400 mt-1 max-w-[220px]">
          {description}
        </p>
      </div>

      <div className="mt-4 relative z-10">
        <div
          className={`w-8 h-8 rounded-full ${style.button} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}
        >
          <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};

export default DashboardActionCard;
