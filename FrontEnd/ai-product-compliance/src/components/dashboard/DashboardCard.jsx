import { motion } from 'framer-motion';

export default function DashboardCard({ title, subtitle, children, actions, className = '', noPadding = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100">
          <div>
            {title && <h3 className="text-sm font-600 text-gray-900">{title}</h3>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5 sm:p-6'}>
        {children}
      </div>
    </motion.div>
  );
}
