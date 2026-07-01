import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';
import { getAuditLog } from '../../services/approvalService';
import { formatDateTime } from '../../utils/helpers';

export default function ApprovalHistory() {
  const [filter, setFilter] = useState('all');
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    getAuditLog().then(setAuditLogs).catch(() => setAuditLogs([]));
  }, []);

  const decisions = ['Approved', 'Rejected', 'Requested Changes'];
  const filtered = filter === 'all' ? auditLogs.filter(l => decisions.includes(l.action)) : auditLogs.filter(l => l.action === filter);

  const actionColors = {
    'Approved': 'text-teal-800 bg-teal-50 border-teal-200',
    'Rejected': 'text-red-700 bg-red-50 border-red-200',
    'Requested Changes': 'text-yellow-700 bg-yellow-50 border-yellow-200'
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FiFilter className="w-4 h-4 text-gray-400" />
        {['all', 'Approved', 'Rejected', 'Requested Changes'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border font-500 transition-all ${filter === f ? 'bg-teal-700 text-white border-teal-700' : 'text-gray-600 border-gray-200 hover:border-gray-300'}`}
          >
            {f === 'all' ? 'All Decisions' : f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-start gap-3 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-600 text-gray-700">{log.avatar}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <span className="text-sm font-600 text-gray-900">{log.user}</span>
                {decisions.includes(log.action) && (
                  <span className={`text-xs font-500 px-2 py-0.5 rounded-full border ${actionColors[log.action]}`}>
                    {log.action}
                  </span>
                )}
              </div>
              <p className="text-xs text-teal-700 font-500">{log.product}</p>
              {log.details && <p className="text-xs text-gray-500 mt-1">{log.details}</p>}
              <p className="text-xs text-gray-400 mt-1">{formatDateTime(log.timestamp)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
