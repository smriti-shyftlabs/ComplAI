/**
 * approvalService.js — approval queue, decisions, and audit trail via the API.
 */

import { api } from './api';

// ─── Read ─────────────────────────────────────────────────────────────────────
export const getApprovals = () => api.get('/approvals');

export const getApprovalHistory = (productId = null) =>
  api.get('/approvals/history', { productId });

export const getApprovalById = async (id) => {
  const history = await api.get('/approvals/history');
  const record = history.find(r => r.id === id);
  if (!record) throw new Error(`Approval ${id} not found`);
  return record;
};

export const getAuditLog = (productId = null) =>
  api.get('/approvals/audit', { productId });

export const getAuditLogPaginated = (page = 1, perPage = 20, productId = null) =>
  api.get('/approvals/audit/paginated', { page, perPage, productId });

export const getApprovalStats = () => api.get('/approvals/stats');

// ─── Decisions ────────────────────────────────────────────────────────────────
export const approveProduct = (productId, comment = '', reviewerId = 'USR-001') =>
  api.post(`/approvals/${productId}/approve`, { comment, reviewerId });

export const rejectProduct = (productId, comment = '', reviewerId = 'USR-001') =>
  api.post(`/approvals/${productId}/reject`, { comment, reviewerId });

export const requestChanges = (productId, comment = '', reviewerId = 'USR-001') =>
  api.post(`/approvals/${productId}/request-changes`, { comment, reviewerId });
