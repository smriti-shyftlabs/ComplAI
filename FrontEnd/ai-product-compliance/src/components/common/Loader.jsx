import { useTheme } from '../../context/ThemeContext';

export function Spinner({ size = 'md', color = 'blue' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  const colors = {
    blue: 'text-teal-700',
    white: 'text-white',
    gray: 'text-gray-400',
    green: 'text-teal-700'
  };
  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colors[color]}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
    </div>
  );
}

export function SkeletonCard() {
  const { isDark } = useTheme();
  const shimmer = isDark ? '#1E3530' : '#E5E7EB';
  const shimmerAlt = isDark ? '#162C28' : '#F3F4F6';
  const bg = isDark ? '#112320' : '#FFFFFF';
  const border = isDark ? 'rgba(43,160,144,0.12)' : '#E5E7EB';
  return (
    <div
      className="animate-pulse rounded-xl p-6"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <div className="flex items-center gap-4 mb-4">
        <div style={{ width: 48, height: 48, borderRadius: 12, background: shimmer, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ height: 14, background: shimmer, borderRadius: 6, width: '70%' }} />
          <div style={{ height: 11, background: shimmerAlt, borderRadius: 6, width: '45%' }} />
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ height: 11, background: shimmerAlt, borderRadius: 6, width: '100%' }} />
        <div style={{ height: 11, background: shimmer,    borderRadius: 6, width: '84%' }} />
        <div style={{ height: 11, background: shimmerAlt, borderRadius: 6, width: '62%' }} />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  const { isDark } = useTheme();
  const shimmer    = isDark ? '#1E3530' : '#E5E7EB';
  const shimmerAlt = isDark ? '#162C28' : '#F3F4F6';
  const divider    = isDark ? 'rgba(43,160,144,0.1)' : '#F1F5F9';
  return (
    <div className="animate-pulse">
      <div style={{ height: 40, background: shimmerAlt, borderRadius: 8, marginBottom: 12 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: `1px solid ${divider}` }}
        >
          <div style={{ height: 14, background: shimmer,    borderRadius: 6, flex: '0 0 18%' }} />
          <div style={{ height: 14, background: shimmerAlt, borderRadius: 6, flex: '0 0 24%' }} />
          <div style={{ height: 14, background: shimmer,    borderRadius: 6, flex: '0 0 14%' }} />
          <div style={{ height: 14, background: shimmerAlt, borderRadius: 6, flex: '0 0 12%' }} />
          <div style={{ height: 14, background: shimmer,    borderRadius: 6, flex: '0 0 16%' }} />
        </div>
      ))}
    </div>
  );
}

export default function Loader() {
  return <PageLoader />;
}
