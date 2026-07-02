/**
 * DynamicField — renders a single schema-driven field by its `type`.
 * Types: text | number | textarea | select | multiselect | chips | toggle | date
 */
import { useState } from 'react';
import { FiPlus, FiX, FiCheck } from 'react-icons/fi';
import Input from '../common/Input';
import Select from '../common/Select';

function FieldLabel({ field }) {
  return (
    <label className="block text-sm font-500 text-gray-700 mb-1.5">
      {field.label}
      {field.required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Toggle({ field, value, onChange }) {
  const on = value === true;
  return (
    <button
      type="button"
      onClick={() => onChange(!on)}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-all
        ${on ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-white hover:border-gray-400'}`}
    >
      <span className={on ? 'text-blue-800 font-500' : 'text-gray-600'}>{field.label}</span>
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-gray-300'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${on ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </span>
    </button>
  );
}

function MultiSelect({ field, value = [], onChange }) {
  const selected = Array.isArray(value) ? value : [];
  const toggle = (opt) =>
    onChange(selected.includes(opt) ? selected.filter(v => v !== opt) : [...selected, opt]);
  return (
    <div className="flex flex-wrap gap-2">
      {field.options.map(opt => {
        const active = selected.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border font-500 transition-all
              ${active ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-300 hover:border-gray-400'}`}
          >
            {active && <FiCheck className="w-3.5 h-3.5" />}
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Chips({ field, value = [], onChange }) {
  const [draft, setDraft] = useState('');
  const chips = Array.isArray(value) ? value : [];
  const add = (raw) => {
    const v = raw.trim();
    if (v && !chips.includes(v)) onChange([...chips, v]);
    setDraft('');
  };
  const remove = (c) => onChange(chips.filter(x => x !== c));
  const suggestions = (field.suggestions || []).filter(s => !chips.includes(s));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {chips.map(c => (
          <span key={c} className="flex items-center gap-1 text-sm px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-500">
            {c}
            <button type="button" onClick={() => remove(c)} className="hover:text-blue-900"><FiX className="w-3 h-3" /></button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add(draft); } }}
        placeholder="Type a claim and press Enter"
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400"
      />
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestions.map(s => (
            <button key={s} type="button" onClick={() => add(s)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600">
              <FiPlus className="w-3 h-3" />{s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DynamicField({ field, value, onChange, error }) {
  const set = (v) => onChange(field.key, v);

  // Inputs that render their own label via the shared <Input> component.
  if (field.type === 'text' || field.type === 'number' || field.type === 'date') {
    return (
      <Input
        label={field.label}
        required={field.required}
        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
        placeholder={field.placeholder}
        value={value ?? ''}
        onChange={e => set(e.target.value)}
        error={error}
        {...(field.type === 'number' ? { min: '0', step: 'any' } : {})}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <div>
        <FieldLabel field={field} />
        <textarea
          rows={3}
          placeholder={field.placeholder}
          value={value ?? ''}
          onChange={e => set(e.target.value)}
          className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 resize-none transition-all
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.type === 'select') {
    return (
      <div>
        <FieldLabel field={field} />
        <Select
          value={value ?? ''}
          onChange={set}
          placeholder={`Select ${field.label.toLowerCase()}…`}
          options={field.options.map(opt => ({ value: opt, label: opt }))}
          error={error}
        />
      </div>
    );
  }

  if (field.type === 'toggle') {
    return <div><Toggle field={field} value={value} onChange={set} /></div>;
  }

  if (field.type === 'multiselect') {
    return (
      <div>
        <FieldLabel field={field} />
        <MultiSelect field={field} value={value} onChange={set} />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  if (field.type === 'chips') {
    return (
      <div>
        <FieldLabel field={field} />
        <Chips field={field} value={value} onChange={set} />
      </div>
    );
  }

  return null;
}
