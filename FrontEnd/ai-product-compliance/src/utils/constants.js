export const ROUTES = {
  DASHBOARD: '/',
  PRODUCTS: '/products',
  COMPLIANCE: '/compliance',
  APPROVAL: '/approval',
  AUDIT: '/audit',
  PUBLISHED: '/published',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings'
};

export const STATUS_COLORS = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', dot: 'bg-yellow-400' },
  approved: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-400' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', dot: 'bg-red-400' },
  published: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', dot: 'bg-green-400' }
};

export const RISK_COLORS = {
  low: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
  high: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' }
};

export const SEVERITY_COLORS = {
  critical: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  high: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  low: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' }
};

export const CATEGORIES = [
  'Electronics',
  'Apparel',
  'Food & Beverage',
  'Health & Beauty',
  'Home & Garden',
  'Toys',
  'Automotive',
  'Books',
  'Sports',
  'Industrial'
];

export const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', icon: 'FiHome' },
  { label: 'Add Product', path: '/products', icon: 'FiPlusCircle' },
  { label: 'Compliance Report', path: '/compliance', icon: 'FiShield' },
  { label: 'Products', path: '/approval', icon: 'FiCheckSquare' },
  { label: 'Audit Trail', path: '/audit', icon: 'FiList' },
  { label: 'Published', path: '/published', icon: 'FiGlobe' },
  { label: 'Analytics', path: '/analytics', icon: 'FiBarChart2' },
  { label: 'Settings', path: '/settings', icon: 'FiSettings' }
];

export const COMPLIANCE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  FAIR: 50,
  POOR: 0
};

export const COMPLIANCE_COLORS = {
  EXCELLENT: { color: '#10B981', label: 'Excellent', bg: 'bg-green-100', text: 'text-green-800' },
  GOOD: { color: '#3B82F6', label: 'Good', bg: 'bg-blue-100', text: 'text-blue-800' },
  FAIR: { color: '#F59E0B', label: 'Fair', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  POOR: { color: '#EF4444', label: 'Poor', bg: 'bg-red-100', text: 'text-red-800' }
};

export const ANALYSIS_STEPS = [
  { id: 1, label: 'Reading Product Data', duration: 800 },
  { id: 2, label: 'OCR Processing Documents', duration: 1200 },
  { id: 3, label: 'Detecting Category & Region', duration: 700 },
  { id: 4, label: 'Loading Compliance Rules', duration: 600 },
  { id: 5, label: 'Running Compliance Checks', duration: 1500 },
  { id: 6, label: 'Generating AI Suggestions', duration: 1000 }
];
