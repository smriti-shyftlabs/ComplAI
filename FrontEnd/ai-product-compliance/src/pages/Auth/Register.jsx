import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const ROLES = ['Admin', 'Senior Reviewer', 'Compliance Analyst', 'Junior Reviewer', 'Viewer'];
const DEPARTMENTS = ['Compliance', 'Platform', 'Legal', 'Operations', 'Quality Assurance'];

const inputCls =
  'w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition';
const selectCls =
  'w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition';

export default function Register({ onSwitchToLogin }) {
  const { register, authLoading, authError } = useAuth();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: 'Junior Reviewer', department: 'Compliance',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError('');
  };

  const validate = () => {
    if (!form.name.trim()) return 'Full name is required.';
    if (!form.email.trim()) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Enter a valid email address.';
    if (form.password.length < 6) return 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword) return 'Passwords do not match.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setLocalError(err); return; }
    try {
      await register({ name: form.name, email: form.email, password: form.password, role: form.role, department: form.department });
    } catch {
      // shown via authError
    }
  };

  const error = localError || authError;

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'];
  const strengthColor = ['', 'bg-red-400', 'bg-amber-400', 'bg-emerald-500'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create account</h2>
        <p className="text-sm text-slate-500 mt-1">Join your team on ComplAI</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-4 text-sm text-red-700"
        >
          <FiAlertCircle className="shrink-0" />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
          <div className="relative">
            <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@company.com" className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
            <select name="role" value={form.role} onChange={handleChange} className={selectCls}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
            <select name="department" value={form.department} onChange={handleChange} className={selectCls}>
              {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Min. 6 characters"
              className={`${inputCls} pr-11`}
            />
            <button type="button" onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColor[strength] : 'bg-slate-200'}`} />
                ))}
              </div>
              <span className="text-xs text-slate-500">{strengthLabel[strength]}</span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
          <div className="relative">
            <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              className={`${inputCls} pr-11`}
            />
            {form.confirmPassword && form.password === form.confirmPassword && (
              <FiCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500 w-4 h-4" />
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={authLoading}
          className="w-full h-11 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25 mt-1"
        >
          {authLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Creating account…
            </>
          ) : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-slate-500 mt-5">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-indigo-600 font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </motion.div>
  );
}
