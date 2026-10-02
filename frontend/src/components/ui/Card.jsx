import React from 'react';
import { motion } from 'motion/react';

export const Card = ({
  children,
  className = '',
  bodyClassName = '',
  hover = false,
  header,
  footer,
  ...props
}) => {
  const hasOverflow = className.includes('overflow-');

  // If header or footer is provided, use structured layout
  if (header || footer) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`
          bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700/80
          shadow-xs ${hasOverflow ? '' : 'overflow-hidden'} ${
            hover
              ? 'hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700/80 transition-all duration-200'
              : ''
          }
          ${className}
        `}
        {...props}
      >
        {header && (
          <div className="px-5 py-3.5 border-b border-surface-200 dark:border-surface-700/80">
            {header}
          </div>
        )}
        <div className={`p-5 ${bodyClassName}`}>{children}</div>
        {footer && (
          <div className="px-5 py-3.5 bg-surface-50/50 dark:bg-surface-900/40 border-t border-surface-200 dark:border-surface-700/80">
            {footer}
          </div>
        )}
      </motion.div>
    );
  }

  // When no header/footer, motion.div directly houses children
  // Only apply default padding if no custom padding was specified in className
  const hasCustomPadding = /(^|\s)(p|px|py|pt|pb|pl|pr)-\d+/.test(className) || className.includes('!p-');
  const defaultPadding = hasCustomPadding ? '' : 'p-5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700/80
        shadow-xs ${hasOverflow ? '' : 'overflow-hidden'} ${
          hover
            ? 'hover:shadow-md hover:border-primary-400/80 dark:hover:border-primary-600/80 transition-all duration-200'
            : ''
        }
        ${defaultPadding}
        ${className}
        ${bodyClassName}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
