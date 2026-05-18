/**
 * InlineError — cosmic red glow card with retry affordance.
 * For RPC / contract read failures.
 */
interface Props {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export default function InlineError({ message, onRetry, className = '' }: Props) {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-500/40 bg-black/50 backdrop-blur-xl p-4 space-y-3 ${className}`}
      style={{ boxShadow: '0 0 18px rgba(255,60,80,0.18)' }}
    >
      <div className="flex items-start gap-3">
        <span className="text-red-300 font-mono text-lg leading-none" aria-hidden>⚠</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-mono tracking-[0.2em] uppercase text-red-300 font-bold mb-1">
            Network Error
          </div>
          <div className="text-[12px] font-mono text-white/70 break-words">
            {message.length > 240 ? `${message.slice(0, 240)}…` : message}
          </div>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="min-h-[36px] px-4 rounded-lg border border-red-400/50 bg-red-400/5 font-mono text-[11px] tracking-[0.2em] font-bold text-red-200 hover:bg-red-400/15 hover:scale-[1.02] transition-all"
        >
          ↻ RETRY
        </button>
      )}
    </div>
  );
}
