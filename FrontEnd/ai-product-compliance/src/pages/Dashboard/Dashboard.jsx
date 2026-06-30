import { motion } from 'framer-motion';
import { FiPackage, FiShield, FiClock, FiXCircle, FiAlertTriangle, FiAlertCircle, FiInfo, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import StatCard from '../../components/dashboard/StatCard';
import DashboardCard from '../../components/dashboard/DashboardCard';
import ComplianceChart from '../../components/dashboard/ComplianceChart';
import RecentProducts from '../../components/dashboard/RecentProducts';
import QuickActions from '../../components/dashboard/QuickActions';
import { kpiData, categoryDistribution, recentAlerts } from '../../data/dashboardData';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';

const iconMap = { FiPackage, FiShield, FiClock, FiXCircle };
const alertIconMap = { FiAlertTriangle, FiAlertCircle, FiInfo, FiCheckCircle };

const alertTypeStyles = {
  critical: 'bg-red-50 border-l-red-500 text-red-700',
  warning: 'bg-yellow-50 border-l-yellow-500 text-yellow-700',
  info: 'bg-blue-50 border-l-blue-500 text-blue-700',
  success: 'bg-green-50 border-l-green-500 text-green-700'
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-700 text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Monitor your product compliance and catalog governance</p>
        </div>
        <Button icon={FiPackage} onClick={() => navigate('/products')}>
          Add New Product
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, i) => {
          const Icon = iconMap[kpi.icon];
          return (
            <StatCard
              key={kpi.id}
              label={kpi.label}
              value={kpi.value}
              trend={kpi.trend}
              change={kpi.change}
              icon={Icon}
              color={kpi.color}
            />
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Compliance Trend"
          subtitle="12-month compliance score & approval data"
          className="lg:col-span-2"
          actions={
            <button onClick={() => navigate('/analytics')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View Analytics <FiArrowRight className="w-3 h-3" />
            </button>
          }
        >
          <ComplianceChart />
        </DashboardCard>

        <DashboardCard title="Category Distribution" subtitle="Products by category">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution.slice(0, 6)}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryDistribution.slice(0, 6).map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v} products`, '']} />
                <Legend
                  formatter={(v) => <span className="text-xs text-gray-600">{v}</span>}
                  iconSize={8}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      {/* Recent Products + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard
          title="Recent Products"
          subtitle="Latest product submissions"
          className="lg:col-span-2"
          actions={
            <button onClick={() => navigate('/published')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <FiArrowRight className="w-3 h-3" />
            </button>
          }
          noPadding
        >
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            <RecentProducts />
          </div>
        </DashboardCard>

        <DashboardCard title="Quick Actions" subtitle="Common tasks">
          <QuickActions />
        </DashboardCard>
      </div>

      {/* Alerts */}
      <DashboardCard
        title="Recent Alerts"
        subtitle="Compliance notifications requiring attention"
        actions={
          <span className="text-xs text-blue-600 cursor-pointer hover:underline">Mark all read</span>
        }
      >
        <div className="space-y-2">
          {recentAlerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${alertTypeStyles[alert.type]}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-500">{alert.message}</p>
                <p className="text-xs opacity-60 mt-0.5">{alert.time}</p>
              </div>
              {alert.product && (
                <button
                  onClick={() => navigate('/compliance')}
                  className="text-xs font-600 opacity-80 hover:opacity-100 flex-shrink-0 underline"
                >
                  View
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </DashboardCard>
    </div>
  );
}
