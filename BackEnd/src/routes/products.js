import { Router } from 'express';
import { Products, AuditLogs } from '../seed.js';
import { generateId } from '../utils.js';

const router = Router();

function auditLog(productId, action, user, comment) {
  const product = Products().findById(productId);
  AuditLogs().insert({
    id: generateId('LOG'), productId, product: product?.name, action, user,
    avatar: user.split(' ').map(w => w[0]).join('').toUpperCase(),
    comment, details: comment, timestamp: new Date().toISOString(),
  });
}

// ── reads (specific routes before :id) ──────────────────────────────────────
router.get('/', (_req, res) => res.json(Products().sort('createdAt', 'desc')));

router.get('/search', (req, res) => {
  const q = String(req.query.q || '').toLowerCase();
  res.json(Products().find(r =>
    r.name?.toLowerCase().includes(q) ||
    r.brand?.toLowerCase().includes(q) ||
    r.category?.toLowerCase().includes(q) ||
    r.description?.toLowerCase().includes(q)));
});

router.get('/by-status/:status', (req, res) => res.json(Products().findByIndex('status', req.params.status)));
router.get('/by-category/:category', (req, res) => res.json(Products().findByIndex('category', req.params.category)));

router.get('/paginated', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const filter = req.query.status ? { status: req.query.status } : null;
  res.json(Products().paginate(page, perPage, filter));
});

router.get('/counts/status', (_req, res) => res.json(Products().groupCount('status')));
router.get('/counts/category', (_req, res) => res.json(Products().groupCount('category')));
router.get('/avg-score', (_req, res) => res.json({ average: Products().avg('complianceScore') }));

router.get('/:id', (req, res) => {
  const p = Products().findById(req.params.id);
  if (!p) return res.status(404).json({ error: `Product ${req.params.id} not found` });
  res.json(p);
});

// ── writes ──────────────────────────────────────────────────────────────────
router.post('/', (req, res) => {
  const data = req.body || {};
  const now = new Date().toISOString();
  const newProduct = {
    ...data,
    id: generateId('PRD'),
    status: 'pending',
    complianceScore: 0,
    riskLevel: 'medium',
    createdAt: now,
    updatedAt: now,
    images: data.images || [],
    certificates: data.certificates || [],
    aiScore: 0,
    reviewedBy: null,
    tags: data.tags || [],
  };
  const inserted = Products().insert(newProduct);
  auditLog(inserted.id, 'Created', 'Admin User', 'Product submitted for compliance review');
  res.status(201).json(inserted);
});

router.patch('/:id', (req, res) => {
  const updated = Products().update(req.params.id, req.body || {});
  if (!updated) return res.status(404).json({ error: `Product ${req.params.id} not found` });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const deleted = Products().delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: `Product ${req.params.id} not found` });
  auditLog(req.params.id, 'Deleted', 'Admin User', `Product "${deleted.name}" removed`);
  res.json(deleted);
});

router.post('/:id/publish', (req, res) => {
  const updated = Products().update(req.params.id, { status: 'published', publishedAt: new Date().toISOString() });
  if (!updated) return res.status(404).json({ error: `Product ${req.params.id} not found` });
  auditLog(req.params.id, 'Published', 'Admin User', 'Product published to marketplace');
  res.json(updated);
});

export default router;
