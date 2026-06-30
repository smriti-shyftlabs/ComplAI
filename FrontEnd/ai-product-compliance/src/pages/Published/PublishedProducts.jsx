import { motion } from 'framer-motion';
import { FiGlobe, FiDownload, FiStar } from 'react-icons/fi';
import ProductTable from '../../components/product/ProductTable';
import Button from '../../components/common/Button';
import { useProducts } from '../../hooks/useProducts';

export default function PublishedProducts() {
  const { products, loading } = useProducts();
  const published = products.filter(p => p.status === 'published');

  const marketplaces = ['Amazon', 'eBay', 'Walmart', 'Shopify'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-700 text-gray-900">Published Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">Products live on marketplaces</p>
        </div>
        <Button variant="secondary" icon={FiDownload} size="sm">Export CSV</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Published', value: published.length, icon: FiGlobe, color: 'bg-green-50 text-green-700' },
          { label: 'Avg Compliance', value: `${Math.round(published.reduce((s, p) => s + p.complianceScore, 0) / (published.length || 1))}%`, icon: FiStar, color: 'bg-blue-50 text-blue-700' },
          { label: 'High Compliance (90+)', value: published.filter(p => p.complianceScore >= 90).length, icon: FiStar, color: 'bg-purple-50 text-purple-700' },
          { label: 'Need Review', value: published.filter(p => p.complianceScore < 75).length, icon: FiStar, color: 'bg-yellow-50 text-yellow-700' }
        ].map(stat => (
          <div key={stat.label} className={`rounded-xl p-4 border border-gray-100 ${stat.color}`}>
            <p className="text-2xl font-700">{stat.value}</p>
            <p className="text-xs font-500 opacity-80 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Marketplace Badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-gray-500">Listed on:</span>
        {marketplaces.map(m => (
          <span key={m} className="text-xs font-600 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-700 flex items-center gap-1.5 shadow-sm">
            <FiGlobe className="w-3 h-3 text-blue-500" />
            {m}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-6">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading published products...</div>
        ) : (
          <ProductTable products={published} filterStatus="published" />
        )}
      </div>
    </div>
  );
}
