/**
 * NFTCard — single live NFT tile in the Mint grid.
 * Pulls per-token claim condition for price/supply/window. Inert "Claim" button
 * (Phase 4 will wire the actual claim transaction).
 */
import { useTokenClaimCondition } from '@/lib/thirdweb/nftQueries';
import { extractDivisionFromNFT } from '@/lib/thirdweb/divisionFromMetadata';
import { useEthUsdPrice, ethToUsd } from '@/lib/priceFeed';
import DivisionBadge from '@/components/game/DivisionBadge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { NFT } from 'thirdweb';

interface Props {
  nft: NFT;
}

const ZERO = 0n;
const MAX_UINT256 = (1n << 256n) - 1n;
const NATIVE_CURRENCY = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

// Names (case-insensitive substring) that are not yet live — overrides on-chain claim state.
// Remove an entry here to flip the card live without contract changes.
const COMING_SOON_NAMES = ['monster', 'mortal escape'];

function formatEth(wei: bigint): string {
  // ETH = wei / 1e18, render up to 6 decimals trimmed
  const divisor = 1_000_000_000_000_000_000n;
  const whole = wei / divisor;
  const frac = wei % divisor;
  if (frac === 0n) return whole.toString();
  // pad to 18, take 6 sig digits, trim trailing zeros
  const fracStr = frac.toString().padStart(18, '0').slice(0, 6).replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}

