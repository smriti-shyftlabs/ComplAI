import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiGlobe, FiDownload, FiSearch, FiChevronUp, FiChevronDown,
  FiChevronLeft, FiChevronRight, FiEye, FiExternalLink,
  FiTrendingUp, FiAward, FiAlertCircle,
} from 'react-icons/fi';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import DateFilter from '../../components/common/DateFilter';
import { RiskBadge } from '../../components/common/Badge';
import { useProducts } from '../../hooks/useProducts';
import { useTheme } from '../../context/ThemeContext';
import { formatDate, formatCurrency, isInDateRange } from '../../utils/helpers';
import { CATEGORIES } from '../../utils/constants';
import { SkeletonTable } from '../../components/common/Loader';

const PAGE_SIZE = 10;

/* ── Circular score ring ─────────────────────────────────────────────── */
function ScoreRing({ score }) {
  const r = 14, stroke = 2.5;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 90 ? '#10B981' : score >= 75 ? '#2BA090' : score >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
        <svg width="36" height="36" viewBox="0 0 34 34" style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <circle cx="17" cy="17" r={r} fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth={stroke} />
          <circle cx="17" cy="17" r={r} fill="none" stroke={color} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 9.5, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
        </div>
      </div>
      <div style={{ width: 48, height: 4, borderRadius: 4, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${score}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

/* ── Sort icon ───────────────────────────────────────────────────────── */
function SortIcon({ col, sortKey, sortDir }) {
  const active = sortKey === col;
  return (
    <span style={{ display: 'flex', flexDirection: 'column', gap: 1, marginLeft: 4, opacity: active ? 1 : 0.3 }}>
      <FiChevronUp style={{ width: 10, height: 10, color: active && sortDir === 'asc' ? '#2BA090' : 'currentColor' }} />
      <FiChevronDown style={{ width: 10, height: 10, marginTop: -4, color: active && sortDir === 'desc' ? '#2BA090' : 'currentColor' }} />
    </span>
  );
}

/* ── Live dot ────────────────────────────────────────────────────────── */
function LiveDot() {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: '#10B981',
        boxShadow: '0 0 0 2px rgba(16,185,129,0.25)',
        animation: 'pulse 2s infinite',
        flexShrink: 0,
      }} />
      <span style={{ fontSize: 12, fontWeight: 500, color: '#10B981' }}>Live</span>
    </span>
  );
}

