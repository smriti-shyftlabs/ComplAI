/**
 * chatbotService.js — data-aware compliance assistant, backed by the API.
 *
 * The intelligence (live-catalog intents, regulatory knowledge base, and
 * optional Claude answers) all lives server-side; this is a thin client.
 */

import { api } from './api';

export const getChatbotResponse = async (question) => {
  const { response } = await api.post('/chat', { question });
  return response;
};
