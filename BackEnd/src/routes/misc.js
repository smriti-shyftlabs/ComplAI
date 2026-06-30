import { Router } from 'express';
import { Settings, Products, Reports, Rules, Notifications } from '../seed.js';
import {
  complianceTrendData,
  recentAlerts,
} from '../../../FrontEnd/ai-product-compliance/src/data/dashboardData.js';

const router = Router();

const PALETTE = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#F97316', '#14B8A6', '#6366F1'];
const STATUS_COLORS = { published: '#10B981', approved: '#3B82F6', pending: '#F59E0B', rejected: '#EF4444', revision: '#8B5CF6' };

// ── settings ──────────────────────────────────────────────────────────────
router.get('/settings', (_req, res) => res.json(Settings().findAll()));

router.patch('/settings/:id', (req, res) => {
  const updated = Settings().update(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: `Setting ${req.params.id} not found` });
  res.json(updated);
});

// ── compliance rules ──────────────────────────────────────────────────────
router.get('/rules', (_req, res) => res.json(Rules().findAll()));

// ── notifications ───────────────────────────────────────────────────────────
router.get('/notifications', (_req, res) =>
  res.json(Notifications().sort('id', 'desc')));

router.post('/notifications/read-all', (_req, res) => {
  Notifications().updateWhere(() => true, { read: true });
  res.json({ success: true });
});

router.patch('/notifications/:id', (req, res) => {
  const updated = Notifications().update(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: `Notification ${req.params.id} not found` });
  res.json(updated);
});

// ── analytics (live-derived) ─────────────────────────────────────────────────
router.get('/analytics', (_req, res) => {
  const products = Products().findAll();
  const total = products.length;

  // status distribution
  const statusCounts = {};
  for (const p of products) statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
  const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: STATUS_COLORS[name] || '#94A3B8',
  }));

  // category breakdown with avg compliance score
  const byCat = {};
  for (const p of products) {
    const c = p.category || 'Unknown';
    (byCat[c] ||= { sum: 0, n: 0 });
    byCat[c].sum += Number(p.complianceScore) || 0;
    byCat[c].n += 1;
  }
  const categoryBreakdown = Object.entries(byCat)
    .map(([name, { sum, n }], i) => ({ name, value: n, avg: Math.round(sum / n), color: PALETTE[i % PALETTE.length] }))
    .sort((a, b) => b.value - a.value);

  const avgComplianceScore = Products().avg('complianceScore');
  const decided = (statusCounts.approved || 0) + (statusCounts.published || 0) + (statusCounts.rejected || 0);
  const approvalRate = decided
    ? Math.round(((statusCounts.approved || 0) + (statusCounts.published || 0)) / decided * 100)
    : 0;

  res.json({
    kpi: {
      totalProducts: total,
      avgComplianceScore,
      approvalRate,
      reportsGenerated: Reports().count(),
      byStatus: statusCounts,
    },
    statusDistribution,
    categoryBreakdown,
    complianceTrend: complianceTrendData,
    recentAlerts,
  });
});

export default router;
