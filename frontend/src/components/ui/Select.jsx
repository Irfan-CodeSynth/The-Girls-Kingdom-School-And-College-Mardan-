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
        <label className="block text-xs font-bold uppercase tracking-wider text-[#374151] mb-1.5 font-sans">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`
          block w-full rounded-xl border bg-white 
          text-[#111827] sm:text-sm transition-colors font-sans
          focus:outline-none focus:ring-2 focus:ring-[#5A0D1A]/20 focus:border-[#5A0D1A]
          disabled:opacity-50 disabled:bg-[#FAFAFA]
          px-3.5 py-2.5
          ${error 
            ? 'border-danger-500 text-danger-900 focus:ring-danger-500' 
            : 'border-[#EFE5E0]'}
          ${className}
        `}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className="bg-white text-gray-400">
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option
            key={opt.value}
            value={opt.value}
            className="bg-white text-[#111827]"
          >
            {opt.label}
          </option>
        ))}
      </select>
      {(error || helperText) && (
        <p className={`mt-1 text-xs ${error ? 'text-danger-600 font-medium' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
