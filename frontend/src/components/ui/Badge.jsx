import React from 'react';

const variantStyles = {
  default: 'bg-[#FAF8F5] text-[#4B5563] border border-[#EFE5E0]',
  secondary: 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]',
  primary: 'bg-[#FAF8F5] text-[#5A0D1A] border border-[#EFE5E0]',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border border-rose-200',
  info: 'bg-sky-50 text-sky-700 border border-sky-200',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variantStyles[variant] || variantStyles.default} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === 'success'
              ? 'bg-emerald-500'
              : variant === 'warning'
              ? 'bg-amber-500'
              : variant === 'danger'
              ? 'bg-rose-500'
              : variant === 'primary'
              ? 'bg-primary-500'
              : 'bg-surface-400'
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
