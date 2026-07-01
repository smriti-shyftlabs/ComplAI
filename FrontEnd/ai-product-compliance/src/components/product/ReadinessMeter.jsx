/**
 * ReadinessMeter — real-time Compliance Readiness Score (0–100%).
 * Shows a progress bar, band label (Poor / Fair / Good / Ready to Publish),
 * and mandatory/optional completion counts.
 */
import { motion } from 'framer-motion';
import { FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { readinessBand, PUBLISH_THRESHOLD } from '../../utils/readiness';

export default function ReadinessMeter({ readiness }) {
  const { score, mandatoryDone, mandatoryTotal, optionalDone, optionalTotal, mandatoryComplete } = readiness;
  const band = readinessBand(score);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-600 text-gray-900">Compliance Readiness</h3>
        <span className="text-2xl font-700" style={{ color: band.color }}>{score}%</span>
      </div>
      <p className={`text-xs font-500 mb-3 ${band.text}`}>{band.label}</p>

      {/* Progress bar with the 75% publish threshold marker */}
      <div className="relative h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${band.bar}`}
          initial={false}
          animate={{ width: `${score}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
      <div className="relative h-4 mt-1">
        <div
          className="absolute -top-1 flex flex-col items-center"
          style={{ left: `${PUBLISH_THRESHOLD}%`, transform: 'translateX(-50%)' }}
        >
          <div className="w-px h-2 bg-gray-400" />
          <span className="text-[10px] text-gray-400 mt-0.5">Publish {PUBLISH_THRESHOLD}%</span>
        </div>
      </div>

      {/* Band scale legend */}
      <div className="grid grid-cols-4 gap-1 mt-3 text-center">
        {[
          { label: 'Poor', color: 'bg-red-400' },
          { label: 'Fair', color: 'bg-yellow-400' },
          { label: 'Good', color: 'bg-blue-400' },
          { label: 'Ready', color: 'bg-green-400' },
        ].map(b => (
          <div key={b.label}>
            <div className={`h-1 rounded-full ${b.color}`} />
            <span className="text-[10px] text-gray-400">{b.label}</span>
          </div>
        ))}
      </div>

      {/* Completion breakdown */}
      <div className="mt-4 space-y-2 text-sm">
        <div className="flex items-center gap-2">
          {mandatoryComplete
            ? <FiCheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
            : <FiAlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />}
          <span className="text-gray-600">Required fields</span>
          <span className="ml-auto font-600 text-gray-900">{mandatoryDone}/{mandatoryTotal}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
          </span>
          <span className="text-gray-600">Recommended fields</span>
          <span className="ml-auto font-600 text-gray-900">{optionalDone}/{optionalTotal}</span>
        </div>
      </div>

      {!mandatoryComplete ? (
        <p className="mt-3 text-xs text-gray-500">Complete all required fields to run compliance analysis.</p>
      ) : score < PUBLISH_THRESHOLD ? (
        <p className="mt-3 text-xs text-gray-500">Add recommended details to reach {PUBLISH_THRESHOLD}% and unlock publishing.</p>
      ) : (
        <p className="mt-3 text-xs text-green-600 font-500">Meets the publish readiness threshold.</p>
      )}
    </div>
  );
}
