import React from 'react';

export const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  className = '',
  maxLength,
  value,
  rows = 4,
  ...props
}, ref) => {
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {label && (
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-200">
            {label}
          </label>
        )}
        {maxLength && (
          <span className="text-xs text-surface-400">
            {currentLength} / {maxLength}
          </span>
        )}
      </div>
      <textarea
        ref={ref}
        rows={rows}
        maxLength={maxLength}
        value={value}
        className={`
          block w-full rounded-lg border bg-white dark:bg-surface-800 
          text-surface-900 dark:text-white sm:text-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:opacity-50 disabled:bg-surface-50 dark:disabled:bg-surface-900
          px-3 py-2
          ${error 
            ? 'border-danger-500 text-danger-900 placeholder-danger-300 focus:ring-danger-500' 
            : 'border-surface-300 dark:border-surface-600 placeholder-surface-400'}
          ${className}
        `}
        {...props}
      />
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-danger-500' : 'text-surface-500 dark:text-surface-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
