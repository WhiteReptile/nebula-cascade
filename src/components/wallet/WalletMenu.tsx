/**
 * WalletMenu — dropdown for a connected wallet.
 * Copy address · View on BaseScan · Disconnect (with confirm dialog).
 * Pure frontend, reuses thirdweb v5 active wallet hooks.
 */
import { useState } from 'react';
import { useActiveAccount, useActiveWallet, useDisconnect } from 'thirdweb/react';
import { toast } from 'sonner';
import { ChevronDown, Copy, ExternalLink, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useResolvedName } from '@/hooks/useResolvedName';

function shorten(s: string) {
  return `${s.slice(0, 6)}…${s.slice(-4)}`;
}

export default function WalletMenu() {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { disconnect } = useDisconnect();
  const name = useResolvedName(account?.address);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!account) return null;
  const addr = account.address;
  const label = name ?? shorten(addr);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(addr);
      toast.success('Address copied');
    } catch {
      toast.error('Copy failed');
    }
  };

  const doDisconnect = () => {
    if (wallet) disconnect(wallet);
    toast.success('Wallet disconnected');
    setConfirmOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="inline-flex items-center gap-1.5 rounded-md border border-cyan-500/25 bg-black/50 px-2.5 py-1 font-mono text-[11px] tracking-widest text-cyan-200 hover:border-cyan-400/60 hover:text-cyan-100 transition-colors"
            title={addr}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(0,255,170,0.9)]" />
            <span>{label}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-black/95 border-cyan-500/25 font-mono text-xs">
          <DropdownMenuItem onClick={copy} className="cursor-pointer">
            <Copy className="mr-2 h-3.5 w-3.5" /> Copy address
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <a
              href={`https://basescan.org/address/${addr}`}
              target="_blank"
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" /> View on BaseScan
            </a>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-cyan-500/20" />
          <DropdownMenuItem
            onClick={() => setConfirmOpen(true)}
            className="cursor-pointer text-red-300 focus:text-red-200"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" /> Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-black/95 border-cyan-500/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="glow-yellow tracking-widest">Disconnect wallet?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60 font-mono text-xs">
              You will be signed out of {shorten(addr)} on this device. You can reconnect anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={doDisconnect}
              className="font-mono bg-red-500/80 hover:bg-red-500 text-white"
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
