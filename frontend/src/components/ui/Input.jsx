import React, { useId } from 'react';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  className = '',
  id: providedId,
  ...props
}, ref) => {
  const autoId = useId();
  const inputId = providedId || autoId;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-surface-700 dark:text-surface-200 mb-1">
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
          id={inputId}
          className={`
            block w-full rounded-xl border bg-white 
            text-[#111827] sm:text-sm transition-colors font-sans
            focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]
            disabled:opacity-50 disabled:bg-[#FAFAFA]
            ${leftIcon ? 'pl-10' : 'pl-3.5'} pr-3.5 py-2.5
            ${error 
              ? 'border-danger-500 text-danger-900 placeholder-danger-300 focus:ring-danger-500' 
              : 'border-[#EFE5E0] placeholder:text-gray-400'}
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
