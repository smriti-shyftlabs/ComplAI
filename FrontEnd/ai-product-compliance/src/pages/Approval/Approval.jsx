import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiFilter, FiGlobe, FiCheckCircle, FiUpload, FiPlus } from 'react-icons/fi';
import ApprovalCard from '../../components/approval/ApprovalCard';
import ReviewerPanel from '../../components/approval/ReviewerPanel';
import ApprovalHistory from '../../components/approval/ApprovalHistory';
import BulkUploadModal from '../../components/product/BulkUploadModal';
import Button from '../../components/common/Button';
import DateFilter from '../../components/common/DateFilter';
import { SkeletonCard } from '../../components/common/Loader';
import { StatusBadge, RiskBadge } from '../../components/common/Badge';
import { useProducts } from '../../hooks/useProducts';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
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
  const navigate = useNavigate();
  const { products, loading, updateProduct, publishProduct, refetch } = useProducts();
  const { currentUser } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [riskFilter, setRiskFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [tab, setTab] = useState('queue');
  const [publishingId, setPublishingId] = useState(null);
  const [marketplaceById, setMarketplaceById] = useState({});
  const [history, setHistory] = useState([]);
  const [bulkOpen, setBulkOpen] = useState(false);

  const pending   = products.filter(p => p.status === 'pending');
  const approved  = products.filter(p => p.status === 'approved');
  const published = products.filter(p => p.status === 'published');
  const filtered  = pending
    .filter(p => riskFilter === 'all' || p.riskLevel === riskFilter)
    .filter(p => isInDateRange(p.createdAt, dateFilter));

  const loadHistory = useCallback(() => {
    getPublishHistory().then(setHistory).catch(() => setHistory([]));
  }, []);
  useEffect(() => { loadHistory(); }, [loadHistory]);

  const handleApprove = async (id, comment) => {
    await approveProduct(id, comment);
    updateProduct(id, { status: 'approved', reviewComment: comment });
    showToast(`${products.find(p => p.id === id)?.name || 'Product'} approved successfully`, 'success');
  };

  const handleReject = async (id, comment) => {
    await rejectProduct(id, comment);
    updateProduct(id, { status: 'rejected', reviewComment: comment });
    showToast(`${products.find(p => p.id === id)?.name || 'Product'} rejected`, 'error');
  };

  const handlePublish = async (product) => {
    const marketplace = marketplaceById[product.id] || MARKETPLACES[0];
    setPublishingId(product.id);
    try {
      await publishProduct(product.id, { publishedBy: currentUser?.name || 'Admin User', marketplace });
      loadHistory();
      showToast(`${product.name} published to ${marketplace}`, 'success');
    } catch {
      showToast('Publish failed — please try again', 'error');
    } finally {
      setPublishingId(null);
    }
  };

  // ── colour tokens ─────────────────────────────────────────────────────────
  const cardBg      = isDark ? '#141414' : '#FFFFFF';
  const cardBorder  = isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB';
  const divider     = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9';
  const textPri     = isDark ? '#FAFAFA' : '#111827';
  const textSec     = isDark ? '#A3A3A3' : '#6B7280';
  const textMut     = isDark ? '#525252' : '#9CA3AF';
  const tabBarBg    = isDark ? '#1A1A1A' : '#F3F4F6';
  const tabBarBord  = isDark ? 'rgba(255,255,255,0.06)' : 'transparent';
  const activeTabBg = isDark ? '#2A2A2A' : '#FFFFFF';
  const rowHoverBg  = isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB';

  const tabs = [
    { key: 'queue',          label: `Pending Queue (${pending.length})` },
    { key: 'approved',       label: `Approved (${approved.length})` },
    { key: 'published',      label: `Published (${published.length})` },
    { key: 'publishHistory', label: 'Publish History' },
    { key: 'history',        label: 'Approval History' },
  ];

  // ── shared empty-state ────────────────────────────────────────────────────
  const EmptyState = ({ icon: Icon, iconBg, iconColor, title, sub }) => (
    <div style={{
      textAlign: 'center', padding: '64px 24px',
      background: cardBg, border: `1px solid ${cardBorder}`,
      borderRadius: 12,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: iconBg, display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 16px',
      }}>
        <Icon style={{ width: 28, height: 28, color: iconColor }} />
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: textPri, margin: 0 }}>{title}</p>
      <p style={{ fontSize: 13, color: textMut, marginTop: 4 }}>{sub}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: textPri, margin: 0 }}>Products</h1>
          <p style={{ fontSize: 13, color: textSec, marginTop: 2 }}>Review, approve, and publish product submissions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon={FiUpload} onClick={() => setBulkOpen(true)}>Bulk Upload via CSV</Button>
          <Button icon={FiPlus} onClick={() => navigate('/products', { state: { newProduct: true } })}>Add New Product</Button>
        </div>
      </div>

      {/* ── Tab bar — full width so no empty space above ReviewerPanel ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        background: tabBarBg,
        border: `1px solid ${tabBarBord}`,
        borderRadius: 12,
        overflowX: 'auto',
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              whiteSpace: 'nowrap',
              textAlign: 'center',
              transition: 'background 0.15s, color 0.15s, box-shadow 0.15s',
              background: tab === t.key ? activeTabBg : 'transparent',
              color: tab === t.key ? textPri : textSec,
              boxShadow: tab === t.key
                ? (isDark ? '0 1px 4px rgba(0,0,0,0.5)' : '0 1px 3px rgba(0,0,0,0.1)')
                : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── PENDING QUEUE ─────────────────────────────────────────────────── */}
      {tab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiFilter style={{ width: 15, height: 15, color: textMut }} />
                <span style={{ fontSize: 13, color: textSec }}>Risk:</span>
                {['all', 'high', 'medium', 'low'].map(r => (
                  <button
                    key={r}
                    onClick={() => setRiskFilter(r)}
                    style={{
                      fontSize: 12, padding: '5px 12px',
                      borderRadius: 9999, fontWeight: 500,
                      cursor: 'pointer', textTransform: 'capitalize',
                      transition: 'all 0.15s',
                      background: riskFilter === r ? '#2BA090' : 'transparent',
                      color: riskFilter === r ? '#FFFFFF' : textSec,
                      border: `1px solid ${riskFilter === r ? '#2BA090' : cardBorder}`,
                    }}
                  >
                    {r === 'all' ? 'All' : `${r} risk`}
                  </button>
                ))}
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <DateFilter value={dateFilter} onChange={setDateFilter} />
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">{[1,2,3].map(n => <SkeletonCard key={n} />)}</div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={({ style }) => (
                  <svg style={style} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                iconBg={isDark ? 'rgba(43,160,144,0.12)' : '#ECFDF5'}
                iconColor="#2BA090"
                title="No pending products"
                sub="All products have been reviewed"
              />
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

      {/* ── APPROVED ──────────────────────────────────────────────────────── */}
      {tab === 'approved' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">{[1,2].map(n => <SkeletonCard key={n} />)}</div>
          ) : approved.length === 0 ? (
            <EmptyState
              icon={FiCheckCircle}
              iconBg={isDark ? 'rgba(59,130,246,0.12)' : '#EFF6FF'}
              iconColor="#3B82F6"
              title="No approved products awaiting publish"
              sub="Approve products from the Pending Queue first"
            />
          ) : (
            approved.map((product, i) => {
              const canPublish = (product.complianceScore ?? 0) >= PUBLISH_MIN_SCORE;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    background: cardBg,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 12,
                    boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
                    padding: '20px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: textPri, margin: 0 }}>{product.name}</h3>
                      <StatusBadge status={product.status} />
                      <RiskBadge risk={product.riskLevel} />
                    </div>
                    <p style={{ fontSize: 13, color: textSec, marginTop: 4 }}>
                      {product.brand} · {product.category} · Score{' '}
                      <span style={{ fontWeight: 600, color: canPublish ? '#10B981' : '#F59E0B' }}>
                        {product.complianceScore ?? 0}
                      </span>
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: textMut, marginBottom: 4 }}>Marketplace</label>
                      <select
                        value={marketplaceById[product.id] || MARKETPLACES[0]}
                        onChange={e => setMarketplaceById(m => ({ ...m, [product.id]: e.target.value }))}
                        style={{
                          border: `1px solid ${cardBorder}`,
                          borderRadius: 8,
                          padding: '7px 10px',
                          fontSize: 13,
                          background: isDark ? '#1A1A1A' : '#FFFFFF',
                          color: textPri,
                          outline: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        {MARKETPLACES.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
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
                        <span style={{ fontSize: 11, color: '#F59E0B' }}>Needs score {PUBLISH_MIN_SCORE}+ to publish</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      )}

      {/* ── PUBLISHED ─────────────────────────────────────────────────────── */}
      {tab === 'published' && (
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">{[1,2].map(n => <SkeletonCard key={n} />)}</div>
          ) : published.length === 0 ? (
            <EmptyState
              icon={FiGlobe}
              iconBg={isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5'}
              iconColor="#10B981"
              title="No published products yet"
              sub="Publish an approved product to see it here"
            />
          ) : (
            published.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  borderRadius: 12,
                  boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
                  padding: '20px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: textPri, margin: 0 }}>{product.name}</h3>
                    <StatusBadge status={product.status} />
                  </div>
                  <p style={{ fontSize: 13, color: textSec, marginTop: 4 }}>
                    {product.brand} · {product.category}
                    {product.marketplace ? <> · <span style={{ fontWeight: 500, color: textPri }}>{product.marketplace}</span></> : null}
                    {product.publishVersion ? ` · v${product.publishVersion}` : null}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 12, color: textSec }}>
                    Published by <span style={{ fontWeight: 500, color: textPri }}>{product.publishedBy || '—'}</span>
                  </p>
                  <p style={{ fontSize: 12, color: textMut, marginTop: 2 }}>{formatDateTime(product.publishedAt)}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}

      {/* ── PUBLISH HISTORY ───────────────────────────────────────────────── */}
      {tab === 'publishHistory' && (
        <div style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 12,
          boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${divider}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: textPri, margin: 0 }}>Publish History</h3>
          </div>
          {history.length === 0 ? (
            <p style={{ fontSize: 13, color: textMut, padding: '48px 24px', textAlign: 'center' }}>
              No publish activity recorded yet.
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: isDark ? '#1A1A1A' : '#F9FAFB' }}>
                    {['Product','SKU','Category','Marketplace','Published By','Date & Time','Version','Status'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', fontSize: 11, fontWeight: 600,
                        color: textMut, textTransform: 'uppercase', letterSpacing: '0.06em',
                        padding: '10px 16px',
                        borderBottom: `1px solid ${divider}`,
                        whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map((h, i) => (
                    <tr
                      key={h.id}
                      style={{
                        borderBottom: `1px solid ${divider}`,
                        background: i % 2 === 0 ? 'transparent' : (isDark ? 'rgba(255,255,255,0.015)' : 'rgba(0,0,0,0.01)'),
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: textPri }}>{h.productName}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: textSec }}>{h.sku || '—'}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: textSec }}>{h.category}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: textPri, fontWeight: 500 }}>{h.marketplace}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: textSec }}>{h.publishedBy}</td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: textMut, whiteSpace: 'nowrap' }}>{formatDateTime(h.publishedAt)}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: textSec }}>v{h.version}</td>
                      <td style={{ padding: '12px 16px' }}><StatusBadge status={h.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── APPROVAL HISTORY ──────────────────────────────────────────────── */}
      {tab === 'history' && (
        <div style={{
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          borderRadius: 12,
          boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${divider}` }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: textPri, margin: 0 }}>Approval History</h3>
          </div>
          <div style={{ padding: '20px 24px' }}>
            <ApprovalHistory />
          </div>
        </div>
      )}

      <BulkUploadModal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        onImported={refetch}
      />
    </div>
  );
}
