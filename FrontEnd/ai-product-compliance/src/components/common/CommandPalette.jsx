import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiHome, FiPlusCircle, FiShield, FiCheckSquare,
  FiList, FiGlobe, FiBarChart2, FiSettings, FiCornerDownLeft, FiZap, FiX
} from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const allActions = [
  { id: 'dashboard',  label: 'Dashboard',          hint: 'Overview and key metrics',        icon: FiHome,        path: '/' },
  { id: 'products',   label: 'Add Product',         hint: 'Submit a product for compliance', icon: FiPlusCircle,  path: '/products' },
  { id: 'compliance', label: 'Compliance Report',   hint: 'Review compliance status',        icon: FiShield,      path: '/compliance' },
  { id: 'approval',   label: 'Approval Queue',      hint: 'Products awaiting approval',      icon: FiCheckSquare, path: '/approval' },
  { id: 'audit',      label: 'Audit Trail',         hint: 'Full activity history',           icon: FiList,        path: '/audit' },
  { id: 'published',  label: 'Published Products',  hint: 'Live catalog items',              icon: FiGlobe,       path: '/published' },
  { id: 'analytics',  label: 'Analytics',           hint: 'Charts, trends and insights',     icon: FiBarChart2,   path: '/analytics' },
  { id: 'settings',   label: 'Settings',            hint: 'Account and preferences',         icon: FiSettings,    path: '/settings' },
];

export default function CommandPalette() {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const filtered = allActions.filter(a =>
    !query ||
    a.label.toLowerCase().includes(query.toLowerCase()) ||
    a.hint.toLowerCase().includes(query.toLowerCase())
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelected(0);
  }, []);

  const execute = useCallback((action) => {
    navigate(action.path);
    close();
  }, [navigate, close]);

  // Keyboard & custom event listeners
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(o => !o);
      }
      if (e.key === 'Escape') close();
    };
    const onOpen = () => { setIsOpen(true); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('open-command-palette', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('open-command-palette', onOpen);
    };
  }, [close]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 40);
  }, [isOpen]);

  // Reset selection on query change
  useEffect(() => { setSelected(0); }, [query]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.children[selected];
    el?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const handleKey = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter' && filtered[selected]) {
      execute(filtered[selected]);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60]"
            style={{ background: isDark ? 'rgba(0,10,9,0.7)' : 'rgba(12,53,48,0.5)', backdropFilter: 'blur(6px)' }}
            onClick={close}
          />

          {/* Palette modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-[61] w-full max-w-[560px]"
            style={{ top: '16%', left: '50%', transform: 'translateX(-50%)' }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: isDark ? '#122420' : '#fff',
                boxShadow: isDark ? '0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.4)' : '0 32px 80px rgba(12,53,48,0.28), 0 8px 24px rgba(12,53,48,0.12)',
                border: isDark ? '1px solid rgba(43,160,144,0.2)' : '1px solid #BDD8D3',
              }}
            >
              {/* Search row */}
              <div
                className="flex items-center gap-3 px-4"
                style={{ height: 56, borderBottom: `1px solid ${isDark ? 'rgba(43,160,144,0.12)' : '#E5F3F0'}` }}
              >
                <FiSearch style={{ color: '#2BA090', width: 18, height: 18, flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Search pages, actions..."
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: isDark ? '#DDF0ED' : '#0C3530', fontSize: '0.95rem', fontWeight: 500 }}
                />
                <button
                  onClick={close}
                  className="flex items-center justify-center rounded-lg transition-all"
                  style={{ width: 28, height: 28, background: isDark ? '#182E2B' : '#F0FAF8', border: `1px solid ${isDark ? 'rgba(43,160,144,0.2)' : '#BDD8D3'}`, color: '#7EC8BE', flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.background = isDark ? '#1E3531' : '#C5E8E3'}
                  onMouseLeave={e => e.currentTarget.style.background = isDark ? '#182E2B' : '#F0FAF8'}
                >
                  <FiX style={{ width: 13, height: 13 }} />
                </button>
              </div>

              {/* Results list */}
              <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
                {filtered.length === 0 ? (
                  <div className="py-12 text-center" style={{ color: '#7EC8BE', fontSize: '0.85rem' }}>
                    No results for &ldquo;{query}&rdquo;
                  </div>
                ) : (
                  <div className="py-2">
                    <p
                      className="px-4 pb-2"
                      style={{ color: '#7EC8BE', fontSize: '0.63rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}
                    >
                      Quick Navigation
                    </p>
                    <div ref={listRef}>
                      {filtered.map((action, i) => {
                        const Icon = action.icon;
                        const isSelected = i === selected;
                        return (
                          <button
                            key={action.id}
                            onClick={() => execute(action)}
                            onMouseEnter={() => setSelected(i)}
                            className="w-full flex items-center gap-3.5 px-4 py-2.5 transition-all text-left"
                            style={{
                              background: isSelected ? '#F0FAF8' : 'transparent',
                              borderLeft: `3px solid ${isSelected ? '#2BA090' : 'transparent'}`,
                            }}
                          >
                            <div
                              className="flex items-center justify-center rounded-xl flex-shrink-0"
                              style={{
                                width: 36,
                                height: 36,
                                background: isSelected ? (isDark ? '#1E3531' : '#C5E8E3') : (isDark ? '#182E2B' : '#F4FBFA'),
                                transition: 'background 0.15s',
                              }}
                            >
                              <Icon style={{ width: 16, height: 16, color: isSelected ? '#0C3530' : '#2BA090' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p style={{ color: isDark ? '#DDF0ED' : '#0C3530', fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 }}>
                                {action.label}
                              </p>
                              <p style={{ color: '#7EC8BE', fontSize: '0.72rem', marginTop: 1 }}>
                                {action.hint}
                              </p>
                            </div>
                            {isSelected && (
                              <FiCornerDownLeft style={{ color: '#2BA090', width: 14, height: 14, flexShrink: 0 }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer hints */}
              <div
                className="flex items-center gap-4 px-4 py-2"
                style={{ borderTop: `1px solid ${isDark ? 'rgba(43,160,144,0.12)' : '#E5F3F0'}`, background: isDark ? '#0F201E' : '#FAFFFE' }}
              >
                {[
                  { keys: ['↑', '↓'], label: 'Navigate' },
                  { keys: ['↵'], label: 'Open' },
                ].map(({ keys, label }) => (
                  <span key={label} className="flex items-center gap-1.5" style={{ color: '#7EC8BE', fontSize: '0.72rem' }}>
                    {keys.map(k => (
                      <kbd key={k} style={{
                        background: '#EBF7F5', border: '1px solid #BDD8D3',
                        borderRadius: 4, padding: '1px 5px',
                        fontFamily: 'inherit', fontWeight: 700, fontSize: '0.62rem', color: '#2BA090'
                      }}>{k}</kbd>
                    ))}
                    {label}
                  </span>
                ))}
                <span className="flex items-center gap-1.5 ml-auto" style={{ color: '#7EC8BE', fontSize: '0.72rem' }}>
                  <kbd style={{ background: '#EBF7F5', border: '1px solid #BDD8D3', borderRadius: 4, padding: '1px 5px', fontFamily: 'inherit', fontWeight: 700, fontSize: '0.62rem', color: '#2BA090' }}>⌘K</kbd>
                  Toggle
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
