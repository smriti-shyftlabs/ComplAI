import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

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

// Per-color icon gradient and border accent — works in both themes via inline styles
const colorTokens = {
  teal:   { grad: ['rgba(43,160,144,0.18)', 'rgba(43,160,144,0.05)'], icon: '#2CB5A3', border: '#2BA090' },
  blue:   { grad: ['rgba(43,160,144,0.18)', 'rgba(43,160,144,0.05)'], icon: '#2CB5A3', border: '#2BA090' },
  green:  { grad: ['rgba(43,160,144,0.18)', 'rgba(43,160,144,0.05)'], icon: '#2CB5A3', border: '#2BA090' },
  yellow: { grad: ['rgba(234,179,8,0.18)',   'rgba(234,179,8,0.05)'],  icon: '#CA8A04', border: '#EAB308' },
  red:    { grad: ['rgba(239,68,68,0.18)',   'rgba(239,68,68,0.05)'],  icon: '#EF4444', border: '#EF4444' },
  purple: { grad: ['rgba(147,51,234,0.18)', 'rgba(147,51,234,0.05)'], icon: '#A855F7', border: '#9333EA' },
};

export default function StatCard({ label, value, trend, change, icon: Icon, color = 'blue', subtitle }) {
  const { isDark } = useTheme();
  const isStringValue = typeof value === 'string' && value.includes('%');
  const numValue = isStringValue ? parseFloat(value) : value;
  const animated = useCounter(numValue);
  const displayValue = isStringValue ? `${animated}%` : animated;

  const tokens = colorTokens[color] || colorTokens.teal;
  const isUp = trend === 'up';
  const isPositive = (isUp && change > 0) || (!isUp && change < 0);

  const cardBg    = isDark ? '#141414' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB';
  const labelColor = isDark ? '#737373' : '#6B7280';
  const valueColor = isDark ? '#FAFAFA' : '#111827';
  const subtitleColor = isDark ? '#525252' : '#9CA3AF';
  const trendPos  = isDark ? '#2CB5A3' : '#0D7A6E';
  const trendNeg  = isDark ? '#F87171' : '#EF4444';
  const trendMuted = isDark ? '#525252' : '#9CA3AF';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderLeft: `4px solid ${tokens.border}`,
        borderRadius: 12,
        padding: '20px 24px',
        boxShadow: isDark
          ? '0 1px 3px rgba(0,0,0,0.5)'
          : '0 1px 3px rgba(12,53,48,0.06), 0 4px 12px rgba(12,53,48,0.04)',
        transition: 'box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = isDark
          ? '0 4px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)'
          : '0 4px 20px rgba(12,53,48,0.1), 0 1px 4px rgba(12,53,48,0.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = isDark
          ? '0 1px 3px rgba(0,0,0,0.5)'
          : '0 1px 3px rgba(12,53,48,0.06), 0 4px 12px rgba(12,53,48,0.04)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, color: labelColor, fontWeight: 500, marginBottom: 4 }}>{label}</p>
          <p style={{ fontSize: 28, fontWeight: 700, color: valueColor, lineHeight: 1.1 }}>
            {displayValue}
          </p>
          {subtitle && <p style={{ fontSize: 11, color: subtitleColor, marginTop: 4 }}>{subtitle}</p>}
        </div>
        {Icon && (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${tokens.grad[0]}, ${tokens.grad[1]})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: `1px solid ${tokens.icon}22`,
            }}
          >
            <Icon style={{ width: 20, height: 20, color: tokens.icon }} />
          </div>
        )}
      </div>

      {change !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12 }}>
          {isUp
            ? <FiTrendingUp style={{ width: 14, height: 14, color: isPositive ? trendPos : trendNeg }} />
            : <FiTrendingDown style={{ width: 14, height: 14, color: isPositive ? trendPos : trendNeg }} />
          }
          <span style={{ fontSize: 13, fontWeight: 600, color: isPositive ? trendPos : trendNeg }}>
            {Math.abs(change)}%
          </span>
          <span style={{ fontSize: 12, color: trendMuted }}>vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
