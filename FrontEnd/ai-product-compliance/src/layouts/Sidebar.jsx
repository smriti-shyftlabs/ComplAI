import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiHome, FiPlusCircle, FiShield, FiCheckSquare, FiList,
  FiGlobe, FiBarChart2, FiSettings, FiLogOut, FiZap, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard',         path: '/',           icon: FiHome },
  { label: 'Add Product',       path: '/products',   icon: FiPlusCircle },
  { label: 'Compliance Report', path: '/compliance', icon: FiShield },
  { label: 'Approval Queue',    path: '/approval',   icon: FiCheckSquare },
  { label: 'Audit Trail',       path: '/audit',      icon: FiList },
  { label: 'Published',         path: '/published',  icon: FiGlobe },
  { label: 'Analytics',         path: '/analytics',  icon: FiBarChart2 },
  { label: 'Settings',          path: '/settings',   icon: FiSettings },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

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
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : '-100%' }}
        transition={{ type: 'tween', duration: 0.25 }}
        className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 flex flex-col shadow-lg lg:translate-x-0 lg:static lg:z-auto lg:shadow-none"
        style={{ transform: undefined }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <FiShield className="text-white w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-900 leading-tight block">ComplianceAI</span>
            <span className="text-xs text-gray-500">Catalog Governance</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Main Menu</p>
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
                    className="relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150"
                    style={{
                      color: isActive ? '#2563EB' : '#374151',
                      backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                    }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-blue-50 rounded-lg"
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    {!isActive && hoveredItem === item.path && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 bg-gray-50 rounded-lg"
                      />
                    )}
                    <Icon
                      className="w-4 h-4 flex-shrink-0 relative z-10 transition-colors"
                      style={{ color: isActive ? '#2563EB' : hoveredItem === item.path ? '#2563EB' : '#6B7280' }}
                    />
                    <span className="relative z-10">{item.label}</span>
                    {isActive && <FiChevronRight className="w-3.5 h-3.5 ml-auto relative z-10 text-blue-400" />}
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* AI badge */}
          <div className="mt-6 mx-2">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-1">
                <FiZap className="w-4 h-4" />
                <span className="text-sm font-semibold">AI Powered</span>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">Real-time compliance analysis with 99%+ accuracy</p>
            </div>
          </div>
        </nav>

        {/* User profile + logout */}
        <div className="border-t border-gray-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <span className="text-white text-sm font-semibold">{currentUser?.avatar || 'AU'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{currentUser?.role || ''}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
