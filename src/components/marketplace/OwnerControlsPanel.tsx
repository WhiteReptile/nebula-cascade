/**
 * OwnerControlsPanel — owner-only marketplace admin (treasury + fee).
 * Renders nothing unless connected wallet === contract owner.
 */
import { useState } from 'react';
import {
  useMarketplaceOwner,
  useTreasuryStats,
  useSetTreasury,
  useSetFeeBps,
} from '@/hooks/useMarketplaceContract';
import SkeletonPanel from './SkeletonPanel';
import { MARKETPLACE_CONFIGURED } from '@/lib/marketplace/contract';

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/;

export default function OwnerControlsPanel() {
  const { isOwner, owner } = useMarketplaceOwner();
  const { treasury, feeBps, refresh } = useTreasuryStats();
  const { setTreasury, isPending: tPending } = useSetTreasury(refresh);
  const { setFeeBps, isPending: fPending } = useSetFeeBps(refresh);

  const [newTreasury, setNewTreasury] = useState('');
  const [newBps, setNewBps] = useState('');

  // Owner not yet resolved → render a slim skeleton so layout doesn't jump.
  if (owner == null) return <SkeletonPanel lines={2} />;
  if (!isOwner) return null;

  const bpsNum = Number(newBps);
  const bpsValid = newBps !== '' && Number.isInteger(bpsNum) && bpsNum >= 0 && bpsNum <= 1000;
  const tValid = ADDR_RE.test(newTreasury);

  const onSubmitTreasury = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tValid) return;
    try { await setTreasury(newTreasury); setNewTreasury(''); } catch { /* toast handled */ }
  };
  const onSubmitFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bpsValid) return;
    try { await setFeeBps(bpsNum); setNewBps(''); } catch { /* toast handled */ }
  };

  const panel = "rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl";

  return (
    <div className={`${panel} p-6 space-y-6`} style={{ boxShadow: '0 0 24px rgba(255,51,68,0.12)' }}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h3 className="text-lg uppercase tracking-[0.3em] menu-neon-title-red font-bold">
          ⚙ Owner Controls
        </h3>
        <span className="text-[10px] glow-white tracking-[0.25em] uppercase border border-red-500/40 px-2 py-1 rounded">
          Contract Admin
        </span>
      </div>

      {/* Treasury */}
      <form onSubmit={onSubmitTreasury} className="space-y-2">
        <div className="text-xs glow-blue uppercase tracking-widest font-bold">Treasury Address</div>
        <div className="text-[11px] glow-white font-mono break-all">
          Current: {treasury ?? '—'}
        </div>
        <div className="flex gap-2 flex-wrap">
          <input
            value={newTreasury}
            onChange={e => setNewTreasury(e.target.value.trim())}
            placeholder="0x…"
            className="flex-1 min-w-[260px] h-11 px-3 rounded-lg bg-black/60 border border-blue-500/30 text-yellow-300 placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-yellow-400/60"
          />
          <button
            type="submit"
            disabled={!tValid || tPending}
            className="min-h-[44px] px-5 rounded-lg border bg-black/40 glow-yellow glow-border-yellow text-xs tracking-[0.2em] font-bold hover:bg-yellow-400/10 hover:scale-[1.03] transition-all disabled:opacity-40 disabled:hover:scale-100"
          >
            {tPending ? '…' : 'UPDATE TREASURY'}
          </button>
        </div>
      </form>

      {/* Fee */}
      <form onSubmit={onSubmitFee} className="space-y-2">
        <div className="text-xs glow-blue uppercase tracking-widest font-bold">Fee (basis points)</div>
        <div className="text-[11px] glow-white font-mono">
          Current: {feeBps != null ? `${feeBps} bps · ${(feeBps / 100).toFixed(2)}%` : '—'}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <input
            type="number"
            min={0}
            max={1000}
            value={newBps}
            onChange={e => setNewBps(e.target.value)}
            placeholder="0 – 1000"
            className="w-40 h-11 px-3 rounded-lg bg-black/60 border border-blue-500/30 text-yellow-300 placeholder:text-white/30 font-mono text-sm focus:outline-none focus:border-yellow-400/60"
          />
          <span className="text-xs glow-white font-mono">
            {bpsValid ? `= ${(bpsNum / 100).toFixed(2)}%` : newBps === '' ? '—' : 'MAX 10% (1000 bps)'}
          </span>
          <button
            type="submit"
            disabled={!bpsValid || fPending}
            className="min-h-[44px] px-5 rounded-lg border bg-black/40 glow-yellow glow-border-yellow text-xs tracking-[0.2em] font-bold hover:bg-yellow-400/10 hover:scale-[1.03] transition-all disabled:opacity-40 disabled:hover:scale-100 ml-auto"
          >
            {fPending ? '…' : 'UPDATE FEE'}
          </button>
        </div>
      </form>
    </div>
  );
}
