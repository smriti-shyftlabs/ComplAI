import { Router } from 'express';
import { Approvals, AuditLogs, Products, Reports } from '../seed.js';
import { generateId, randomReviewer } from '../utils.js';
import { sendDecisionEmail } from '../mailer.js';

const router = Router();

function recordDecision(productId, decision, comment, reviewerId, reviewerName) {
  const avatar = reviewerName.split(' ').map(w => w[0]).join('').toUpperCase();
  const product = Products().findById(productId);
  Approvals().insert({
    id: generateId('APR'), productId, decision, comment, reviewerId, reviewerName,
    reviewerAvatar: avatar, decidedAt: new Date().toISOString(),
  });
  AuditLogs().insert({
    id: generateId('LOG'), productId, product: product?.name, action: decision, user: reviewerName,
    avatar, comment, details: comment, timestamp: new Date().toISOString(),
  });
}

// ── reads ───────────────────────────────────────────────────────────────────
router.get('/', (_req, res) =>
  res.json(Products().find(p => ['pending', 'approved', 'rejected', 'revision'].includes(p.status))));

router.get('/history', (req, res) => {
  const { productId } = req.query;
  res.json(productId ? Approvals().findByIndex('productId', productId) : Approvals().sort('decidedAt', 'desc'));
});

router.get('/audit', (req, res) => {
  const { productId } = req.query;
  res.json(productId ? AuditLogs().findByIndex('productId', productId) : AuditLogs().sort('timestamp', 'desc'));
});

router.get('/audit/paginated', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 20;
  const { productId } = req.query;
  const filter = productId ? r => r.productId === productId : null;
  const result = AuditLogs().paginate(page, perPage, filter);
  result.data = result.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  res.json(result);
});

router.get('/stats', (_req, res) => res.json(Approvals().groupCount('decision')));

// ── decisions ─────────────────────────────────────────────────────────────
const DECISIONS = {
  approve:          { status: 'approved', label: 'Approved',           stamp: 'reviewedAt' },
  reject:           { status: 'rejected', label: 'Rejected',           stamp: 'reviewedAt' },
  'request-changes':{ status: 'revision', label: 'Requested Changes',  stamp: 'changesRequestedAt' },
};

for (const [action, cfg] of Object.entries(DECISIONS)) {
  router.post(`/:productId/${action}`, (req, res) => {
    const { comment = '', reviewerId = 'USR-001' } = req.body || {};
    const reviewerName = randomReviewer();
    const patch = { status: cfg.status, reviewComment: comment, reviewedBy: reviewerName, [cfg.stamp]: new Date().toISOString() };
    const updated = Products().update(req.params.productId, patch);
    if (!updated) return res.status(404).json({ error: `Product ${req.params.productId} not found` });
    recordDecision(req.params.productId, cfg.label, comment, reviewerId, reviewerName);

    // Notify the vendor with the compliance report (fire-and-forget).
    const report = Reports().findOne({ productId: req.params.productId });
    sendDecisionEmail(updated, cfg.label, comment, report).catch(() => {});

    res.json(updated);
  });
}

export default router;
