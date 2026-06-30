import { Router } from 'express';
import { Users } from '../seed.js';
import { generateId, hashPassword, checkPassword, initials } from '../utils.js';

const router = Router();
const strip = ({ passwordHash, ...u }) => u;

// ── auth ────────────────────────────────────────────────────────────────────
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password required.' });
  const user = Users().findOne({ email: email.trim().toLowerCase() });
  if (!user) return res.status(401).json({ error: 'No account found with that email address.' });
  if (!user.passwordHash) return res.status(401).json({ error: 'Account has no password set. Contact an admin.' });
  if (!checkPassword(password, user.passwordHash)) return res.status(401).json({ error: 'Incorrect password.' });
  if (user.status === 'inactive') return res.status(403).json({ error: 'This account has been deactivated.' });
  res.json(strip(user));
});

// ── users CRUD ──────────────────────────────────────────────────────────────
router.get('/users', (_req, res) => res.json(Users().findAll().map(strip)));

router.get('/users/:id', (req, res) => {
  const u = Users().findById(req.params.id);
  if (!u) return res.status(404).json({ error: `User ${req.params.id} not found` });
  res.json(strip(u));
});

router.post('/users', (req, res) => {
  const data = req.body || {};
  const email = (data.email || '').trim().toLowerCase();
  if (Users().findOne({ email })) return res.status(409).json({ error: 'A user with this email already exists.' });
  if (!data.password || data.password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const inserted = Users().insert({
    id: generateId('USR'),
    name: (data.name || '').trim(),
    email,
    role: data.role || 'Junior Reviewer',
    department: data.department || 'Compliance',
    avatar: initials(data.name || 'User'),
    passwordHash: hashPassword(data.password),
    status: 'active',
    productsReviewed: 0,
    approvalRate: '0%',
    createdAt: new Date().toISOString(),
  });
  res.status(201).json(strip(inserted));
});

router.patch('/users/:id', (req, res) => {
  const data = req.body || {};
  const patch = { ...data };
  if (data.password) {
    if (data.password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    patch.passwordHash = hashPassword(data.password);
    delete patch.password;
  }
  if (data.email) patch.email = data.email.trim().toLowerCase();
  const updated = Users().update(req.params.id, patch);
  if (!updated) return res.status(404).json({ error: `User ${req.params.id} not found` });
  res.json(strip(updated));
});

router.delete('/users/:id', (req, res) => {
  const deleted = Users().delete(req.params.id);
  if (!deleted) return res.status(404).json({ error: `User ${req.params.id} not found` });
  res.json({ id: req.params.id });
});

router.post('/users/:id/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const user = Users().findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found.' });
  if (user.passwordHash && !checkPassword(currentPassword, user.passwordHash))
    return res.status(400).json({ error: 'Current password is incorrect.' });
  if (!newPassword || newPassword.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  Users().update(req.params.id, { passwordHash: hashPassword(newPassword) });
  res.json({ success: true });
});

export default router;
