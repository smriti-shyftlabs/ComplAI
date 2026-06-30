/**
 * productService.js — backed by InMemoryDB `products` collection.
 */

import { Products, AuditLogs } from '../db/initDB';
import { delay, generateId } from '../utils/helpers';

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getProducts = async () => {
  await delay(250);
  return Products().sort('createdAt', 'desc');
};

export const getProductById = async (id) => {
  await delay(150);
  const product = Products().findById(id);
  if (!product) throw new Error(`Product ${id} not found`);
  return product;
};

export const getProductsByStatus = async (status) => {
  await delay(200);
  return Products().findByIndex('status', status);
};

export const getProductsByCategory = async (category) => {
  await delay(200);
  return Products().findByIndex('category', category);
};

export const getProductsPaginated = async (page = 1, perPage = 10, filter = null) => {
  await delay(200);
  return Products().paginate(page, perPage, filter);
};

export const getStatusCounts = async () => {
  await delay(100);
  return Products().groupCount('status');
};

export const getCategoryCounts = async () => {
  await delay(100);
  return Products().groupCount('category');
};

export const getAverageComplianceScore = async () => {
  await delay(100);
  return Products().avg('complianceScore');
};

export const searchProducts = async (query) => {
  await delay(200);
  const q = query.toLowerCase();
  return Products().find(
    r =>
      r.name?.toLowerCase().includes(q) ||
      r.brand?.toLowerCase().includes(q) ||
      r.category?.toLowerCase().includes(q) ||
      r.description?.toLowerCase().includes(q)
  );
};

// ─── Write ────────────────────────────────────────────────────────────────────

export const createProduct = async (data) => {
  await delay(400);
  const newProduct = {
    ...data,
    id: generateId('PRD'),
    status: 'pending',
    complianceScore: 0,
    riskLevel: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: data.images || [],
    certificates: data.certificates || [],
    aiScore: 0,
    reviewedBy: null,
    tags: data.tags || [],
  };
  const inserted = Products().insert(newProduct);
  _auditLog(inserted.id, 'Created', 'Admin User', 'Product submitted for compliance review');
  return inserted;
};

export const updateProduct = async (id, patch) => {
  await delay(300);
  const updated = Products().update(id, patch);
  if (!updated) throw new Error(`Product ${id} not found`);
  return updated;
};

export const deleteProduct = async (id) => {
  await delay(300);
  const deleted = Products().delete(id);
  if (!deleted) throw new Error(`Product ${id} not found`);
  _auditLog(id, 'Deleted', 'Admin User', `Product "${deleted.name}" removed`);
  return deleted;
};

export const publishProduct = async (id) => {
  await delay(400);
  const updated = Products().update(id, {
    status: 'published',
    publishedAt: new Date().toISOString(),
  });
  if (!updated) throw new Error(`Product ${id} not found`);
  _auditLog(id, 'Published', 'Admin User', 'Product published to marketplace');
  return updated;
};

// ─── Internal ─────────────────────────────────────────────────────────────────

function _auditLog(productId, action, user, comment) {
  AuditLogs().insert({
    id: generateId('LOG'),
    productId,
    action,
    user,
    avatar: user.split(' ').map(w => w[0]).join('').toUpperCase(),
    comment,
    timestamp: new Date().toISOString(),
  });
}
