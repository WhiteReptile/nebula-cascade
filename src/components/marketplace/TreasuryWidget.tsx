/**
 * TreasuryWidget — owner-only stats for the marketplace contract.
 * Shows treasury address, fee, contract ETH balance, and lifetime volume.
 */
import {
  useMarketplaceOwner,
  useTreasuryStats,
  useLifetimeVolume,
} from '@/hooks/useMarketplaceContract';
import { useEthUsdPrice, ethToUsd } from '@/lib/priceFeed';
import AddressLink from './AddressLink';
import { MARKETPLACE_ADDRESS } from '@/lib/marketplace/contract';

function weiToEth(w: bigint): number {
  // Safe enough for display (< 2^53 ETH never happens)
  return Number(w) / 1e18;
}

export default function TreasuryWidget() {
  const { isOwner } = useMarketplaceOwner();
  const { treasury, feeBps, contractBalanceWei, refresh } = useTreasuryStats();
  const { volumeWei, loading: volLoading, refresh: refreshVol } = useLifetimeVolume();
  const { ethUsd } = useEthUsdPrice();

  if (!isOwner) return null;

  const balEth = weiToEth(contractBalanceWei);
  const volEth = weiToEth(volumeWei);
  const balUsd = ethToUsd(balEth, ethUsd);
  const volUsd = ethToUsd(volEth, ethUsd);

  const panel = "rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl";

  return (
    <div className={`${panel} p-5 space-y-4`} style={{ boxShadow: '0 0 20px rgba(0,255,170,0.1)' }}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold glow-yellow tracking-widest">Treasury</h3>
        <button
          onClick={() => { refresh(); refreshVol(); }}
          className="text-[10px] glow-white tracking-[0.2em] uppercase border border-blue-500/40 px-2 py-1 rounded hover:border-yellow-400/60 transition-all"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="text-xs space-y-3">
        <div>
          <div className="glow-blue tracking-widest uppercase text-[10px] mb-1">Treasury Address</div>
          <div className="glow-white font-mono break-all">{treasury ?? '—'}</div>
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

        <div className="flex justify-between">
          <span className="glow-blue tracking-widest">Lifetime Volume</span>
          <span className="text-right">
            <div className="glow-yellow font-bold">
              {volLoading && volumeWei === 0n ? '…' : `${volEth.toFixed(6)} ETH`}
            </div>
            {volUsd != null && (
              <div className="glow-white text-[10px] tracking-widest">${volUsd.toFixed(2)} USD</div>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
