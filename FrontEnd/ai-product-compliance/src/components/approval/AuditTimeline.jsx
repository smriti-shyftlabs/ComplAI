import { motion } from 'framer-motion';
import { formatDateTime } from '../../utils/helpers';

const actionColors = {
  'Approved': 'bg-green-100 text-green-700 border-green-200',
  'Rejected': 'bg-red-100 text-red-700 border-red-200',
  'Published': 'bg-blue-100 text-blue-700 border-blue-200',
  'Analyzed': 'bg-purple-100 text-purple-700 border-purple-200',
  'Flagged': 'bg-orange-100 text-orange-700 border-orange-200',
  'Requested Changes': 'bg-yellow-100 text-yellow-700 border-yellow-200'
};

const avatarColors = {
  'AI': 'from-purple-500 to-purple-700',
  'SJ': 'from-blue-500 to-blue-700',
  'MC': 'from-green-500 to-green-700',
  'ER': 'from-pink-500 to-pink-700',
  'DK': 'from-orange-500 to-orange-700',
  'JW': 'from-cyan-500 to-cyan-700'
};

export default function AuditTimeline({ logs = [] }) {
  return (
    <div className="relative">
      {logs.map((log, i) => (
        <motion.div
          key={log.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex gap-4 pb-6 last:pb-0 relative"
        >
          {/* Vertical line */}
          {i < logs.length - 1 && (
            <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200" />
          )}

          {/* Avatar */}
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[log.avatar] || 'from-gray-400 to-gray-600'} flex items-center justify-center flex-shrink-0 z-10 shadow-sm`}>
            <span className="text-white text-xs font-600">{log.avatar}</span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-start flex-wrap gap-2 mb-1">
              <span className="text-sm font-600 text-gray-900">{log.user}</span>
              <span className={`text-xs font-500 px-2 py-0.5 rounded-full border ${actionColors[log.action] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {log.action}
              </span>
              <span className="text-xs text-gray-400">{formatDateTime(log.timestamp)}</span>
            </div>
            <p className="text-xs text-blue-600 font-500 mb-1">{log.product} ({log.productId})</p>
            <p className="text-xs text-gray-600 leading-relaxed">{log.details}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
