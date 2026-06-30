import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiShield, FiCheckCircle, FiTrendingUp, FiZap } from 'react-icons/fi';
import Login from './Login';
import Register from './Register';

const features = [
  { icon: FiShield,      title: 'AI Compliance Engine',    desc: 'Analyze products against 20+ rules instantly' },
  { icon: FiCheckCircle, title: 'Automated Review Workflow', desc: 'Streamline approvals with human-in-the-loop' },
  { icon: FiTrendingUp,  title: 'Real-time Analytics',     desc: 'Track compliance rates and AI accuracy trends' },
  { icon: FiZap,         title: '99% Accuracy',            desc: 'AI-powered suggestions reduce review time by 70%' },
];

export default function AuthPage() {
  const [view, setView] = useState('login');

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (branding) ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/30" />
          <div className="absolute bottom-0 -left-24 w-80 h-80 rounded-full bg-blue-900/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/5" />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
            <FiShield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">ComplianceAI</span>
        </div>

        {/* Hero text */}
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight">
              AI-Powered Product<br />Compliance Platform
            </h1>
            <p className="text-blue-100 mt-4 text-lg leading-relaxed max-w-md">
              Review, analyze, and approve products before publication — with AI that catches what humans miss.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                className="flex items-start gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <f.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-blue-200 mt-0.5">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-6 pt-4 border-t border-white/20">
            {[['10K+', 'Products reviewed'], ['99%', 'AI accuracy'], ['70%', 'Faster reviews']].map(([val, label]) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{val}</p>
                <p className="text-xs text-blue-200">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-xs text-blue-300">
          © 2024 ComplianceAI · Enterprise Catalog Governance
        </p>
      </div>

      {/* ── Right panel (form) ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center bg-gray-50 px-6 py-12 sm:px-12">
        {/* Mobile logo */}
        <div className="flex items-center gap-2.5 mb-8 lg:hidden">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow">
            <FiShield className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-lg font-bold text-gray-900">ComplianceAI</span>
        </div>

        <div className="w-full max-w-md">
          {/* Tab switcher */}
          <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-8 shadow-sm">
            {['login', 'register'].map(tab => (
              <button
                key={tab}
                onClick={() => setView(tab)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  view === tab
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {/* Form card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <AnimatePresence mode="wait">
              {view === 'login' ? (
                <Login key="login" onSwitchToRegister={() => setView('register')} />
              ) : (
                <Register key="register" onSwitchToLogin={() => setView('login')} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
