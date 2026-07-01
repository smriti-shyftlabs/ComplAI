import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

function useCounter(target, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const numTarget = typeof target === 'string' ? parseFloat(target) : target;
    if (isNaN(numTarget)) { setCount(target); return; }
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * numTarget);
      setCount(current);
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

const colorConfig = {
  teal: { icon: 'bg-teal-100 text-teal-700', border: 'border-l-teal-600' },
  blue: { icon: 'bg-teal-100 text-teal-700', border: 'border-l-teal-600' },
  green: { icon: 'bg-teal-100 text-teal-700', border: 'border-l-teal-600' },
  yellow: { icon: 'bg-yellow-100 text-yellow-600', border: 'border-l-yellow-500' },
  red: { icon: 'bg-red-100 text-red-600', border: 'border-l-red-500' },
  purple: { icon: 'bg-purple-100 text-purple-600', border: 'border-l-purple-500' }
};

export default function StatCard({ label, value, trend, change, icon: Icon, color = 'blue', subtitle }) {
  const isStringValue = typeof value === 'string' && value.includes('%');
  const numValue = isStringValue ? parseFloat(value) : value;
  const animated = useCounter(numValue);
  const displayValue = isStringValue ? `${animated}%` : animated;

  const { icon: iconClass, border: borderClass } = colorConfig[color] || colorConfig.blue;
  const isUp = trend === 'up';
  const isPositive = (isUp && change > 0) || (!isUp && change < 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bg-white rounded-xl border border-gray-200 border-l-4 ${borderClass} p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500 font-500 mb-1">{label}</p>
          <p className="text-2xl sm:text-3xl font-700 text-gray-900 leading-tight">
            {displayValue}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div className={`flex items-center gap-1.5 mt-3 text-sm ${isPositive ? 'text-teal-700' : 'text-red-500'}`}>
          {isUp ? <FiTrendingUp className="w-3.5 h-3.5" /> : <FiTrendingDown className="w-3.5 h-3.5" />}
          <span className="font-600">{Math.abs(change)}%</span>
          <span className="text-gray-400 font-400">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
