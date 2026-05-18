/**
 * MyCardTile — one card row inside MY CARDS.
 * Extracted so we can call useLockExpiry() per-card legally.
 */
import { useLockExpiry } from '@/hooks/useMarketplaceContract';
import { DIVISION_LABELS } from '@/lib/divisionSystem';
import type { CardMetadata } from '@/lib/cardSystem';
import type { CardEnergy } from '@/lib/energySystem';
import type { OnChainListing } from '@/hooks/useMarketplaceContract';

interface Props {
  card: CardMetadata;
  energy?: CardEnergy;
  isActive: boolean;
  onChainListing?: OnChainListing;
  onSelectActive: () => void;
  onSell: () => void;
  onCancel: () => void;
}

function fmtHMS(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function MyCardTile({
  card, energy, isActive, onChainListing, onSelectActive, onSell, onCancel,
}: Props) {
  const isListed = !!onChainListing;
  let tokenIdBig: bigint | null = null;
  try { tokenIdBig = BigInt(card.tokenId); } catch { tokenIdBig = null; }
  const { isLocked, secondsLeft } = useLockExpiry(tokenIdBig);

  const panel = "rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl";

  return (
    <div
      className={`${panel} p-5 transition-all cursor-pointer group hover:scale-[1.02] ${
        isActive ? 'glow-border-yellow' : 'hover:glow-border-yellow'
      }`}
      onClick={() => !isListed && onSelectActive()}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 transition-all glow-white ${
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
        <div className="flex-1 min-w-0">
          <div className="text-base font-bold truncate glow-blue">{card.name}</div>
          <div className="text-xs tracking-widest mt-1 flex items-center gap-2 flex-wrap">
            <span className="glow-white">{DIVISION_LABELS[card.division]}</span>
            {isActive && <span className="glow-yellow">• ACTIVE</span>}
            {isListed && <span className="glow-yellow">• LISTED ON-CHAIN</span>}
            {isLocked && !isListed && (
              <span
                className="px-2 py-0.5 rounded border border-red-500/50 text-red-300 font-mono"
                style={{ textShadow: '0 0 8px rgba(255,50,80,0.7)', boxShadow: '0 0 10px rgba(255,50,80,0.25)' }}
                title="24h anti-flip lock active"
              >
                🔒 {fmtHMS(secondsLeft)}
              </span>
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
        ) : (
          <button
            disabled={isLocked}
            title={isLocked ? '24h anti-flip lock active' : undefined}
            onClick={(e) => { e.stopPropagation(); if (!isLocked) onSell(); }}
            className="min-h-[40px] px-4 py-2 rounded-lg border bg-black/40 glow-yellow glow-border-yellow text-xs tracking-[0.2em] font-bold hover:scale-105 hover:bg-yellow-400/10 transition-all disabled:opacity-40 disabled:hover:scale-100 disabled:cursor-not-allowed"
          >
            {isLocked ? `LOCKED · ${fmtHMS(secondsLeft)}` : 'SELL ON-CHAIN'}
          </button>
        )}
      </div>
    </div>
  );
}
