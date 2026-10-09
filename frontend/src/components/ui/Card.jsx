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
          bg-white rounded-2xl border border-[#EFE5E0]
          shadow-xs ${hasOverflow ? '' : 'overflow-hidden'} ${
            hover
              ? 'hover:shadow-md hover:border-[#5A0D1A]/30 transition-all duration-200'
              : ''
          }
          ${className}
        `}
        {...props}
      >
        {header && (
          <div className="px-5 py-3.5 border-b border-[#EFE5E0] bg-[#FAF8F5]">
            {header}
          </div>
        )}
        <div className={`p-5 ${bodyClassName}`}>{children}</div>
        {footer && (
          <div className="px-5 py-3.5 bg-[#FAF8F5] border-t border-[#EFE5E0]">
            {footer}
          </div>
        )}
      </motion.div>
    );
  }

  // When no header/footer, motion.div directly houses children
  const hasCustomPadding = /(^|\s)(p|px|py|pt|pb|pl|pr)-\d+/.test(className) || className.includes('!p-');
  const defaultPadding = hasCustomPadding ? '' : 'p-5';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        bg-white rounded-2xl border border-[#EFE5E0]
        shadow-xs ${hasOverflow ? '' : 'overflow-hidden'} ${
          hover
            ? 'hover:shadow-md hover:border-[#5A0D1A]/30 transition-all duration-200'
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
