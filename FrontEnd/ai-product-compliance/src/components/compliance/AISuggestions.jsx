import { motion } from 'framer-motion';
import { FiZap, FiArrowRight, FiAlertCircle, FiInfo } from 'react-icons/fi';

const priorityConfig = {
  high: { color: 'text-red-600 bg-red-50 border-red-100', icon: FiAlertCircle },
  medium: { color: 'text-yellow-600 bg-yellow-50 border-yellow-100', icon: FiInfo },
  low: { color: 'text-teal-700 bg-teal-50 border-teal-100', icon: FiZap }
};

const defaultSuggestions = [
  { id: 1, text: 'Add FCC certification document to prove regulatory compliance for the US market', priority: 'high', category: 'Certification' },
  { id: 2, text: 'Include product dimensions and weight in the description to improve buyer confidence', priority: 'medium', category: 'Description' },
  { id: 3, text: 'Add high-resolution images showing all sides of the product with white background', priority: 'high', category: 'Images' },
  { id: 4, text: 'Include country of origin label visible in at least one product image', priority: 'medium', category: 'Labels' },
  { id: 5, text: 'Add a FAQ section addressing common safety concerns to improve trust score', priority: 'low', category: 'Enhancement' }
];

export default function AISuggestions({ suggestions = defaultSuggestions, recommendation }) {
  return (
    <div>
      {recommendation && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-100 rounded-xl">
          <div className="flex items-start gap-2">
            <FiZap className="w-4 h-4 text-teal-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-600 text-teal-900 mb-1">AI Recommendation</p>
              <p className="text-sm text-teal-800">{recommendation}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {suggestions.map((suggestion, i) => {
          const config = priorityConfig[suggestion.priority] || priorityConfig.low;
          const Icon = config.icon;
          return (
            <motion.div
              key={suggestion.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-start gap-3 p-4 rounded-xl border ${config.color}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {suggestion.category && (
                    <span className="text-xs font-600 uppercase tracking-wide opacity-70">{suggestion.category}</span>
                  )}
                  <span className="text-xs font-600 opacity-60 capitalize">• {suggestion.priority} priority</span>
                </div>
                <p className="text-sm leading-relaxed">{suggestion.text}</p>
              </div>
              <button className="p-1.5 rounded-lg hover:bg-white/60 transition-colors flex-shrink-0">
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
