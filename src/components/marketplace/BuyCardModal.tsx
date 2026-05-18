/**
 * BuyCardModal — Confirmation step before a purchase is finalized.
 * Minimalist: card identity + price + Confirm/Cancel. No payment rail yet
 * (off-chain ownership swap via marketplaceSystem.buyCard).
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DIVISION_LABELS, type Division } from '@/lib/divisionSystem';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  listing: {
    id: string;
    cardName?: string;
    cardDivision?: Division;
    cardColor?: string;
    priceCents: number;
    feePercent: number;
  } | null;
  submitting: boolean;
  onConfirm: () => void;
}

const BuyCardModal = ({ open, onOpenChange, listing, submitting, onConfirm }: Props) => {
  if (!listing) return null;
  const price = (listing.priceCents / 100).toFixed(2);
  const color = listing.cardColor ?? '#5599ff';
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
            Off-chain ownership transfer. 24h sale-lock applies to the buyer.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4">
          <div
            className="w-14 h-14 rounded-full flex-shrink-0"
            style={{
              background: `radial-gradient(circle at 35% 35%, ${color}ee, ${color}50)`,
              boxShadow: `0 0 24px ${color}60`,
            }}
          />
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold font-mono text-blue-300 truncate">{listing.cardName}</div>
            <div className="text-xs font-mono tracking-widest text-white/60 mt-1">
              {listing.cardDivision ? DIVISION_LABELS[listing.cardDivision] : '—'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono tracking-widest text-white/50 uppercase">Price</div>
            <div className="text-2xl font-bold font-mono text-yellow-300">${price}</div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="flex-1 min-h-[44px] px-5 rounded-lg border border-white/20 bg-black/40 font-mono text-sm tracking-[0.2em] font-bold text-white/70 hover:bg-white/5 transition-all"
          >
            CANCEL
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="flex-1 min-h-[44px] px-5 rounded-lg border border-yellow-400/50 bg-yellow-400/10 font-mono text-sm tracking-[0.2em] font-bold text-yellow-300 hover:bg-yellow-400/20 hover:scale-[1.02] transition-all disabled:opacity-40"
            style={{ textShadow: '0 0 10px rgba(255,221,0,0.5)' }}
          >
            {submitting ? '...' : `BUY · $${price}`}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BuyCardModal;
