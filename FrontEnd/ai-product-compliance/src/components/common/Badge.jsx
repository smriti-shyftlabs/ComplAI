import { useTheme } from '../../context/ThemeContext';

// Per-variant color tokens for dark and light mode
const variantTokens = {
  success: {
    light: { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0', dot: '#10B981' },
    dark:  { bg: 'rgba(16,185,129,0.12)', color: '#34D399', border: 'rgba(16,185,129,0.25)', dot: '#10B981', glow: 'rgba(16,185,129,0.2)' },
  },
  warning: {
    light: { bg: '#FFFBEB', color: '#92400E', border: '#FDE68A', dot: '#F59E0B' },
    dark:  { bg: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: 'rgba(245,158,11,0.25)', dot: '#F59E0B', glow: 'rgba(245,158,11,0.2)' },
  },
  danger: {
    light: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA', dot: '#EF4444' },
    dark:  { bg: 'rgba(239,68,68,0.12)', color: '#FCA5A5', border: 'rgba(239,68,68,0.25)', dot: '#EF4444', glow: 'rgba(239,68,68,0.2)' },
  },
  info: {
    light: { bg: '#F0FAF8', color: '#0C3530', border: '#99E6DC', dot: '#2BA090' },
    dark:  { bg: 'rgba(43,160,144,0.12)', color: '#2CB5A3', border: 'rgba(43,160,144,0.25)', dot: '#2CB5A3', glow: 'rgba(43,160,144,0.2)' },
  },
  gray: {
    light: { bg: '#F9FAFB', color: '#4B5563', border: '#E5E7EB', dot: '#9CA3AF' },
    dark:  { bg: 'rgba(255,255,255,0.06)', color: '#A3A3A3', border: 'rgba(255,255,255,0.12)', dot: '#737373', glow: 'transparent' },
  },
  purple: {
    light: { bg: '#F5F3FF', color: '#5B21B6', border: '#DDD6FE', dot: '#7C3AED' },
    dark:  { bg: 'rgba(124,58,237,0.12)', color: '#C4B5FD', border: 'rgba(124,58,237,0.25)', dot: '#A78BFA', glow: 'rgba(124,58,237,0.2)' },
  },
  orange: {
    light: { bg: '#FFF7ED', color: '#9A3412', border: '#FED7AA', dot: '#EA580C' },
    dark:  { bg: 'rgba(234,88,12,0.12)', color: '#FDBA74', border: 'rgba(234,88,12,0.25)', dot: '#F97316', glow: 'rgba(234,88,12,0.2)' },
  },
  cyan: {
    light: { bg: '#ECFEFF', color: '#164E63', border: '#A5F3FC', dot: '#06B6D4' },
    dark:  { bg: 'rgba(6,182,212,0.12)', color: '#67E8F9', border: 'rgba(6,182,212,0.25)', dot: '#22D3EE', glow: 'rgba(6,182,212,0.2)' },
  },
};

const sizes = {
  xs: { fontSize: 11, padding: '2px 8px' },
  sm: { fontSize: 12, padding: '3px 10px' },
  md: { fontSize: 13, padding: '4px 12px' },
};

export default function Badge({ children, variant = 'gray', size = 'sm', dot = false, className = '' }) {
  const { isDark } = useTheme();
  const tokens = (variantTokens[variant] || variantTokens.gray)[isDark ? 'dark' : 'light'];
  const sz = sizes[size] || sizes.sm;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontWeight: 500,
        fontSize: sz.fontSize,
        padding: sz.padding,
        borderRadius: 9999,
        background: tokens.bg,
        color: tokens.color,
        border: `1px solid ${tokens.border}`,
        boxShadow: isDark && tokens.glow ? `0 0 0 1px ${tokens.glow}` : 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {dot && (
        <span style={{
          width: 6, height: 6,
          borderRadius: '50%',
          background: tokens.dot,
          flexShrink: 0,
        }} />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const config = {
    pending:   { variant: 'warning', label: 'Pending' },
    approved:  { variant: 'info',    label: 'Approved' },
    rejected:  { variant: 'danger',  label: 'Rejected' },
    published: { variant: 'success', label: 'Published' },
  };
  const { variant, label } = config[status] || { variant: 'gray', label: status };
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function RiskBadge({ risk }) {
  const config = {
    low:    { variant: 'success', label: 'Low Risk' },
    medium: { variant: 'warning', label: 'Medium Risk' },
    high:   { variant: 'danger',  label: 'High Risk' },
  };
  const { variant, label } = config[risk] || { variant: 'gray', label: risk };
  return <Badge variant={variant}>{label}</Badge>;
}

export function SeverityBadge({ severity }) {
  const config = {
    critical: { variant: 'danger',  label: 'Critical' },
    high:     { variant: 'orange',  label: 'High' },
    medium:   { variant: 'warning', label: 'Medium' },
    low:      { variant: 'info',    label: 'Low' },
  };
  const { variant, label } = config[severity] || { variant: 'gray', label: severity };
  return <Badge variant={variant} size="xs">{label}</Badge>;
}
