import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiShield, FiCheckSquare, FiList,
  FiGlobe, FiBarChart2, FiSettings, FiLogOut, FiZap
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { label: 'Dashboard',         path: '/',           icon: FiHome },
  { label: 'Compliance Report', path: '/compliance', icon: FiShield },
  { label: 'Products',          path: '/approval',   icon: FiCheckSquare },
  { label: 'Audit Trail',       path: '/audit',      icon: FiList },
  { label: 'Published',         path: '/published',  icon: FiGlobe },
  { label: 'Analytics',         path: '/analytics',  icon: FiBarChart2 },
  { label: 'Settings',          path: '/settings',   icon: FiSettings },
];

export default function Sidebar({ isOpen, onClose, isCollapsed = false }) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);
  const { isDark } = useTheme();

  const handleLogout = () => {
    logout();
    onClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.25 }}
        className="fixed left-0 top-0 h-full z-50 flex flex-col lg:translate-x-0 lg:static lg:z-auto overflow-hidden"
        style={{
          width: isCollapsed ? 72 : 256,
          background: isDark ? '#071614' : '#0C3530',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center px-4 py-[18px]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', minHeight: 64 }}
        >
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-xl"
            style={{
              width: 36,
              height: 36,
              background: 'linear-gradient(135deg, #7EC8BE, #2BA090)',
              boxShadow: '0 4px 12px rgba(12,53,48,0.5)',
            }}
          >
            <FiShield style={{ color: '#0C3530', width: 17, height: 17 }} />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.16 }}
                className="ml-3 overflow-hidden"
              >
                <span
                  className="block text-white whitespace-nowrap"
                  style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em' }}
                >
                  ComplAI
                </span>
                <span
                  className="block whitespace-nowrap"
                  style={{ color: '#7EC8BE', fontSize: '0.67rem', fontWeight: 500, letterSpacing: '0.05em' }}
                >
                  Catalog Governance
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2.5 py-4 overflow-y-auto overflow-x-hidden">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="px-3 mb-3 whitespace-nowrap"
                style={{
                  color: '#1A5048',
                  fontSize: '0.63rem',
                  fontWeight: 700,
                  letterSpacing: '0.13em',
                  textTransform: 'uppercase',
                }}
              >
                Main Menu
              </motion.p>
            )}
          </AnimatePresence>

          <ul className="space-y-0.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path ||
                (item.path !== '/' && location.pathname.startsWith(item.path));
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    onMouseEnter={() => setHoveredItem(item.path)}
                    onMouseLeave={() => setHoveredItem(null)}
                    title={isCollapsed ? item.label : undefined}
                    className="relative flex items-center rounded-lg transition-all duration-150 overflow-hidden"
                    style={{
                      padding: isCollapsed ? '10px 0' : '10px 12px',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      gap: isCollapsed ? 0 : 12,
                      color: isActive ? '#C5E8E3' : '#7EC8BE',
                      background: isActive ? 'rgba(126,200,190,0.14)' : 'transparent',
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 rounded-lg"
                        style={{
                          background: 'rgba(126,200,190,0.14)',
                          borderLeft: isCollapsed ? 'none' : '3px solid #7EC8BE',
                        }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    {!isActive && hoveredItem === item.path && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 rounded-lg"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      />
                    )}

                    <Icon
                      className="flex-shrink-0 relative z-10"
                      style={{
                        width: 17,
                        height: 17,
                        color: isActive ? '#7EC8BE' : hoveredItem === item.path ? '#7EC8BE' : '#2A6B60',
                      }}
                    />

                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          transition={{ duration: 0.14 }}
                          className="relative z-10 whitespace-nowrap truncate"
                          style={{
                            fontSize: '0.825rem',
                            fontWeight: isActive ? 700 : 600,
                            letterSpacing: isActive ? '-0.01em' : '0',
                          }}
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* AI badge */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
                className="mt-5 mx-1"
              >
                <div
                  className="rounded-xl p-3.5"
                  style={{ background: 'rgba(126,200,190,0.1)', border: '1px solid rgba(126,200,190,0.2)' }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <FiZap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#7EC8BE' }} />
                    <span style={{ color: '#C5E8E3', fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.01em' }}>
                      AI Powered
                    </span>
                  </div>
                  <p style={{ color: '#7EC8BE', fontSize: '0.7rem', lineHeight: 1.5 }}>
                    Real-time compliance analysis with 99%+ accuracy
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* User profile */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div
            className="flex items-center"
            style={{ gap: isCollapsed ? 0 : 10, justifyContent: isCollapsed ? 'center' : 'flex-start' }}
          >
            <div
              className="rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                width: 34, height: 34,
                background: 'linear-gradient(135deg, #2BA090, #0E4540)',
                boxShadow: '0 2px 8px rgba(12,53,48,0.5)',
              }}
            >
              <span className="text-white text-xs" style={{ fontWeight: 700 }}>
                {currentUser?.avatar || 'AU'}
              </span>
            </div>

            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.14 }}
                  className="flex-1 min-w-0 flex items-center gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white truncate" style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.3 }}>
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="truncate" style={{ color: '#7EC8BE', fontSize: '0.68rem', fontWeight: 500 }}>
                      {currentUser?.role || ''}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                    style={{ color: '#1A5048' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#1A5048'; }}
                  >
                    <FiLogOut className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
