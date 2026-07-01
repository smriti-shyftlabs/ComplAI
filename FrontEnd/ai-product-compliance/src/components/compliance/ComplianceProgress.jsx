import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const steps = [
  'Reading Product Data',
  'OCR Processing Documents',
  'Detecting Category & Region',
  'Loading Compliance Rules',
  'Running Compliance Checks',
  'Generating AI Suggestions'
];

export default function ComplianceProgress({ progress }) {
  const currentStep = progress?.step || 0;
  const percentage = progress?.progress || 0;

  return (
    <div className="py-8 px-4">
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-24 h-24 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="40" fill="none" stroke="#E2E8F0" strokeWidth="8" />
            <motion.circle
              cx="48" cy="48" r="40"
              fill="none"
              stroke="#2BA090"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={251.2}
              animate={{ strokeDashoffset: 251.2 - (percentage / 100) * 251.2 }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-700 text-teal-700">{percentage}%</span>
          </div>
        </div>
        <p className="text-lg font-600 text-gray-900">Analyzing Product</p>
        {progress?.label && (
          <motion.p
            key={progress.label}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-teal-700 mt-1"
          >
            {progress.label}...
          </motion.p>
        )}
      </div>

      <div className="space-y-3">
        {steps.map((step, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3"
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isDone ? 'bg-teal-600' : isActive ? 'bg-teal-700' : 'bg-gray-100'}`}>
                {isDone ? (
                  <FiCheck className="w-3.5 h-3.5 text-white" />
                ) : isActive ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <span className="text-xs text-gray-400 font-600">{stepNum}</span>
                )}
              </div>
              <span className={`text-sm transition-colors ${isDone ? 'text-teal-700 line-through' : isActive ? 'text-teal-700 font-600' : 'text-gray-400'}`}>
                {step}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
