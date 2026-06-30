import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiAlertCircle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

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
    } catch (err) {
      // error shown via authError
    }
  };

  const fillDemo = (email, password) => setForm({ email, password });

  const error = localError || authError;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to your ComplianceAI account</p>
      </div>

      {/* Error */}
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
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@company.com"
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={authLoading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
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
      <div className="mt-6">
        <p className="text-xs text-center text-gray-400 mb-3">— Demo accounts —</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Admin', email: 'admin@company.com', password: 'admin123' },
            { label: 'Reviewer', email: 'sarah.johnson@company.com', password: 'sarah123' },
          ].map(acc => (
            <button
              key={acc.label}
              type="button"
              onClick={() => fillDemo(acc.email, acc.password)}
              className="text-xs px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition-colors text-left"
            >
              <span className="font-semibold text-blue-600">{acc.label}</span>
              <br />
              <span className="text-gray-400">{acc.email}</span>
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-6">
        No account?{' '}
        <button onClick={onSwitchToRegister} className="text-blue-600 font-semibold hover:underline">
          Create one
        </button>
      </p>
    </motion.div>
  );
}
