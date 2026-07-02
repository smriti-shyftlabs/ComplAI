/**
 * seed.js — collection accessors + one-time seeding.
 *
 * Seed data is imported directly from the frontend's data modules
 * (../../FrontEnd/ai-product-compliance/src/data) so the two stay in sync.
 * Seeding only runs when a collection is empty, so it's safe to call on every
 * boot. Bump SEED_VERSION to force a fresh reseed (wipes seeded collections).
 */

import db, { collection } from './db.js';
import { dummyProducts } from '../../FrontEnd/ai-product-compliance/src/data/dummyProducts.js';
import { complianceRules } from '../../FrontEnd/ai-product-compliance/src/data/complianceRules.js';
import {
  auditLogs,
  notifications,
  users as reviewers,
} from '../../FrontEnd/ai-product-compliance/src/data/dashboardData.js';

// ── Collection accessors ────────────────────────────────────────────────────
export const Products      = () => collection('products', { idPrefix: 'PRD' });
export const Rules         = () => collection('complianceRules', { idPrefix: 'RULE' });
export const Approvals     = () => collection('approvals', { idPrefix: 'APR' });
export const AuditLogs     = () => collection('auditLogs', { idPrefix: 'LOG' });
export const Notifications = () => collection('notifications', { idPrefix: 'NOTIF' });
export const Users         = () => collection('users', { idPrefix: 'USR' });
export const Reports       = () => collection('complianceReports', { idPrefix: 'RPT' });
export const Settings      = () => collection('settings', { idPrefix: 'CFG' });
export const Emails        = () => collection('emails', { idPrefix: 'MAIL' });

const SETTINGS_SEED = [
  { id: 'CFG-001', key: 'complianceThreshold',      value: 75,   label: 'Minimum Compliance Score', description: 'Products below this score are flagged for review.' },
  { id: 'CFG-002', key: 'autoApproveThreshold',     value: 95,   label: 'Auto-Approve Score',       description: 'Products at or above this score are auto-approved.' },
  { id: 'CFG-003', key: 'slaDays',                  value: 3,    label: 'SLA (days)',               description: 'Maximum days a reviewer has to action a product.' },
  { id: 'CFG-004', key: 'enableAIChat',             value: true, label: 'Enable AI Chat Assistant', description: 'Show the floating AI chat widget.' },
  { id: 'CFG-005', key: 'enableEmailNotifications', value: true, label: 'Email Notifications',      description: 'Send email alerts on approval decisions.' },
];

const SEED_VERSION = 'v3';

export function initDB() {
  // version table for forced reseeds
  db.prepare('CREATE TABLE IF NOT EXISTS _meta (key TEXT PRIMARY KEY, value TEXT)').run();
  const current = db.prepare("SELECT value FROM _meta WHERE key = 'seed_version'").get();
  if (!current || current.value !== SEED_VERSION) {
    for (const name of ['products', 'complianceRules', 'approvals', 'auditLogs',
                         'notifications', 'users', 'complianceReports', 'settings']) {
      collection(name).clear();
    }
    db.prepare("INSERT INTO _meta (key, value) VALUES ('seed_version', ?) \
                ON CONFLICT(key) DO UPDATE SET value = excluded.value").run(SEED_VERSION);
  }

  const seedIfEmpty = (col, data) => { if (col.count() === 0 && data.length) col.insertMany(data); };

  seedIfEmpty(Products(), dummyProducts);
  seedIfEmpty(Rules(), complianceRules);
  seedIfEmpty(AuditLogs(), auditLogs);
  seedIfEmpty(Notifications(), notifications);
  seedIfEmpty(Users(), reviewers);
  seedIfEmpty(Settings(), SETTINGS_SEED);
  // approvals & complianceReports start empty
  Approvals(); Reports();

  const stats = {};
  for (const [name, col] of [['products', Products()], ['rules', Rules()],
    ['users', Users()], ['auditLogs', AuditLogs()], ['settings', Settings()]]) {
    stats[name] = col.count();
  }
  console.log('[ComplAI DB] seeded:', stats);
}
