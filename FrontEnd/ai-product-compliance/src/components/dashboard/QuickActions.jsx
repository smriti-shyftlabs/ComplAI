import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlusCircle, FiShield, FiBarChart2, FiDownload, FiArrowRight } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const actions = [
  {
    icon: FiPlusCircle,
    label: 'Add Product',
    description: 'Upload and submit for review',
    accent: '#2BA090',
    gradDark: 'rgba(43,160,144,0.12)',
    gradLight: 'rgba(43,160,144,0.08)',
    borderDark: 'rgba(43,160,144,0.2)',
    borderLight: 'rgba(43,160,144,0.15)',
    path: '/products',
  },
  {
    icon: FiShield,
    label: 'Run Compliance Check',
    description: 'Analyze pending products',
    accent: '#2BA090',
    gradDark: 'rgba(43,160,144,0.12)',
    gradLight: 'rgba(43,160,144,0.08)',
    borderDark: 'rgba(43,160,144,0.2)',
    borderLight: 'rgba(43,160,144,0.15)',
    path: '/compliance',
  },
  {
    icon: FiBarChart2,
    label: 'View Reports',
    description: 'Analytics and insights',
    accent: '#A855F7',
    gradDark: 'rgba(168,85,247,0.12)',
    gradLight: 'rgba(168,85,247,0.08)',
    borderDark: 'rgba(168,85,247,0.2)',
    borderLight: 'rgba(168,85,247,0.15)',
    path: '/analytics',
  },
  {
    icon: FiDownload,
    label: 'Export Data',
    description: 'Download CSV or PDF',
    accent: '#F97316',
    gradDark: 'rgba(249,115,22,0.12)',
    gradLight: 'rgba(249,115,22,0.08)',
    borderDark: 'rgba(249,115,22,0.2)',
    borderLight: 'rgba(249,115,22,0.15)',
    path: '/audit',
  },
];

export default function QuickActions() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [hovered, setHovered] = useState(null);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((action, i) => {
        const isHov = hovered === i;
        const bg     = isHov
          ? (isDark ? action.gradDark : action.gradLight)
          : (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)');
        const border = isHov
          ? (isDark ? action.borderDark : action.borderLight)
          : (isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB');
        const iconBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.8)';

        return (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(action.path)}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
              padding: '16px 12px',
              borderRadius: 12,
              border: `1px solid ${border}`,
              background: bg,
              cursor: 'pointer',
              transition: 'background 0.18s ease, border-color 0.18s ease, transform 0.18s ease',
              transform: isHov ? 'translateY(-2px)' : 'translateY(0)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              width: 40, height: 40,
              borderRadius: 10,
              background: iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isDark ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
              transition: 'background 0.18s ease',
            }}>
              <action.icon style={{ width: 19, height: 19, color: isHov ? action.accent : (isDark ? '#A3A3A3' : '#6B7280') }} />
            </div>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 11.5, fontWeight: 600, color: isHov ? action.accent : (isDark ? '#D4D4D4' : '#374151'), margin: 0, transition: 'color 0.18s' }}>
                {action.label}
              </p>
              <p style={{ fontSize: 10.5, color: isDark ? '#525252' : '#9CA3AF', marginTop: 2, display: 'none' }} className="sm:block">
                {action.description}
              </p>
            </div>

            {/* Arrow reveal on hover */}
            <AnimatePresence>
              {isHov && (
                <motion.div
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -4 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    bottom: 8,
                    right: 10,
                    color: action.accent,
                    opacity: 0.7,
                  }}
                >
                  <FiArrowRight style={{ width: 12, height: 12 }} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
