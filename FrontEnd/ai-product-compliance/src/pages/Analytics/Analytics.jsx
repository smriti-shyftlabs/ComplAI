import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { getAnalytics } from '../../services/metaService';
import { useTheme } from '../../context/ThemeContext';

// Illustrative time-series (no per-month history is stored server-side).
const approvalRate = [
  { month: 'Jul', rate: 78, rejected: 22 },
  { month: 'Aug', rate: 82, rejected: 18 },
  { month: 'Sep', rate: 80, rejected: 20 },
  { month: 'Oct', rate: 85, rejected: 15 },
  { month: 'Nov', rate: 88, rejected: 12 },
  { month: 'Dec', rate: 87, rejected: 13 }
];

const aiAccuracy = [
  { month: 'Jul', accuracy: 91 },
  { month: 'Aug', accuracy: 93 },
  { month: 'Sep', accuracy: 92 },
  { month: 'Oct', accuracy: 95 },
  { month: 'Nov', accuracy: 96 },
  { month: 'Dec', accuracy: 97 }
];

function ChartCard({ title, subtitle, children, isDark, cardBg, cardBorder, titleColor, subtitleColor, dividerColor }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 12,
        boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}
    >
      <div style={{ padding: '16px 20px', borderBottom: `1px solid ${dividerColor}` }}>
        <h3 style={{ fontSize: 13.5, fontWeight: 600, color: titleColor, margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: 12, color: subtitleColor, margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
      <div style={{ padding: '16px 20px' }}>{children}</div>
    </motion.div>
  );
}

function CustomTooltip({ active, payload, label, isDark, unit = '' }) {
  if (!active || !payload?.length) return null;
  const bg     = isDark ? '#1C1C1C' : '#FFFFFF';
  const border = isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB';
  const lbl    = isDark ? '#FAFAFA' : '#111827';
  const sub    = isDark ? '#A3A3A3' : '#6B7280';
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
      {label && <p style={{ fontSize: 11, color: sub, marginBottom: 4 }}>{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: 13, fontWeight: 600, color: p.color || lbl, margin: '2px 0' }}>
          {p.name}: <span style={{ color: lbl }}>{p.value}{unit}</span>
        </p>
      ))}
    </div>
  );
}

export default function Analytics() {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);

  useEffect(() => {
    getAnalytics().then(setData).catch(() => setData(null));
  }, []);

  const trend = data?.complianceTrend || [];
  const statusData = data?.statusDistribution || [];
  const categoryByCompliance = (data?.categoryBreakdown || []).map(c => ({
    name: c.name.length > 10 ? c.name.substring(0, 10) + '…' : c.name,
    fullName: c.name,
    avg: c.avg,
    products: c.value,
  }));

  // Color tokens
  const pageBg      = isDark ? '#0A0A0A' : 'transparent';
  const cardBg      = isDark ? '#141414' : '#FFFFFF';
  const cardBorder  = isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB';
  const dividerColor = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9';
  const titleColor  = isDark ? '#FAFAFA' : '#111827';
  const subtitleColor = isDark ? '#737373' : '#6B7280';
  const tickColor   = isDark ? '#525252' : '#94A3B8';
  const gridColor   = isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9';
  const legendColor = isDark ? '#A3A3A3' : '#6B7280';

  const chartCardProps = { isDark, cardBg, cardBorder, titleColor, subtitleColor, dividerColor };

  const kpis = [
    {
      label: 'Avg Compliance Score',
      value: data ? `${data.kpi.avgComplianceScore}%` : '—',
      grad: isDark ? 'linear-gradient(135deg, #1A4A44, #0C2E2A)' : 'linear-gradient(135deg, #2BA090, #1F7A6E)',
      glow: 'rgba(43,160,144,0.3)',
    },
    {
      label: 'AI Accuracy',
      value: '96.8%',
      grad: isDark ? 'linear-gradient(135deg, #1A4A44, #0C2E2A)' : 'linear-gradient(135deg, #2BA090, #1F7A6E)',
      glow: 'rgba(43,160,144,0.3)',
    },
    {
      label: 'Approval Rate',
      value: data ? `${data.kpi.approvalRate}%` : '—',
      grad: isDark ? 'linear-gradient(135deg, #2E1A4A, #1C0C2E)' : 'linear-gradient(135deg, #7C3AED, #5B21B6)',
      glow: 'rgba(124,58,237,0.3)',
    },
    {
      label: 'Reports Generated',
      value: data ? data.kpi.reportsGenerated : '—',
      grad: isDark ? 'linear-gradient(135deg, #4A2A1A, #2E1A0C)' : 'linear-gradient(135deg, #EA580C, #C2410C)',
      glow: 'rgba(234,88,12,0.3)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: titleColor, margin: 0 }}>Analytics</h1>
        <p style={{ fontSize: 13, color: subtitleColor, marginTop: 2 }}>Compliance performance metrics and insights</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: kpi.grad,
              borderRadius: 12,
              padding: '16px 20px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: isDark ? `0 4px 20px ${kpi.glow}` : '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            {/* subtle top-right glow circle */}
            <div style={{
              position: 'absolute', top: -20, right: -20,
              width: 80, height: 80,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              pointerEvents: 'none',
            }} />
            <p style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF', margin: 0 }}>{kpi.value}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance by Category */}
        <ChartCard title="Compliance Score by Category" subtitle="Average compliance score per product category" {...chartCardProps}>
          <div style={{ height: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryByCompliance} margin={{ top: 5, right: 10, left: -10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: tickColor }} angle={-30} textAnchor="end" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickColor }} domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip isDark={isDark} unit="%" />} />
                <Bar dataKey="avg" fill="#2BA090" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Product Status Distribution */}
        <ChartCard title="Product Status Distribution" subtitle="Current status breakdown" {...chartCardProps}>
          <div style={{ height: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip isDark={isDark} />} />
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: legendColor }}>{v}</span>} iconSize={8} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Approval Rate */}
        <ChartCard title="Approval vs Rejection Rate" subtitle="Last 6 months trend" {...chartCardProps}>
          <div style={{ height: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={approvalRate} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip isDark={isDark} unit="%" />} />
                <Legend formatter={(v) => <span style={{ fontSize: 12, color: legendColor }}>{v}</span>} />
                <Bar dataKey="rate" name="Approval Rate" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="rejected" name="Rejection Rate" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* AI Accuracy Trend */}
        <ChartCard title="AI Accuracy Trend" subtitle="AI compliance detection accuracy over time" {...chartCardProps}>
          <div style={{ height: 256 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aiAccuracy} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={isDark ? 0.25 : 0.15} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                <YAxis domain={[88, 100]} tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip isDark={isDark} unit="%" />} />
                <Area type="monotone" dataKey="accuracy" name="AI Accuracy" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#aiGradient)" dot={{ fill: '#8B5CF6', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Monthly Trend Full Width */}
      <ChartCard title="Full Year Compliance & Approval Trend" subtitle="Monthly overview of compliance scores and approval volumes" {...chartCardProps}>
        <div style={{ height: 288 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
              <Legend formatter={(v) => <span style={{ fontSize: 12, color: legendColor }}>{v}</span>} />
              <Line type="monotone" dataKey="score" name="Compliance Score %" stroke="#2BA090" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="approved" name="Approved" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
