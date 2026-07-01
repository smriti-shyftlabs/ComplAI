import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu, FiBell, FiSearch, FiSun, FiMoon, FiChevronDown,
  FiUser, FiSettings, FiLogOut
} from 'react-icons/fi';
import { getNotifications, markAllNotificationsRead } from '../services/metaService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onMenuClick }) {
  const { currentUser, logout } = useAuth();
  const { isDark, toggleDark } = useTheme();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications().then(setNotifications).catch(() => setNotifications([]));
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

  const handleLogout = () => {
    setShowProfile(false);
    logout();
  };

  const typeColors = {
    action: 'bg-teal-600', warning: 'bg-yellow-500',
    success: 'bg-teal-600', error: 'bg-red-500', info: 'bg-gray-400',
  };

  return (
    <header className="sticky top-0 z-30 h-16 flex items-center px-4 sm:px-6 gap-4" style={{ background: isDark ? '#0F2421' : '#F0FAF8', borderBottom: `1px solid ${isDark ? 'rgba(43,160,144,0.15)' : '#BDD8D3'}` }}>
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg transition-colors" style={{ color: '#2BA090' }}
      >
        <FiMenu className="w-5 h-5" />
      </button>

      {/* Greeting */}
      <div className="hidden sm:block">
        <p className="text-sm font-semibold" style={{ color: '#0C3530' }}>{getGreeting()}, {currentUser?.name?.split(' ')[0] || 'User'}</p>
        <p className="text-xs" style={{ color: '#2BA090' }}>Welcome back to ComplAI</p>
      </div>

      {/* Search — opens command palette */}
      <div className="flex-1 max-w-md mx-auto">
        <button
          onClick={() => window.dispatchEvent(new Event('open-command-palette'))}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm transition-all text-left"
          style={{ background: isDark ? '#182E2B' : '#C5E8E3', border: `1px solid ${isDark ? 'rgba(43,160,144,0.2)' : '#BDD8D3'}`, color: '#7EC8BE' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#2BA090'; e.currentTarget.style.background = '#BBE0DA'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#BDD8D3'; e.currentTarget.style.background = '#C5E8E3'; }}
        >
          <FiSearch style={{ width: 15, height: 15, flexShrink: 0, color: '#2BA090' }} />
          <span style={{ flex: 1, fontWeight: 500, fontSize: '0.82rem' }}>Search or jump to...</span>
          <span className="hidden sm:flex items-center gap-0.5">
            <kbd style={{ background: '#F0FAF8', border: '1px solid #BDD8D3', borderRadius: 4, padding: '1px 5px', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.6rem', color: '#2BA090' }}>⌘</kbd>
            <kbd style={{ background: '#F0FAF8', border: '1px solid #BDD8D3', borderRadius: 4, padding: '1px 5px', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.6rem', color: '#2BA090' }}>K</kbd>
          </span>
        </button>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleDark}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isDark ? <FiSun className="w-4 h-4" /> : <FiMoon className="w-4 h-4" />}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setShowNotifications(p => !p); setShowProfile(false); }}
            className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
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
                className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">Notifications</span>
                  <button onClick={markAllRead} className="text-xs text-teal-700 cursor-pointer hover:underline">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`flex gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 ${!n.read ? 'bg-teal-50/40' : ''}`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${typeColors[n.type] || 'bg-gray-400'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-gray-100 text-center">
                  <span className="text-xs text-teal-700 cursor-pointer hover:underline">View all notifications</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => { setShowProfile(p => !p); setShowNotifications(false); }}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-semibold">{currentUser?.avatar || 'U'}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-900 leading-tight">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-gray-500">{currentUser?.role || ''}</p>
            </div>
            <FiChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900">{currentUser?.name}</p>
                  <p className="text-xs text-gray-500">{currentUser?.email}</p>
                  <span className="inline-block mt-1 text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium">{currentUser?.role}</span>
                </div>
                <button
                  onClick={() => { navigate('/settings'); setShowProfile(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiUser className="w-4 h-4 text-gray-400" /> Profile
                </button>
                <button
                  onClick={() => { navigate('/settings'); setShowProfile(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FiSettings className="w-4 h-4 text-gray-400" /> Settings
                </button>
                <div className="border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                  >
                    <FiLogOut className="w-4 h-4" /> Sign Out
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
