/**
 * ListCardModal — On-chain listing flow.
 * Step 1: setApprovalForAll on the collection (one-time per wallet).
 * Step 2: enter ETH price → listCard() escrows the NFT into the marketplace contract.
 */
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useApprovalStatus, useListCard } from '@/hooks/useMarketplaceContract';
import { NEBULA_COLLECTION_ADDRESS } from '@/lib/marketplace/contract';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tokenId: bigint | null;
  tokenName?: string;
  onListed?: () => void;
}

function ethToWei(eth: string): bigint | null {
  const trimmed = eth.trim();
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  const [whole, frac = ''] = trimmed.split('.');
  const padded = (frac + '0'.repeat(18)).slice(0, 18);
  try {
    return BigInt(whole) * 1_000_000_000_000_000_000n + BigInt(padded || '0');
  } catch {
    return null;
  }
}

const ListCardModal = ({ open, onOpenChange, tokenId, tokenName, onListed }: Props) => {
  const { isApproved, approve, approving } = useApprovalStatus();
  const { list, isPending } = useListCard(() => {
    onListed?.();
    onOpenChange(false);
  });
  const [price, setPrice] = useState('');

  const submit = async () => {
    if (tokenId === null) return;
    const wei = ethToWei(price);
    if (!wei || wei === 0n) return;
    try {
      await list(NEBULA_COLLECTION_ADDRESS, tokenId, wei);
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
            List Card for Sale
          </DialogTitle>
          <DialogDescription className="font-mono text-white/60 tracking-wider text-xs">
            On-chain. The NFT is escrowed by the marketplace until sold or cancelled.
          </DialogDescription>
        </DialogHeader>

        <div className="py-3 space-y-4">
          <div className="text-xs font-mono tracking-widest text-white/60">
            {tokenName ?? (tokenId !== null ? `Token #${tokenId}` : '—')}
          </div>

          {!isApproved ? (
            <div className="space-y-3">
              <div className="text-sm font-mono text-white/70 tracking-wider">
                Step 1 of 2 — approve the marketplace to transfer your Nebula cards.
                This is a one-time wallet signature.
              </div>
              <button
                onClick={() => approve().catch(() => {})}
                disabled={approving}
                className="w-full min-h-[44px] px-5 rounded-lg border border-blue-400/50 bg-blue-400/10 font-mono text-sm tracking-[0.2em] font-bold text-blue-300 hover:bg-blue-400/20 disabled:opacity-40"
              >
                {approving ? 'APPROVING…' : 'APPROVE MARKETPLACE'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-mono uppercase tracking-widest text-blue-300 font-bold">
                Price in ETH
              </label>
              <Input
                type="text"
                inputMode="decimal"
                placeholder="0.005"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="bg-black/50 border-blue-500/30 text-yellow-300 placeholder:text-white/30 font-mono h-12 text-lg"
              />
              <div className="text-[11px] font-mono tracking-widest text-white/40">
                3% marketplace fee · 24h relist lock applies after sale
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 min-h-[44px] px-5 rounded-lg border border-white/20 bg-black/40 font-mono text-sm tracking-[0.2em] font-bold text-white/70 hover:bg-white/5"
            >
              CANCEL
            </button>
            {isApproved && (
              <button
                onClick={submit}
                disabled={isPending || !ethToWei(price)}
                className="flex-1 min-h-[44px] px-5 rounded-lg border border-yellow-400/50 bg-yellow-400/10 font-mono text-sm tracking-[0.2em] font-bold text-yellow-300 hover:bg-yellow-400/20 disabled:opacity-40"
                style={{ textShadow: '0 0 10px rgba(255,221,0,0.5)' }}
              >
                {isPending ? 'LISTING…' : 'LIST'}
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ListCardModal;
