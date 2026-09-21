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
      <div className="w-12 h-12 rounded-2xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-400 dark:text-surface-300 mb-4 shadow-inner">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-base font-semibold text-surface-900 dark:text-white">
        {title}
      </h4>
      <p className="mt-1 text-sm text-surface-500 dark:text-surface-400 max-w-sm">
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
