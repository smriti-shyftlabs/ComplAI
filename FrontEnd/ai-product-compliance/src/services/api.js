/**
 * api.js — thin fetch wrapper for the ComplAI backend.
 *
 * Base URL comes from VITE_API_URL (see .env), defaulting to the local API.
 * Non-2xx responses throw an Error carrying the server's { error } message,
 * so callers keep the same try/catch behaviour the old services had.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function request(method, path, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data;
}

const qs = (params) => {
  const entries = Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
};

export const api = {
  get: (path, params) => request('GET', `${path}${qs(params)}`),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  del: (path) => request('DELETE', path),
};

export { BASE_URL };
