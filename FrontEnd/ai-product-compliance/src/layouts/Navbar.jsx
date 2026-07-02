import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiBell, FiSearch, FiSun, FiMoon, FiChevronDown,
  FiUser, FiSettings, FiLogOut, FiShield
} from 'react-icons/fi';
import { getNotifications, markAllNotificationsRead } from '../services/metaService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/** Extract up to 2 initials from a full name */
function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Navbar({ onMenuClick }) {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notifRef  = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    getNotifications().then(setNotifications).catch(() => setNotifications([]));
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handle = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))  setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = async () => {
    try { await markAllNotificationsRead(); } catch { /* ignore */ }
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogout = () => { setShowProfile(false); logout(); };

  const typeColors = {
    action: 'bg-teal-600', warning: 'bg-yellow-500',
    success: 'bg-teal-600', error: 'bg-red-500', info: 'bg-gray-400',
  };

  const initials = getInitials(currentUser?.name);

  // ── Shared dropdown styles ──────────────────────────────────────────────
  const dropdownBase = {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    zIndex: 50,
    borderRadius: 14,
    overflow: 'hidden',
    border: isDark ? '1px solid rgba(43,160,144,0.18)' : '1px solid #E2E8F0',
    background: isDark ? '#132622' : '#ffffff',
    boxShadow: isDark
      ? '0 16px 48px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.3)'
      : '0 16px 48px rgba(12,53,48,0.14), 0 4px 12px rgba(12,53,48,0.06)',
  };

  const menuItem = (extra = {}) => ({
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 16px',
    fontSize: 13.5,
    fontWeight: 500,
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    textAlign: 'left',
    color: isDark ? '#C8E8E3' : '#374151',
    transition: 'background 0.12s',
    ...extra,
  });

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 gap-4"
      style={{
        background: isDark ? '#0F2421' : '#F0FAF8',
        borderBottom: `1px solid ${isDark ? 'rgba(43,160,144,0.15)' : '#BDD8D3'}`,
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg transition-colors"
        style={{ color: '#2BA090' }}
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Greeting */}
      <div className="hidden sm:block">
        <p className="text-sm font-semibold" style={{ color: isDark ? '#A8D5CE' : '#0C3530' }}>
          {getGreeting()}, {currentUser?.name?.split(' ')[0] || 'User'}
        </p>
        <p className="text-xs" style={{ color: isDark ? '#4A9B90' : '#2BA090' }}>
          Welcome back to ComplAI
        </p>
      </div>

      {/* Search — opens command palette */}
      <div className="flex-1 max-w-md mx-auto">
        <button
          onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-all text-left"
          style={{
            background: isDark ? '#182E2B' : '#C5E8E3',
            border: `1px solid ${isDark ? 'rgba(43,160,144,0.2)' : '#BDD8D3'}`,
            color: isDark ? '#4A9B90' : '#7EC8BE',
          }}
        >
          <FiSearch style={{ width: 15, height: 15, flexShrink: 0, color: isDark ? '#2BA090' : '#2BA090' }} />
          <span style={{ flex: 1, fontWeight: 500, fontSize: '0.82rem' }}>Search or jump to...</span>
          <span className="hidden sm:flex items-center gap-0.5">
            {['⌘', 'K'].map(k => (
              <kbd key={k} style={{
                background: isDark ? '#1E3531' : '#F0FAF8',
                border: `1px solid ${isDark ? 'rgba(43,160,144,0.25)' : '#BDD8D3'}`,
                borderRadius: 4, padding: '1px 5px',
                fontFamily: 'inherit', fontWeight: 700,
                fontSize: '0.6rem', color: '#2BA090',
              }}>{k}</kbd>
            ))}
          </span>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 ml-auto">

        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg transition-colors"
          style={{ color: isDark ? '#4A9B90' : '#6B7280' }}
          onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(43,160,144,0.12)' : '#E5E7EB'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
        >
          {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
        </button>

        {/* ── Notifications ─────────────────────────────────────────── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotifications(p => !p); setShowProfile(false); }}
            className="relative p-2 rounded-lg transition-colors"
            style={{ color: isDark ? '#4A9B90' : '#6B7280' }}
            onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(43,160,144,0.12)' : '#E5E7EB'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <FiBell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{ ...dropdownBase, width: 320 }}
              >
                {/* Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderBottom: `1px solid ${isDark ? 'rgba(43,160,144,0.12)' : '#F1F5F9'}`,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: isDark ? '#DDF0ED' : '#111827' }}>
                    Notifications
                  </span>
                  <button
                    onClick={markAllRead}
                    style={{ fontSize: 12, color: '#2BA090', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 500 }}
                  >
                    Mark all read
                  </button>
                </div>

                {/* List */}
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        display: 'flex', gap: 12, padding: '12px 16px',
                        cursor: 'pointer',
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB'}`,
                        background: !n.read
                          ? isDark ? 'rgba(43,160,144,0.07)' : 'rgba(43,160,144,0.04)'
                          : 'transparent',
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[n.type] || 'bg-gray-400'}`} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: !n.read ? 600 : 500, color: isDark ? '#DDF0ED' : '#111827' }}>
                          {n.title}
                        </p>
                        <p style={{ fontSize: 11, color: isDark ? '#6B9E99' : '#6B7280', marginTop: 2 }}>{n.message}</p>
                        <p style={{ fontSize: 11, color: isDark ? '#4A9B90' : '#9CA3AF', marginTop: 4 }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div style={{
                  padding: '10px 16px', textAlign: 'center',
                  borderTop: `1px solid ${isDark ? 'rgba(43,160,144,0.12)' : '#F1F5F9'}`,
                }}>
                  <button style={{ fontSize: 12, color: '#2BA090', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 500 }}>
                    View all notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Profile ───────────────────────────────────────────────── */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(p => !p); setShowNotifications(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px 6px 6px',
              borderRadius: 10,
              cursor: 'pointer',
              border: 'none',
              background: showProfile
                ? isDark ? 'rgba(43,160,144,0.14)' : '#E5E7EB'
                : 'transparent',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => {
              if (!showProfile) e.currentTarget.style.background = isDark ? 'rgba(43,160,144,0.1)' : '#F3F4F6';
            }}
            onMouseLeave={e => {
              if (!showProfile) e.currentTarget.style.background = 'transparent';
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'linear-gradient(135deg, #155E56, #2BA090)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(21,94,86,0.35)',
              fontSize: 13, fontWeight: 700, color: '#fff',
              letterSpacing: '0.03em',
            }}>
              {initials}
            </div>

            {/* Name + role */}
            <div className="hidden sm:block text-left" style={{ lineHeight: 1.25 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#DDF0ED' : '#111827' }}>
                {currentUser?.name || 'User'}
              </p>
              <p style={{ fontSize: 11, color: isDark ? '#4A9B90' : '#6B7280' }}>
                {currentUser?.role || 'Member'}
              </p>
            </div>

            <FiChevronDown
              className="hidden sm:block"
              style={{
                width: 14, height: 14,
                color: isDark ? '#4A9B90' : '#9CA3AF',
                transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.18s',
              }}
            />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{ ...dropdownBase, width: 220 }}
              >
                {/* User info */}
                <div style={{
                  padding: '14px 16px 12px',
                  borderBottom: `1px solid ${isDark ? 'rgba(43,160,144,0.12)' : '#F1F5F9'}`,
                }}>
                  {/* Mini avatar row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #155E56, #2BA090)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: '#fff',
                      boxShadow: '0 2px 8px rgba(21,94,86,0.35)',
                    }}>
                      {initials}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#DDF0ED' : '#111827', lineHeight: 1.3 }}>
                        {currentUser?.name}
                      </p>
                      <p style={{ fontSize: 11, color: isDark ? '#4A9B90' : '#6B7280' }}>
                        {currentUser?.email}
                      </p>
                    </div>
                  </div>
                  {/* Role badge */}
                  <span style={{
                    display: 'inline-block',
                    fontSize: 11, fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 20,
                    background: isDark ? 'rgba(43,160,144,0.18)' : 'rgba(43,160,144,0.1)',
                    color: isDark ? '#7EC8BE' : '#155E56',
                    border: `1px solid ${isDark ? 'rgba(43,160,144,0.3)' : 'rgba(43,160,144,0.25)'}`,
                  }}>
                    {currentUser?.role || 'Member'}
                  </span>
                </div>

                {/* Menu items */}
                <div style={{ padding: '6px 0' }}>
                  <button
                    style={menuItem()}
                    onClick={() => { navigate('/settings'); setShowProfile(false); }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(43,160,144,0.1)' : '#F9FAFB'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <FiUser style={{ width: 15, height: 15, color: isDark ? '#4A9B90' : '#9CA3AF' }} />
                    Profile
                  </button>
                  <button
                    style={menuItem()}
                    onClick={() => { navigate('/settings'); setShowProfile(false); }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(43,160,144,0.1)' : '#F9FAFB'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <FiSettings style={{ width: 15, height: 15, color: isDark ? '#4A9B90' : '#9CA3AF' }} />
                    Settings
                  </button>
                  <button
                    style={menuItem()}
                    onClick={() => { navigate('/settings'); setShowProfile(false); }}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(43,160,144,0.1)' : '#F9FAFB'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <FiShield style={{ width: 15, height: 15, color: isDark ? '#4A9B90' : '#9CA3AF' }} />
                    Compliance Rules
                  </button>
                </div>

                {/* Sign out */}
                <div style={{ borderTop: `1px solid ${isDark ? 'rgba(43,160,144,0.12)' : '#F1F5F9'}`, padding: '6px 0' }}>
                  <button
                    style={menuItem({ color: '#EF4444', fontWeight: 600 })}
                    onClick={handleLogout}
                    onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(239,68,68,0.1)' : '#FEF2F2'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                  >
                    <FiLogOut style={{ width: 15, height: 15, color: '#EF4444' }} />
                    Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
