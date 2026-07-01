import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const inputCls =
  'w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/60 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition';

export default function Login({ onSwitchToRegister }) {
  const { login, authLoading, authError } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!form.email || !form.password) {
      setLocalError('Please enter your email and password.');
      return;
    }
    try {
      await login(form.email, form.password);
    } catch {
      // error shown via authError
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });
  const error = localError || authError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
        <p className="text-sm text-slate-500 mt-1">Sign in to your ComplAI account</p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl mb-5 text-sm text-red-700"
        >
          <FiAlertCircle className="shrink-0" />
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
          <div className="relative">
            <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              autoComplete="email"
              className={inputCls}
            />
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
              placeholder="••••••••"
              autoComplete="current-password"
              className={`${inputCls} pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={authLoading}
          className="w-full h-11 bg-gradient-to-r from-violet-600 to-teal-700 hover:from-violet-700 hover:to-teal-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-indigo-600/25"
        >
          {authLoading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Signing in…
            </>
          ) : 'Sign in'}
        </button>
      </form>

      {/* Demo accounts */}
      <div className="mt-7">
        <div className="flex items-center gap-3 mb-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">Demo accounts</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { label: 'Sneha', email: 'sneha@shyftlabs.io', password: 'admin@123', tint: 'bg-violet-50 hover:bg-violet-100/70 ring-violet-100', name: 'text-violet-700', avatar: 'bg-violet-100 text-violet-600' },
            { label: 'Smriti', email: 'smriti@shyftlabs.io', password: 'complai123', tint: 'bg-teal-50 hover:bg-teal-100/70 ring-teal-100', name: 'text-teal-800', avatar: 'bg-teal-100 text-teal-700' },
          ].map(acc => (
            <button
              key={acc.label}
              type="button"
              onClick={() => fillDemo(acc.email, acc.password)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl ring-1 transition-colors text-left ${acc.tint}`}
            >
              <span className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${acc.avatar}`}>
                <FiUser className="w-3.5 h-3.5" />
              </span>
              <span className="min-w-0">
                <span className={`block text-xs font-semibold ${acc.name}`}>{acc.label}</span>
                <span className="block text-[11px] text-slate-400 truncate">{acc.email}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        No account?{' '}
        <button onClick={onSwitchToRegister} className="text-indigo-600 font-semibold hover:underline">
          Create one
        </button>
      </p>
    </motion.div>
  );
}
