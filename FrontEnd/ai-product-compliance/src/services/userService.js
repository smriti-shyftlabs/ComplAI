/**
 * userService.js — authentication & user CRUD, backed by the ComplAI REST API.
 * Passwords are validated/hashed server-side; responses never include hashes.
 */

import { api } from './api';

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const login = (email, password) => api.post('/auth/login', { email, password });

// ─── Read ─────────────────────────────────────────────────────────────────────
export const getUsers = () => api.get('/users');

export const getUserById = (id) => api.get(`/users/${id}`);

// ─── Write ────────────────────────────────────────────────────────────────────
export const createUser = (data) => api.post('/users', data);

export const updateUser = (id, data) => api.patch(`/users/${id}`, data);

export const deleteUser = (id) => api.del(`/users/${id}`);

export const changePassword = (id, currentPassword, newPassword) =>
  api.post(`/users/${id}/change-password`, { currentPassword, newPassword });
