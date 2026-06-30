/**
 * metaService.js — analytics, compliance rules, settings, and notifications.
 */

import { api } from './api';

export const getAnalytics = () => api.get('/analytics');

export const getRules = () => api.get('/rules');

export const getSettings = () => api.get('/settings');
export const updateSetting = (id, patch) => api.patch(`/settings/${id}`, patch);

export const getNotifications = () => api.get('/notifications');
export const markAllNotificationsRead = () => api.post('/notifications/read-all');
