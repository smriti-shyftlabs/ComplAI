import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowLeft, FiZap, FiCheckCircle, FiFileText,
  FiRefreshCw, FiAlertTriangle, FiTrash2, FiArrowRight, FiEdit2, FiLock,
} from 'react-icons/fi';
import ProductForm from '../../components/product/ProductForm';
import ReadinessMeter from '../../components/product/ReadinessMeter';
import ComplianceProgress from '../../components/compliance/ComplianceProgress';
import ComplianceScore from '../../components/compliance/ComplianceScore';
import Button from '../../components/common/Button';
import { useCompliance } from '../../hooks/useCompliance';
import { useProducts } from '../../hooks/useProducts';
import { getCategoryDefaults, getCategoryFields } from '../../data/categorySchemas';
import { computeReadiness, validateProduct } from '../../utils/readiness';
import { loadDraft, saveDraft, clearDraft, draftSignature } from '../../utils/productDraft';

/** Assemble the flat form values into the product payload sent to the API. */
function buildPayload(values, readinessScore) {
  const facts = {}, documents = {}, root = {};
  getCategoryFields(values.category).forEach(f => {
    const v = values[f.key];
    if (f.group === 'facts') facts[f.key] = v ?? null;
    else if (f.group === 'documents') documents[f.key] = v ?? null;
    else root[f.key] = v;
  });
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

const INITIAL_VALUES = { images: [] };

export default function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();

  // "Add New Product" (from the Dashboard, Quick Actions, or command palette)
  // sends state.newProduct → always start from a fresh, blank form. Any other
  // arrival (refresh, "Continue Editing" from the report) keeps the draft.
  const freshStart = location.state?.newProduct === true;
  const { analyzeProduct, progress } = useCompliance();
  const { addProduct, updateProduct } = useProducts();

  const draft = useMemo(() => (freshStart ? null : loadDraft()), []);
  const [values, setValues] = useState(() => draft?.values || INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [product, setProduct] = useState(() => draft?.product || null);
  const [result, setResult] = useState(() => draft?.result || null);
  const [analyzedSignature, setAnalyzedSignature] = useState(() => draft?.analyzedSignature || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const readiness = useMemo(() => computeReadiness(values.category, values), [values]);
  const signature = useMemo(() => draftSignature(values), [values]);

  const hasAnalysis = !!result;
  const outdated = hasAnalysis && analyzedSignature !== null && signature !== analyzedSignature;
  // After analysis the form is read-only ("view mode") until the user opts into editing.
  const locked = hasAnalysis && !editMode;

  // Starting a new product: wipe any persisted draft and consume the flag so a
  // later refresh doesn't re-trigger the reset.
  useEffect(() => {
    if (freshStart) {
      clearDraft();
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the draft on every change so it survives navigation + refresh.
  useEffect(() => {
    saveDraft({ values, product, result, analyzedSignature });
  }, [values, product, result, analyzedSignature]);

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
    setAnalyzing(true);
    try {
      const payload = buildPayload(values, readiness.score);
      // First run creates the product; a re-run patches it and forces re-scoring.
      const saved = product?.id
        ? await updateProduct(product.id, payload)
        : await addProduct(payload);
      const res = await analyzeProduct({ ...payload, ...saved }, !!product?.id);
      setProduct(saved);
      setResult(res);
      setAnalyzedSignature(signature);
      setEditMode(false);   // lock back to view mode with the fresh report
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDiscard = () => {
    clearDraft();
    setValues(INITIAL_VALUES);
    setErrors({});
    setProduct(null);
    setResult(null);
    setAnalyzedSignature(null);
    setEditMode(false);
  };

  const viewFullReport = () =>
    navigate('/compliance', {
      state: { product: { ...product, ...values }, complianceResult: result, fromEditor: true },
    });

  const hasDraft = !!(product || result || values.name || values.category);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <button onClick={() => navigate('/')} className="hover:text-gray-700 transition-colors">Dashboard</button>
        <span>/</span>
        <span className="text-gray-900 font-500">Add Product</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" icon={FiArrowLeft} onClick={() => navigate(-1)} />
          <div>
            <h1 className="text-2xl font-700 text-gray-900">Add New Product</h1>
            <p className="text-sm text-gray-500 mt-0.5">Complete the details and run AI compliance analysis. Publishing happens from the Approval Queue.</p>
          </div>
        </div>
        {hasDraft && (
          <Button variant="ghost" size="sm" icon={FiTrash2} onClick={handleDiscard}>Discard draft</Button>
        )}
      </div>

      {analyzing ? (
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
          {/* Left: analysis result banner (if any) + editable form */}
          <div className="lg:col-span-2 space-y-6">
            {hasAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border shadow-sm p-5 ${outdated ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-4">
                    <ComplianceScore score={result.score} size="sm" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-600 text-gray-900">Compliance Analysis</h3>
                        {outdated ? (
                          <span className="flex items-center gap-1 text-[11px] font-600 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                            <FiAlertTriangle className="w-3 h-3" /> Outdated
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-600 px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            <FiCheckCircle className="w-3 h-3" /> Up to date
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Score {result.score}/100 · {result.violations?.length ?? 0} violation(s) · risk {result.riskLevel}
                      </p>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" icon={FiFileText} onClick={viewFullReport}>View Full Report</Button>
                </div>
                {outdated && (
                  <p className="text-xs text-yellow-700 mt-3">
                    You edited the product after the last analysis. Re-run the compliance analysis before publishing.
                  </p>
                )}
              </motion.div>
            )}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
              {locked && (
                <div className="flex items-center gap-2 p-3 mb-6 bg-gray-50 border border-gray-200 rounded-lg">
                  <FiLock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <p className="text-xs text-gray-600">
                    View mode — details are locked to match the compliance report. Click <span className="font-600">Edit Product Details</span> to make changes.
                  </p>
                </div>
              )}
              <div className={locked ? 'opacity-60 pointer-events-none select-none' : ''}>
                <ProductForm values={values} errors={errors} onChange={handleChange} disabled={locked} />
              </div>
            </div>
          </div>

          {/* Right: readiness + actions (sticky) */}
          <div className="space-y-4 lg:sticky lg:top-6">
            <ReadinessMeter readiness={readiness} />

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
              {!hasAnalysis ? (
                <>
                  <Button variant="primary" fullWidth icon={FiZap}
                    disabled={!readiness.mandatoryComplete || !(values.vendorEmail || '').trim()}
                    onClick={handleAnalyze}>
                    Run Compliance Analysis
                  </Button>
                  {(!readiness.mandatoryComplete || !(values.vendorEmail || '').trim()) && (
                    <p className="text-xs text-gray-500 text-center">Complete all required fields to enable analysis.</p>
                  )}
                </>
              ) : editMode ? (
                <>
                  {/* Edit mode — re-run gated on actual changes */}
                  <Button variant="primary" fullWidth icon={FiRefreshCw}
                    disabled={!outdated || !readiness.mandatoryComplete}
                    onClick={handleAnalyze}>
                    Re-run Compliance Analysis
                  </Button>
                  {outdated ? (
                    <p className="text-xs text-yellow-700 text-center">
                      Product details have changed. Please re-run the Compliance Analysis to generate an updated compliance report.
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 text-center">Editing enabled — no changes yet.</p>
                  )}
                  {!outdated && (
                    <Button variant="ghost" fullWidth onClick={() => setEditMode(false)}>Done editing</Button>
                  )}
                </>
              ) : (
                <>
                  {/* View mode — locked; Edit beside Go to Approval Queue */}
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
                    <FiCheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <p className="text-sm font-500 text-green-800">Analysis complete — submitted for approval.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="secondary" fullWidth icon={FiEdit2} onClick={() => setEditMode(true)}>
                      Edit Product Details
                    </Button>
                    <Button variant="secondary" fullWidth icon={FiArrowRight} iconPosition="right" onClick={() => navigate('/approval')}>
                      Go to Approval Queue
                    </Button>
                  </div>
                </>
              )}
              <p className="text-center text-[11px] text-gray-400 leading-relaxed">
                After approval, this product is published from the Approval Queue.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
