import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import ProductForm from '../../components/product/ProductForm';
import ComplianceProgress from '../../components/compliance/ComplianceProgress';
import { useCompliance } from '../../hooks/useCompliance';
import { useProducts } from '../../hooks/useProducts';
import Button from '../../components/common/Button';

export default function AddProduct() {
  const navigate = useNavigate();
  const { analyzeProduct, loading, progress } = useCompliance();
  const { addProduct } = useProducts();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const newProduct = await addProduct(formData);
      const result = await analyzeProduct({ ...formData, ...newProduct });
      navigate('/compliance', { state: { product: { ...newProduct, ...formData }, complianceResult: result } });
    } catch (err) {
      console.error('Submission error:', err);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          <p className="text-sm text-gray-500 mt-0.5">Submit a product for AI-powered compliance analysis</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {(submitting || loading) ? (
          <motion.div
            key="progress"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm"
          >
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-600 text-gray-900">AI Compliance Analysis</h2>
              <p className="text-sm text-gray-500 mt-0.5">Analyzing your product against 20+ compliance rules...</p>
            </div>
            <ComplianceProgress progress={progress} />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8"
          >
            <div className="mb-6">
              <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl border border-teal-100">
                <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-600 text-teal-900">AI-Powered Analysis</p>
                  <p className="text-xs text-teal-800 mt-0.5">After submission, our AI will scan your product against 20+ compliance rules including certifications, labels, safety standards, and regional requirements.</p>
                </div>
              </div>
            </div>
            <ProductForm onSubmit={handleSubmit} loading={submitting || loading} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
