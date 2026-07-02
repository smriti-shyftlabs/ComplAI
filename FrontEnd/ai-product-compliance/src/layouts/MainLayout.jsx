import { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIChat from '../components/chat/AIChat';
import CommandPalette from '../components/common/CommandPalette';

export default function MainLayout({ children }) {
  const { isDark } = useTheme();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const collapseTimer = useRef(null);

  const handleSidebarEnter = () => {
    clearTimeout(collapseTimer.current);
    setSidebarExpanded(true);
  };

  const handleSidebarLeave = () => {
    collapseTimer.current = setTimeout(() => setSidebarExpanded(false), 180);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: isDark ? '#0D1F1D' : '#F0FAF8' }}>
      {/* Desktop Sidebar — hover to expand */}
      <div
        className="hidden lg:flex lg:flex-shrink-0 transition-all duration-300"
        style={{ width: sidebarExpanded ? 256 : 72 }}
        onMouseEnter={handleSidebarEnter}
        onMouseLeave={handleSidebarLeave}
      >
        <Sidebar
          isOpen={true}
          onClose={() => {}}
          isCollapsed={!sidebarExpanded}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={false}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.06 } }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{ position: 'absolute', inset: 0, overflowY: 'auto' }}
              className="p-4 sm:p-6 lg:p-8"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global overlays */}
      <AIChat />
      <CommandPalette />
    </div>
  );
}
