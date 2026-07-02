import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { getComplianceColor } from '../../utils/helpers';
import { useTheme } from '../../context/ThemeContext';

export default function ComplianceScore({ score = 0, size = 'lg', showLabel = true }) {
  const { isDark } = useTheme();
  const sizes = {
    sm: { container: 'w-20 h-20', text: 'text-xl', label: 'text-xs', stroke: 4, r: 32 },
    md: { container: 'w-28 h-28', text: 'text-2xl', label: 'text-xs', stroke: 6, r: 44 },
    lg: { container: 'w-40 h-40', text: 'text-4xl', label: 'text-sm', stroke: 8, r: 64 }
  };

  const { container, text, label, stroke, r } = sizes[size] || sizes.lg;
  const { color, label: colorLabel } = getComplianceColor(score);
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${container} relative`}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${(r + stroke) * 2} ${(r + stroke) * 2}`}>
          {/* Track */}
          <circle
            cx={r + stroke}
            cy={r + stroke}
            r={r}
            fill="none"
            stroke={isDark ? '#2A2A2A' : '#F1F5F9'}
            strokeWidth={stroke}
          />
          {/* Progress */}
          <motion.circle
            cx={r + stroke}
            cy={r + stroke}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            style={isDark ? { filter: `drop-shadow(0 0 6px ${color}70)` } : {}}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`${text} font-700 leading-none`}
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          <span className={`${label} font-500`} style={{ color: isDark ? '#525252' : '#6B7280' }}>/ 100</span>
        </div>
      </div>
      {showLabel && (
        <div className="text-center">
          <span className="text-sm font-600 px-3 py-1 rounded-full" style={{ backgroundColor: `${color}18`, color }}>
            {colorLabel} Compliance
          </span>
        </div>
      )}
    </div>
  );
}
