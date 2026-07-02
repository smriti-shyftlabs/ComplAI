import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMessageSquare, FiCheck, FiX, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import Button from '../common/Button';
import { StatusBadge, RiskBadge, SeverityBadge } from '../common/Badge';
import ComplianceScore from '../compliance/ComplianceScore';
import { getComplianceReport } from '../../services/aiService';
import { formatCurrency, formatDate } from '../../utils/helpers';

// Left-accent colour per severity (red for critical/high, yellow for medium, teal for low).
const SEV_ACCENT = {
  critical: 'border-red-400 bg-red-50',
  high: 'border-orange-400 bg-orange-50',
  medium: 'border-yellow-400 bg-yellow-50',
  low: 'border-teal-400 bg-teal-50',
};

export default function ApprovalCard({ product, onApprove, onReject, index = 0 }) {
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [submitting, setSubmitting] = useState(null); // 'approve' | 'reject' | null
  const [violations, setViolations] = useState([]);
  const [reportLoaded, setReportLoaded] = useState(false);

  // Load the product's compliance report so we can surface its violations.
  useEffect(() => {
    let active = true;
    getComplianceReport(product.id)
      .then(r => { if (active) { setViolations(r?.violations || []); setReportLoaded(!!r); } })
      .catch(() => { if (active) { setViolations([]); setReportLoaded(false); } });
    return () => { active = false; };
  }, [product.id]);

  const handleAction = async (type) => {
    if (submitting) return; // guard double-submit
    setSubmitting(type);
    try {
      if (type === 'approve') await onApprove?.(product.id, comment);
      else if (type === 'reject') await onReject?.(product.id, comment);
    } finally {
      setSubmitting(null);
    }
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

          {/* Violations */}
          {violations.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-1.5 mb-2">
                <FiAlertTriangle className="w-3.5 h-3.5 text-red-500" />
                <span className="text-xs font-600 text-gray-700">
                  Violations ({violations.length})
                </span>
              </div>
              <div className="space-y-1.5">
                {violations.map((v, idx) => (
                  <div
                    key={v.ruleId || idx}
                    className={`flex items-start gap-2 rounded-lg border-l-4 px-3 py-2 ${SEV_ACCENT[v.severity] || 'border-gray-300 bg-gray-50'}`}
                  >
                    <SeverityBadge severity={v.severity} />
                    <div className="min-w-0">
                      <p className="text-xs font-600 text-gray-900">{v.rule}</p>
                      <p className="text-xs text-gray-600">{v.description}</p>
                      {v.fix && (
                        <p className="text-xs text-gray-700 mt-0.5"><span className="font-600">Fix:</span> {v.fix}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clean — report ran with zero violations */}
          {reportLoaded && violations.length === 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border-l-4 border-teal-400 bg-teal-50 px-3 py-2">
              <FiCheckCircle className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span className="text-xs font-600 text-teal-800">No violations — meets all compliance rules</span>
            </div>
          )}

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
              loading={submitting === 'approve'}
              disabled={!!submitting}
              onClick={() => handleAction('approve')}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={FiX}
              loading={submitting === 'reject'}
              disabled={!!submitting}
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
