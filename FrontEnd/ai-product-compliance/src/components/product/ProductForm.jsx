/**
 * ProductForm — controlled, category-driven Add Product form.
 *
 * Renders the common fields on load, then progressively reveals the
 * category-specific sections (from categorySchemas) once a selectable category
 * is chosen. State lives in the parent (AddProduct) so the readiness meter can
 * update in real time and values survive across the analyze/publish phases.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { FiDollarSign, FiHash, FiMail } from 'react-icons/fi';
import Input from '../common/Input';
import CategorySelector from './CategorySelector';
import ImageUploader from './ImageUploader';
import DynamicField from './DynamicField';
import { getCategorySchema } from '../../data/categorySchemas';

export default function ProductForm({ values, errors = {}, onChange, disabled = false }) {
  const schema = getCategorySchema(values.category);
  const description = values.description || '';

  return (
    <fieldset disabled={disabled} className="space-y-8">
      {/* ── Common fields (always visible) ── */}
      <div>
        <h3 className="text-sm font-600 text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-700">1</span>
          Basic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Product Name" required placeholder="e.g. ZenTech UltraBook Pro 14"
            value={values.name || ''} onChange={e => onChange('name', e.target.value)} error={errors.name} />
          <Input label="Brand" required placeholder="e.g. ZenTech"
            value={values.brand || ''} onChange={e => onChange('brand', e.target.value)} error={errors.brand} />
          <Input label="Vendor Email" required type="email" placeholder="vendor@company.com" icon={FiMail}
            value={values.vendorEmail || ''} onChange={e => onChange('vendorEmail', e.target.value)}
            error={errors.vendorEmail} />
          <Input label="SKU ID" placeholder="e.g. SKU-1001" icon={FiHash}
            value={values.sku || ''} onChange={e => onChange('sku', e.target.value)} />
          <Input label="Price ($)" required type="number" placeholder="0.00" icon={FiDollarSign} min="0" step="0.01"
            value={values.price || ''} onChange={e => onChange('price', e.target.value)} error={errors.price} />
          <Input label="Product" required placeholder="e.g. Laptop"
            value={values.productType || ''} onChange={e => onChange('productType', e.target.value)} error={errors.productType} />
        </div>

        <div className="mt-4">
          <CategorySelector label="Category" required value={values.category || ''}
            onChange={v => onChange('category', v)} error={errors.category} />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-500 text-gray-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe your product: features, materials, dimensions, use cases..."
            value={description}
            onChange={e => onChange('description', e.target.value)}
            rows={4}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 resize-none transition-all
              focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent
              ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
          />
          <div className="flex justify-between mt-1">
            {errors.description
              ? <p className="text-xs text-red-600">{errors.description}</p>
              : <p className="text-xs text-gray-400">Minimum 30 characters</p>}
            <span className={`text-xs ${description.length < 30 ? 'text-red-400' : 'text-gray-400'}`}>{description.length} chars</span>
          </div>
        </div>
      </div>

      {/* ── Images (common, required) ── */}
      <div>
        <h3 className="text-sm font-600 text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-700">2</span>
          Product Images <span className="text-red-500">*</span>
        </h3>
        <ImageUploader images={values.images || []} onChange={v => onChange('images', v)} maxImages={10} />
        {errors.images && <p className="mt-1 text-xs text-red-600">{errors.images}</p>}
      </div>

      {/* ── Category-specific sections (progressive disclosure) ── */}
      <AnimatePresence mode="wait">
        {!values.category ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-center py-8 border border-dashed border-gray-200 rounded-xl bg-gray-50"
          >
            <p className="text-sm text-gray-500 font-500">Select a category to continue</p>
            <p className="text-xs text-gray-400 mt-1">Category-specific compliance fields will appear here.</p>
          </motion.div>
        ) : schema ? (
          <motion.div
            key={values.category}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {schema.sections.map((section, si) => (
              <div key={section.id}>
                <h3 className="text-sm font-600 text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-teal-700 text-white flex items-center justify-center text-xs font-700">{si + 3}</span>
                  {section.title}
                  <span className="text-xs font-400 text-gray-400">· {schema.label}</span>
                </h3>
                <div className={section.id === 'facts' || section.id === 'documents' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                  {section.fields.map(field => (
                    <DynamicField
                      key={field.key}
                      field={field}
                      value={values[field.key]}
                      onChange={onChange}
                      error={errors[field.key]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </fieldset>
  );
}
