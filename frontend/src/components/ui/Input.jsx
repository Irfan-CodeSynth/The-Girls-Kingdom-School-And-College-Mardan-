import React from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`
            block w-full rounded-lg border bg-white dark:bg-surface-800 
            text-surface-900 dark:text-white sm:text-sm transition-colors
            focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
            disabled:opacity-50 disabled:bg-surface-50 dark:disabled:bg-surface-900
            ${leftIcon ? 'pl-10' : 'pl-3'} pr-3 py-2
            ${error 
              ? 'border-danger-500 text-danger-900 placeholder-danger-300 focus:ring-danger-500' 
              : 'border-surface-300 dark:border-surface-600 placeholder-surface-400'}
            ${className}
          `}
          {...props}
        />
      </div>
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-danger-500' : 'text-surface-500 dark:text-surface-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
