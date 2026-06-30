import { motion } from 'framer-motion';
import { FiZap } from 'react-icons/fi';

/**
 * Render a string with very lightweight markdown:
 *   **bold**  → <strong>
 *   line breaks → separate lines
 * Returns an array of React nodes.
 */
function renderFormatted(text) {
  if (!text) return null;
  return text.split('\n').map((line, li) => {
    // Split on **bold** segments
    const parts = line.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
    return (
      <span key={li} className="block">
        {parts.map((part, pi) =>
          part.startsWith('**') && part.endsWith('**') ? (
            <strong key={pi} className="font-semibold">{part.slice(2, -2)}</strong>
          ) : (
            <span key={pi}>{part}</span>
          )
        )}
      </span>
    );
  });
}

export default function ChatMessage({ message }) {
  const { type, text, time, isTyping } = message;
  const isUser = type === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${isUser ? 'bg-blue-600' : 'bg-gradient-to-br from-purple-500 to-blue-600'}`}>
        {isUser ? (
          <span className="text-white text-xs font-600">A</span>
        ) : (
          <FiZap className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
            isUser
              ? 'bg-blue-600 text-white rounded-tr-sm'
              : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}
        >
          {isTyping ? (
            <div className="flex items-center gap-1 py-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-gray-400 rounded-full"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          ) : isUser ? (
            text
          ) : (
            renderFormatted(text)
          )}
        </div>
        {time && !isTyping && (
          <span className="text-xs text-gray-400 px-1">{time}</span>
        )}
      </div>
    </motion.div>
  );
}
