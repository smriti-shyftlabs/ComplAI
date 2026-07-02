import { motion } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function DashboardCard({ title, subtitle, children, actions, className = '', noPadding = false }) {
  const { isDark } = useTheme();

  const cardBg     = isDark ? '#141414' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB';
  const divider    = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9';
  const titleColor = isDark ? '#FAFAFA' : '#111827';
  const subtitleColor = isDark ? '#737373' : '#6B7280';
  const shadow     = isDark
    ? '0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)'
    : '0 1px 3px rgba(0,0,0,0.06)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className={className}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 12,
        boxShadow: shadow,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Top accent strip (light mode only) */}
      {!isDark && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(to right, #2BA090, rgba(43,160,144,0.15))',
          borderRadius: '12px 12px 0 0',
        }} />
      )}

      {(title || subtitle || actions) && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 20px',
          borderBottom: `1px solid ${divider}`,
        }}>
          <div>
            {title && <h3 style={{ fontSize: 13.5, fontWeight: 600, color: titleColor, margin: 0 }}>{title}</h3>}
            {subtitle && <p style={{ fontSize: 12, color: subtitleColor, margin: '2px 0 0' }}>{subtitle}</p>}
          </div>
          {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{actions}</div>}
        </div>
      )}
      <div style={noPadding ? {} : { padding: '20px 24px' }}>
        {children}
      </div>
    </motion.div>
  );
}
