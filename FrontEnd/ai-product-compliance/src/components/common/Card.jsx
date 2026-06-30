import { motion } from 'framer-motion';

export default function Card({
  children,
  title,
  subtitle,
  actions,
  className = '',
  hoverable = false,
  padding = 'default',
  noBorder = false,
  ...props
}) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    default: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8'
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -2, boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' } : undefined}
      transition={{ duration: 0.2 }}
      className={`
        bg-white rounded-xl
        ${noBorder ? '' : 'border border-gray-200'}
        shadow-sm
        ${hoverable ? 'cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || actions) && (
        <div className={`flex items-start justify-between border-b border-gray-100 ${paddingStyles['default']} pb-4 mb-0`}>
          <div>
            {title && <h3 className="text-base font-600 text-gray-900">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2 ml-4">{actions}</div>}
        </div>
      )}
      <div className={title || subtitle || actions ? paddingStyles['default'] : paddingStyles[padding]}>
        {children}
      </div>
    </motion.div>
  );
}
