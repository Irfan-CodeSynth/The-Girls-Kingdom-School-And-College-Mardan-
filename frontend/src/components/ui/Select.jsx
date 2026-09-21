import React from 'react';

export const Select = React.forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder,
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
      <select
        ref={ref}
        className={`
          block w-full rounded-lg border bg-white dark:bg-surface-800 
          text-surface-900 dark:text-white sm:text-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
          disabled:opacity-50 disabled:bg-surface-50 dark:disabled:bg-surface-900
          px-3 py-2
          ${error 
            ? 'border-danger-500 text-danger-900 focus:ring-danger-500' 
            : 'border-surface-300 dark:border-surface-600'}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-white dark:bg-surface-800 text-surface-400">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
          >
            {opt.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <p className={`mt-1 text-sm ${error ? 'text-danger-500' : 'text-surface-500 dark:text-surface-400'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
