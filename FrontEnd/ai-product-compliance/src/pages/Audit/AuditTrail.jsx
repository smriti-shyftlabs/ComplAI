import { useState, useEffect } from 'react';
import { FiSearch, FiDownload } from 'react-icons/fi';
import AuditTimeline from '../../components/approval/AuditTimeline';
import Button from '../../components/common/Button';
import { getAuditLog } from '../../services/approvalService';

export default function AuditTrail() {
  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');

  useEffect(() => {
    getAuditLog().then(setAuditLogs).catch(() => setAuditLogs([]));
  }, []);

  const actions = ['all', 'Approved', 'Rejected', 'Published', 'Analyzed', 'Flagged', 'Requested Changes'];
  const users = ['all', ...new Set(auditLogs.map(l => l.user))];

  const filtered = auditLogs.filter(log => {
    if (actionFilter !== 'all' && log.action !== actionFilter) return false;
    if (userFilter !== 'all' && log.user !== userFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return log.product?.toLowerCase().includes(q) || log.user.toLowerCase().includes(q) || log.details?.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-700 text-gray-900">Audit Trail</h1>
          <p className="text-sm text-gray-500 mt-0.5">Complete history of all compliance and approval actions</p>
        </div>
        <Button variant="secondary" icon={FiDownload} size="sm">Export Log</Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Actions', value: auditLogs.length, color: 'text-teal-700 bg-teal-50' },
          { label: 'Approved', value: auditLogs.filter(l => l.action === 'Approved').length, color: 'text-teal-700 bg-teal-50' },
          { label: 'Rejected', value: auditLogs.filter(l => l.action === 'Rejected').length, color: 'text-red-600 bg-red-50' },
          { label: 'AI Actions', value: auditLogs.filter(l => l.user === 'AI System').length, color: 'text-purple-600 bg-purple-50' }
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-4 ${stat.color}`}>
            <p className="text-2xl font-700">{stat.value}</p>
            <p className="text-xs font-500 opacity-80 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
        >
          {actions.map(a => <option key={a} value={a}>{a === 'all' ? 'All Actions' : a}</option>)}
        </select>
        <select
          value={userFilter}
          onChange={e => setUserFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 bg-white"
        >
          {users.map(u => <option key={u} value={u}>{u === 'all' ? 'All Users' : u}</option>)}
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} entries</span>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No audit logs match your filters</p>
        ) : (
          <AuditTimeline logs={filtered} />
        )}
      </div>
    </div>
  );
}
