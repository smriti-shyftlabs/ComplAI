import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiZap } from 'react-icons/fi';
import ChatMessage from './ChatMessage';
import { getAIResponse } from '../../services/aiService';
import { useTheme } from '../../context/ThemeContext';

const initialMessages = [
  {
    id: 1,
    type: 'ai',
    text: "Hi! I'm ComplAI. I can explain regulations **and** answer questions about your live catalog — try asking why a product was rejected or how many are pending review.",
    time: 'Just now',
  },
];

const quickQuestions = [
  'What is this app?',
  'How many products are pending?',
  'Show high-risk products',
  'Why was PRD-005 rejected?',
];

/*
  ChatEyes layout math (used by Shades SVG):
    container padding : 8px top/bottom, 14px left/right
    gap between items : 7px
    dot width         : 5px
    eye width/height  : 13 × 17 px

  → container size   : 73 × 33 px  (no loading dots)
  → Eye 1 rect       : x=26..39, y=8..25
  → Eye 2 rect       : x=46..59, y=8..25
  → Gap between eyes : x=39..46  (7 px)

  Lens placement (2 px padding around each eye):
    left  lens: x=24, y=6, w=17, h=21
    right lens: x=44, y=6, w=17, h=21
    bridge    : M41 13 Q42.5 9.5 44 13   (left-lens right → right-lens left)
    arms      : y=14, extend to x=−20 / x=93  (overflow:visible)
*/

/* ── Single eye ──────────────────────────────────────────────── */
function Eye({ px, py, blink, glasses }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      {/* Eyelashes */}
      {!blink && !glasses && (
        <div style={{
          position: 'absolute', top: -4, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-around', padding: '0 1px',
          pointerEvents: 'none',
        }}>
          {['-22deg', '0deg', '22deg'].map((r, i) => (
            <div key={i} style={{
              width: 1.2, height: 4,
              background: 'rgba(255,255,255,0.55)',
              borderRadius: 2,
              transform: `rotate(${r})`,
              transformOrigin: 'bottom center',
            }} />
          ))}
        </div>
      )}

      {/* Sclera */}
      <motion.div
        style={{
          width: 13, height: 17,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse at 40% 35%, #fff 55%, #e6f5f2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.07)',
        }}
        animate={{ scaleY: blink ? 0.07 : 1 }}
        transition={{ duration: blink ? 0.06 : 0.1 }}
      >
        {/* Iris + pupil — tracks cursor */}
        <motion.div
          animate={blink ? { x: 0, y: 0 } : { x: px, y: py }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{ position: 'relative', flexShrink: 0 }}
        >
          {/* Iris */}
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 32%, #3BB09A 0%, #1A6B60 45%, #0C3530 100%)',
            position: 'relative',
          }}>
            {/* Dark pupil centre */}
            <div style={{ position: 'absolute', inset: 2.5, borderRadius: '50%', background: '#07100E' }} />
            {/* Main shine */}
            <div style={{
              position: 'absolute', top: 1, left: 1.5,
              width: 2.5, height: 2.5, borderRadius: '50%',
              background: 'rgba(255,255,255,0.85)',
            }} />
            {/* Secondary shine */}
            <div style={{
              position: 'absolute', bottom: 1.5, right: 1,
              width: 1.2, height: 1.2, borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)',
            }} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ── Sunglasses — overlaid on the eyes wrapper only ─────────────
   The wrapper is exactly: w = 13 + 7 + 13 = 33px, h = 17px
   So viewBox="0 0 33 17" maps 1-to-1 to the wrapper's pixels.
   Left lens  : x=0,  y=0, w=13, h=17
   Right lens : x=20, y=0, w=13, h=17  (gap = 7px)
   Bridge     : M13 6 Q16.5 3.5 20 6
   Arms extend outside via overflow:visible
