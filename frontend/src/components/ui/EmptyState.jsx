import React from 'react';
import { motion } from 'motion/react';
import { Inbox } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Data Found',
  description = 'There are currently no items to display.',
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center text-center p-8 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#EFE5E0] flex items-center justify-center text-[#5A0D1A] mb-4 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-bold text-[#111827]">
        {title}
      </h4>
      <p className="mt-1 text-sm text-[#6B7280] max-w-sm">
        {description}
      </p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
