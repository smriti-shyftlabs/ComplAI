import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFilter } from 'react-icons/fi';
import ApprovalCard from '../../components/approval/ApprovalCard';
import ReviewerPanel from '../../components/approval/ReviewerPanel';
import ApprovalHistory from '../../components/approval/ApprovalHistory';
import { useProducts } from '../../hooks/useProducts';
import { approveProduct, rejectProduct, requestChanges } from '../../services/approvalService';

export default function Approval() {
  const { products, loading, updateProduct } = useProducts();
  const [riskFilter, setRiskFilter] = useState('all');
  const [tab, setTab] = useState('queue');

  const pending = products.filter(p => p.status === 'pending');
  const filtered = riskFilter === 'all' ? pending : pending.filter(p => p.riskLevel === riskFilter);

  const handleApprove = async (id, comment) => {
    await approveProduct(id, comment);
    updateProduct(id, { status: 'approved', reviewComment: comment });
  };

  const handleReject = async (id, comment) => {
    await rejectProduct(id, comment);
    updateProduct(id, { status: 'rejected', reviewComment: comment });
  };

  const handleRequestChanges = async (id, comment) => {
    await requestChanges(id, comment);
    updateProduct(id, { status: 'revision', reviewComment: comment });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-700 text-gray-900">Approval Queue</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review and approve pending product submissions</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {['queue', 'history'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-500 transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'queue' ? `Pending Queue (${pending.length})` : 'Approval History'}
          </button>
        ))}
      </div>

      {tab === 'queue' ? (
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
                  className={`text-xs px-3 py-1.5 rounded-full border font-500 capitalize transition-all ${riskFilter === r ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {r === 'all' ? 'All' : `${r} risk`}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">Loading...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  onRequestChanges={handleRequestChanges}
                  index={i}
                />
              ))
            )}
          </div>

          {/* Reviewer Panel */}
          <ReviewerPanel />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <h3 className="text-sm font-600 text-gray-900 mb-4">Approval History</h3>
          <ApprovalHistory />
        </div>
      )}
    </div>
  );
}
