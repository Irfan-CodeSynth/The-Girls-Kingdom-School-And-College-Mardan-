import React from 'react';
import { motion } from 'motion/react';

export const Card = ({
  children,
  className = '',
  hover = false,
  header,
  footer,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        bg-white dark:bg-surface-800 rounded-xl border border-surface-200 dark:border-surface-700
        shadow-sm overflow-hidden ${hover ? 'hover:shadow-md transition-shadow' : ''}
        ${className}
      `}
      {...props}
    >
      {header && (
        <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700">
          {header}
        </div>
      )}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-surface-50 dark:bg-surface-900/40 border-t border-surface-200 dark:border-surface-700">
          {footer}
        </div>
      )}
    </motion.div>
  );
};

export default Card;
