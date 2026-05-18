/**
 * ListingCard — single on-chain listing tile (image, name, rarity, seller, ETH+USD, BUY).
 */
import { useNftMetadata, resolveIpfsImage } from '@/hooks/useNftMetadata';
import { extractDivisionFromNFT } from '@/lib/thirdweb/divisionFromMetadata';
import { useEthUsdPrice, ethToUsd } from '@/lib/priceFeed';
import DivisionBadge from '@/components/game/DivisionBadge';
import type { OnChainListing } from '@/hooks/useMarketplaceContract';
import type { Division } from '@/lib/divisionSystem';

interface Props {
  listing: OnChainListing;
  isOwn: boolean;
  onBuy: () => void;
  onCancel: () => void;
}

function shortAddr(a: string): string {
  return a.slice(0, 6) + '…' + a.slice(-4);
}

function formatEth(wei: bigint): string {
  const div = 1_000_000_000_000_000_000n;
  const whole = wei / div;
  const frac = wei % div;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(18, '0').slice(0, 6).replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}

const ListingCard = ({ listing, isOwn, onBuy, onCancel }: Props) => {
  const { nft } = useNftMetadata(listing.tokenId);
  const { ethUsd } = useEthUsdPrice();

  const meta = (nft?.metadata ?? {}) as Record<string, unknown>;
  const name = (typeof meta.name === 'string' && meta.name) || `Token #${listing.tokenId}`;
  const image = resolveIpfsImage(
    (typeof meta.image === 'string' && meta.image) ||
      (typeof meta.image_url === 'string' && meta.image_url) ||
      null,
  );
  const division: Division | null = nft ? extractDivisionFromNFT(nft) : null;

  const ethStr = formatEth(listing.priceWei);
  const usd = ethToUsd(Number(ethStr), ethUsd);

  return (
    <div
      className="group rounded-xl border bg-black/55 backdrop-blur-md flex flex-col p-3 gap-2.5 transition-all hover:scale-[1.02]"
      style={{
        borderColor: 'rgba(255, 51, 68, 0.3)',
        boxShadow: '0 0 18px rgba(255, 51, 68, 0.15)',
      }}
    >
      <div
        className="relative aspect-square rounded-lg overflow-hidden border bg-black/40"
        style={{ borderColor: 'rgba(255, 51, 68, 0.4)' }}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 font-mono text-xs">
            …
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        {division && <DivisionBadge division={division} size="sm" />}
        <div className="uppercase tracking-wider text-white/45 font-mono text-[10px]">
          #{listing.tokenId.toString()}
        </div>
      </div>

      <h3 className="font-bold font-mono text-white/95 text-[15px] leading-tight">{name}</h3>

      <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
        seller {shortAddr(listing.seller)}
      </div>

      <div className="flex items-end justify-between border-t border-red-500/20 pt-2 gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-white/50 font-mono">Price</div>
          <div className="text-base font-mono font-bold text-white/95 leading-tight whitespace-nowrap">
            {ethStr} <span className="text-xs text-white/55">ETH</span>
          </div>
          {usd !== null && (
            <div className="text-[11px] text-white/50 font-mono mt-0.5">≈ ${usd.toFixed(2)}</div>
          )}
        </div>

        {isOwn ? (
          <button
            onClick={onCancel}
            className="rounded-lg border tracking-[0.15em] font-mono font-bold uppercase min-h-[36px] px-3 text-[11px] shrink-0 transition-all hover:scale-105"
            style={{
              borderColor: 'rgba(85, 153, 255, 0.6)',
              color: '#9ec6ff',
              background: 'rgba(0,0,0,0.4)',
            }}
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={onBuy}
            className="rounded-lg border tracking-[0.15em] font-mono font-bold uppercase min-h-[36px] px-4 text-[11px] shrink-0 transition-all hover:scale-105"
            style={{
              borderColor: 'rgba(255, 221, 0, 0.7)',
              color: '#ffe55c',
              background: 'rgba(255, 221, 0, 0.08)',
              textShadow: '0 0 8px rgba(255,221,0,0.4)',
            }}
          >
            Buy
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
