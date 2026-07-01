import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheck, FiX, FiDownload, FiGlobe } from 'react-icons/fi';
import ComplianceScore from '../../components/compliance/ComplianceScore';
import ComplianceChecklist from '../../components/compliance/ComplianceChecklist';
import AISuggestions from '../../components/compliance/AISuggestions';
import RuleViolationCard from '../../components/compliance/RuleViolationCard';
import { StatusBadge, RiskBadge } from '../../components/common/Badge';
import Button from '../../components/common/Button';
import { getProducts } from '../../services/productService';
import { analyzeProduct } from '../../services/aiService';
import { approveProduct, rejectProduct } from '../../services/approvalService';
import { publishProduct } from '../../services/productService';
import { formatCurrency } from '../../utils/helpers';

const DECISION_CONFIG = {
  approve: { status: 'approved', run: approveProduct, message: 'Product approved.' },
  reject: { status: 'rejected', run: rejectProduct, message: 'Product rejected.' },
};

export default function ComplianceReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [decision, setDecision] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const [publishing, setPublishing] = useState(false);

  const handleDecision = async (type) => {
    if (!product?.id || submitting) return;
    const config = DECISION_CONFIG[type];
    setSubmitting(type);
    try {
      await config.run(product.id);
      setProduct(prev => ({ ...prev, status: config.status }));
      setDecision({ type, message: config.message });
    } catch (err) {
      console.error('Decision failed:', err);
    } finally {
      setSubmitting(null);
    }
  };

  const handlePublish = async () => {
    if (!product?.id || publishing) return;
    setPublishing(true);
    try {
      await publishProduct(product.id);
      setProduct(prev => ({ ...prev, status: 'published' }));
      setDecision({ type: 'published', message: 'Product published to marketplace.' });
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (location.state?.product && location.state?.complianceResult) {
        setProduct(location.state.product);
        setReport(location.state.complianceResult);
        setLoading(false);
        return;
      }
      const all = await getProducts();
      const p = all.find(x => x.status === 'pending') || all[0];
      if (!p) { setLoading(false); return; }
      setProduct(p);
      const result = await analyzeProduct(p);
      setReport(result);
      setLoading(false);
    };
    init();
  }, [location.state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin w-8 h-8 text-teal-700" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm text-gray-500">Loading compliance report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate('/')} className="hover:text-gray-700">Dashboard</button>
        <span>/</span>
        <span className="text-gray-900 font-500">Compliance Report</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={FiArrowLeft} onClick={() => navigate(-1)} />
          <div>
            <h1 className="text-2xl font-700 text-gray-900">Compliance Report</h1>
            <p className="text-sm text-gray-500">{product?.name}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" icon={FiDownload}>Export Report</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="space-y-5">
          {/* Score Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center"
          >
            <ComplianceScore score={report?.score || 0} size="lg" />
            <div className="w-full mt-6 space-y-2 text-sm">
              {[
                { label: 'Rules Checked', value: report?.rulesChecked || 20 },
                { label: 'Rules Passed', value: report?.rulesPassed, color: 'text-teal-700' },
                { label: 'Rules Failed', value: report?.rulesFailed, color: 'text-red-600' },
                { label: 'AI Confidence', value: `${report?.confidence || 94}%` }
              ].map(item => (
                <div key={item.label} className="flex justify-between">
                  <span className="text-gray-500">{item.label}</span>
                  <span className={`font-600 ${item.color || 'text-gray-900'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          {product && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3"
            >
              <h3 className="text-sm font-600 text-gray-900">Product Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Status</span><StatusBadge status={product.status} /></div>
                <div className="flex justify-between"><span className="text-gray-500">Risk Level</span><RiskBadge risk={report?.riskLevel || product.riskLevel} /></div>
                <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="font-500 text-gray-800">{product.category}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Brand</span><span className="font-500 text-gray-800">{product.brand}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Price</span><span className="font-500 text-gray-800">{formatCurrency(product.price)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Images</span><span className="font-500 text-gray-800">{product.images?.length || 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Certificates</span><span className="font-500 text-gray-800">{product.certificates?.length || 0}</span></div>
              </div>
            </motion.div>
          )}

          {/* Decision Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3"
          >
            <h3 className="text-sm font-600 text-gray-900">Review Decision</h3>
            {decision ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-100 rounded-lg">
                  <FiCheck className="w-4 h-4 text-teal-700 flex-shrink-0" />
                  <p className="text-sm font-500 text-teal-900">{decision.message}</p>
                </div>
                {decision.type === 'approve' && (
                  <Button
                    variant="success"
                    fullWidth
                    icon={FiGlobe}
                    loading={publishing}
                    disabled={publishing}
                    onClick={handlePublish}
                  >
                    Publish to Marketplace
                  </Button>
                )}
                {decision.type === 'published' ? (
                  <Button variant="secondary" fullWidth onClick={() => navigate('/published')}>
                    View Published Products
                  </Button>
                ) : (
                  <Button variant="secondary" fullWidth onClick={() => navigate('/approval')}>
                    Go to Approval Queue
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Button
                  variant="success"
                  fullWidth
                  icon={FiCheck}
                  loading={submitting === 'approve'}
                  disabled={!!submitting}
                  onClick={() => handleDecision('approve')}
                >
                  Approve Product
                </Button>
                <Button
                  variant="danger"
                  fullWidth
                  icon={FiX}
                  loading={submitting === 'reject'}
                  disabled={!!submitting}
                  onClick={() => handleDecision('reject')}
                >
                  Reject Product
                </Button>
              </>
            )}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Violations */}
          {report?.violations?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6"
            >
              <h3 className="text-sm font-600 text-gray-900 mb-4">
                Rule Violations
                <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{report.violations.length} found</span>
              </h3>
              <div className="space-y-3">
                {report.violations.map((v, i) => (
                  <RuleViolationCard key={i} violation={v} index={i} />
                ))}
              </div>
            </motion.div>
          )}

          {/* Compliance Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6"
          >
            <h3 className="text-sm font-600 text-gray-900 mb-4">Compliance Checklist</h3>
            <ComplianceChecklist violations={report?.violations || []} />
          </motion.div>

          {/* AI Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6"
          >
            <h3 className="text-sm font-600 text-gray-900 mb-4">AI Suggestions</h3>
            <AISuggestions
              suggestions={report?.suggestions}
              recommendation={report?.recommendation}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
