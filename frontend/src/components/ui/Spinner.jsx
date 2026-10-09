import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const colorMap = {
    primary: 'text-[#5A0D1A]',
    white: 'text-white',
    gray: 'text-[#9CA3AF]',
  };

  return (
    <Loader2
      className={`animate-spin ${sizeMap[size] || sizeMap.md} ${colorMap[color] || colorMap.primary} ${className}`}
    />
  );
};

export default Spinner;
