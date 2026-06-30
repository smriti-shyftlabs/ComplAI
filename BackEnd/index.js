import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { initDB } from './src/seed.js';
import { aiEnabled } from './src/ai.js';
import products from './src/routes/products.js';
import ai from './src/routes/ai.js';
import approvals from './src/routes/approvals.js';
import users from './src/routes/users.js';
import chatbot from './src/routes/chatbot.js';
import misc from './src/routes/misc.js';

initDB();

const app = express();

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : true; // reflect request origin in dev
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, aiEnabled }));

app.use('/api/products', products);
app.use('/api', ai);          // /api/reports, /api/analyze, /api/status
app.use('/api/approvals', approvals);
app.use('/api', users);       // /api/auth/login, /api/users
app.use('/api/chat', chatbot);
app.use('/api', misc);        // /api/settings, /api/analytics

// 404 + error handlers
app.use((req, res) => res.status(404).json({ error: `Not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`[ComplAI API] listening on http://localhost:${PORT}`);
  console.log(`[ComplAI API] AI (Claude) ${aiEnabled ? 'ENABLED' : 'DISABLED — using local fallback'}`);
});