export default function PublishedProducts() {
  const { products, loading } = useProducts();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const published = useMemo(() => products.filter(p => p.status === 'published'), [products]);

  const filtered = useMemo(() => {
    let r = [...published];
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(p => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'all') r = r.filter(p => p.category === categoryFilter);
    if (dateFilter !== 'all') r = r.filter(p => isInDateRange(p.createdAt, dateFilter));
    r.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return r;
  }, [published, search, categoryFilter, dateFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(1);
  };

  const avgScore = published.length
    ? Math.round(published.reduce((s, p) => s + (p.complianceScore || 0), 0) / published.length)
    : 0;

  // ── Theme-aware colour tokens ─────────────────────────────────────────
  const surface  = isDark ? '#141414' : '#ffffff';
  const surface2 = isDark ? '#111111' : '#F9FAFB';
  const border   = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(189,216,211,0.45)';
  const headerBg = isDark ? '#111111' : '#F8FFFE';
  const textPri  = isDark ? '#FAFAFA' : '#111827';
  const textSec  = isDark ? '#A3A3A3' : '#6B7280';
  const textMut  = isDark ? '#525252' : '#9CA3AF';
  const hoverBg  = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(43,160,144,0.03)';
  const divider  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(189,216,211,0.3)';
  const inputBg  = isDark ? '#1A1A1A' : '#ffffff';
  const inputBorder = isDark ? 'rgba(255,255,255,0.1)' : '#D1D5DB';
  const pillBg   = isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6';
  const pillText = isDark ? '#A3A3A3' : '#374151';

  const cols = [
    { key: 'name',            label: 'Product',    width: '26%' },
    { key: 'category',        label: 'Category',   width: '12%' },
    { key: 'price',           label: 'Price',      width: '10%' },
    { key: 'complianceScore', label: 'Score',      width: '14%' },
    { key: 'riskLevel',       label: 'Risk',       width: '9%'  },
    { key: 'createdAt',       label: 'Published',  width: '12%' },
    { key: '_live',           label: 'Status',     width: '9%'  },
  ];

  const statCards = [
    {
      label: 'Total Published',
      value: published.length,
      icon: FiGlobe,
      accent: '#2BA090',
      bg: isDark ? 'rgba(43,160,144,0.08)' : 'rgba(43,160,144,0.06)',
    },
    {
      label: 'Avg Compliance',
      value: `${avgScore}%`,
      icon: FiTrendingUp,
      accent: '#10B981',
      bg: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.06)',
    },
    {
      label: 'High Compliance',
      value: published.filter(p => p.complianceScore >= 90).length,
      icon: FiAward,
      accent: '#8B5CF6',
      bg: isDark ? 'rgba(139,92,246,0.08)' : 'rgba(139,92,246,0.06)',
    },
    {
      label: 'Needs Review',
      value: published.filter(p => p.complianceScore < 75).length,
      icon: FiAlertCircle,
      accent: '#F59E0B',
      bg: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)',
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-700 text-gray-900">Published Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {published.length} product{published.length !== 1 ? 's' : ''} live across marketplaces
          </p>
        </div>
        <Button variant="secondary" icon={FiDownload} size="sm">Export CSV</Button>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map(stat => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: stat.bg,
                border: `1px solid ${border}`,
                borderRadius: 14,
                padding: '16px 18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 500, color: textSec }}>{stat.label}</p>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  background: `${stat.accent}18`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon style={{ width: 14, height: 14, color: stat.accent }} />
                </div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 700, color: textPri, lineHeight: 1 }}>{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* ── Marketplace pills ─────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: textSec, fontWeight: 500 }}>Live on:</span>
        {['Amazon', 'eBay', 'Walmart', 'Shopify'].map(m => (
          <span key={m} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, fontWeight: 600,
            padding: '5px 12px',
            borderRadius: 20,
            border: `1px solid ${border}`,
            background: surface,
            color: textSec,
            boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
          }}>
            <FiGlobe style={{ width: 11, height: 11, color: '#2BA090' }} />
            {m}
          </span>
        ))}
      </div>

      {/* ── Table card ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)'
            : '0 4px 24px rgba(12,53,48,0.07), 0 0 0 1px rgba(189,216,211,0.15)',
        }}
      >
        {/* Filters bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10,
          padding: '14px 20px',
          borderBottom: `1px solid ${border}`,
          background: headerBg,
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 180 }}>
            <FiSearch style={{
              position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
              width: 14, height: 14, color: textMut,
            }} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: '100%', paddingLeft: 32, paddingRight: 12,
                paddingTop: 7, paddingBottom: 7,
                fontSize: 13, borderRadius: 8, outline: 'none',
                border: `1px solid ${inputBorder}`,
                background: inputBg,
                color: textPri,
              }}
            />
          </div>

          <Select
            value={categoryFilter}
            onChange={v => { setCategoryFilter(v); setPage(1); }}
            options={[{ value: 'all', label: 'All Categories' }, ...CATEGORIES.map(c => ({ value: c, label: c }))]}
            className="w-44"
          />
          <DateFilter value={dateFilter} onChange={v => { setDateFilter(v); setPage(1); }} />

          <span style={{ marginLeft: 'auto', fontSize: 12, color: textMut, fontWeight: 500 }}>
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: 24 }}>
            <SkeletonTable rows={6} />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: 720, borderCollapse: 'collapse' }}>
              {/* Head */}
              <thead>
                <tr style={{ background: headerBg }}>
                  {cols.map(col => (
                    <th
                      key={col.key}
                      onClick={() => col.key !== '_live' && handleSort(col.key)}
                      style={{
                        width: col.width,
                        padding: '11px 16px',
                        textAlign: 'left',
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: textMut,
                        cursor: col.key !== '_live' ? 'pointer' : 'default',
                        userSelect: 'none',
                        borderBottom: `1px solid ${border}`,
                        whiteSpace: 'nowrap',
                        transition: 'color 0.12s',
                      }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center' }}>
                        {col.label}
                        {col.key !== '_live' && (
                          <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                        )}
                      </span>
                    </th>
                  ))}
                  <th style={{
                    width: '8%', padding: '11px 16px', textAlign: 'right',
                    fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
                    textTransform: 'uppercase', color: textMut,
                    borderBottom: `1px solid ${border}`,
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>

              {/* Body */}
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={cols.length + 1}>
                      <div style={{
                        padding: '60px 20px', textAlign: 'center',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                      }}>
                        <div style={{
                          width: 52, height: 52, borderRadius: '50%',
                          background: isDark ? 'rgba(43,160,144,0.1)' : 'rgba(43,160,144,0.08)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <FiGlobe style={{ width: 22, height: 22, color: '#2BA090' }} />
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: textPri }}>No published products</p>
                        <p style={{ fontSize: 13, color: textSec }}>
                          {search || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'Approve and publish products to see them here'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paged.map((product, i) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      style={{ borderBottom: `1px solid ${divider}`, transition: 'background 0.12s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      {/* Product */}
                      <td style={{ padding: '13px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                            background: `linear-gradient(135deg, #155E56, #2BA090)`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(21,94,86,0.3)',
                          }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                              {product.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: textPri, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>
                              {product.name}
                            </p>
                            <p style={{ fontSize: 11, color: textMut, marginTop: 1 }}>
                              {product.brand || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{
                          fontSize: 11.5, fontWeight: 500,
                          padding: '3px 9px', borderRadius: 6,
                          background: pillBg, color: pillText,
                          whiteSpace: 'nowrap',
                          border: `1px solid ${border}`,
                        }}>
                          {product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: textPri }}>
                          {formatCurrency(product.price)}
                        </span>
                      </td>

                      {/* Score */}
                      <td style={{ padding: '13px 16px' }}>
                        <ScoreRing score={product.complianceScore ?? 0} />
                      </td>

                      {/* Risk */}
                      <td style={{ padding: '13px 16px' }}>
                        <RiskBadge risk={product.riskLevel} />
                      </td>

                      {/* Published date */}
                      <td style={{ padding: '13px 16px' }}>
                        <span style={{ fontSize: 12.5, color: textSec }}>
                          {product.createdAt ? formatDate(product.createdAt) : '—'}
                        </span>
                      </td>

                      {/* Live status */}
                      <td style={{ padding: '13px 16px' }}>
                        <LiveDot />
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                          <button
                            onClick={() => navigate('/compliance')}
                            title="View compliance report"
                            style={{
                              padding: '5px 8px', borderRadius: 7, border: 'none',
                              background: isDark ? 'rgba(43,160,144,0.1)' : 'rgba(43,160,144,0.08)',
                              color: '#2BA090', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: 4,
                              fontSize: 11.5, fontWeight: 600,
                              transition: 'background 0.12s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(43,160,144,0.18)' : 'rgba(43,160,144,0.14)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = isDark ? 'rgba(43,160,144,0.1)' : 'rgba(43,160,144,0.08)'; }}
                          >
                            <FiEye style={{ width: 12, height: 12 }} />
                            View
                          </button>
                          <button
                            title="Open in marketplace"
                            style={{
                              padding: 5, borderRadius: 7, border: 'none',
                              background: 'none', color: textMut, cursor: 'pointer',
                              display: 'flex', alignItems: 'center',
                              transition: 'background 0.12s, color 0.12s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6'; e.currentTarget.style.color = textSec; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = textMut; }}
                          >
                            <FiExternalLink style={{ width: 13, height: 13 }} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 20px',
            borderTop: `1px solid ${border}`,
            background: headerBg,
          }}>
            <p style={{ fontSize: 12, color: textMut }}>
              Showing <span style={{ color: textPri, fontWeight: 600 }}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span style={{ color: textPri, fontWeight: 600 }}>{filtered.length}</span>
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  padding: '5px 7px', borderRadius: 7,
                  border: `1px solid ${border}`,
                  background: surface, color: textSec,
                  cursor: page === 1 ? 'not-allowed' : 'pointer',
                  opacity: page === 1 ? 0.4 : 1,
                  display: 'flex', alignItems: 'center',
                  transition: 'background 0.12s',
                }}
              >
                <FiChevronLeft style={{ width: 14, height: 14 }} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = i + 1;
                const active = page === pg;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    style={{
                      width: 30, height: 30, borderRadius: 7, fontSize: 12, fontWeight: 600,
                      border: `1px solid ${active ? '#2BA090' : border}`,
                      background: active ? '#2BA090' : surface,
                      color: active ? '#ffffff' : textSec,
                      cursor: 'pointer',
                      transition: 'all 0.12s',
                    }}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  padding: '5px 7px', borderRadius: 7,
                  border: `1px solid ${border}`,
                  background: surface, color: textSec,
                  cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  opacity: page === totalPages ? 0.4 : 1,
                  display: 'flex', alignItems: 'center',
                  transition: 'background 0.12s',
                }}
              >
                <FiChevronRight style={{ width: 14, height: 14 }} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
