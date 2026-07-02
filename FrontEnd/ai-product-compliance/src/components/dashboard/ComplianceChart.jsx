import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: isDark ? '#1A3530' : '#ffffff',
      border: `1px solid ${isDark ? 'rgba(43,160,144,0.3)' : '#E2E8F0'}`,
      borderRadius: 10,
      padding: '10px 14px',
      boxShadow: isDark
        ? '0 8px 24px rgba(0,0,0,0.5)'
        : '0 8px 24px rgba(12,53,48,0.12)',
      minWidth: 140,
    }}>
      <p style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#DDF0ED' : '#111827', marginBottom: 8 }}>
        {label}
      </p>
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: isDark ? '#9ECDC7' : '#6B7280' }}>{entry.name}:</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#DDF0ED' : '#111827' }}>
            {entry.name === 'Compliance Score' ? `${entry.value}%` : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function ComplianceChart({ data = [] }) {
  const { isDark } = useTheme();

  const gridColor   = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
  const tickColor   = isDark ? '#4A9B90' : '#94A3B8';

  return (
    <div className="h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2BA090" stopOpacity={isDark ? 0.25 : 0.15} />
              <stop offset="95%" stopColor="#2BA090" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="approvedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10B981" stopOpacity={isDark ? 0.2 : 0.12} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />

          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: tickColor }}
            axisLine={false}
            tickLine={false}
            width={35}
          />

          <Tooltip content={(props) => <CustomTooltip {...props} isDark={isDark} />} />

          <Area
            type="monotone"
            dataKey="score"
            name="Compliance Score"
            stroke="#2BA090"
            strokeWidth={2.5}
            fill="url(#scoreGradient)"
            dot={{ fill: '#2BA090', r: 3, strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="approved"
            name="Approved"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#approvedGradient)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
