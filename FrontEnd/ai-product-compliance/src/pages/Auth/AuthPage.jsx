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
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ring-1 ring-white/20"
        style={{ background: 'linear-gradient(135deg, #2BA090 0%, #0C3530 100%)' }}>
        <FiShield className="w-5 h-5 text-white" />
      </div>
      <span className={`text-2xl font-bold tracking-tight ${textClass}`}>
        Compl<span style={{
          background: 'linear-gradient(90deg, #7EC8BE, #2BA090)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>AI</span>
      </span>
    </div>
  );
}

export default function AuthPage() {
  const [view, setView] = useState('login');

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — teal branded ──────────────────────────────── */}
      <div
        className="hidden lg:flex lg:w-[54%] relative overflow-hidden"
        style={{ background: 'linear-gradient(140deg, #051210 0%, #0C3530 40%, #155E56 75%, #1A8072 100%)' }}
      >
        {/* Decorations */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Teal glow orb */}
          <div className="absolute top-[30%] right-[-10rem] w-[28rem] h-[28rem] rounded-full"
            style={{ background: 'radial-gradient(circle at 30% 40%, rgba(43,160,144,0.55) 0%, rgba(21,94,86,0.35) 40%, transparent 70%)' }} />
          <div className="absolute bottom-[-4rem] left-[-6rem] w-[22rem] h-[22rem] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(126,200,190,0.18) 0%, transparent 70%)' }} />
          <div className="absolute top-[-3rem] right-[10%] w-64 h-64 rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(43,160,144,0.22) 0%, transparent 70%)' }} />

          {/* Subtle grid */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="46" height="46" patternUnits="userSpaceOnUse">
                <path d="M 46 0 L 0 0 0 46" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Wave lines */}
          <svg className="absolute bottom-0 left-0 w-full opacity-25" viewBox="0 0 800 200" fill="none" preserveAspectRatio="none">
            <path d="M0 140 C 180 90, 360 200, 800 110" stroke="url(#wave)" strokeWidth="1.5" fill="none" />
            <path d="M0 175 C 220 130, 420 220, 800 150" stroke="url(#wave)" strokeWidth="1.5" fill="none" />
            <defs>
              <linearGradient id="wave" x1="0" y1="0" x2="800" y2="0" gradientUnits="userSpaceOnUse">
                <stop stopColor="#7EC8BE" stopOpacity="0" />
                <stop offset="0.5" stopColor="#7EC8BE" stopOpacity="0.9" />
                <stop offset="1" stopColor="#7EC8BE" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-14 w-full">
          <Wordmark />

          <div className="space-y-9 py-8">
            <div>
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm font-medium backdrop-blur"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: '#BDF0E8' }}>
                <HiSparkles className="w-4 h-4" style={{ color: '#7EC8BE' }} />
                Enterprise Catalog Governance
              </span>
              <h1 className="mt-7 text-5xl font-bold leading-[1.08] tracking-tight text-white">
                AI-Powered<br />Product Compliance<br />
                <span style={{
                  background: 'linear-gradient(90deg, #7EC8BE, #2BA090, #BDF0E8)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>Platform</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed max-w-md" style={{ color: 'rgba(189,240,232,0.75)' }}>
                Review, analyze, and approve products before publication — with AI that catches what humans miss.
              </p>
            </div>

            {/* Feature list */}
            <div>
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.07 * i, duration: 0.4 }}
                  className={`flex items-center gap-4 py-4 ${i < features.length - 1 ? 'border-b' : ''}`}
                  style={{ borderColor: 'rgba(126,200,190,0.15)' }}
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(43,160,144,0.18)', border: '1px solid rgba(126,200,190,0.2)' }}>
                    <f.icon className="w-5 h-5" style={{ color: '#7EC8BE' }} />
                  </div>
                  <div>
                    <p className="text-[15px] font-semibold text-white">{f.title}</p>
                    <p className="text-sm mt-0.5" style={{ color: 'rgba(189,240,232,0.6)' }}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats card */}
          <div className="rounded-2xl px-6 py-5 flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(126,200,190,0.15)', backdropFilter: 'blur(8px)' }}>
            {stats.map(s => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(43,160,144,0.2)' }}>
                  <s.icon className="w-4 h-4" style={{ color: '#7EC8BE' }} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white leading-none">{s.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(126,200,190,0.7)' }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 sm:px-10 relative"
        style={{ background: 'linear-gradient(145deg, #F0FAF8 0%, #E4F5F2 100%)' }}>

        {/* Faint teal dot texture */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#BDD8D3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" opacity="0.45" />
        </svg>

        <div className="relative w-full max-w-md">
          <Wordmark className="justify-center mb-8 lg:hidden" textClass="text-teal-900" />

          {/* Card */}
          <div className="rounded-2xl p-8 sm:p-9"
            style={{
              background: '#ffffff',
              boxShadow: '0 20px 60px rgba(12,53,48,0.12), 0 4px 16px rgba(12,53,48,0.07), 0 0 0 1px rgba(189,216,211,0.6)',
            }}>

            {/* Tabs */}
            <div className="flex mb-7" style={{ borderBottom: '1px solid rgba(189,216,211,0.6)' }}>
              {['login', 'register'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setView(tab)}
                  className="relative flex-1 pb-3 text-[15px] font-semibold transition-colors"
                >
                  <span style={{ color: view === tab ? '#155E56' : '#6B7280' }}>
                    {tab === 'login' ? 'Sign In' : 'Create Account'}
                  </span>
                  {view === tab && (
                    <motion.span
                      layoutId="authUnderline"
                      className="absolute -bottom-px left-0 right-0 h-0.5 rounded-full"
                      style={{ background: 'linear-gradient(90deg, #155E56, #2BA090)' }}
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

          <p className="text-center text-xs mt-6" style={{ color: '#9CA3AF' }}>
            © 2024 ComplAI · Enterprise Catalog Governance
          </p>
        </div>
      </div>
    </div>
  );
}
