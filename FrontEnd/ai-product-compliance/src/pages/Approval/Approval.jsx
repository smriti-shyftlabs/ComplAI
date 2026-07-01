import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiGlobe, FiCheckCircle } from 'react-icons/fi';
import ApprovalCard from '../../components/approval/ApprovalCard';
import ReviewerPanel from '../../components/approval/ReviewerPanel';
import ApprovalHistory from '../../components/approval/ApprovalHistory';
import Button from '../../components/common/Button';
import { StatusBadge, RiskBadge } from '../../components/common/Badge';
import { useProducts } from '../../hooks/useProducts';
import { approveProduct, rejectProduct } from '../../services/approvalService';

const PUBLISH_MIN_SCORE = 75;

export default function Approval() {
  const { products, loading, updateProduct, publishProduct } = useProducts();
  const [riskFilter, setRiskFilter] = useState('all');
  const [tab, setTab] = useState('queue');
  const [publishingId, setPublishingId] = useState(null);

  const pending = products.filter(p => p.status === 'pending');
  const approved = products.filter(p => p.status === 'approved');
  const filtered = riskFilter === 'all' ? pending : pending.filter(p => p.riskLevel === riskFilter);

  const handleApprove = async (id, comment) => {
    await approveProduct(id, comment);
    updateProduct(id, { status: 'approved', reviewComment: comment });
  };

  const handleReject = async (id, comment) => {
    await rejectProduct(id, comment);
    updateProduct(id, { status: 'rejected', reviewComment: comment });
  };

  const handlePublish = async (id) => {
    setPublishingId(id);
    try {
      await publishProduct(id);
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setPublishingId(null);
    }
  };

  const tabs = [
    { key: 'queue', label: `Pending Queue (${pending.length})` },
    { key: 'approved', label: `Approved (${approved.length})` },
    { key: 'history', label: 'Approval History' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-700 text-gray-900">Approval Queue</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review, approve, and publish product submissions</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-500 transition-all ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Queue */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-2">
              <FiFilter className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-600 mr-1">Risk:</span>
              {['all', 'high', 'medium', 'low'].map(r => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-500 capitalize transition-all ${riskFilter === r ? 'bg-teal-700 text-white border-teal-700' : 'text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {r === 'all' ? 'All' : `${r} risk`}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-gray-600 font-600">No pending products</p>
                <p className="text-sm text-gray-400 mt-1">All products have been reviewed</p>
              </div>
            ) : (
              filtered.map((product, i) => (
                <ApprovalCard
                  key={product.id}
                  product={product}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  index={i}
                />
              ))
            )}
          </div>

          {/* Reviewer Panel */}
          <ReviewerPanel />
        </div>
      )}

      {tab === 'approved' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12 text-gray-400">Loading...</div>
          ) : approved.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600 font-600">No approved products awaiting publish</p>
              <p className="text-sm text-gray-400 mt-1">Approve products from the Pending Queue first</p>
            </div>
          ) : (
            approved.map((product, i) => {
              const canPublish = (product.complianceScore ?? 0) >= PUBLISH_MIN_SCORE;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between flex-wrap gap-4"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-600 text-gray-900">{product.name}</h3>
                      <StatusBadge status={product.status} />
                      <RiskBadge risk={product.riskLevel} />
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {product.brand} · {product.category} · Compliance score{' '}
                      <span className={`font-600 ${canPublish ? 'text-green-600' : 'text-yellow-600'}`}>
                        {product.complianceScore ?? 0}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Button
                      variant="success"
                      size="sm"
                      icon={FiGlobe}
                      loading={publishingId === product.id}
                      disabled={!canPublish || publishingId === product.id}
                      onClick={() => handlePublish(product.id)}
                    >
                      Publish to Marketplace
                    </Button>
                    {!canPublish && (
                      <span className="text-xs text-yellow-600">
                        Needs score {PUBLISH_MIN_SCORE}+ to publish
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <h3 className="text-sm font-600 text-gray-900 mb-4">Approval History</h3>
          <ApprovalHistory />
        </div>
      )}
    </div>
  );
}
