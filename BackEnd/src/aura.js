/**
 * aura.js — Aura AI provider (OpenAI-compatible chat completions).
 *
 * The hackathon Aura gateway exposes an OpenAI-style /chat/completions endpoint.
 * Configure via .env: AURA_API_KEY, AURA_BASE_URL, AURA_MODEL.
 * Enabled only when both key and base URL are set; otherwise the app falls back
 * to Anthropic (if configured) or the deterministic/offline logic.
 */

const KEY = process.env.AURA_API_KEY;
const BASE = (process.env.AURA_BASE_URL || '').replace(/\/+$/, '');
// "auto" lets Aura's classifier/router pick the cheapest model that clears the
// quality gate. Use auto/cheap | auto/mid | auto/quality, or a pin like
// anthropic/claude-opus-4-7, to force a tier/model.
const MODEL = process.env.AURA_MODEL || 'auto';

export const auraEnabled = !!(KEY && BASE);
export const auraModel = MODEL;

/**
 * Call the Aura chat-completions endpoint (OpenAI-compatible).
 * @param {object} o
 * @param {string}  o.system   system prompt
 * @param {string}  o.user     user message
 * @param {boolean} o.json     request a JSON object response
 * @param {number}  o.maxTokens
 * @param {object}  [o.metadata]  routing hints (session_id, complexity, domain)
 * @returns {Promise<string>} the assistant message text
 */
export async function auraChat({ system, user, json = false, maxTokens = 900, metadata } = {}) {
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: user });

  const body = { model: MODEL, messages, max_tokens: maxTokens };
  if (json) body.response_format = { type: 'json_object' };
  if (metadata) body.metadata = metadata;

  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Aura ${res.status}: ${detail.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data?.choices?.[0]?.message?.content || '').trim();
}
