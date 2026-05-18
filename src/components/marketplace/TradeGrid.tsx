/**
 * TradeGrid — On-chain marketplace grid.
 * Rarity chips + sort dropdown + responsive grid + empty/loading/error states.
 * Triggers buy/cancel modals via callbacks.
 */
import { useMemo, useState } from 'react';
import { useActiveListings, useApprovalStatus, type OnChainListing } from '@/hooks/useMarketplaceContract';
import { useNftMetadata } from '@/hooks/useNftMetadata';
import { extractDivisionFromNFT } from '@/lib/thirdweb/divisionFromMetadata';
import { MARKETPLACE_CONFIGURED } from '@/lib/marketplace/contract';
import { useActiveAccount } from 'thirdweb/react';
import ListingCard from './ListingCard';
import InlineError from './InlineError';
import { DIVISION_LABELS, type Division } from '@/lib/divisionSystem';

type DivFilter = Division | 'all';
type Sort = 'newest' | 'price_asc' | 'price_desc';

const FILTERS: { key: DivFilter; label: string }[] = [
  { key: 'all', label: 'ALL' },
  { key: 'gem_v', label: 'V' },
  { key: 'gem_iv', label: 'IV' },
  { key: 'gem_iii', label: 'III' },
  { key: 'gem_ii', label: 'II' },
  { key: 'gem_i', label: 'I' },
];

interface Props {
  onBuy: (l: OnChainListing) => void;
  onCancel: (l: OnChainListing) => void;
}

/** Wraps ListingCard with a division-aware filter wrapper. */
function FilterableListing({
  listing,
  filter,
  isOwn,
  onBuy,
  onCancel,
}: {
  listing: OnChainListing;
  filter: DivFilter;
  isOwn: boolean;
  onBuy: () => void;
  onCancel: () => void;
}) {
  const { nft } = useNftMetadata(listing.tokenId);
  const div = nft ? extractDivisionFromNFT(nft) : null;
  if (filter !== 'all' && div !== filter) return null;
  return <ListingCard listing={listing} isOwn={isOwn} onBuy={onBuy} onCancel={onCancel} />;
}

const TradeGrid = ({ onBuy, onCancel }: Props) => {
  const account = useActiveAccount();
  const { listings, loading, error, refresh } = useActiveListings();
  const [filter, setFilter] = useState<DivFilter>('all');
  const [sort, setSort] = useState<Sort>('newest');

  const sorted = useMemo(() => {
    const arr = [...listings];
    if (sort === 'newest') arr.sort((a, b) => Number(b.createdAt - a.createdAt));
    if (sort === 'price_asc') arr.sort((a, b) => (a.priceWei < b.priceWei ? -1 : a.priceWei > b.priceWei ? 1 : 0));
    if (sort === 'price_desc') arr.sort((a, b) => (a.priceWei > b.priceWei ? -1 : a.priceWei < b.priceWei ? 1 : 0));
    return arr;
  }, [listings, sort]);

  if (!MARKETPLACE_CONFIGURED) {
    return (
      <div className="rounded-xl border border-yellow-400/40 bg-black/40 p-8 text-center backdrop-blur-xl space-y-3">
        <div className="font-mono uppercase tracking-[0.3em] text-yellow-300 font-bold">
          On-Chain Marketplace Not Yet Deployed
        </div>
        <div className="font-mono text-sm text-white/60 tracking-wider">
          Deploy <code className="text-yellow-300">contracts/NebulaMarketplace.sol</code> via Remix to Base,
          then add <code className="text-yellow-300">VITE_MARKETPLACE_CONTRACT</code> to your project env.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filter + sort row */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex gap-2 overflow-x-auto overscroll-contain max-w-full -mx-1 px-1 pb-1 snap-x snap-mandatory">
          {/* horizontal-scroll on narrow viewports */}
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`min-h-[40px] px-4 py-1.5 text-xs tracking-[0.2em] font-mono font-bold rounded-lg border bg-black/40 transition-all hover:scale-105 ${
                  active
                    ? 'border-yellow-400/70 text-yellow-300'
                    : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white/90'
                }`}
                style={active ? { textShadow: '0 0 8px rgba(255,221,0,0.5)' } : undefined}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="min-h-[40px] px-3 rounded-lg border border-white/20 bg-black/60 text-xs font-mono tracking-widest text-white/80 focus:outline-none focus:border-yellow-400/60"
        >
          <option value="newest">NEWEST</option>
          <option value="price_asc">PRICE ↑</option>
          <option value="price_desc">PRICE ↓</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-20 font-mono tracking-[0.3em] text-blue-300 animate-pulse" role="status">
          LOADING ON-CHAIN LISTINGS…
        </div>
      ) : error ? (
        <InlineError message={`Failed to read contract: ${error}`} onRetry={refresh} />
      ) : sorted.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col items-center py-20 space-y-3">
          <div
            className="w-16 h-16 rounded-full"
            style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(85,153,255,0.5), rgba(255,221,0,0.2), transparent)',
              boxShadow: '0 0 30px rgba(85,153,255,0.3)',
            }}
          />
          <span className="text-lg tracking-[0.3em] font-mono font-bold text-blue-300">
            {filter === 'all' ? 'NO LIVE LISTINGS' : `NO ${DIVISION_LABELS[filter as Division].toUpperCase()} LISTINGS`}
          </span>
          <span className="text-xs font-mono tracking-widest text-white/50">
            {filter === 'all' ? 'Be the first to list a card' : 'Try another division — or be the first to list this one'}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sorted.map((l) => (
            <FilterableListing
              key={l.id.toString()}
              listing={l}
              filter={filter}
              isOwn={!!account && account.address.toLowerCase() === l.seller.toLowerCase()}
              onBuy={() => onBuy(l)}
              onCancel={() => onCancel(l)}
            />
          ))}
        </div>
      )}

      {/* Approval status hint for sellers */}
      {account && <ApprovalHint />}
    </div>
  );
};

function ApprovalHint() {
  const { isApproved } = useApprovalStatus();
  if (isApproved) return null;
  return (
    <div className="text-[11px] font-mono tracking-widest text-white/40 text-center">
      First-time sellers will be asked to approve the marketplace once before listing.
    </div>
  );
}

export default TradeGrid;
