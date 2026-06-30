import { motion } from 'framer-motion';
import { FiUser, FiClock, FiAlertCircle, FiStar } from 'react-icons/fi';
import { users } from '../../data/dashboardData';

export default function ReviewerPanel() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
      <div>
        <h3 className="text-sm font-600 text-gray-900 mb-4">Assigned Reviewers</h3>
        <div className="space-y-3">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-600">{user.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-600 text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-600 text-green-600">{user.approvalRate}</p>
                <p className="text-xs text-gray-400">{user.productsReviewed} reviewed</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-600 text-gray-900 mb-3">SLA Status</h3>
        <div className="space-y-2">
          {[
            { label: 'Reviewed within 24h', value: '73%', color: 'bg-green-500', width: '73%' },
            { label: 'Reviewed within 48h', value: '91%', color: 'bg-blue-500', width: '91%' },
            { label: 'SLA Breaches', value: '4%', color: 'bg-red-500', width: '4%' }
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>{item.label}</span>
                <span className="font-600">{item.value}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: item.width }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className={`h-full rounded-full ${item.color}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2 mb-3">
          <FiAlertCircle className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-600 text-gray-900">Priority Queue</h3>
        </div>
        <div className="space-y-2">
          {[
            { label: 'Critical Risk', count: 3, color: 'text-red-600 bg-red-50' },
            { label: 'High Risk', count: 8, color: 'text-orange-600 bg-orange-50' },
            { label: 'Medium Risk', count: 21, color: 'text-yellow-600 bg-yellow-50' },
            { label: 'Low Risk', count: 15, color: 'text-green-600 bg-green-50' }
          ].map(item => (
            <div key={item.label} className={`flex items-center justify-between px-3 py-2 rounded-lg ${item.color}`}>
              <span className="text-xs font-500">{item.label}</span>
              <span className="text-xs font-700">{item.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