──────────────────────────────────────────────────────────────── */
function Shades() {
  return (
    <motion.svg
      key="shades"
      viewBox="0 0 33 17"
      style={{
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        overflow: 'visible', pointerEvents: 'none',
        transformOrigin: '50% 0%',
      }}
      initial={{ y: -14, opacity: 0, scaleY: 0.1 }}
      animate={{ y: 0,   opacity: 1, scaleY: 1   }}
      exit={{   y: -10,  opacity: 0, scaleY: 0.1  }}
      transition={{ type: 'spring', bounce: 0.45, duration: 0.32 }}
    >
      {/* Left arm */}
      <line x1="0" y1="6" x2="-18" y2="6"
        stroke="#D4A830" strokeWidth="1.5" strokeLinecap="round" />

      {/* Left lens — x=0, y=0, w=13, h=17 */}
      <rect x="0" y="0" width="13" height="17" rx="4"
        fill="rgba(4,7,5,0.93)" stroke="#D4A830" strokeWidth="1.2" />
      <rect x="2" y="2" width="5" height="1.5" rx="0.7"
        fill="rgba(255,255,255,0.22)" />

      {/* Bridge across the 7 px gap */}
      <path d="M13 6 Q16.5 3.5 20 6"
        stroke="#D4A830" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Right lens — x=20, y=0, w=13, h=17 */}
      <rect x="20" y="0" width="13" height="17" rx="4"
        fill="rgba(4,7,5,0.93)" stroke="#D4A830" strokeWidth="1.2" />
      <rect x="22" y="2" width="5" height="1.5" rx="0.7"
        fill="rgba(255,255,255,0.22)" />

      {/* Right arm */}
      <line x1="33" y1="6" x2="51" y2="6"
        stroke="#D4A830" strokeWidth="1.5" strokeLinecap="round" />
    </motion.svg>
  );
}

