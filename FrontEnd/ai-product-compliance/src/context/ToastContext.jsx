import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertCircle, FiInfo } from 'react-icons/fi';

const ToastContext = createContext(null);

// ── Colour map (theme-agnostic, works in both light and dark) ───────────────
const TYPE_CONFIG = {
  success: {
    icon: FiCheck,
    bg: 'linear-gradient(135deg,#0E3B2E,#0D4D3A)',
    border: 'rgba(16,185,129,0.4)',
    iconBg: 'rgba(16,185,129,0.25)',
    iconColor: '#34D399',
    text: '#A7F3D0',
  },
  error: {
    icon: FiX,
    bg: 'linear-gradient(135deg,#3B1010,#4A1414)',
    border: 'rgba(239,68,68,0.4)',
    iconBg: 'rgba(239,68,68,0.25)',
    iconColor: '#F87171',
    text: '#FECACA',
  },
  info: {
    icon: FiInfo,
    bg: 'linear-gradient(135deg,#0C2D29,#0F3A35)',
    border: 'rgba(43,160,144,0.4)',
    iconBg: 'rgba(43,160,144,0.25)',
    iconColor: '#2BA090',
    text: '#99D6CF',
  },
  warning: {
    icon: FiAlertCircle,
    bg: 'linear-gradient(135deg,#2D1F08,#3B2810)',
    border: 'rgba(245,158,11,0.4)',
    iconBg: 'rgba(245,158,11,0.25)',
    iconColor: '#FBBF24',
    text: '#FDE68A',
  },
};

// ── Individual Toast ────────────────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
  const c = TYPE_CONFIG[toast.type] || TYPE_CONFIG.info;
  const Icon = c.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.92, transition: { duration: 0.16 } }}
      transition={{ type: 'spring', damping: 22, stiffness: 300 }}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '12px 14px',
        borderRadius: 12,
        border: `1px solid ${c.border}`,
        background: c.bg,
        boxShadow: '0 8px 32px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.25)',
        minWidth: 260,
        maxWidth: 340,
        pointerEvents: 'all',
        cursor: 'default',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 28,
        height: 28,
        borderRadius: 8,
        background: c.iconBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon style={{ width: 14, height: 14, color: c.iconColor }} />
      </div>

      {/* Message */}
      <p style={{
        flex: 1,
        fontSize: 13.5,
        fontWeight: 500,
        lineHeight: 1.4,
        color: c.text,
        paddingTop: 4,
      }}>
        {toast.message}
      </p>

      {/* Close */}
      <button
        onClick={() => onDismiss(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 2,
          color: c.iconColor,
          opacity: 0.6,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 4,
          flexShrink: 0,
        }}
      >
        <FiX style={{ width: 13, height: 13 }} />
      </button>
    </motion.div>
  );
}

// ── Toast Container ─────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        alignItems: 'flex-end',
        pointerEvents: 'none',
      }}
    >
      <AnimatePresence>
        {toasts.map(t => (
          <Toast key={t.id} toast={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ── Provider ────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// Safe hook — returns no-op if called outside provider
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => {} };
  return ctx;
};
