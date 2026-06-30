/**
 * approvalService.js — backed by InMemoryDB `approvals` and `auditLogs` collections.
 */

import { Approvals, AuditLogs, Products } from '../db/initDB';
import { delay, generateId } from '../utils/helpers';
import { updateProduct } from './productService';

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getApprovals = async () => {
  await delay(300);
  // Return all products that are in a reviewable state
  return Products().find(p => ['pending', 'approved', 'rejected', 'revision'].includes(p.status));
};

export const getApprovalById = async (id) => {
  await delay(150);
  const record = Approvals().findById(id);
  if (!record) throw new Error(`Approval ${id} not found`);
  return record;
};

export const getApprovalHistory = async (productId = null) => {
  await delay(200);
  if (productId) return Approvals().findByIndex('productId', productId);
  return Approvals().sort('decidedAt', 'desc');
};

export const getAuditLog = async (productId = null) => {
  await delay(200);
  if (productId) return AuditLogs().findByIndex('productId', productId);
  return AuditLogs().sort('timestamp', 'desc');
};

export const getAuditLogPaginated = async (page = 1, perPage = 20, productId = null) => {
  await delay(200);
  const filter = productId ? r => r.productId === productId : null;
  const result = AuditLogs().paginate(page, perPage, filter);
  // Sort within page by timestamp desc
  result.data = result.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  return result;
};

// ─── Decisions ────────────────────────────────────────────────────────────────

export const approveProduct = async (productId, comment = '', reviewerId = 'USR-001') => {
  await delay(500);
  const updated = await updateProduct(productId, {
    status: 'approved',
    reviewComment: comment,
    reviewedBy: 'Sarah Johnson',
    reviewedAt: new Date().toISOString(),
  });
  _recordDecision(productId, 'Approved', comment, reviewerId, 'Sarah Johnson');
  return updated;
};

export const rejectProduct = async (productId, comment = '', reviewerId = 'USR-001') => {
  await delay(500);
  const updated = await updateProduct(productId, {
    status: 'rejected',
    reviewComment: comment,
    reviewedBy: 'Sarah Johnson',
    reviewedAt: new Date().toISOString(),
  });
  _recordDecision(productId, 'Rejected', comment, reviewerId, 'Sarah Johnson');
  return updated;
};

export const requestChanges = async (productId, comment = '', reviewerId = 'USR-001') => {
  await delay(500);
  const updated = await updateProduct(productId, {
    status: 'revision',
    reviewComment: comment,
    reviewedBy: 'Sarah Johnson',
    changesRequestedAt: new Date().toISOString(),
  });
  _recordDecision(productId, 'Requested Changes', comment, reviewerId, 'Sarah Johnson');
  return updated;
};

// ─── Stats ────────────────────────────────────────────────────────────────────

export const getApprovalStats = async () => {
  await delay(100);
  return Approvals().groupCount('decision');
};

// ─── Internal ─────────────────────────────────────────────────────────────────

function _recordDecision(productId, decision, comment, reviewerId, reviewerName) {
  // Save to approvals collection (history)
  Approvals().insert({
    id: generateId('APR'),
    productId,
    decision,
    comment,
    reviewerId,
    reviewerName,
    reviewerAvatar: reviewerName.split(' ').map(w => w[0]).join('').toUpperCase(),
    decidedAt: new Date().toISOString(),
  });

  // Write to audit log
  AuditLogs().insert({
    id: generateId('LOG'),
    productId,
    action: decision,
    user: reviewerName,
    avatar: reviewerName.split(' ').map(w => w[0]).join('').toUpperCase(),
    comment,
    timestamp: new Date().toISOString(),
  });
}
