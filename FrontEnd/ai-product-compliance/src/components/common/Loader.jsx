export function Spinner({ size = 'md', color = 'blue' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };
  const colors = {
    blue: 'text-teal-700',
    white: 'text-white',
    gray: 'text-gray-400',
    green: 'text-teal-700'
  };
  return (
    <svg
      className={`animate-spin ${sizes[size]} ${colors[color]}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-64 gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500 animate-pulse">Loading...</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-gray-100 rounded-lg mb-3" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3 border-b border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-1/5" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
          <div className="h-4 bg-gray-200 rounded w-1/6" />
          <div className="h-4 bg-gray-200 rounded w-1/8" />
          <div className="h-4 bg-gray-200 rounded w-1/6" />
        </div>
      ))}
    </div>
  );
}

export default function Loader() {
  return <PageLoader />;
}
