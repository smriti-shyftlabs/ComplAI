import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiAlertTriangle, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { SeverityBadge } from '../common/Badge';
import { complianceRules } from '../../data/complianceRules';

export default function ComplianceChecklist({ violations = [] }) {
  const [expanded, setExpanded] = useState(null);

  const violationRuleIds = violations.map(v => v.rule);

  const getRuleStatus = (rule) => {
    const violation = violations.find(v => v.rule === rule.name);
    if (violation) return { status: violation.severity === 'critical' ? 'fail' : 'warning', violation };
    return { status: 'pass', violation: null };
  };

  const rules = complianceRules.slice(0, 12);

  const statusIcon = (status) => {
    if (status === 'pass') return <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center"><FiCheck className="w-3 h-3 text-green-600" /></div>;
    if (status === 'fail') return <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center"><FiX className="w-3 h-3 text-red-600" /></div>;
    return <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center"><FiAlertTriangle className="w-3 h-3 text-yellow-600" /></div>;
  };

  return (
    <div className="space-y-2">
      {rules.map((rule, i) => {
        const { status, violation } = getRuleStatus(rule);
        const isExpanded = expanded === rule.id;
        return (
          <motion.div
            key={rule.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`border rounded-lg overflow-hidden ${status === 'fail' ? 'border-red-200 bg-red-50/30' : status === 'warning' ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'}`}
          >
            <button
              onClick={() => setExpanded(isExpanded ? null : rule.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50/50 transition-colors"
            >
              {statusIcon(status)}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-500 text-gray-800">{rule.name}</span>
                  <SeverityBadge severity={rule.severity} />
                </div>
                <span className="text-xs text-gray-400">{rule.category}</span>
              </div>
              {isExpanded ? <FiChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <FiChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-600 mb-2">{rule.description}</p>
                    <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
                      <span className="font-600 text-gray-700">Requirement: </span>{rule.requirement}
                    </div>
                    {violation && (
                      <div className="mt-2 bg-red-50 border border-red-100 rounded-lg p-3 text-xs">
                        <p className="font-600 text-red-700 mb-1">Violation Detected</p>
                        <p className="text-red-600">{violation.description}</p>
                        <p className="text-red-600 mt-1"><span className="font-600">Fix: </span>{violation.fix}</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
