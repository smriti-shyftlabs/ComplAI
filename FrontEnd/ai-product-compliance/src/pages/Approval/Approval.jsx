import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiGlobe, FiCheckCircle } from 'react-icons/fi';
import ApprovalCard from '../../components/approval/ApprovalCard';
import ReviewerPanel from '../../components/approval/ReviewerPanel';
import ApprovalHistory from '../../components/approval/ApprovalHistory';
import Button from '../../components/common/Button';
import DateFilter from '../../components/common/DateFilter';
import { SkeletonCard } from '../../components/common/Loader';
import { StatusBadge, RiskBadge } from '../../components/common/Badge';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../context/AuthContext';
import { approveProduct, rejectProduct } from '../../services/approvalService';
import { getPublishHistory } from '../../services/productService';
import { isInDateRange } from '../../utils/helpers';
import { useToast } from '../../context/ToastContext';

const PUBLISH_MIN_SCORE = 75;
const MARKETPLACES = ['Amazon', 'eBay', 'Walmart', 'Shopify'];

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString();
}

export default function Approval() {
  const { products, loading, updateProduct, publishProduct } = useProducts();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [tab, setTab] = useState('queue');
  const [publishingId, setPublishingId] = useState(null);
  const [marketplaceById, setMarketplaceById] = useState({});
  const [history, setHistory] = useState([]);

  const pending = products.filter(p => p.status === 'pending');
  const approved = products.filter(p => p.status === 'approved');
  const published = products.filter(p => p.status === 'published');
  const filtered = pending
    .filter(p => riskFilter === 'all' || p.riskLevel === riskFilter)
    .filter(p => isInDateRange(p.createdAt, dateFilter));

  const loadHistory = useCallback(() => {
    getPublishHistory().then(setHistory).catch(() => setHistory([]));
  }, []);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleApprove = async (id, comment) => {
    await approveProduct(id, comment);
    updateProduct(id, { status: 'approved', reviewComment: comment });
    const name = products.find(p => p.id === id)?.name || 'Product';
    showToast(`${name} approved successfully`, 'success');
  };

  const handleReject = async (id, comment) => {
    await rejectProduct(id, comment);
    updateProduct(id, { status: 'rejected', reviewComment: comment });
    const name = products.find(p => p.id === id)?.name || 'Product';
    showToast(`${name} rejected`, 'error');
  };

  const handlePublish = async (product) => {
    const marketplace = marketplaceById[product.id] || MARKETPLACES[0];
    setPublishingId(product.id);
    try {
      await publishProduct(product.id, {
        publishedBy: currentUser?.name || 'Admin User',
        marketplace,
      });
      loadHistory();   // refresh the publish-history log immediately
      showToast(`${product.name} published to ${marketplace}`, 'success');
    } catch (err) {
      console.error('Publish failed:', err);
      showToast('Publish failed — please try again', 'error');
    } finally {
      setPublishingId(null);
    }
  };

  const tabs = [
    { key: 'queue', label: `Pending Queue (${pending.length})` },
    { key: 'approved', label: `Approved (${approved.length})` },
    { key: 'published', label: `Published (${published.length})` },
    { key: 'publishHistory', label: 'Publish History' },
    { key: 'history', label: 'Approval History' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-700 text-gray-900">Products</h1>
        <p className="text-sm text-gray-500 mt-0.5">Review, approve, and publish product submissions</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit flex-wrap">
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
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <FiFilter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">Risk:</span>
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
              <DateFilter value={dateFilter} onChange={setDateFilter} className="ml-auto" />
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => <SkeletonCard key={n} />)}
              </div>
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
          <ReviewerPanel products={products} />
        </div>
      )}

      {tab === 'approved' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map(n => <SkeletonCard key={n} />)}
            </div>
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
                  <div className="flex items-end gap-2">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Marketplace</label>
                      <select
                        value={marketplaceById[product.id] || MARKETPLACES[0]}
                        onChange={e => setMarketplaceById(m => ({ ...m, [product.id]: e.target.value }))}
                        className="border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
                      >
                        {MARKETPLACES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Button
                        variant="success"
                        size="sm"
                        icon={FiGlobe}
                        loading={publishingId === product.id}
                        disabled={!canPublish || publishingId === product.id}
                        onClick={() => handlePublish(product)}
                      >
                        Publish to Marketplace
                      </Button>
                      {!canPublish && (
                        <span className="text-xs text-yellow-600">Needs score {PUBLISH_MIN_SCORE}+ to publish</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {tab === 'published' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">{[1, 2].map(n => <SkeletonCard key={n} />)}</div>
          ) : published.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <FiGlobe className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-gray-600 font-600">No published products yet</p>
              <p className="text-sm text-gray-400 mt-1">Publish an approved product to see it here</p>
            </div>
          ) : (
            published.map((product, i) => (
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
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {product.brand} · {product.category}
                    {product.marketplace ? <> · <span className="text-gray-700 font-500">{product.marketplace}</span></> : null}
                    {product.publishVersion ? ` · v${product.publishVersion}` : null}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <p>Published by <span className="font-500 text-gray-700">{product.publishedBy || '—'}</span></p>
                  <p className="mt-0.5">{formatDateTime(product.publishedAt)}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {tab === 'publishHistory' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <h3 className="text-sm font-600 text-gray-900 mb-4">Publish History</h3>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">No publish activity recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="py-2 pr-4 font-500">Product</th>
                    <th className="py-2 pr-4 font-500">SKU</th>
                    <th className="py-2 pr-4 font-500">Category</th>
                    <th className="py-2 pr-4 font-500">Marketplace</th>
                    <th className="py-2 pr-4 font-500">Published By</th>
                    <th className="py-2 pr-4 font-500">Date &amp; Time</th>
                    <th className="py-2 pr-4 font-500">Version</th>
                    <th className="py-2 font-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id} className="border-b border-gray-50">
                      <td className="py-2.5 pr-4 font-500 text-gray-900">{h.productName}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{h.sku || '—'}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{h.category}</td>
                      <td className="py-2.5 pr-4 text-gray-700">{h.marketplace}</td>
                      <td className="py-2.5 pr-4 text-gray-600">{h.publishedBy}</td>
                      <td className="py-2.5 pr-4 text-gray-600 whitespace-nowrap">{formatDateTime(h.publishedAt)}</td>
                      <td className="py-2.5 pr-4 text-gray-600">v{h.version}</td>
                      <td className="py-2.5"><StatusBadge status={h.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
