import React from 'react';

export const Skeleton = ({
  className = '',
  variant = 'rect',
  ...props
}) => {
  const variantStyles = {
    circle: 'rounded-full',
    rect: 'rounded-xl',
    text: 'rounded-md h-4',
  };

  return (
    <div
      className={`animate-pulse bg-[#EFE5E0]/70 ${variantStyles[variant] || 'rounded-xl'} ${className}`}
      {...props}
    />
  );
};

export default Skeleton;
