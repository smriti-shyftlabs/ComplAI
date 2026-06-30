import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiShield, FiCheckCircle, FiTrendingUp, FiZap, FiUsers, FiTarget } from 'react-icons/fi';
import { LuRocket } from 'react-icons/lu';
import { HiSparkles } from 'react-icons/hi2';
import Login from './Login';
import Register from './Register';

const features = [
  { icon: FiShield,      title: 'AI Compliance Engine',     desc: 'Analyze products against 20+ rules instantly' },
  { icon: FiCheckCircle, title: 'Automated Review Workflow', desc: 'Streamline approvals with human-in-the-loop' },
  { icon: FiTrendingUp,  title: 'Real-time Analytics',      desc: 'Track compliance rates and AI accuracy trends' },
  { icon: FiZap,         title: '99% Accuracy',             desc: 'AI suggestions reduce review time by 70%' },
];

const stats = [
  { icon: FiUsers,  value: '10K+', label: 'Products reviewed' },
  { icon: FiTarget, value: '99%',  label: 'AI accuracy' },
  { icon: LuRocket, value: '70%',  label: 'Faster reviews' },
];

function Wordmark({ className = '', textClass = 'text-white' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-900/40 ring-1 ring-white/20">
        <FiShield className="w-5 h-5 text-white" />
      </div>
      <span className={`text-2xl font-bold tracking-tight ${textClass}`}>
        Compl<span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">AI</span>
      </span>
    </div>
  );
}

export default function AuthPage() {
  const [view, setView] = useState('login');

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel (branding) ─────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[54%] relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #3a2a8c 0%, #211a55 45%, #0b1027 100%)' }}>
        {/* Decoration */}
        <div className="absolute inset-0 pointer-events-none">
          {/* glow orb */}
          <div className="absolute top-[36%] right-[-11rem] w-[26rem] h-[26rem] rounded-full"
               style={{ background: 'radial-gradient(circle at 30% 32%, #7e93f5 0%, #5360e0 30%, #4a32b8 50%, rgba(40,30,110,0) 70%)', opacity: 0.8 }} />
          <div className="absolute top-[30%] right-[-14rem] w-[32rem] h-[32rem] rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-violet-600/30 blur-3xl" />
          {/* grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.10]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
                <path d="M 46 0 L 0 0 0 46" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          {/* flowing waves bottom */}
          <svg className="absolute bottom-0 left-0 w-full opacity-30" viewBox="0 0 800 200" fill="none" preserveAspectRatio="none">
            <path d="M0 140 C 180 90, 360 200, 800 110" stroke="url(#wave)" strokeWidth="1.5" fill="none" />
            <path d="M0 175 C 220 130, 420 220, 800 150" stroke="url(#wave)" strokeWidth="1.5" fill="none" />
            <defs>
              <linearGradient id="wave" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7c8cff" stopOpacity="0" />
                <stop offset="0.5" stopColor="#9aa8ff" stopOpacity="0.8" />
                <stop offset="1" stopColor="#7c8cff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-14 w-full">
          <Wordmark />

          <div className="space-y-9 py-8">
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 ring-1 ring-white/15 text-sm font-medium text-blue-50 backdrop-blur">
                <HiSparkles className="w-4 h-4 text-violet-300" />
                Enterprise Catalog Governance
              </span>
              <h1 className="mt-7 text-5xl font-bold leading-[1.08] tracking-tight text-white">
                AI-Powered<br />Product Compliance<br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-violet-400 bg-clip-text text-transparent">Platform</span>
              </h1>
              <p className="mt-5 text-base text-slate-300/90 leading-relaxed max-w-md">
                Review, analyze, and approve products before publication — with AI that catches what humans miss.
              </p>
            </div>

            {/* Feature list with dividers */}
            <div>
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.07 * i, duration: 0.4 }}
                  className={`flex items-center gap-4 py-4 ${i < features.length - 1 ? 'border-b border-white/10' : ''}`}
                >
                  <div className="w-11 h-11 rounded-xl bg-white/10 ring-1 ring-white/10 flex items-center justify-center flex-shrink-0">
                    <f.icon className="w-5 h-5 text-violet-200" />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">{f.title}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats card */}
          <div className="rounded-2xl bg-white/[0.06] ring-1 ring-white/10 backdrop-blur px-6 py-5 flex items-center justify-between">
            {stats.map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-violet-200" />
                </div>
                <div>
                  <p className="text-xl font-bold text-white leading-none">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-10 relative bg-gradient-to-br from-slate-50 to-slate-100">
        {/* faint dotted texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.5] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#c7d2fe" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" opacity="0.25" />
        </svg>

        <div className="relative w-full max-w-md">
          <Wordmark className="justify-center mb-8 lg:hidden" textClass="text-slate-900" />

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-300/40 ring-1 ring-slate-200/70 p-8 sm:p-9">
            {/* Underline tabs */}
            <div className="flex border-b border-slate-200 mb-7">
              {['login', 'register'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setView(tab)}
                  className="relative flex-1 pb-3 text-[15px] font-semibold transition-colors"
                >
                  <span className={view === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'}>
                    {tab === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                  {view === tab && (
                    <motion.span
                      layoutId="authUnderline"
                      className="absolute -bottom-px left-0 right-0 h-0.5 bg-indigo-600 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {view === 'login' ? (
                <Login key="login" onSwitchToRegister={() => setView('register')} />
              ) : (
                <Register key="register" onSwitchToLogin={() => setView('login')} />
              )}
            </AnimatePresence>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2024 ComplAI · Enterprise Catalog Governance
          </p>
        </div>
      </div>
    </div>
  );
}
