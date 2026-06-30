/**
 * userService.js
 *
 * Handles user CRUD and authentication against the InMemoryDB `users` collection.
 * Passwords are hashed with a simple btoa-based scheme (good enough for a demo;
 * swap for bcrypt in a real backend).
 */

import { Users } from '../db/initDB';
import { delay, generateId } from '../utils/helpers';

// ─── Password helpers ─────────────────────────────────────────────────────────

const hashPassword = (password) => btoa(unescape(encodeURIComponent(password + '__salt_complianceai')));
const checkPassword = (plain, hashed) => hashPassword(plain) === hashed;

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * Attempt login. Returns the user object (without passwordHash) on success,
 * throws on failure.
 */
export const login = async (email, password) => {
  await delay(400);
  const user = Users().findOne({ email: email.trim().toLowerCase() });
  if (!user) throw new Error('No account found with that email address.');
  if (!user.passwordHash) throw new Error('Account has no password set. Contact an admin.');
  if (!checkPassword(password, user.passwordHash)) throw new Error('Incorrect password.');
  if (user.status === 'inactive') throw new Error('This account has been deactivated.');

  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
};

// ─── Read ─────────────────────────────────────────────────────────────────────

export const getUsers = async () => {
  await delay(200);
  return Users()
    .findAll()
    .map(({ passwordHash: _, ...u }) => u);
};

export const getUserById = async (id) => {
  await delay(150);
  const user = Users().findById(id);
  if (!user) throw new Error(`User ${id} not found`);
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
};

// ─── Write ────────────────────────────────────────────────────────────────────

export const createUser = async (data) => {
  await delay(400);

  const email = data.email.trim().toLowerCase();
  const existing = Users().findOne({ email });
  if (existing) throw new Error('A user with this email already exists.');

  if (!data.password || data.password.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const initials = data.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const newUser = {
    id: generateId('USR'),
    name: data.name.trim(),
    email,
    role: data.role || 'Junior Reviewer',
    department: data.department || 'Compliance',
    avatar: initials,
    passwordHash: hashPassword(data.password),
    status: 'active',
    productsReviewed: 0,
    approvalRate: '0%',
    createdAt: new Date().toISOString(),
  };

  const inserted = Users().insert(newUser);
  const { passwordHash: _, ...safeUser } = inserted;
  return safeUser;
};

export const updateUser = async (id, data) => {
  await delay(300);

  const patch = { ...data };

  // If a new password is being set
  if (data.password) {
    if (data.password.length < 6) throw new Error('Password must be at least 6 characters.');
    patch.passwordHash = hashPassword(data.password);
    delete patch.password;
  }

  if (data.email) patch.email = data.email.trim().toLowerCase();

  const updated = Users().update(id, patch);
  if (!updated) throw new Error(`User ${id} not found`);
  const { passwordHash: _, ...safeUser } = updated;
  return safeUser;
};

export const deleteUser = async (id) => {
  await delay(300);
  const deleted = Users().delete(id);
  if (!deleted) throw new Error(`User ${id} not found`);
  return { id };
};

export const changePassword = async (id, currentPassword, newPassword) => {
  await delay(400);
  const user = Users().findById(id);
  if (!user) throw new Error('User not found.');
  if (user.passwordHash && !checkPassword(currentPassword, user.passwordHash)) {
    throw new Error('Current password is incorrect.');
  }
  if (newPassword.length < 6) throw new Error('New password must be at least 6 characters.');
  Users().update(id, { passwordHash: hashPassword(newPassword) });
  return { success: true };
};
