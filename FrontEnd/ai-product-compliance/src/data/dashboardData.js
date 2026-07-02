export const kpiData = [
  {
    id: 1,
    label: 'Total Products',
    value: 1284,
    trend: 'up',
    change: 12.5,
    icon: 'FiPackage',
    color: 'blue'
  },
  {
    id: 2,
    label: 'Compliance Rate',
    value: '87.3%',
    trend: 'up',
    change: 3.2,
    icon: 'FiShield',
    color: 'green'
  },
  {
    id: 3,
    label: 'Pending Review',
    value: 47,
    trend: 'down',
    change: -8.1,
    icon: 'FiClock',
    color: 'yellow'
  },
  {
    id: 4,
    label: 'Rejected Products',
    value: 23,
    trend: 'down',
    change: -15.4,
    icon: 'FiXCircle',
    color: 'red'
  }
];

export const complianceTrendData = [
  { month: 'Jan', score: 72, products: 95, approved: 68, rejected: 12 },
  { month: 'Feb', score: 74, products: 108, approved: 80, rejected: 10 },
  { month: 'Mar', score: 76, products: 122, approved: 93, rejected: 14 },
  { month: 'Apr', score: 79, products: 135, approved: 107, rejected: 11 },
  { month: 'May', score: 81, products: 148, approved: 120, rejected: 9 },
  { month: 'Jun', score: 80, products: 160, approved: 128, rejected: 13 },
  { month: 'Jul', score: 83, products: 172, approved: 143, rejected: 8 },
  { month: 'Aug', score: 85, products: 188, approved: 160, rejected: 7 },
  { month: 'Sep', score: 84, products: 201, approved: 169, rejected: 11 },
  { month: 'Oct', score: 86, products: 218, approved: 188, rejected: 6 },
  { month: 'Nov', score: 88, products: 235, approved: 207, rejected: 5 },
  { month: 'Dec', score: 87, products: 249, approved: 217, rejected: 8 }
];

export const categoryDistribution = [
  { name: 'Electronics', value: 284, color: '#3B82F6' },
  { name: 'Health & Beauty', value: 198, color: '#10B981' },
  { name: 'Home & Garden', value: 176, color: '#F59E0B' },
  { name: 'Food & Beverage', value: 154, color: '#EF4444' },
  { name: 'Apparel', value: 142, color: '#8B5CF6' },
  { name: 'Sports', value: 118, color: '#F97316' },
  { name: 'Toys', value: 96, color: '#06B6D4' },
  { name: 'Automotive', value: 72, color: '#84CC16' },
  { name: 'Books', value: 28, color: '#EC4899' },
  { name: 'Industrial', value: 16, color: '#6B7280' }
];

export const recentAlerts = [
  {
    id: 1,
    type: 'critical',
    message: 'Flammable Paint Stripper (PRD-023) missing hazmat classification',
    product: 'PRD-023',
    time: '5 minutes ago',
    icon: 'FiAlertTriangle'
  },
  {
    id: 2,
    type: 'warning',
    message: 'Baby Formula (PRD-010) pending FDA registration verification',
    product: 'PRD-010',
    time: '23 minutes ago',
    icon: 'FiAlertCircle'
  },
  {
    id: 3,
    type: 'info',
    message: '3 products approaching compliance certificate expiry in 30 days',
    product: null,
    time: '1 hour ago',
    icon: 'FiInfo'
  },
  {
    id: 4,
    type: 'critical',
    message: 'Anti-Aging Serum (PRD-015) contains unverified medical claims',
    product: 'PRD-015',
    time: '2 hours ago',
    icon: 'FiAlertTriangle'
  },
  {
    id: 5,
    type: 'warning',
    message: 'E-Scooter (PRD-026) missing UL2272 certification upload',
    product: 'PRD-026',
    time: '3 hours ago',
    icon: 'FiAlertCircle'
  },
  {
    id: 6,
    type: 'success',
    message: 'Organic Coconut Oil (PRD-008) approved and published successfully',
    product: 'PRD-008',
    time: '4 hours ago',
    icon: 'FiCheckCircle'
  },
  {
    id: 7,
    type: 'info',
    message: 'New compliance rule update: EU Battery Regulation effective Q2 2024',
    product: null,
    time: '5 hours ago',
    icon: 'FiInfo'
  }
];

