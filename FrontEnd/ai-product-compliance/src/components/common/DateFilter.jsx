/**
 * DateFilter — calendar icon + Select preset + optional custom from/to date inputs.
 *
 * Props:
 *   value     — string preset ('all','today','week','month','quarter','custom')
 *               OR { from: string, to: string } for custom range
 *   onChange  — (value: string | { from: string, to: string }) => void
 *   className — extra class on wrapper div
 */

import { useState } from 'react';
import { FiCalendar } from 'react-icons/fi';
import Select from './Select';
import { DATE_FILTER_OPTIONS } from '../../utils/helpers';
import { useTheme } from '../../context/ThemeContext';

export default function DateFilter({ value, onChange, className = '' }) {
  const { isDark } = useTheme();

  // Derive initial preset from incoming value
  const initPreset = typeof value === 'object' ? 'custom' : (value || 'all');
  const initFrom   = typeof value === 'object' ? (value.from || '') : '';
  const initTo     = typeof value === 'object' ? (value.to   || '') : '';

  const [preset, setPreset] = useState(initPreset);
  const [from,   setFrom]   = useState(initFrom);
  const [to,     setTo]     = useState(initTo);

  const handlePreset = (v) => {
    setPreset(v);
    if (v === 'custom') {
      onChange({ from, to });
    } else {
      onChange(v);
    }
  };

  const handleFrom = (v) => {
    setFrom(v);
    onChange({ from: v, to });
  };

  const handleTo = (v) => {
    setTo(v);
    onChange({ from, to: v });
  };

  const inputStyle = {
    padding: '7px 10px',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    border: isDark
      ? '1px solid rgba(255,255,255,0.1)'
      : '1px solid rgba(155,192,185,0.65)',
    background: isDark ? '#1A1A1A' : '#ffffff',
    color: isDark ? '#FAFAFA' : '#0C3530',
    outline: 'none',
    width: 130,
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s',
    colorScheme: isDark ? 'dark' : 'light',
  };

  const focusInput = (e) => {
    e.target.style.borderColor = '#2BA090';
    e.target.style.boxShadow = '0 0 0 3px rgba(43,160,144,0.14)';
  };

  const blurInput = (e) => {
    e.target.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(155,192,185,0.65)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      className={className}
      style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}
    >
      <FiCalendar
        style={{
          width: 16,
          height: 16,
          color: isDark ? '#525252' : '#9CA3AF',
          flexShrink: 0,
        }}
      />

      <Select
        value={preset}
        onChange={handlePreset}
        options={DATE_FILTER_OPTIONS}
        className="w-36"
      />

      {preset === 'custom' && (
        <>
          <input
            type="date"
            value={from}
            onChange={e => handleFrom(e.target.value)}
            onFocus={focusInput}
            onBlur={blurInput}
            style={inputStyle}
          />
          <span style={{ fontSize: 12, color: isDark ? '#737373' : '#9CA3AF', flexShrink: 0 }}>
            to
          </span>
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={e => handleTo(e.target.value)}
            onFocus={focusInput}
            onBlur={blurInput}
            style={inputStyle}
          />
        </>
      )}
    </div>
  );
}
