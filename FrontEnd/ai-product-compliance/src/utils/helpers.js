export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  return date.toLocaleDateString('en-US', defaultOptions);
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

export const getStatusColor = (status) => {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    approved: 'bg-blue-100 text-blue-800 border-blue-200',
    rejected: 'bg-red-100 text-red-800 border-red-200',
    published: 'bg-green-100 text-green-800 border-green-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

export const getRiskColor = (risk) => {
  const colors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };
  return colors[risk] || 'bg-gray-100 text-gray-800';
};

export const getComplianceColor = (score) => {
  if (score >= 90) return { color: '#10B981', label: 'Excellent', ring: 'stroke-emerald-500' };
  if (score >= 75) return { color: '#3B82F6', label: 'Good', ring: 'stroke-blue-500' };
  if (score >= 50) return { color: '#F59E0B', label: 'Fair', ring: 'stroke-yellow-500' };
  return { color: '#EF4444', label: 'Poor', ring: 'stroke-red-500' };
};

export const calculateComplianceRate = (products) => {
  if (!products || products.length === 0) return 0;
  const compliant = products.filter(p => p.complianceScore >= 75).length;
  return Math.round((compliant / products.length) * 100);
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
};

export const generateId = (prefix = 'ID') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return formatDate(dateString);
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMins > 0) return `${diffMins}m ago`;
  return 'Just now';
};

export const getSeverityWeight = (severity) => {
  const weights = { critical: 4, high: 3, medium: 2, low: 1 };
  return weights[severity] || 0;
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
};

export const sortByDate = (array, key = 'createdAt', order = 'desc') => {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[key]);
    const dateB = new Date(b[key]);
    return order === 'desc' ? dateB - dateA : dateA - dateB;
  });
};

// ── Date filter shared across pages ──────────────────────────────────────────
export const DATE_FILTER_OPTIONS = [
  { value: 'all',     label: 'All time'    },
  { value: 'today',   label: 'Today'       },
  { value: 'week',    label: 'This week'   },
  { value: 'month',   label: 'This month'  },
  { value: 'quarter', label: 'Last 90 days'},
  { value: 'custom',  label: 'Custom range'},
];

/**
 * isInDateRange — supports preset strings AND custom { from, to } objects.
 * @param {string} dateStr  — ISO date string on the record
 * @param {string|{from:string,to:string}} range — preset key OR { from, to }
 */
export const isInDateRange = (dateStr, range) => {
  if (!range || range === 'all' || !dateStr) return true;
  const d = new Date(dateStr);

  // Custom range: { from?: string, to?: string }
  if (typeof range === 'object') {
    const { from, to } = range;
    if (from) {
      const fromDate = new Date(from);
      fromDate.setHours(0, 0, 0, 0);
      if (d < fromDate) return false;
    }
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      if (d > toDate) return false;
    }
    return true;
  }

  // Preset string ranges
  const now = new Date();
  const sod = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (range === 'today')   return d >= sod;
  if (range === 'week')    return d >= new Date(+sod - 6 * 864e5);
  if (range === 'month')   return d >= new Date(sod.getFullYear(), sod.getMonth(), 1);
  if (range === 'quarter') return d >= new Date(+sod - 89 * 864e5);
  return true;
};

export const filterProducts = (products, filters) => {
  return products.filter(product => {
    if (filters.status && filters.status !== 'all' && product.status !== filters.status) return false;
    if (filters.category && filters.category !== 'all' && product.category !== filters.category) return false;
    if (filters.riskLevel && filters.riskLevel !== 'all' && product.riskLevel !== filters.riskLevel) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      const matchName = product.name.toLowerCase().includes(search);
      const matchBrand = product.brand.toLowerCase().includes(search);
      const matchCategory = product.category.toLowerCase().includes(search);
      if (!matchName && !matchBrand && !matchCategory) return false;
    }
    return true;
  });
};
