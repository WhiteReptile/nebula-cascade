/**
 * TreasuryWidget — owner-only stats for the marketplace contract.
 * Shows treasury address, fee, contract ETH balance, and lifetime volume.
 * Surfaces inline errors with retry; uses skeleton while first paint loads.
 */
import {
  useMarketplaceOwner,
  useTreasuryStats,
  useLifetimeVolume,
} from '@/hooks/useMarketplaceContract';
import { useEthUsdPrice, ethToUsd } from '@/lib/priceFeed';
import AddressLink from './AddressLink';
import InlineError from './InlineError';
import SkeletonPanel from './SkeletonPanel';
import { MARKETPLACE_ADDRESS } from '@/lib/marketplace/contract';
import { useState } from 'react';

function weiToEth(w: bigint): number {
  return Number(w) / 1e18;
}

function RefreshButton({ onClick, spinning, label = 'Refresh' }: { onClick: () => void; spinning?: boolean; label?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={spinning}
      aria-label={label}
      className="text-[10px] glow-white tracking-[0.2em] uppercase border border-blue-500/40 px-2 py-1 rounded hover:border-yellow-400/60 transition-all disabled:opacity-60"
    >
      <span className={`inline-block ${spinning ? 'animate-spin' : ''}`} aria-hidden>↻</span> {label}
    </button>
  );
}

export default function TreasuryWidget() {
  const { isOwner } = useMarketplaceOwner();
  const { treasury, feeBps, contractBalanceWei, loading, error, refresh } = useTreasuryStats();
  const { volumeWei, loading: volLoading, error: volError, refresh: refreshVol } = useLifetimeVolume();
  const { ethUsd } = useEthUsdPrice();
  const [spinT, setSpinT] = useState(false);
  const [spinV, setSpinV] = useState(false);

  if (!isOwner) return null;

  const balEth = weiToEth(contractBalanceWei);
  const volEth = weiToEth(volumeWei);
  const balUsd = ethToUsd(balEth, ethUsd);
  const volUsd = ethToUsd(volEth, ethUsd);

  const panel = "rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl";

  if (loading && treasury == null && feeBps == null) {
    return <SkeletonPanel lines={5} />;
  }

  const handleT = () => { setSpinT(true); refresh(); setTimeout(() => setSpinT(false), 800); };
  const handleV = () => { setSpinV(true); refreshVol(); setTimeout(() => setSpinV(false), 800); };

  return (
    <div className={`${panel} p-5 space-y-4`} style={{ boxShadow: '0 0 20px rgba(0,255,170,0.1)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold glow-yellow tracking-widest">Treasury</h3>
        <RefreshButton onClick={handleT} spinning={spinT} />
      </div>

      {error && <InlineError message={error} onRetry={handleT} />}

      <div className="text-xs space-y-3">
        <div>
          <div className="glow-blue tracking-widest uppercase text-[10px] mb-1">Treasury Address</div>
          <AddressLink address={treasury} truncate={false} className="text-[11px] break-all" />
        </div>
        <div>
          <div className="glow-blue tracking-widest uppercase text-[10px] mb-1">Marketplace Contract</div>
          <AddressLink address={MARKETPLACE_ADDRESS} truncate={false} className="text-[11px] break-all" />
        </div>

        <div className="flex justify-between">
          <span className="glow-blue tracking-widest">Current Fee</span>
          <span className="glow-yellow font-bold">
            {feeBps != null ? `${(feeBps / 100).toFixed(2)}%` : '—'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="glow-blue tracking-widest">Contract Balance</span>
          <span className="text-right">
            <div className="glow-yellow font-bold">{balEth.toFixed(6)} ETH</div>
            {balUsd != null && (
              <div className="glow-white text-[10px] tracking-widest">${balUsd.toFixed(2)} USD</div>
            )}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <span className="glow-blue tracking-widest flex items-center gap-2">
            Lifetime Volume
            <RefreshButton onClick={handleV} spinning={spinV} label="↻" />
          </span>
          <span className="text-right">
            <div className="glow-yellow font-bold">
              {volLoading && volumeWei === 0n ? '…' : `${volEth.toFixed(6)} ETH`}
            </div>
            {volUsd != null && (
              <div className="glow-white text-[10px] tracking-widest">${volUsd.toFixed(2)} USD</div>
            )}
          </span>
        </div>

        {volError && <InlineError message={volError} onRetry={handleV} />}
      </div>
    </div>
  );
}
