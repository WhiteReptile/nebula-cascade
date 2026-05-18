/**
 * MyCardTile — one card row inside MY CARDS.
 * Extracted so we can call useLockExpiry() per-card legally.
 * Shows a 24h anti-flip lock countdown with a progress ring + shadcn Tooltip on the SELL button.
 */
import { useLockExpiry } from '@/hooks/useMarketplaceContract';
import { DIVISION_LABELS } from '@/lib/divisionSystem';
import type { CardMetadata } from '@/lib/cardSystem';
import type { CardEnergy } from '@/lib/energySystem';
import type { OnChainListing } from '@/hooks/useMarketplaceContract';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  card: CardMetadata;
  energy?: CardEnergy;
  isActive: boolean;
  onChainListing?: OnChainListing;
  onSelectActive: () => void;
  onSell: () => void;
  onCancel: () => void;
}

const LOCK_WINDOW_SEC = 24 * 60 * 60;

function fmtHMS(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function fmtUnlockTime(secondsLeft: number): string {
  const d = new Date(Date.now() + secondsLeft * 1000);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function MyCardTile({
  card, energy, isActive, onChainListing, onSelectActive, onSell, onCancel,
}: Props) {
  const isListed = !!onChainListing;
  let tokenIdBig: bigint | null = null;
  try { tokenIdBig = BigInt(card.tokenId); } catch { tokenIdBig = null; }
  const { isLocked, secondsLeft } = useLockExpiry(tokenIdBig);

  const panel = "rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl";

  // Lock progress (1 = just locked, 0 = unlocked). Used to draw a stroke-dasharray ring.
  const progress = Math.min(1, Math.max(0, secondsLeft / LOCK_WINDOW_SEC));
  const RING_R = 24;
  const RING_C = 2 * Math.PI * RING_R;
  const dashOffset = RING_C * (1 - progress);
  const ringColor = secondsLeft < 60 ? 'rgba(255,80,100,0.95)' : 'rgba(255,80,100,0.7)';

  const sellBtn = (
    <button
      disabled={isLocked}
      aria-label={
        isLocked
          ? `Locked — unlocks in ${fmtHMS(secondsLeft)} at ${fmtUnlockTime(secondsLeft)}`
          : 'Sell on-chain'
      }
      onClick={(e) => { e.stopPropagation(); if (!isLocked) onSell(); }}
      className="min-h-[40px] px-4 py-2 rounded-lg border bg-black/40 glow-yellow glow-border-yellow text-xs tracking-[0.2em] font-bold hover:scale-105 hover:bg-yellow-400/10 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
    >
      {isLocked ? `LOCKED · ${fmtHMS(secondsLeft)}` : 'SELL ON-CHAIN'}
    </button>
  );

  return (
    <div
      className={`${panel} p-5 transition-all cursor-pointer group hover:scale-[1.02] ${
        isActive ? 'glow-border-yellow' : 'hover:glow-border-yellow'
      }`}
      onClick={() => !isListed && onSelectActive()}
    >
      <div className="flex items-center gap-4">
        {/* Avatar + lock ring */}
        <div className="relative w-14 h-14 flex-shrink-0">
          {isLocked && (
            <svg
              viewBox="0 0 60 60"
              className="absolute inset-[-3px] w-[60px] h-[60px] -rotate-90 pointer-events-none"
              aria-hidden
            >
              <circle
                cx="30" cy="30" r={RING_R}
                fill="none"
                stroke="rgba(255,80,100,0.15)"
                strokeWidth="3"
              />
              <circle
                cx="30" cy="30" r={RING_R}
                fill="none"
                stroke={ringColor}
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={RING_C}
                strokeDashoffset={dashOffset}
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(255,80,100,0.8))',
                  transition: 'stroke-dashoffset 1s linear',
                }}
              />
            </svg>
          )}
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all glow-white ${
              isActive ? 'animate-pulse' : 'group-hover:scale-110'
            }`}
            style={{
              background: `radial-gradient(circle at 35% 35%, ${card.colorHex}ee, ${card.colorHex}50)`,
              boxShadow: isActive
                ? `0 0 30px ${card.colorHex}80, 0 0 60px ${card.colorHex}40`
                : `0 0 18px ${card.colorHex}50`,
            }}
          >
            {card.tokenId}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-base font-bold truncate glow-blue">{card.name}</div>
          <div className="text-xs tracking-widest mt-1 flex items-center gap-2 flex-wrap">
            <span className="glow-white">{DIVISION_LABELS[card.division]}</span>
            {isActive && <span className="glow-yellow">• ACTIVE</span>}
            {isListed && <span className="glow-yellow">• LISTED ON-CHAIN</span>}
            {isLocked && !isListed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    className={`px-2 py-0.5 rounded border font-mono cursor-help ${
                      secondsLeft < 60
                        ? 'border-red-400 text-red-200 animate-pulse'
                        : 'border-red-500/50 text-red-300'
                    }`}
                    style={{
                      textShadow: '0 0 8px rgba(255,50,80,0.7)',
                      boxShadow: secondsLeft < 60
                        ? '0 0 18px rgba(255,50,80,0.55)'
                        : '0 0 10px rgba(255,50,80,0.25)',
                    }}
                  >
                    🔒 {fmtHMS(secondsLeft)}
                  </span>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-black/95 border-red-400/50 text-red-200 font-mono text-xs tracking-wider max-w-[280px]"
                >
                  24h anti-flip lock active.<br />
                  Unlocks at <span className="text-yellow-300">{fmtUnlockTime(secondsLeft)}</span>.
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        {energy && (
          <div className="text-right flex-shrink-0">
            <div className={`text-base font-bold ${energy.energy > 0 ? 'glow-yellow' : 'glow-white'}`}>
              ⚡ {energy.energy}/{energy.maxEnergy}
            </div>
            <div className="flex gap-1 mt-2 justify-end">
              {Array.from({ length: energy.maxEnergy }).map((_, i) => (
                <div
                  key={i}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    background: i < energy.energy ? '#ffdd00' : '#ffffff15',
                    boxShadow: i < energy.energy ? '0 0 6px #ffdd00' : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-blue-500/20 flex justify-end">
        {isListed ? (
          <button
            onClick={(e) => { e.stopPropagation(); onCancel(); }}
            className="min-h-[40px] px-4 py-2 rounded-lg border border-blue-400/50 bg-blue-400/10 text-blue-300 text-xs tracking-[0.2em] font-bold hover:scale-105 hover:bg-blue-400/20 transition-all"
          >
            CANCEL LISTING
          </button>
        ) : isLocked ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span>{sellBtn}</span>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-black/95 border-red-400/50 text-red-200 font-mono text-xs tracking-wider max-w-[280px]"
            >
              24h anti-flip lock. Unlocks at{' '}
              <span className="text-yellow-300">{fmtUnlockTime(secondsLeft)}</span>.
            </TooltipContent>
          </Tooltip>
        ) : sellBtn}
      </div>
    </div>
  );
}