export const auditLogs = [
  { id: 1, user: 'Sneha', action: 'Approved', product: 'Sony WH-1000XM5', productId: 'PRD-001', timestamp: '2024-01-20T14:22:00Z', details: 'All compliance checks passed. High quality submission.', avatar: 'SN' },
  { id: 2, user: 'Smriti', action: 'Rejected', product: "Men's Running Shoes AeroBoost X", productId: 'PRD-005', timestamp: '2024-01-16T10:30:00Z', details: 'Missing safety certifications and country of origin disclosure.', avatar: 'SM' },
  { id: 3, user: 'Kalyani Paraye', action: 'Analyzed', product: 'Organic Green Tea Extract', productId: 'PRD-002', timestamp: '2024-01-18T09:20:00Z', details: 'AI compliance score: 62. High risk detected: unverified health claims.', avatar: 'KP' },
  { id: 4, user: 'Sneha', action: 'Published', product: 'Stainless Steel Cookware Set', productId: 'PRD-004', timestamp: '2024-01-17T12:00:00Z', details: 'Product published to marketplace. All certifications verified.', avatar: 'SN' },
  { id: 5, user: 'Smriti', action: 'Rejected', product: 'Vitamin D3 + K2 Complex', productId: 'PRD-006', timestamp: '2024-01-19T11:00:00Z', details: 'Missing FDA disclaimer and incorrect serving size information.', avatar: 'SM' },
  { id: 6, user: 'Kalyani Paraye', action: 'Approved', product: "Children's Building Blocks", productId: 'PRD-003', timestamp: '2024-01-19T16:45:00Z', details: 'ASTM and EN71 certifications verified. Age labeling correct.', avatar: 'KP' },
  { id: 7, user: 'Sneha', action: 'Flagged', product: 'Anti-Aging Retinol Serum', productId: 'PRD-015', timestamp: '2024-01-17T11:00:00Z', details: 'Medical claims detected: "clinically proven". Requires FDA substantiation.', avatar: 'SN' },
  { id: 8, user: 'Smriti', action: 'Rejected', product: 'Flammable Paint Stripper', productId: 'PRD-023', timestamp: '2024-01-18T14:00:00Z', details: 'Missing SDS, hazmat classification, and GHS labels. Critical violations.', avatar: 'SM' },
  { id: 9, user: 'Kalyani Paraye', action: 'Approved', product: 'Organic Cold-Pressed Coconut Oil', productId: 'PRD-008', timestamp: '2024-01-14T15:30:00Z', details: 'USDA Organic and Non-GMO certifications verified. Excellent compliance.', avatar: 'KP' },
  { id: 10, user: 'Sneha', action: 'Analyzed', product: 'Car OBD2 Diagnostic Scanner', productId: 'PRD-012', timestamp: '2024-01-19T13:00:00Z', details: 'FCC and CE certifications present. Minor: warranty terms need clarification.', avatar: 'SN' },
  { id: 11, user: 'Smriti', action: 'Analyzed', product: 'Baby Formula Stage 1', productId: 'PRD-010', timestamp: '2024-01-22T09:35:00Z', details: 'AI score: 55. Missing: nutrition label format, allergen declarations.', avatar: 'SM' },
  { id: 12, user: 'Kalyani Paraye', action: 'Published', product: 'Bluetooth Smart Watch', productId: 'PRD-007', timestamp: '2024-01-18T09:00:00Z', details: 'Published after FCC certification confirmed. Excellent submission.', avatar: 'KP' },
  { id: 13, user: 'Sneha', action: 'Approved', product: 'Industrial Safety Helmet EN397', productId: 'PRD-009', timestamp: '2024-01-13T11:00:00Z', details: 'Perfect compliance score 99. EN397 and ANSI certifications verified.', avatar: 'SN' },
  { id: 14, user: 'Smriti', action: 'Flagged', product: 'E-Scooter 350W Electric', productId: 'PRD-026', timestamp: '2024-01-24T09:05:00Z', details: 'UL2272 certification uploaded but needs verification. Speed disclosure required.', avatar: 'SM' },
  { id: 15, user: 'Kalyani Paraye', action: 'Published', product: 'Cast Iron Dutch Oven', productId: 'PRD-028', timestamp: '2024-01-11T15:00:00Z', details: 'FDA and LFGB food safety certifications verified. Published.', avatar: 'KP' },
  { id: 16, user: 'Sneha', action: 'Rejected', product: 'Whey Protein Powder', productId: 'PRD-017', timestamp: '2024-01-20T09:30:00Z', details: 'Missing allergen statement and incorrect serving size per FDA guidelines.', avatar: 'SN' },
  { id: 17, user: 'Smriti', action: 'Analyzed', product: 'Kids Bicycle 20"', productId: 'PRD-019', timestamp: '2024-01-23T10:05:00Z', details: 'AI score: 69. Helmet safety recommendation language needs review.', avatar: 'SM' },
  { id: 18, user: 'Kalyani Paraye', action: 'Published', product: 'Portable Air Purifier', productId: 'PRD-020', timestamp: '2024-01-14T11:00:00Z', details: 'Energy Star and AHAM certifications verified. Excellent compliance.', avatar: 'KP' },
  { id: 19, user: 'Sneha', action: 'Approved', product: 'Lithium Power Bank', productId: 'PRD-021', timestamp: '2024-01-21T10:00:00Z', details: 'UN38.3 test report verified. FCC and CE marks confirmed.', avatar: 'SN' },
  { id: 20, user: 'Smriti', action: 'Analyzed', product: 'Wireless Mechanical Keyboard', productId: 'PRD-014', timestamp: '2024-01-21T14:05:00Z', details: 'AI score: 78. Minor: warranty terms unclear. FCC certification present.', avatar: 'SM' }
];

