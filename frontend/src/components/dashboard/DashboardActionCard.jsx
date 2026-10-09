import React from 'react';
import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';

export const DashboardActionCard = ({
  title = 'Action Title',
  description = 'Brief action description text.',
  to = '#',
  theme = 'crimson',
  watermarkIcon: WatermarkIcon,
}) => {
  const themeStyles = {
    crimson: {
      bg: 'bg-[#FAF5F5]',
      border: 'border-[#F3E3E3]',
      title: 'text-[#5A0D1A]',
      description: 'text-[#4B5563]',
      button: 'bg-[#5A0D1A] text-white',
      watermark: 'text-[#5A0D1A]/5',
    },
    slate: {
      bg: 'bg-[#F8F9FA]',
      border: 'border-gray-200',
      title: 'text-[#111827]',
      description: 'text-[#4B5563]',
      button: 'bg-[#1F2937] text-white',
      watermark: 'text-[#1F2937]/5',
    },
    gold: {
      bg: 'bg-[#FDFBF7]',
      border: 'border-[#F5EED9]',
      title: 'text-[#966A1E]',
      description: 'text-[#4B5563]',
      button: 'bg-[#B48318] text-white',
      watermark: 'text-[#C59B27]/10',
    },
    emerald: {
      bg: 'bg-[#F0FDF4]',
      border: 'border-[#DCFCE7]',
      title: 'text-[#166534]',
      description: 'text-[#4B5563]',
      button: 'bg-[#15803D] text-white',
      watermark: 'text-[#16A34A]/10',
    },
  };

  const style = themeStyles[theme] || themeStyles.crimson;

  return (
    <Link
      to={to}
      className={`relative overflow-hidden rounded-2xl p-6 ${style.bg} border ${style.border} shadow-xs hover:shadow-md transition-all group flex flex-col justify-between min-h-[140px] cursor-pointer`}
    >
      {WatermarkIcon && (
        <WatermarkIcon
          className={`absolute -right-2 -bottom-2 w-28 h-28 ${style.watermark} pointer-events-none transition-transform group-hover:scale-105 duration-300`}
        />
      )}

      <div className="relative z-10">
        <h3 className={`font-serif text-lg font-bold ${style.title}`}>
          {title}
        </h3>
        <p className={`text-xs ${style.description} mt-1 max-w-[220px] font-sans`}>
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
