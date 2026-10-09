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
    <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 border border-[#EFE5E0] dark:border-surface-700/80 shadow-xs hover:shadow-md transition-all flex items-center justify-between group cursor-pointer h-full">
      <div className="flex items-center gap-3.5 min-w-0">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform ${iconBg}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          {loading ? (
            <Skeleton className="h-7 w-14 mb-1" />
          ) : (
            <p className="font-serif text-2xl font-bold text-surface-900 dark:text-white leading-none truncate">
              {value}
            </p>
          )}
          <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 mt-1 truncate">
            {label}
          </p>
        </div>
      </div>
      <div className="w-7 h-7 rounded-full border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-400 group-hover:text-[#701422] group-hover:border-[#701422] dark:group-hover:text-white transition-colors shrink-0 ml-2">
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );

  return to ? <Link to={to} className="block h-full">{content}</Link> : content;
};

export default DashboardStatCard;
