import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUsers } from '../../services/userService';

const PUBLISH_MIN_SCORE = 75;

export default function ReviewerPanel({ products = [] }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  // Live queue overview derived from the products in the review pipeline.
  const pending = products.filter(p => p.status === 'pending');
  const awaitingPublish = products.filter(
    p => p.status === 'approved' && (Number(p.complianceScore) || 0) >= PUBLISH_MIN_SCORE
  );
  const rejected = products.filter(p => p.status === 'rejected');
  const published = products.filter(p => p.status === 'published');

  const stats = [
    { label: 'Pending', value: pending.length },
    { label: 'Awaiting Publish', value: awaitingPublish.length },
    { label: 'Rejected', value: rejected.length },
    { label: 'Published', value: published.length },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-5">
      <div>
        <h3 className="text-sm font-600 text-gray-900 mb-3">Queue Overview</h3>
        <div className="grid grid-cols-2 gap-2">
          {stats.map(s => (
            <div key={s.label} className="rounded-lg bg-gray-50 px-3 py-2.5">
              <p className="text-lg font-700 text-teal-700 leading-tight">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <h3 className="text-sm font-600 text-gray-900 mb-4">Assigned Reviewers</h3>
        <div className="space-y-3">
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-600">{user.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-600 text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs font-600 text-teal-700">{user.approvalRate}</p>
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
            { label: 'Reviewed within 24h', value: '73%', color: 'bg-teal-600', width: '73%' },
            { label: 'Reviewed within 48h', value: '91%', color: 'bg-teal-600', width: '91%' },
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

    </div>
  );
}
