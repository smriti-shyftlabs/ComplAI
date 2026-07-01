import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiZap, FiGlobe, FiCheckCircle, FiFileText, FiEdit2 } from 'react-icons/fi';
import ProductForm from '../../components/product/ProductForm';
import ReadinessMeter from '../../components/product/ReadinessMeter';
import ComplianceProgress from '../../components/compliance/ComplianceProgress';
import ComplianceScore from '../../components/compliance/ComplianceScore';
import Button from '../../components/common/Button';
import { useCompliance } from '../../hooks/useCompliance';
import { useProducts } from '../../hooks/useProducts';
import { publishProduct } from '../../services/productService';
import { getCategoryDefaults, getCategoryFields } from '../../data/categorySchemas';
import { computeReadiness, validateProduct, PUBLISH_THRESHOLD } from '../../utils/readiness';

/** Assemble the flat form values into the product payload sent to the API. */
function buildPayload(values, readinessScore) {
  const facts = {}, documents = {}, root = {};
  getCategoryFields(values.category).forEach(f => {
    const v = values[f.key];
    if (f.group === 'facts') facts[f.key] = v ?? null;
    else if (f.group === 'documents') documents[f.key] = v ?? null;
    else root[f.key] = v;
  });
  // Provided documents double as "certificates" for the AI scoring engine.
  const certificates = Object.entries(documents)
    .filter(([, v]) => v === true || (typeof v === 'string' && v.trim()))
    .map(([k]) => k);

  return {
    name: values.name,
    brand: values.brand,
    vendorEmail: values.vendorEmail || '',
    sku: values.sku || '',
    category: values.category,
    productType: values.productType,
    price: parseFloat(values.price) || 0,
    description: values.description,
    title: root.title || values.name,
    targetMarkets: root.targetMarkets || [],
    claims: root.claims || [],
    tags: root.claims || [],
    facts,
    documents,
    certificates,
    images: (values.images || []).map(img => img.name || img),
    readinessScore,
  };
}

export default function AddProduct() {
  const navigate = useNavigate();
  const { analyzeProduct, progress } = useCompliance();
  const { addProduct } = useProducts();

  const [values, setValues] = useState({ images: [] });
  const [errors, setErrors] = useState({});
  const [phase, setPhase] = useState('form');      // form | analyzing | analyzed
  const [product, setProduct] = useState(null);
  const [result, setResult] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const readiness = useMemo(() => computeReadiness(values.category, values), [values]);
  const canPublish = phase === 'analyzed' && readiness.score >= PUBLISH_THRESHOLD;

  const handleChange = (key, value) => {
    setValues(prev => {
      if (key === 'category' && value !== prev.category) {
        return { ...prev, category: value, ...getCategoryDefaults(value) };
      }
      return { ...prev, [key]: value };
    });
    setErrors(prev => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const handleAnalyze = async () => {
    const errs = validateProduct(values.category, values);
    const email = (values.vendorEmail || '').trim();
    if (!email) errs.vendorEmail = 'Vendor email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.vendorEmail = 'Enter a valid email address';
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setPhase('analyzing');
    try {
      const payload = buildPayload(values, readiness.score);
      const created = await addProduct(payload);
      const res = await analyzeProduct({ ...payload, ...created });
      setProduct(created);
      setResult(res);
      setPhase('analyzed');
    } catch (err) {
      console.error('Analysis error:', err);
      setPhase('form');
    }
  };

  const handlePublish = async () => {
    if (!product || !canPublish || publishing) return;
    setPublishing(true);
    try {
      await publishProduct(product.id);
      setPublished(true);
    } catch (err) {
      console.error('Publish failed:', err);
    } finally {
      setPublishing(false);
    }
  };

  const viewFullReport = () =>
    navigate('/compliance', { state: { product: { ...product, ...values }, complianceResult: result } });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate('/')} className="hover:text-gray-700 transition-colors">Dashboard</button>
        <span>/</span>
        <span className="text-gray-900 font-500">Add Product</span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={FiArrowLeft} onClick={() => navigate(-1)} />
        <div>
          <h1 className="text-2xl font-700 text-gray-900">Add New Product</h1>
          <p className="text-sm text-gray-500 mt-0.5">Complete the details, run AI compliance analysis, then publish.</p>
        </div>
      </div>

      {phase === 'analyzing' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm"
        >
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-base font-600 text-gray-900">AI Compliance Analysis</h2>
            <p className="text-sm text-gray-500 mt-0.5">Analyzing your product against 20+ compliance rules...</p>
          </div>
          <ComplianceProgress progress={progress} />
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left: form or analysis result */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              <AnimatePresence mode="wait">
                {phase === 'analyzed' && result ? (
                  <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                      <FiCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <p className="text-sm font-500 text-green-800">Compliance analysis complete for {product?.name}.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      <ComplianceScore score={result.score} size="lg" />
                      <div className="flex-1 space-y-2 text-sm w-full">
                        <div className="flex justify-between"><span className="text-gray-500">AI Compliance Score</span><span className="font-600 text-gray-900">{result.score}/100</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Risk Level</span><span className="font-600 text-gray-900 capitalize">{result.riskLevel}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Rules Failed</span><span className="font-600 text-red-600">{result.rulesFailed ?? result.violations?.length ?? 0}</span></div>
                        <div className="flex justify-between"><span className="text-gray-500">Violations Found</span><span className="font-600 text-gray-900">{result.violations?.length ?? 0}</span></div>
                      </div>
                    </div>

                    {result.recommendation && (
                      <p className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-lg p-3">{result.recommendation}</p>
                    )}

                    <div className="flex flex-wrap gap-3 pt-2 border-t border-gray-100">
                      <Button variant="secondary" icon={FiFileText} onClick={viewFullReport}>View Full Report</Button>
                      <Button variant="ghost" icon={FiEdit2} onClick={() => setPhase('form')}>Continue Editing</Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <ProductForm values={values} errors={errors} onChange={handleChange} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: readiness + actions (sticky) */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <ReadinessMeter readiness={readiness} />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              {published ? (
                <>
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                    <FiGlobe className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-sm font-500 text-green-800">Published to marketplace.</p>
                  </div>
                  <Button variant="secondary" fullWidth onClick={() => navigate('/published')}>View Published Products</Button>
                </>
              ) : (
                <>
                  {phase !== 'analyzed' ? (
                    <>
                      <Button
                        variant="primary"
                        fullWidth
                        icon={FiZap}
                        disabled={!readiness.mandatoryComplete || !(values.vendorEmail || '').trim()}
                        onClick={handleAnalyze}
                      >
                        Run Compliance Analysis
                      </Button>
                      {!readiness.mandatoryComplete && (
                        <p className="text-xs text-gray-500 text-center">Complete all required fields to enable analysis.</p>
                      )}
                    </>
                  ) : (
                    <>
                      <Button
                        variant="success"
                        fullWidth
                        icon={FiGlobe}
                        loading={publishing}
                        disabled={!canPublish}
                        onClick={handlePublish}
                      >
                        Publish to Marketplace
                      </Button>
                      {!canPublish && (
                        <p className="text-xs text-yellow-600 text-center">
                          Readiness must reach {PUBLISH_THRESHOLD}% to publish — add more recommended details.
                        </p>
                      )}
                    </>
                  )}
                  <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                    Publishing requires all mandatory fields, a completed compliance analysis, and a readiness score of {PUBLISH_THRESHOLD}% or higher.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
