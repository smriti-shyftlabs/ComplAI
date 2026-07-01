import { Router } from 'express';
import { Products, Reports } from '../seed.js';
import { analyzeProduct, aiEnabled } from '../ai.js';

const router = Router();

router.get('/status', (_req, res) => res.json({ aiEnabled }));

router.get('/reports', (_req, res) => res.json(Reports().sort('analyzedAt', 'desc')));

router.get('/reports/:productId', (req, res) => {
  res.json(Reports().findOne({ productId: req.params.productId }) || null);
});

// Analyze a product. Accepts the product in the body, or looks it up by id.
router.post('/analyze/:productId', async (req, res) => {
  try {
    const product = (req.body && req.body.id) ? req.body : Products().findById(req.params.productId);
    if (!product) return res.status(404).json({ error: `Product ${req.params.productId} not found` });
    const force = req.body?.force === true || req.query.force === 'true';
    const report = await analyzeProduct(product, { force });
    res.json(report);
  } catch (err) {
    console.error('[analyze] error:', err);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

export default router;