export const notifications = [
  { id: 1, title: 'Approval Required', message: 'Baby Formula (PRD-010) awaiting your review', type: 'action', read: false, time: '10m ago' },
  { id: 2, title: 'Certificate Expiring', message: 'FCC certificate for PRD-014 expires in 25 days', type: 'warning', read: false, time: '1h ago' },
  { id: 3, title: 'Product Published', message: 'Sony WH-1000XM5 is now live on marketplace', type: 'success', read: false, time: '2h ago' },
  { id: 4, title: 'AI Analysis Complete', message: 'E-Scooter compliance analysis ready for review', type: 'info', read: true, time: '3h ago' },
  { id: 5, title: 'Rule Update', message: 'New EU Battery Regulation rules added', type: 'info', read: true, time: '5h ago' },
  { id: 6, title: 'Rejection Notice', message: "Men's Running Shoes rejected - missing certifications", type: 'error', read: true, time: '1d ago' },
  { id: 7, title: 'SLA Warning', message: '5 products approaching 48-hour review SLA', type: 'warning', read: false, time: '2d ago' },
  { id: 8, title: 'Bulk Upload Complete', message: '47 products uploaded and queued for analysis', type: 'success', read: true, time: '2d ago' },
  { id: 9, title: 'New Reviewer Added', message: 'James Wilson joined as compliance reviewer', type: 'info', read: true, time: '3d ago' },
  { id: 10, title: 'Monthly Report Ready', message: 'December 2023 compliance report is available', type: 'info', read: true, time: '1w ago' }
];

// Passwords hashed with btoa(password + '__salt_complianceai')
const _h = (p) => btoa(unescape(encodeURIComponent(p + '__salt_complianceai')));

export const users = [
  { id: 'USR-007', name: 'Sneha',            email: 'sneha@shyftlabs.io',          role: 'Admin', department: 'Platform',   avatar: 'SN', passwordHash: _h('admin@123'),  productsReviewed: 48, approvalRate: '92%', status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'USR-009', name: 'Smriti',           email: 'smriti@shyftlabs.io',         role: 'Admin', department: 'Compliance', avatar: 'SM', passwordHash: _h('complai123'), productsReviewed: 37, approvalRate: '86%', status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'USR-010', name: 'Kalyani Paraye',   email: 'kalyani.paraye@shyftlabs.io', role: 'Admin',              department: 'Compliance',  avatar: 'KP', passwordHash: _h('complai123'), productsReviewed: 29,   approvalRate: '78%',  status: 'active', createdAt: '2024-01-01T00:00:00Z' },
];
