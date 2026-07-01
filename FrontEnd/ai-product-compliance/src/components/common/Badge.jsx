const variants = {
  success: 'bg-teal-100 text-teal-900 border-teal-200',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  danger: 'bg-red-100 text-red-800 border-red-200',
  info: 'bg-teal-100 text-teal-900 border-teal-200',
  gray: 'bg-gray-100 text-gray-700 border-gray-200',
  purple: 'bg-purple-100 text-purple-800 border-purple-200',
  orange: 'bg-orange-100 text-orange-800 border-orange-200',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-200'
};

const dotColors = {
  success: 'bg-teal-600',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500',
  info: 'bg-teal-600',
  gray: 'bg-gray-400',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  cyan: 'bg-cyan-500'
};

const sizes = {
  xs: 'text-xs px-2 py-0.5',
  sm: 'text-xs px-2.5 py-1',
  md: 'text-sm px-3 py-1'
};

export default function Badge({
  children,
  variant = 'gray',
  size = 'sm',
  dot = false,
  className = ''
}) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 font-500 border rounded-full
      ${variants[variant] || variants.gray}
      ${sizes[size] || sizes.sm}
      ${className}
    `}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColors[variant] || dotColors.gray}`} />
      )}
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const config = {
    pending: { variant: 'warning', label: 'Pending' },
    approved: { variant: 'info', label: 'Approved' },
    rejected: { variant: 'danger', label: 'Rejected' },
    published: { variant: 'success', label: 'Published' }
  };
  const { variant, label } = config[status] || { variant: 'gray', label: status };
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function RiskBadge({ risk }) {
  const config = {
    low: { variant: 'success', label: 'Low Risk' },
    medium: { variant: 'warning', label: 'Medium Risk' },
    high: { variant: 'danger', label: 'High Risk' }
  };
  const { variant, label } = config[risk] || { variant: 'gray', label: risk };
  return <Badge variant={variant}>{label}</Badge>;
}

export function SeverityBadge({ severity }) {
  const config = {
    critical: { variant: 'danger', label: 'Critical' },
    high: { variant: 'orange', label: 'High' },
    medium: { variant: 'warning', label: 'Medium' },
    low: { variant: 'info', label: 'Low' }
  };
  const { variant, label } = config[severity] || { variant: 'gray', label: severity };
  return <Badge variant={variant} size="xs">{label}</Badge>;
}
