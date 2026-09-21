import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rect',
  ...props
}) => {
  const variantStyles = {
    circle: 'rounded-full',
    rect: 'rounded-lg',
    text: 'rounded h-4',
  };

  return (
    <div
      className={`animate-pulse bg-surface-200 dark:bg-surface-700 ${variantStyles[variant] || 'rounded-lg'} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
