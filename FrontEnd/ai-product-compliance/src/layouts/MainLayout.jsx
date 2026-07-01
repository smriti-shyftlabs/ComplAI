import { useState, useRef } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIChat from '../components/chat/AIChat';
import CommandPalette from '../components/common/CommandPalette';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);   // mobile
  const [sidebarExpanded, setSidebarExpanded] = useState(true); // desktop hover state
  const collapseTimer = useRef(null);

  const handleSidebarEnter = () => {
    clearTimeout(collapseTimer.current);
    setSidebarExpanded(true);
  };

  const handleSidebarLeave = () => {
    collapseTimer.current = setTimeout(() => setSidebarExpanded(false), 180);
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#F0FAF8' }}>
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
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 min-h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Global overlays */}
      <AIChat />
      <CommandPalette />
    </div>
  );
}
