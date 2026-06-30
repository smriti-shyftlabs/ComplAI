import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiSearch, FiCheck } from 'react-icons/fi';
import { CATEGORIES } from '../../utils/constants';

export default function CategorySelector({ value, onChange, label = 'Category', required = false, error }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  const filtered = CATEGORIES.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-500 text-gray-700 mb-1.5">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm bg-white text-left transition-all
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error ? 'border-red-300' : 'border-gray-300 hover:border-gray-400'}
          ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
        `}
      >
        <span className={value ? 'text-gray-900' : 'text-gray-400'}>{value || 'Select category...'}</span>
        <FiChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <FiSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search categories..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="text-sm text-gray-400 px-3 py-2 text-center">No categories found</p>
              ) : (
                filtered.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => { onChange(category); setIsOpen(false); setSearch(''); }}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-blue-50 hover:text-blue-700 transition-colors rounded-lg mx-1 w-[calc(100%-8px)]"
                  >
                    <span className={value === category ? 'font-600 text-blue-600' : 'text-gray-700'}>{category}</span>
                    {value === category && <FiCheck className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
