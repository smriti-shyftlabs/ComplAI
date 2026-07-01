import { forwardRef } from 'react';

const Input = forwardRef(function Input({
  label,
  error,
  helperText,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  inputClassName = '',
  required,
  disabled,
  id,
  type = 'text',
  ...props
}, ref) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-500 text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className={`
            w-full rounded-lg border text-sm text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent
            disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400
            transition-all duration-150
            ${Icon && iconPosition === 'left' ? 'pl-9' : 'pl-3'}
            ${Icon && iconPosition === 'right' ? 'pr-9' : 'pr-3'}
            py-2.5
            ${error
              ? 'border-red-300 bg-red-50 focus:ring-red-500'
              : 'border-gray-300 bg-white hover:border-gray-400'
            }
            ${inputClassName}
          `}
          {...props}
        />
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

export default Input;
