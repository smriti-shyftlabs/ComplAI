/**
 * aiService.js — compliance analysis backed by the ComplAI REST API.
 *
 * Analysis/report data comes from the backend (real Claude when configured,
 * deterministic fallback otherwise). simulateAnalysis stays client-side — it's
 * purely the step-by-step progress animation shown while analysis runs.
 */

import { api } from './api';
import { delay } from '../utils/helpers';
import { getChatbotResponse } from './chatbotService';

export const getComplianceReport = (productId) => api.get(`/reports/${productId}`);

export const getAllReports = () => api.get('/reports');

export const analyzeProduct = (product, force = false) =>
  api.post(`/analyze/${product.id}`, { ...product, force });

export const refineDescription = async (payload) =>
  (await api.post('/refine-description', payload)).description;

export const simulateAnalysis = async (onProgress) => {
  const steps = [
    'Reading Product Data',
    'OCR Processing Documents',
    'Detecting Category & Region',
    'Loading Compliance Rules',
    'Running Compliance Checks',
    'Generating AI Suggestions',
  ];

  for (let i = 0; i < steps.length; i++) {
    await delay(600 + Math.random() * 600);
    if (onProgress) {
      onProgress({
        step: i + 1,
        total: steps.length,
        label: steps[i],
        progress: Math.round(((i + 1) / steps.length) * 100),
      });
    }
  }
};

/** Backward-compatible entry point — delegates to the chatbot service. */
export const getAIResponse = (question) => getChatbotResponse(question);
