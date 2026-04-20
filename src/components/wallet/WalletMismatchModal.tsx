/**
 * WalletMismatchModal — shown when a user connects a wallet that's already
 * linked to a different Nebula account. Single CTA: sign out + disconnect wallet.
 */
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useDisconnect, useActiveWallet } from 'thirdweb/react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflictingAddress?: string | null;
}

const WalletMismatchModal = ({ open, onOpenChange, conflictingAddress }: Props) => {
  const { disconnect } = useDisconnect();
  const wallet = useActiveWallet();

  const handleSignOut = async () => {
    if (wallet) {
      try { disconnect(wallet); } catch { /* ignore */ }
    }
    await supabase.auth.signOut();
    onOpenChange(false);
    // Force reload so all state resets cleanly
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-0 bg-black/95 backdrop-blur-md"
        style={{
          border: '1px solid rgba(255, 51, 68, 0.5)',
          boxShadow: '0 0 40px rgba(255, 51, 68, 0.4), 0 0 80px rgba(255, 51, 68, 0.2)',
        }}
      >
        <DialogHeader>
          <DialogTitle
            className="text-2xl tracking-[0.25em] uppercase font-mono font-bold"
            style={{ color: '#ff5566', textShadow: '0 0 12px #ff3344' }}
          >
            Wallet Already Linked
          </DialogTitle>
          <DialogDescription className="text-white/70 font-mono text-sm leading-relaxed pt-3">
            This wallet is bound to another Nebula account. To use it, sign out
            of the current account and sign back in — the wallet will reconnect
            automatically.
          </DialogDescription>
        </DialogHeader>

        {conflictingAddress && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 my-2">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1 font-mono">Wallet</div>
            <div className="text-xs text-white/80 font-mono truncate">{conflictingAddress}</div>
          </div>
        )}

        <DialogFooter className="gap-3 sm:gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] px-5 rounded-lg border border-white/20 bg-black/40 text-white/70 text-sm tracking-[0.2em] font-mono font-bold uppercase hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSignOut}
            className="min-h-[44px] px-5 rounded-lg border bg-black/40 text-sm tracking-[0.2em] font-mono font-bold uppercase transition-all hover:scale-[1.03]"
            style={{
              borderColor: 'rgba(255, 51, 68, 0.6)',
              color: '#ff8899',
              boxShadow: '0 0 20px rgba(255, 51, 68, 0.3)',
            }}
          >
            Sign Out
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WalletMismatchModal;
