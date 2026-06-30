/**
 * productService.js — backed by the ComplAI REST API.
 */

import { api } from './api';

// ─── Read ─────────────────────────────────────────────────────────────────────
export const getProducts = () => api.get('/products');

export const getProductById = (id) => api.get(`/products/${id}`);

export const getProductsByStatus = (status) => api.get(`/products/by-status/${encodeURIComponent(status)}`);

export const getProductsByCategory = (category) => api.get(`/products/by-category/${encodeURIComponent(category)}`);

export const getProductsPaginated = (page = 1, perPage = 10, filter = null) =>
  api.get('/products/paginated', { page, perPage, status: filter?.status });

export const getStatusCounts = () => api.get('/products/counts/status');

export const getCategoryCounts = () => api.get('/products/counts/category');

export const getAverageComplianceScore = async () => (await api.get('/products/avg-score')).average;

export const searchProducts = (query) => api.get('/products/search', { q: query });

// ─── Write ────────────────────────────────────────────────────────────────────
export const createProduct = (data) => api.post('/products', data);

export const updateProduct = (id, patch) => api.patch(`/products/${id}`, patch);

export const deleteProduct = (id) => api.del(`/products/${id}`);

export const publishProduct = (id) => api.post(`/products/${id}/publish`);
