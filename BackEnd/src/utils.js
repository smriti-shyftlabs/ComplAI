/** Shared helpers — ID generation + password hashing (matches the frontend). */

const seqs = {};
export function generateId(prefix = 'ID') {
  seqs[prefix] = (seqs[prefix] || 0) + 1;
  // Time-based suffix keeps generated IDs unique across restarts; collections
  // also accept explicit ids, so this is only a fallback for ad-hoc records.
  return `${prefix}-${Date.now().toString(36)}${seqs[prefix]}`;
}

// Same scheme as the frontend's userService/dashboardData so seeded demo
// accounts (admin123, sarah123, …) authenticate correctly.
export const hashPassword = (password) =>
  btoa(unescape(encodeURIComponent(password + '__salt_complianceai')));

export const checkPassword = (plain, hashed) => hashPassword(plain) === hashed;

export const initials = (name) =>
  name.trim().split(/\s+/).map(w => w[0]).join('').toUpperCase().slice(0, 2);

// Reviewer names used to attribute audit-trail / approval actions.
const REVIEWERS = ['Sneha', 'Smriti', 'Kalyani Paraye'];
export const randomReviewer = () => REVIEWERS[Math.floor(Math.random() * REVIEWERS.length)];
