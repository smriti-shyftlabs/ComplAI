/**
 * Select — beautiful custom dropdown with full keyboard navigation.
 *
 * Props:
 *   value      — currently selected value (string)
 *   onChange   — (value: string) => void
 *   options    — Array<string | { value: string, label: string }>
 *   placeholder — string shown when nothing is selected
 *   label      — optional label rendered above
 *   error      — optional error string
 *   className  — extra class on the wrapper div
 *   disabled   — boolean
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiCheck } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  label,
  error,
  className = '',
  disabled = false,
}) {
  const [open, setOpen]           = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const wrapRef  = useRef(null);
  const listRef  = useRef(null);
  const { isDark } = useTheme();

  // Normalise options to { value, label }
  const items = options.map(o =>
    typeof o === 'string' ? { value: o, label: o } : o
  );
  const selected = items.find(i => i.value === value);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const openDropdown = useCallback(() => {
    if (disabled) return;
    setOpen(true);
    const idx = items.findIndex(i => i.value === value);
    setFocusedIdx(idx >= 0 ? idx : 0);
  }, [disabled, items, value]);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setFocusedIdx(-1);
  }, []);

  const selectItem = useCallback((val) => {
    onChange(val);
    closeDropdown();
  }, [onChange, closeDropdown]);

  // Close on click outside
  useEffect(() => {
    const handle = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) closeDropdown();
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [closeDropdown]);

  // Scroll focused item into view
  useEffect(() => {
    if (open && focusedIdx >= 0 && listRef.current) {
      const el = listRef.current.children[focusedIdx];
      if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focusedIdx, open]);

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const onKey = (e) => {
    if (disabled) return;
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!open) { openDropdown(); break; }
        setFocusedIdx(i => Math.min(i + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (!open) { openDropdown(); break; }
        setFocusedIdx(i => Math.max(i - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!open) { openDropdown(); break; }
        if (focusedIdx >= 0 && focusedIdx < items.length) {
          selectItem(items[focusedIdx].value);
        }
        break;
      case 'Tab':
        closeDropdown();
        break;
      default:
        break;
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const triggerStyle = {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s, background-color 0.15s',
    outline: 'none',
    border: open
      ? `1px solid #2BA090`
      : isDark
        ? `1px solid rgba(43,160,144,0.25)`
        : `1px solid rgba(155,192,185,0.65)`,
    background: isDark
      ? open ? '#1E3531' : '#182E2B'
      : open ? '#f6fdfb' : '#ffffff',
    color: selected
      ? isDark ? '#DDF0ED' : '#0C3530'
      : isDark ? '#4A9B90' : '#9CA3AF',
    boxShadow: open
      ? `0 0 0 3px rgba(43,160,144,0.14)`
      : isDark
        ? '0 1px 3px rgba(0,0,0,0.25)'
        : '0 1px 2px rgba(12,53,48,0.05)',
    opacity: disabled ? 0.5 : 1,
  };

  const panelStyle = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    zIndex: 9999,
    borderRadius: 10,
    overflow: 'hidden',
    border: isDark
      ? '1px solid rgba(43,160,144,0.2)'
      : '1px solid rgba(189,216,211,0.55)',
    background: isDark ? '#122420' : '#ffffff',
    boxShadow: isDark
      ? '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)'
      : '0 8px 32px rgba(12,53,48,0.12), 0 2px 8px rgba(12,53,48,0.06)',
  };

  return (
    <div className={className} style={{ position: 'relative' }} ref={wrapRef}>
      {label && (
        <label style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 6,
          color: isDark ? '#B0D8D1' : '#374151',
        }}>
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => open ? closeDropdown() : openDropdown()}
        onKeyDown={onKey}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={triggerStyle}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selected?.label || placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}
        >
          <FiChevronDown
            style={{
              width: 15, height: 15,
              color: isDark ? '#4A9B90' : '#6B7280',
              transition: 'color 0.15s',
            }}
          />
        </motion.span>
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            style={panelStyle}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: -6,  scale: 0.97 }}
            transition={{ duration: 0.14, ease: 'easeOut' }}
          >
            <div ref={listRef} style={{ maxHeight: 224, overflowY: 'auto', padding: '4px 0' }}>
              {items.map((item, i) => {
                const isSelected = item.value === value;
                const isFocused  = i === focusedIdx;
                return (
                  <button
                    key={item.value}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onClick={() => selectItem(item.value)}
                    onMouseEnter={() => setFocusedIdx(i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '8px 12px',
                      fontSize: 13.5,
                      fontWeight: isSelected ? 600 : 400,
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: 'none',
                      outline: 'none',
                      transition: 'background 0.1s',
                      background: isSelected
                        ? isDark
                          ? 'rgba(43,160,144,0.22)'
                          : 'rgba(43,160,144,0.1)'
                        : isFocused
                          ? isDark
                            ? 'rgba(43,160,144,0.12)'
                            : 'rgba(43,160,144,0.06)'
                          : 'transparent',
                      color: isSelected
                        ? isDark ? '#7EC8BE' : '#155E56'
                        : isDark ? '#C8E8E3' : '#1F2937',
                    }}
                  >
                    <span>{item.label}</span>
                    {isSelected && (
                      <FiCheck style={{ width: 13, height: 13, flexShrink: 0, color: isDark ? '#7EC8BE' : '#2BA090' }} />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>{error}</p>
      )}
    </div>
  );
}
