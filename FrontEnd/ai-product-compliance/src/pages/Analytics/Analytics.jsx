import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import { getAnalytics } from '../../services/metaService';

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

function ChartCard({ title, subtitle, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6"
    >
      <div className="mb-4">
        <h3 className="text-sm font-600 text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export default function Analytics() {
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

  const kpis = [
    { label: 'Avg Compliance Score', value: data ? `${data.kpi.avgComplianceScore}%` : '—', color: 'bg-blue-600' },
    { label: 'AI Accuracy', value: '96.8%', color: 'bg-green-600' },
    { label: 'Approval Rate', value: data ? `${data.kpi.approvalRate}%` : '—', color: 'bg-purple-600' },
    { label: 'Reports Generated', value: data ? data.kpi.reportsGenerated : '—', color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-700 text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Compliance performance metrics and insights</p>
      </div>

      {/* Top KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`${kpi.color} text-white rounded-xl p-4`}>
            <p className="text-2xl font-700">{kpi.value}</p>
            <p className="text-xs opacity-80 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance by Category */}
        <ChartCard title="Compliance Score by Category" subtitle="Average compliance score per product category">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryByCompliance} margin={{ top: 5, right: 10, left: -10, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94A3B8' }} angle={-30} textAnchor="end" axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} domain={[0, 100]} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v}%`, 'Avg Score']} />
                <Bar dataKey="avg" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Product Status Distribution */}
        <ChartCard title="Product Status Distribution" subtitle="Current status breakdown">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} cx="50%" cy="45%" innerRadius={60} outerRadius={85} paddingAngle={3} dataKey="value">
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} products`, '']} />
                <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} iconSize={8} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Approval Rate */}
        <ChartCard title="Approval vs Rejection Rate" subtitle="Last 6 months trend">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={approvalRate} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v}%`, '']} />
                <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
                <Bar dataKey="rate" name="Approval Rate" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="rejected" name="Rejection Rate" fill="#EF4444" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* AI Accuracy Trend */}
        <ChartCard title="AI Accuracy Trend" subtitle="AI compliance detection accuracy over time">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={aiAccuracy} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="aiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis domain={[88, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => [`${v}%`, 'Accuracy']} />
                <Area type="monotone" dataKey="accuracy" name="AI Accuracy" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#aiGradient)" dot={{ fill: '#8B5CF6', r: 4, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Monthly Trend Full Width */}
      <ChartCard title="Full Year Compliance & Approval Trend" subtitle="Monthly overview of compliance scores and approval volumes">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend formatter={(v) => <span className="text-xs text-gray-600">{v}</span>} />
              <Line type="monotone" dataKey="score" name="Compliance Score %" stroke="#3B82F6" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="approved" name="Approved" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </div>
  );
}
