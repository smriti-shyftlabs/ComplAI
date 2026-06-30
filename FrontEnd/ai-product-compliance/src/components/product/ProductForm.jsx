import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTag, FiDollarSign, FiHash } from 'react-icons/fi';
import Input from '../common/Input';
import Button from '../common/Button';
import CategorySelector from './CategorySelector';
import ImageUploader from './ImageUploader';
import UploadBox from './UploadBox';

export default function ProductForm({ onSubmit, loading = false }) {
  const [form, setForm] = useState({
    name: '',
    brand: '',
    sku: '',
    category: '',
    description: '',
    price: '',
    tags: '',
    images: [],
    certificates: []
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.category) errs.category = 'Category is required';
    if (!form.brand.trim()) errs.brand = 'Brand is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    else if (form.description.trim().length < 50) errs.description = 'Description must be at least 50 characters';
    if (!form.price) errs.price = 'Price is required';
    else if (isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) errs.price = 'Enter a valid price';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    const productData = {
      ...form,
      price: parseFloat(form.price),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      images: form.images.map(img => img.name || img),
      certificates: form.certificates.map(f => f.name || f)
    };
    onSubmit(productData);
  };

  const set = (key) => (value) => setForm(f => ({ ...f, [key]: value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div>
        <h3 className="text-sm font-600 text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-700">1</span>
          Basic Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Product Name"
            required
            placeholder="e.g. Sony WH-1000XM5 Headphones"
            value={form.name}
            onChange={e => set('name')(e.target.value)}
            error={errors.name}
          />
          <Input
            label="Brand"
            required
            placeholder="e.g. Sony"
            value={form.brand}
            onChange={e => set('brand')(e.target.value)}
            error={errors.brand}
          />
          <Input
            label="SKU"
            placeholder="e.g. SKU-001"
            icon={FiHash}
            value={form.sku}
            onChange={e => set('sku')(e.target.value)}
          />
          <Input
            label="Price (USD)"
            required
            type="number"
            placeholder="0.00"
            icon={FiDollarSign}
            value={form.price}
            onChange={e => set('price')(e.target.value)}
            error={errors.price}
            min="0"
            step="0.01"
          />
        </div>

        <div className="mt-4">
          <CategorySelector
            label="Category"
            required
            value={form.category}
            onChange={set('category')}
            error={errors.category}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-500 text-gray-700 mb-1.5">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe your product in detail: features, materials, dimensions, use cases..."
            value={form.description}
            onChange={e => set('description')(e.target.value)}
            rows={4}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all ${errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'}`}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-xs text-red-600">{errors.description}</p>
            ) : (
              <p className="text-xs text-gray-400">Minimum 50 characters</p>
            )}
            <span className={`text-xs ${form.description.length < 50 ? 'text-red-400' : 'text-gray-400'}`}>{form.description.length} chars</span>
          </div>
        </div>

        <div className="mt-4">
          <Input
            label="Tags"
            placeholder="wireless, noise-canceling, premium (comma separated)"
            icon={FiTag}
            value={form.tags}
            onChange={e => set('tags')(e.target.value)}
            helperText="Add relevant tags to improve discoverability"
          />
        </div>
      </div>

      {/* Images */}
      <div>
        <h3 className="text-sm font-600 text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-700">2</span>
          Product Images
        </h3>
        <ImageUploader
          images={form.images}
          onChange={set('images')}
        />
      </div>

      {/* Certificates */}
      <div>
        <h3 className="text-sm font-600 text-gray-900 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-700">3</span>
          Certificates & Documents
        </h3>
        <UploadBox
          label="Safety Certificates & Compliance Documents"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          files={form.certificates}
          onChange={set('certificates')}
          helperText="Upload FCC, CE, FDA, ASTM, or other relevant certificates"
        />
      </div>

      {/* Submit */}
      <div className="pt-4 border-t border-gray-100">
        <Button
          type="submit"
          loading={loading}
          fullWidth
          size="lg"
        >
          Submit for Compliance Analysis
        </Button>
        <p className="text-center text-xs text-gray-400 mt-3">
          AI will analyze your product against 20+ compliance rules
        </p>
      </div>
    </form>
  );
}
