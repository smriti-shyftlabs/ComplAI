import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import AIChat from '../components/chat/AIChat';

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - hidden on mobile, always visible on lg+ */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64">
          <Sidebar isOpen={true} onClose={() => {}} />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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

      {/* Floating AI Chat */}
      <AIChat />
    </div>
  );
}
