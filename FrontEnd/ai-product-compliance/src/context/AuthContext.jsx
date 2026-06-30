/**
 * AuthContext — provides currentUser, login, logout, and register
 * throughout the entire app. Session is persisted to sessionStorage
 * so it survives refreshes but clears when the tab is closed.
 */

import { createContext, useContext, useState, useCallback } from 'react';
import * as userService from '../services/userService';

const AuthContext = createContext(null);

const SESSION_KEY = 'complianceai_session';

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else sessionStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(loadSession);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const user = await userService.login(email, password);
      setCurrentUser(user);
      saveSession(user);
      return user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    saveSession(null);
  }, []);

  const register = useCallback(async (data) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const user = await userService.createUser(data);
      setCurrentUser(user);
      saveSession(user);
      return user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (patch) => {
    if (!currentUser) return;
    const updated = await userService.updateUser(currentUser.id, patch);
    setCurrentUser(updated);
    saveSession(updated);
    return updated;
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, authLoading, authError, login, logout, register, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
