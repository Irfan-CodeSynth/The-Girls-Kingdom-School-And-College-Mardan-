import React from 'react';
import { motion } from 'motion/react';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-[#5A0D1A] hover:bg-[#420812] text-white shadow-xs',
  secondary: 'bg-[#FAF8F5] text-[#111827] border border-[#EFE5E0] hover:bg-[#F3EFEA]',
  danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs',
  ghost: 'hover:bg-gray-100 text-gray-700',
  outline: 'border border-[#EFE5E0] bg-white hover:bg-[#FAF8F5] text-[#111827] shadow-2xs',
};

const sizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = React.forwardRef(({ 
  children, variant = 'primary', size = 'md', className = '', 
  loading = false, disabled = false, leftIcon, rightIcon, ...props 
}, ref) => {
  const classes = `inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:pointer-events-none ${variants[variant]} ${sizes[size]} ${className}`;
  
  return (
    <motion.button
      ref={ref}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </motion.button>
  );
});

Button.displayName = 'Button';
export default Button;
