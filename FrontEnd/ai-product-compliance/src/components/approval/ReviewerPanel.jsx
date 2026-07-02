import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getUsers } from '../../services/userService';
import { useTheme } from '../../context/ThemeContext';

const PUBLISH_MIN_SCORE = 75;

export default function ReviewerPanel({ products = [] }) {
  const [users, setUsers] = useState([]);
  const { isDark } = useTheme();

  useEffect(() => {
    getUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const pending        = products.filter(p => p.status === 'pending');
  const awaitingPublish = products.filter(
    p => p.status === 'approved' && (Number(p.complianceScore) || 0) >= PUBLISH_MIN_SCORE
  );
  const rejected  = products.filter(p => p.status === 'rejected');
  const published = products.filter(p => p.status === 'published');

  const stats = [
    { label: 'Pending',          value: pending.length,         accent: isDark ? 'rgba(245,158,11,0.15)' : '#FFFBEB',  color: '#F59E0B' },
    { label: 'Awaiting Publish', value: awaitingPublish.length, accent: isDark ? 'rgba(43,160,144,0.15)' : '#F0FAF8',  color: '#2BA090' },
    { label: 'Rejected',         value: rejected.length,         accent: isDark ? 'rgba(239,68,68,0.12)'  : '#FEF2F2',  color: '#EF4444' },
    { label: 'Published',        value: published.length,        accent: isDark ? 'rgba(16,185,129,0.12)' : '#ECFDF5',  color: '#10B981' },
  ];

  const cardBg     = isDark ? '#141414' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : '#E5E7EB';
  const divider    = isDark ? 'rgba(255,255,255,0.06)' : '#F1F5F9';
  const textPri    = isDark ? '#FAFAFA' : '#111827';
  const textSec    = isDark ? '#A3A3A3' : '#6B7280';
  const textMut    = isDark ? '#525252' : '#9CA3AF';
  const rowBg      = isDark ? 'rgba(255,255,255,0.04)' : '#F9FAFB';
  const rowHover   = isDark ? 'rgba(255,255,255,0.07)' : '#F3F4F6';
  const trackBg    = isDark ? '#2A2A2A' : '#E5E7EB';

  return (
    <div style={{
      background: cardBg,
      border: `1px solid ${cardBorder}`,
      borderRadius: 12,
      boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.4)' : '0 1px 3px rgba(0,0,0,0.06)',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>

      {/* Queue Overview */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textPri, margin: '0 0 12px' }}>Queue Overview</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              borderRadius: 10,
              background: s.accent,
              border: `1px solid ${s.color}20`,
              padding: '10px 12px',
            }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 11, color: textSec, margin: '4px 0 0' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Assigned Reviewers */}
      <div style={{ borderTop: `1px solid ${divider}`, paddingTop: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textPri, margin: '0 0 12px' }}>Assigned Reviewers</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {users.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10,
                background: rowBg,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = rowHover; }}
              onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #155E56, #2BA090)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>
                {user.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: textPri, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </p>
                <p style={{ fontSize: 11, color: textSec, margin: 0 }}>{user.role}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#2BA090', margin: 0 }}>{user.approvalRate}</p>
                <p style={{ fontSize: 11, color: textMut, margin: 0 }}>{user.productsReviewed} reviewed</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* SLA Status */}
      <div style={{ borderTop: `1px solid ${divider}`, paddingTop: 16 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: textPri, margin: '0 0 12px' }}>SLA Status</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'Reviewed within 24h', value: '73%', color: '#2BA090', width: '73%' },
            { label: 'Reviewed within 48h', value: '91%', color: '#2BA090', width: '91%' },
            { label: 'SLA Breaches',         value: '4%',  color: '#EF4444', width: '4%'  },
          ].map(item => (
            <div key={item.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: textSec, marginBottom: 5 }}>
                <span>{item.label}</span>
                <span style={{ fontWeight: 600, color: item.color }}>{item.value}</span>
              </div>
              <div style={{ height: 5, background: trackBg, borderRadius: 9999, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: item.width }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  style={{ height: '100%', borderRadius: 9999, background: item.color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
