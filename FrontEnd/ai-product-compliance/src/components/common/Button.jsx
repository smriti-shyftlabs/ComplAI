import { motion } from 'framer-motion';

const variantStyles = {
  primary: 'text-white border-transparent shadow-sm hover:shadow-md hover:opacity-90',
  secondary: 'bg-white hover:bg-teal-50 border-teal-300 shadow-sm',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent shadow-sm hover:shadow-md',
  ghost: 'bg-transparent hover:bg-teal-100 border-transparent',
  outline: 'bg-transparent hover:opacity-80 border',
  success: 'text-white border-transparent shadow-sm hover:opacity-90',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent shadow-sm'
};

const sizeStyles = {
  xs: 'px-2.5 py-1.5 text-xs gap-1.5',
  sm: 'px-3 py-2 text-sm gap-2',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2.5'
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      className={`
        inline-flex items-center justify-center font-500 border rounded-lg transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={
        variant === 'primary' || variant === 'success'
          ? { background: '#155E56', color: '#F0FAF8' }
          : variant === 'outline'
          ? { color: '#2BA090', borderColor: '#7EC8BE' }
          : variant === 'ghost'
          ? { color: '#2BA090' }
          : variant === 'secondary'
          ? { color: '#0C3530', borderColor: '#BDD8D3' }
          : {}
      }
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </motion.button>
  );
}
