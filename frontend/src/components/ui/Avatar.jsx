import React from 'react';

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

export const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 'md',
  status,
  className = '',
}) => {
  const getInitials = (text) => {
    if (!text) return 'GK';
    const parts = text.trim().split(' ');
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeMap[size]} rounded-full object-cover border border-surface-200 dark:border-surface-700`}
        />
      ) : (
        <div
          className={`${sizeMap[size]} rounded-full bg-primary-100 dark:bg-primary-900/60 text-primary-700 dark:text-primary-300 font-semibold flex items-center justify-center border border-primary-200 dark:border-primary-800`}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`
            absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-surface-800
            ${status === 'online' ? 'bg-emerald-500' : 'bg-surface-400'}
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
