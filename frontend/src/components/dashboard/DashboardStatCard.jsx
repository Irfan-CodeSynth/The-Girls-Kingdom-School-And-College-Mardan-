import React from 'react';
import { Link } from 'react-router';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '../ui';

export const DashboardStatCard = ({
  icon: Icon,
  iconBg = 'bg-[#701422] text-white',
  value = 0,
  label = 'Metric',
  to,
  loading = false,
}) => {
  const content = (
    <div className="bg-white rounded-2xl p-4 border border-[#EFE5E0] shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer h-full">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform ${iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-7 w-14 mb-1" />
          ) : (
            <p className="font-serif text-2xl font-bold text-[#111827] leading-none truncate">
              {value}
            </p>
          )}
          <p className="text-xs font-semibold text-[#4B5563] mt-1 truncate font-sans">
            {label}
          </p>
        </div>
      </div>
      <div className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 group-hover:text-[#5A0D1A] group-hover:border-[#5A0D1A] transition-colors shrink-0 ml-2">
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );

  return to ? <Link to={to} className="block h-full">{content}</Link> : content;
};

export default DashboardStatCard;