/* ── Eyes pill above the chat box ───────────────────────────── */
function ChatEyes({ isLoading, isTyping }) {
  const [blink, setBlink]   = useState(false);
  const [pupil, setPupil]   = useState({ x: 0, y: 0 });
  const containerRef        = useRef(null);
  const blinkRef            = useRef(null);

  /* Random blink every 2 – 5 s */
  useEffect(() => {
    const schedule = () => {
      blinkRef.current = setTimeout(() => {
        setBlink(true);
        setTimeout(() => { setBlink(false); schedule(); }, 115);
      }, 1900 + Math.random() * 3800);
    };
    schedule();
    return () => clearTimeout(blinkRef.current);
  }, []);

  /* Pupils follow the cursor */
  useEffect(() => {
    const onMove = (e) => {
      if (!containerRef.current) return;
      const r  = containerRef.current.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const t  = Math.min(Math.hypot(dx, dy) / 180, 1);
      const a  = Math.atan2(dy, dx);
      setPupil({ x: Math.cos(a) * 2.5 * t, y: Math.sin(a) * 2.5 * t });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  /* While glasses are on or blinking → pupils centre */
  const px = (blink || isTyping) ? 0 : pupil.x;
  const py = (blink || isTyping) ? 0 : pupil.y;

  return (
    <motion.div
      ref={containerRef}
      initial={{ scale: 0, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0  }}
      exit={{   scale: 0, opacity: 0, y: 10  }}
      transition={{ duration: 0.24, ease: 'backOut' }}
      style={{
        position:   'relative',          /* ← needed for Shades overlay */
        display:    'flex',
        alignItems: 'center',
        gap: 7,
        background: isTyping
          ? 'linear-gradient(135deg, #0C4F42 0%, #071614 100%)'
          : 'linear-gradient(135deg, #0F8070 0%, #0C3530 100%)',
        borderRadius:  26,
        padding:       '8px 14px',
        boxShadow: isTyping
          ? '0 4px 24px rgba(12,53,48,0.55), 0 0 0 2px rgba(212,168,48,0.5)'
          : '0 4px 20px rgba(12,53,48,0.45), 0 0 0 1.5px rgba(43,160,144,0.3)',
        marginBottom:  -12,
        zIndex:        10,
        alignSelf:     'center',
        transition:    'background 0.3s, box-shadow 0.3s',
      }}
    >
      {/* Status dot: green when idle, gold when typing */}
      <motion.div
        animate={isTyping
          ? { scale: [1, 1.6, 1], background: ['#FBBF24', '#F59E0B', '#FBBF24'] }
          : { scale: [1, 1.5, 1], background: ['#4ADE80', '#22D3A0', '#4ADE80'] }
        }
        transition={{ duration: 1.3, repeat: Infinity }}
        style={{ width: 5, height: 5, borderRadius: '50%', flexShrink: 0, alignSelf: 'flex-end', marginBottom: 3 }}
      />

      {/* Eyes + glasses in their own relative container.
          Width = 13 + 7(gap) + 13 = 33px, height = 17px.
          Shades SVG viewBox="0 0 33 17" maps exactly to this box. */}
      <div style={{ position: 'relative', display: 'flex', gap: 7, alignItems: 'center' }}>
        <Eye px={px} py={py} blink={blink} glasses={isTyping} />
        <Eye px={px} py={py} blink={blink} glasses={isTyping} />
        <AnimatePresence>{isTyping && <Shades />}</AnimatePresence>
      </div>

      {/* Thinking dots while AI responds */}
      {isLoading && (
        <div style={{ display: 'flex', gap: 2.5, paddingLeft: 2 }}>
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.52, repeat: Infinity, delay: i * 0.14 }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ── Main component ──────────────────────────────────────────── */
export default function AIChat() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const endRef    = useRef(null);
  const { isDark } = useTheme();

  const isTyping = input.trim().length > 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput('');
    const userMsg   = { id: Date.now(),     type: 'user', text: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    const typingMsg = { id: Date.now() + 1, type: 'ai',  isTyping: true };
    setMessages(prev => [...prev, userMsg, typingMsg]);
    setLoading(true);
    try {
      const response = await getAIResponse(q);
      setMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { id: Date.now() + 2, type: 'ai', text: response, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch {
      setMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        { id: Date.now() + 2, type: 'ai', text: "I'm having trouble connecting. Please try again.", time: 'now' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Pulse ring behind idle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div key="pulse"
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full pointer-events-none"
            animate={{ scale: [1, 1.55, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
            style={{ background: 'rgba(43,160,144,0.45)' }}
          />
        )}
      </AnimatePresence>

      {/* Floating toggle button */}
      <motion.button
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.93 }}
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 text-white rounded-full shadow-xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #1A6B60 0%, #0C3530 100%)' }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close"
              initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}
            >
              <FiX className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat"
              initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.18 }}
            >
              <FiMessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center font-700">1</span>
        )}
      </motion.button>

      {/* Chat panel + eyes (single animated unit) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div key="panel"
            className="fixed bottom-24 right-6 z-50 flex flex-col"
            style={{ width: 384 }}
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: 24,  scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
          >
            {/* Eyes peeking above chat */}
            <ChatEyes isLoading={loading} isTyping={isTyping} />

            {/* Chat box */}
            <div
              className="h-[480px] rounded-2xl flex flex-col overflow-hidden"
              style={{
                background: isDark ? '#122420' : '#ffffff',
                border:     isDark ? '1px solid rgba(43,160,144,0.18)' : '1px solid rgba(189,216,211,0.55)',
                boxShadow:  isDark
                  ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(43,160,144,0.12)'
                  : '0 20px 60px rgba(12,53,48,0.13), 0 4px 16px rgba(12,53,48,0.07)',
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-teal-700 to-teal-800 px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <FiZap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-600 text-white">ComplAI Assistant</p>
                  <p className="text-xs text-teal-100">Ask me anything about compliance</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                    className="w-2 h-2 bg-teal-300 rounded-full"
                  />
                  <span className="text-xs text-teal-100">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
                <div ref={endRef} />
              </div>

              {/* Quick questions */}
              {messages.length <= 2 && (
                <div className="px-4 pb-2">
                  <p className="text-xs text-gray-400 mb-2">Quick questions:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {quickQuestions.map(q => (
                      <button key={q} onClick={() => sendMessage(q)}
                        className="text-xs px-2.5 py-1.5 bg-teal-50 text-teal-700 rounded-full hover:bg-teal-100 transition-colors border border-teal-100">
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="p-3" style={{
                borderTop: isDark ? '1px solid rgba(43,160,144,0.12)' : '1px solid rgba(189,216,211,0.45)',
              }}>
                <div className="flex gap-2">
                  <input
                    type="text" value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about compliance..."
                    className="flex-1 px-3 py-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                    style={{
                      background: isDark ? 'rgba(24,46,43,0.8)' : '#f8faf9',
                      border:     isDark ? '1px solid rgba(43,160,144,0.2)' : '1px solid rgba(189,216,211,0.5)',
                      color:      isDark ? '#DDF0ED' : '#0C3530',
                    }}
                  />
                  <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                    className="w-9 h-9 text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                    style={{ background: 'linear-gradient(135deg, #1A6B60, #0C3530)' }}>
                    <FiSend className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
