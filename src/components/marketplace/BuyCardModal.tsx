/**
 * BuyCardModal — On-chain buy confirmation.
 * Sends `buyCard(listingId)` with `value = priceWei` from the connected wallet.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useBuyCard, type OnChainListing } from '@/hooks/useMarketplaceContract';
import { useNftMetadata, resolveIpfsImage } from '@/hooks/useNftMetadata';
import { useEthUsdPrice, ethToUsd } from '@/lib/priceFeed';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listing: OnChainListing | null;
  onBought?: () => void;
}

function formatEth(wei: bigint): string {
  const div = 1_000_000_000_000_000_000n;
  const whole = wei / div;
  const frac = wei % div;
  if (frac === 0n) return whole.toString();
  const fracStr = frac.toString().padStart(18, '0').slice(0, 6).replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr}` : whole.toString();
}

const BuyCardModal = ({ open, onOpenChange, listing, onBought }: Props) => {
  const { nft } = useNftMetadata(listing?.tokenId ?? null);
  const { ethUsd } = useEthUsdPrice();
  const { buy, isPending } = useBuyCard(() => {
    onBought?.();
    onOpenChange(false);
  });

  if (!listing) return null;

  const meta = (nft?.metadata ?? {}) as Record<string, unknown>;
  const name = (typeof meta.name === 'string' && meta.name) || `Token #${listing.tokenId}`;
  const image = resolveIpfsImage(
    (typeof meta.image === 'string' && meta.image) ||
      (typeof meta.image_url === 'string' && meta.image_url) ||
      null,
  );
  const ethStr = formatEth(listing.priceWei);
  const usd = ethToUsd(Number(ethStr), ethUsd);

  const confirm = async () => {
    try {
      await buy(listing.id, listing.priceWei);
    } catch { /* toast already shown */ }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-black/90 border-yellow-400/40 backdrop-blur-xl"
        style={{ boxShadow: '0 0 40px rgba(255,221,0,0.2)' }}
      >
        <DialogHeader>
          <DialogTitle className="font-mono uppercase tracking-[0.25em] text-yellow-300">
            Confirm Purchase
          </DialogTitle>
          <DialogDescription className="font-mono text-white/60 tracking-wider text-xs">
            Native ETH on Base · NFT delivered atomically · 24h relist lock applies
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-black/40">
            {image && (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold font-mono text-blue-300 truncate">{name}</div>
            <div className="text-xs font-mono tracking-widest text-white/50 mt-1">
              #{listing.tokenId.toString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono tracking-widest text-white/50 uppercase">Price</div>
            <div className="text-xl font-bold font-mono text-yellow-300 whitespace-nowrap">
              {ethStr} <span className="text-xs text-white/55">ETH</span>
            </div>
            {usd !== null && (
              <div className="text-[11px] font-mono text-white/50 mt-0.5">≈ ${usd.toFixed(2)}</div>
            )}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="flex-1 min-h-[44px] px-5 rounded-lg border border-white/20 bg-black/40 font-mono text-sm tracking-[0.2em] font-bold text-white/70 hover:bg-white/5"
          >
            CANCEL
          </button>
          <button
            onClick={confirm}
            disabled={isPending}
            className="flex-1 min-h-[44px] px-5 rounded-lg border border-yellow-400/50 bg-yellow-400/10 font-mono text-sm tracking-[0.2em] font-bold text-yellow-300 hover:bg-yellow-400/20 hover:scale-[1.02] transition-all disabled:opacity-40"
            style={{ textShadow: '0 0 10px rgba(255,221,0,0.5)' }}
          >
            {isPending ? 'CONFIRMING…' : `BUY · ${ethStr} ETH`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCardModal;
