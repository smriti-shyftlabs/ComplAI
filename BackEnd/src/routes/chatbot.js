import { Router } from 'express';
import { chatbotResponse } from '../ai.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const response = await chatbotResponse(req.body?.question || '');
    res.json({ response });
  } catch (err) {
    console.error('[chat] error:', err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

export default router;