const NFTCard = ({ nft }: Props) => {
  const tokenId = nft.id;
  const { data: cond, isLoading: condLoading, error: condError } =
    useTokenClaimCondition(tokenId);
  const { ethUsd } = useEthUsdPrice();

  const division = extractDivisionFromNFT(nft);
  const supply = nft.type === 'ERC1155' ? nft.supply : 0n;
  const meta = (nft.metadata ?? {}) as Record<string, unknown>;
  const rawImage =
    (typeof meta.image === 'string' && meta.image) ||
    (typeof meta.image_url === 'string' && meta.image_url) ||
    (typeof meta.image_original_url === 'string' && meta.image_original_url) ||
    '';
  const name = (typeof meta.name === 'string' && meta.name) || `Token #${tokenId.toString()}`;

  // Resolve IPFS → project-dedicated Thirdweb CDN (same domain serving the metadata).
  // Generic ipfs.thirdwebcdn.com gateway rate-limits/rejects, so we use the client-scoped CDN.
  const imageSrc = rawImage.startsWith('ipfs://')
    ? `https://0ee0974906e5b6b9d18c8f635d4a3df0.ipfscdn.io/ipfs/${rawImage.slice(7)}`
    : rawImage;

  // Coming-soon override (name-based, case-insensitive substring match)
  const nameLower = (typeof name === 'string' ? name : '').toLowerCase();
  const isComingSoon = COMING_SOON_NAMES.some((n) => nameLower.includes(n));

  // Claim window
  const now = Math.floor(Date.now() / 1000);
  const startTs = cond ? Number(cond.startTimestamp) : 0;
  const isLive = cond && startTs > 0 && startTs <= now;
  const isFuture = cond && startTs > now;
  const isUnlimited = cond && cond.maxClaimableSupply === MAX_UINT256;
  const maxSupply = cond && !isUnlimited ? cond.maxClaimableSupply : null;
  const claimedSoFar = cond ? cond.supplyClaimed : ZERO;
  const isSoldOut = cond && !isUnlimited && maxSupply !== null && claimedSoFar >= maxSupply;

  // Price
  const priceWei = cond?.pricePerToken ?? ZERO;
  const isFree = priceWei === ZERO;
  const isNative = !cond || cond.currency.toLowerCase() === NATIVE_CURRENCY;
  const ethValue = isNative && !isFree ? Number(formatEth(priceWei)) : 0;
  const usdValue = ethToUsd(ethValue, ethUsd);

  // Status pill
  let statusLabel = '—';
  let statusColor = 'rgba(255,255,255,0.4)';
  let statusGlow = 'none';
  if (isComingSoon) {
    statusLabel = 'COMING SOON';
    statusColor = '#ffaa33';
    statusGlow = '0 0 10px #ffaa33';
  } else if (condError) {
    statusLabel = 'NO CLAIM';
    statusColor = 'rgba(255,255,255,0.3)';
  } else if (condLoading) {
    statusLabel = '…';
  } else if (isSoldOut) {
    statusLabel = 'SOLD OUT';
    statusColor = '#888';
  } else if (isFuture) {
    const hours = Math.max(1, Math.ceil((startTs - now) / 3600));
    statusLabel = `STARTS ${hours}h`;
    statusColor = '#ffdd00';
    statusGlow = '0 0 8px #ffdd00';
  } else if (isLive) {
    statusLabel = 'LIVE';
    statusColor = '#22ff88';
    statusGlow = '0 0 10px #22ff88';
  }

  return (
    <div
      className="group rounded-xl border bg-black/55 backdrop-blur-md p-4 flex flex-col gap-3 transition-all hover:scale-[1.03]"
      style={{
        borderColor: 'rgba(255, 51, 68, 0.3)',
        boxShadow: '0 0 18px rgba(255, 51, 68, 0.15)',
      }}
    >
      {/* Image */}
      <div
        className="relative aspect-square rounded-lg overflow-hidden border bg-black/40 transition-all group-hover:scale-[1.01]"
        style={{
          borderColor: 'rgba(255, 51, 68, 0.4)',
          boxShadow: 'inset 0 0 30px rgba(255, 51, 68, 0.08)',
        }}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={name}
            loading="lazy"
            decoding="async"
            width={1024}
            height={1024}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${isComingSoon ? 'opacity-80' : ''}`}
            style={{ imageRendering: 'auto' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30 font-mono text-xs">
            NO IMAGE
          </div>
        )}

        {/* Status pill (top-right) */}
        <div
          className="absolute top-2 right-2 px-2 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest border bg-black/70 backdrop-blur-sm"
          style={{
            color: statusColor,
            borderColor: statusColor,
            textShadow: statusGlow,
          }}
        >
          {statusLabel}
        </div>
      </div>

      {/* Name + Division */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold font-mono truncate text-white/90">{name}</h3>
          <div className="text-[10px] uppercase tracking-widest text-white/40 mt-0.5 font-mono">
            #{tokenId.toString()} · {supply.toString()} minted
          </div>
        </div>
        {division && <DivisionBadge division={division} size="sm" />}
      </div>

      {/* Price */}
      <div className="flex items-end justify-between border-t border-red-500/20 pt-3">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Price</div>
          {isComingSoon ? (
            <div className="text-lg font-mono font-bold text-white/40">—</div>
          ) : condLoading ? (
            <div className="text-sm text-white/40 font-mono mt-1">…</div>
          ) : isFree ? (
            <div className="text-lg font-mono font-bold text-green-400" style={{ textShadow: '0 0 8px #22ff88' }}>
              FREE
            </div>
          ) : isNative ? (
            <>
              <div className="text-lg font-mono font-bold text-white/90">
                {formatEth(priceWei)} <span className="text-xs text-white/50">ETH</span>
              </div>
              {usdValue !== null && (
                <div className="text-[11px] text-white/40 font-mono">
                  ≈ ${usdValue.toFixed(2)}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm font-mono text-white/60">Custom currency</div>
          )}
        </div>

        {/* Claim button (inert) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              disabled
              className="min-h-[40px] px-4 rounded-lg border text-xs tracking-[0.2em] font-mono font-bold uppercase opacity-40 cursor-not-allowed"
              style={{
                borderColor: isComingSoon ? 'rgba(255, 170, 51, 0.5)' : 'rgba(255, 51, 68, 0.5)',
                color: isComingSoon ? '#ffcc77' : '#ff8899',
                background: 'rgba(0,0,0,0.4)',
              }}
            >
              {isComingSoon ? 'Coming Soon' : 'Claim'}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p className="font-mono text-xs">{isComingSoon ? 'Drop date TBA' : 'Live in Phase 4'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
};

export default NFTCard;
