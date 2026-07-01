import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StatusBadge } from '../common/Badge';
import { formatDate } from '../../utils/helpers';
import { useProducts } from '../../hooks/useProducts';

function ScoreBar({ score }) {
  const color = score >= 90 ? 'bg-teal-600' : score >= 75 ? 'bg-teal-600' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden w-16">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
      <span className="text-xs font-600 text-gray-700 w-8 text-right">{score}%</span>
    </div>
  );
}

export default function RecentProducts() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const recent = products.slice(0, 6);

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full min-w-[500px]">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left text-xs font-600 text-gray-500 uppercase tracking-wider pb-3 px-1">Product</th>
            <th className="text-left text-xs font-600 text-gray-500 uppercase tracking-wider pb-3 px-1">Category</th>
            <th className="text-left text-xs font-600 text-gray-500 uppercase tracking-wider pb-3 px-1">Status</th>
            <th className="text-left text-xs font-600 text-gray-500 uppercase tracking-wider pb-3 px-1">Score</th>
            <th className="text-left text-xs font-600 text-gray-500 uppercase tracking-wider pb-3 px-1 hidden sm:table-cell">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {recent.map((product, i) => (
            <motion.tr
              key={product.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => navigate('/compliance')}
              className="hover:bg-gray-50/80 cursor-pointer transition-colors group"
            >
              <td className="py-3 px-1">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-600">{product.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-500 text-gray-900 truncate max-w-[160px] group-hover:text-teal-700 transition-colors">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.brand}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-1">
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">{product.category}</span>
              </td>
              <td className="py-3 px-1">
                <StatusBadge status={product.status} />
              </td>
              <td className="py-3 px-1">
                <ScoreBar score={product.complianceScore} />
              </td>
              <td className="py-3 px-1 hidden sm:table-cell">
                <span className="text-xs text-gray-500">{formatDate(product.createdAt)}</span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
