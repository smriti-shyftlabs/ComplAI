/**
 * initDB.js
 *
 * Seeds all collections from the static dummy-data files on first load.
 * Collections are persisted in localStorage, so seed data is only written
 * once — subsequent page loads restore from storage automatically.
 *
 * Call initDB() once at application startup (main.jsx).
 */

import db from './inMemoryDB';
import { dummyProducts } from '../data/dummyProducts';
import { complianceRules } from '../data/complianceRules';
import {
  auditLogs,
  notifications,
  users as reviewers,
  kpiData,
  complianceTrendData,
  categoryDistribution,
  recentAlerts,
} from '../data/dashboardData';

// ─── Collection schemas ───────────────────────────────────────────────────────

const COLLECTIONS = [
  {
    name: 'products',
    options: {
      idPrefix: 'PRD',
      indexes: ['status', 'category', 'brand', 'riskLevel'],
      persist: true,
      seed: dummyProducts,
    },
  },
  {
    name: 'complianceRules',
    options: {
      idPrefix: 'RULE',
      indexes: ['severity', 'category', 'checkType'],
      persist: true,
      seed: complianceRules,
    },
  },
  {
    name: 'approvals',
    options: {
      idPrefix: 'APR',
      indexes: ['productId', 'reviewerId', 'decision'],
      persist: true,
      seed: [],
    },
  },
  {
    name: 'auditLogs',
    options: {
      idPrefix: 'LOG',
      indexes: ['productId', 'action', 'userId'],
      persist: true,
      seed: auditLogs,
    },
  },
  {
    name: 'notifications',
    options: {
      idPrefix: 'NOTIF',
      indexes: ['read', 'type'],
      persist: true,
      seed: notifications,
    },
  },
  {
    name: 'users',
    options: {
      idPrefix: 'USR',
      indexes: ['role', 'department'],
      persist: true,
      seed: reviewers,
    },
  },
  {
    name: 'complianceReports',
    options: {
      idPrefix: 'RPT',
      indexes: ['productId', 'riskLevel'],
      persist: true,
      seed: [],
    },
  },
  {
    name: 'settings',
    options: {
      idPrefix: 'CFG',
      persist: true,
      seed: [
        {
          id: 'CFG-001',
          key: 'complianceThreshold',
          value: 75,
          label: 'Minimum Compliance Score',
          description: 'Products below this score are flagged for review.',
        },
        {
          id: 'CFG-002',
          key: 'autoApproveThreshold',
          value: 95,
          label: 'Auto-Approve Score',
          description: 'Products at or above this score are auto-approved.',
        },
        {
          id: 'CFG-003',
          key: 'slaDays',
          value: 3,
          label: 'SLA (days)',
          description: 'Maximum days a reviewer has to action a product.',
        },
        {
          id: 'CFG-004',
          key: 'enableAIChat',
          value: true,
          label: 'Enable AI Chat Assistant',
          description: 'Show the floating AI chat widget.',
        },
        {
          id: 'CFG-005',
          key: 'enableEmailNotifications',
          value: true,
          label: 'Email Notifications',
          description: 'Send email alerts on approval decisions.',
        },
      ],
    },
  },
];

// ─── Seed helper data (non-persisted, ephemeral analytics data) ───────────────

const ANALYTICS_SEED = {
  complianceTrend: complianceTrendData,
  categoryDistribution,
  recentAlerts,
  kpi: kpiData,
};

// ─── Init function ────────────────────────────────────────────────────────────

let initialized = false;

export function initDB() {
  if (initialized) return;
  initialized = true;

  // Clear stale localStorage on version bump (change this string to force a reseed)
  const DB_VERSION = 'v3';
  const versionKey = 'complianceai_db_version';
  if (localStorage.getItem(versionKey) !== DB_VERSION) {
    Object.keys(localStorage)
      .filter(k => k.startsWith('complianceai_db_'))
      .forEach(k => localStorage.removeItem(k));
    localStorage.setItem(versionKey, DB_VERSION);
  }

  COLLECTIONS.forEach(({ name, options }) => {
    db.collection(name, options);
  });

  // Store analytics reference data (no persistence needed — rebuilt from data files)
  db._analytics = ANALYTICS_SEED;

  if (import.meta.env.DEV) {
    console.group('[ComplAI DB] Initialized');
    console.table(db.stats());
    console.groupEnd();
  }
}

/** Quick access shortcuts */
export const Products        = () => db.collection('products');
export const Rules           = () => db.collection('complianceRules');
export const Approvals       = () => db.collection('approvals');
export const AuditLogs       = () => db.collection('auditLogs');
export const Notifications   = () => db.collection('notifications');
export const Users           = () => db.collection('users');
export const Reports         = () => db.collection('complianceReports');
export const Settings        = () => db.collection('settings');
