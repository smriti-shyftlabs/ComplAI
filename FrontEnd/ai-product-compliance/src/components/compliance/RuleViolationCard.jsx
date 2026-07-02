import { motion } from 'framer-motion';
import { FiAlertTriangle, FiTool, FiZap } from 'react-icons/fi';
import { SeverityBadge } from '../common/Badge';

export default function RuleViolationCard({ violation, index = 0 }) {
  if (!violation) return null;
  const { rule, severity, description, fix, suggestion, ruleId, owner } = violation;

  const borderColor = severity === 'critical' ? 'border-red-300' : severity === 'high' ? 'border-orange-300' : severity === 'medium' ? 'border-yellow-300' : 'border-teal-200';
  const headerBg = severity === 'critical' ? 'bg-red-50' : severity === 'high' ? 'bg-orange-50' : severity === 'medium' ? 'bg-yellow-50' : 'bg-teal-50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`border ${borderColor} rounded-xl overflow-hidden`}
    >
      <div className={`${headerBg} px-4 py-3 flex items-center gap-3`}>
        <FiAlertTriangle className={`w-4 h-4 flex-shrink-0 ${severity === 'critical' ? 'text-red-600' : severity === 'high' ? 'text-orange-600' : 'text-yellow-600'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {ruleId && <span className="text-xs font-700 text-gray-500 font-mono">{ruleId}</span>}
            <span className="text-sm font-600 text-gray-900">{rule}</span>
            <SeverityBadge severity={severity} />
          </div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs font-600 text-gray-500 uppercase tracking-wider mb-1">Violation</p>
          <p className="text-sm text-gray-700">{description}</p>
        </div>
        {fix && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FiTool className="w-3.5 h-3.5 text-gray-500" />
              <p className="text-xs font-600 text-gray-600 uppercase tracking-wider">Required Fix</p>
            </div>
            <p className="text-sm text-gray-700">{fix}</p>
          </div>
        )}
        {owner && (
          <p className="text-xs text-gray-400">Owner: <span className="font-500 text-gray-600">{owner}</span></p>
        )}
        {suggestion && (
          <div className="bg-teal-50 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <FiZap className="w-3.5 h-3.5 text-teal-600" />
              <p className="text-xs font-600 text-teal-700 uppercase tracking-wider">AI Suggestion</p>
            </div>
            <p className="text-sm text-teal-800">{suggestion}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
