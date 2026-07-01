import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiCheck, FiX } from 'react-icons/fi';
import Button from '../common/Button';
import { StatusBadge, RiskBadge } from '../common/Badge';
import ComplianceScore from '../compliance/ComplianceScore';
import { formatCurrency, formatDate } from '../../utils/helpers';

export default function ApprovalCard({ product, onApprove, onReject, index = 0 }) {
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);

  const handleAction = (type) => {
    if (type === 'approve') onApprove?.(product.id, comment);
    else if (type === 'reject') onReject?.(product.id, comment);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row gap-0">
        {/* Left: Score */}
        <div className="sm:w-48 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-100 flex items-center justify-center p-6">
          <ComplianceScore score={product.complianceScore} size="sm" />
        </div>

        {/* Right: Info */}
        <div className="flex-1 p-5">
          <div className="flex items-start justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-base font-600 text-gray-900 mb-1">{product.name}</h3>
              <p className="text-sm text-gray-500">{product.brand} · {product.category}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={product.status} />
              <RiskBadge risk={product.riskLevel} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
            <div>
              <p className="text-xs text-gray-400">Price</p>
              <p className="text-sm font-600 text-gray-900">{formatCurrency(product.price)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Submitted</p>
              <p className="text-sm font-600 text-gray-900">{formatDate(product.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Certificates</p>
              <p className="text-sm font-600 text-gray-900">{product.certificates?.length || 0} files</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-3 line-clamp-2">{product.description}</p>

          {/* Comment Box */}
          {showComment && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4"
            >
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a review comment (optional)..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-teal-600"
              />
            </motion.div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-gray-100">
            <Button
              variant="success"
              size="sm"
              icon={FiCheck}
              onClick={() => handleAction('approve')}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={FiX}
              onClick={() => handleAction('reject')}
            >
              Reject
            </Button>
            <button
              onClick={() => setShowComment(!showComment)}
              className="ml-auto flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FiMessageSquare className="w-3.5 h-3.5" />
              {showComment ? 'Hide' : 'Add'} comment
              {comment.trim() && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-teal-100 text-teal-700 text-[10px] font-700">
                  1
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
