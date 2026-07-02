import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiChevronUp, FiChevronDown, FiChevronLeft, FiChevronRight, FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
import { StatusBadge, RiskBadge } from '../common/Badge';
import Select from '../common/Select';
import DateFilter from '../common/DateFilter';
import { formatDate, formatCurrency, isInDateRange } from '../../utils/helpers';
import { CATEGORIES } from '../../utils/constants';
import { useTheme } from '../../context/ThemeContext';

const PAGE_SIZE = 10;

export default function ProductTable({ products = [], onDelete, filterStatus = 'all' }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [statusFilter, setStatusFilter] = useState(filterStatus);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.id.toLowerCase().includes(q));
    }
    if (statusFilter !== 'all') result = result.filter(p => p.status === statusFilter);
    if (categoryFilter !== 'all') result = result.filter(p => p.category === categoryFilter);
    if (dateFilter !== 'all') result = result.filter(p => isInDateRange(p.createdAt, dateFilter));
    result.sort((a, b) => {
      let aVal = a[sortKey], bVal = b[sortKey];
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [products, search, statusFilter, categoryFilter, dateFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const SortIcon = ({ col }) => {
    if (sortKey !== col) return <FiChevronUp className="w-3 h-3 text-gray-300" />;
    return sortDir === 'asc'
      ? <FiChevronUp className="w-3 h-3 text-teal-600" />
      : <FiChevronDown className="w-3 h-3 text-teal-600" />;
  };

  const ScoreCell = ({ score }) => {
    const barColor = score >= 75 ? '#2BA090' : score >= 50 ? '#F59E0B' : '#EF4444';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 80 }}>
        <div style={{ flex: 1, height: 5, background: isDark ? '#2A2A2A' : '#E5E7EB', borderRadius: 9999, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score}%`, background: barColor, borderRadius: 9999 }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: barColor, width: 28, textAlign: 'right' }}>{score}</span>
      </div>
    );
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={v => { setStatusFilter(v); setPage(1); }}
          options={[
            { value: 'all',       label: 'All Status'  },
            { value: 'pending',   label: 'Pending'     },
            { value: 'approved',  label: 'Approved'    },
            { value: 'rejected',  label: 'Rejected'    },
            { value: 'published', label: 'Published'   },
          ]}
          className="w-36"
        />
        <Select
          value={categoryFilter}
          onChange={v => { setCategoryFilter(v); setPage(1); }}
          options={[
            { value: 'all', label: 'All Categories' },
            ...CATEGORIES.map(c => ({ value: c, label: c })),
          ]}
          className="w-44"
        />
        <DateFilter
          value={dateFilter}
          onChange={v => { setDateFilter(v); setPage(1); }}
        />
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} products</span>
      </div>

      {/* Table */}
      <div style={{
        overflowX: 'auto',
        borderRadius: 12,
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB'}`,
      }}>
        <table className="w-full min-w-[700px]">
          <thead style={{ background: isDark ? '#1A1A1A' : '#F9FAFB' }}>
            <tr>
              {[
                { key: 'name', label: 'Product' },
                { key: 'category', label: 'Category' },
                { key: 'price', label: 'Price' },
                { key: 'status', label: 'Status' },
                { key: 'complianceScore', label: 'Score' },
                { key: 'riskLevel', label: 'Risk' },
                { key: 'createdAt', label: 'Date' },
              ].map(col => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  style={{
                    textAlign: 'left',
                    fontSize: 11,
                    fontWeight: 600,
                    color: isDark ? '#525252' : '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    userSelect: 'none',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB'}`,
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {col.label}<SortIcon col={col.key} />
                  </span>
                </th>
              ))}
              <th style={{
                textAlign: 'left', fontSize: 11, fontWeight: 600,
                color: isDark ? '#525252' : '#6B7280',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                padding: '10px 16px',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : '#E5E7EB'}`,
              }}>Actions</th>
            </tr>
          </thead>
          <tbody style={{ background: isDark ? '#141414' : '#FFFFFF' }}>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '48px 16px', textAlign: 'center', fontSize: 14, color: isDark ? '#525252' : '#9CA3AF' }}>
                  No products found
                </td>
              </tr>
            ) : (
              paged.map((product, i) => {
                const isHov = hoveredRow === product.id;
                return (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onMouseEnter={() => setHoveredRow(product.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      background: isHov ? (isDark ? 'rgba(255,255,255,0.03)' : '#F9FAFB') : 'transparent',
                      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : '#F3F4F6'}`,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: 8,
                          background: 'linear-gradient(135deg, #2BA090, #1A6E65)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <span style={{ color: '#fff', fontSize: 12, fontWeight: 600 }}>{product.name.charAt(0)}</span>
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: 13.5, fontWeight: 500, color: isDark ? '#E5E5E5' : '#111827', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{product.name}</p>
                          <p style={{ fontSize: 11, color: isDark ? '#525252' : '#9CA3AF', margin: 0 }}>{product.id}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: 11.5, color: isDark ? '#A3A3A3' : '#6B7280',
                        background: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                        padding: '3px 8px', borderRadius: 6,
                      }}>{product.category}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, color: isDark ? '#D4D4D4' : '#374151' }}>{formatCurrency(product.price)}</td>
                    <td style={{ padding: '12px 16px' }}><StatusBadge status={product.status} /></td>
                    <td style={{ padding: '12px 16px' }}><ScoreCell score={product.complianceScore} /></td>
                    <td style={{ padding: '12px 16px' }}><RiskBadge risk={product.riskLevel} /></td>
                    <td style={{ padding: '12px 16px', fontSize: 11.5, color: isDark ? '#525252' : '#9CA3AF' }}>{formatDate(product.createdAt)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, opacity: isHov ? 1 : 0, transition: 'opacity 0.15s ease' }}>
                        <button
                          onClick={() => navigate('/compliance')}
                          style={{ padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer', background: isDark ? 'rgba(43,160,144,0.12)' : '#F0FAF8', color: '#2BA090' }}
                          title="View"
                        >
                          <FiEye style={{ width: 14, height: 14 }} />
                        </button>
                        <button
                          style={{ padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer', background: isDark ? 'rgba(255,255,255,0.06)' : '#F3F4F6', color: isDark ? '#737373' : '#6B7280' }}
                          title="Edit"
                        >
                          <FiEdit2 style={{ width: 14, height: 14 }} />
                        </button>
                        {onDelete && (
                          <button
                            onClick={() => onDelete(product.id)}
                            style={{ padding: 6, borderRadius: 8, border: 'none', cursor: 'pointer', background: isDark ? 'rgba(239,68,68,0.12)' : '#FEF2F2', color: '#EF4444' }}
                            title="Delete"
                          >
                            <FiTrash2 style={{ width: 14, height: 14 }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
          <p style={{ fontSize: 12, color: isDark ? '#525252' : '#9CA3AF' }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: 6, borderRadius: 8,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                color: isDark ? '#737373' : '#6B7280',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                opacity: page === 1 ? 0.4 : 1,
              }}
            >
              <FiChevronLeft style={{ width: 16, height: 16 }} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = i + 1;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  style={{
                    width: 32, height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    background: page === p ? '#2BA090' : (isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF'),
                    color: page === p ? '#FFFFFF' : (isDark ? '#737373' : '#6B7280'),
                    border: `1px solid ${page === p ? '#2BA090' : (isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB')}`,
                  }}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                padding: 6, borderRadius: 8,
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#E5E7EB'}`,
                background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF',
                color: isDark ? '#737373' : '#6B7280',
                cursor: page === totalPages ? 'not-allowed' : 'pointer',
                opacity: page === totalPages ? 0.4 : 1,
              }}
            >
              <FiChevronRight style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
