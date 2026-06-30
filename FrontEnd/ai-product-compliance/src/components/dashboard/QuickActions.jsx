import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPlusCircle, FiShield, FiBarChart2, FiDownload } from 'react-icons/fi';

const actions = [
  {
    icon: FiPlusCircle,
    label: 'Add Product',
    description: 'Upload and submit for review',
    color: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    path: '/products'
  },
  {
    icon: FiShield,
    label: 'Run Compliance Check',
    description: 'Analyze pending products',
    color: 'bg-green-50 text-green-600 hover:bg-green-100',
    path: '/compliance'
  },
  {
    icon: FiBarChart2,
    label: 'View Reports',
    description: 'Analytics and insights',
    color: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    path: '/analytics'
  },
  {
    icon: FiDownload,
    label: 'Export Data',
    description: 'Download CSV or PDF',
    color: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    path: '/audit'
  }
];

export default function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.07 }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(action.path)}
          className={`flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all duration-150 border border-transparent hover:border-gray-200 ${action.color}`}
        >
          <div className="w-10 h-10 rounded-xl bg-white/60 flex items-center justify-center shadow-sm">
            <action.icon className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-xs font-600">{action.label}</p>
            <p className="text-xs opacity-70 mt-0.5 hidden sm:block">{action.description}</p>
          </div>
        </motion.button>
      ))}
    </div>
  );
}
