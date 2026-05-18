/**
 * SkeletonPanel — cosmic shimmer used while marketplace widgets are loading.
 */
interface Props {
  lines?: number;
  className?: string;
}

export default function SkeletonPanel({ lines = 3, className = '' }: Props) {
  return (
    <div
      className={`rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl p-5 space-y-3 ${className}`}
      style={{ boxShadow: '0 0 18px rgba(85,153,255,0.08)' }}
      aria-hidden
    >
      <div className="h-4 w-1/3 rounded bg-blue-500/15 animate-pulse" />
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-white/10 animate-pulse"
          style={{ width: `${60 + ((i * 17) % 35)}%` }}
        />
      ))}
    </div>
  );
}
