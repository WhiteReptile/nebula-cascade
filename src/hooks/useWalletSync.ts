/**
 * useWalletSync — Syncs Thirdweb wallet state with the player's Supabase account.
 *
 * Behavior:
 *  - On wallet connect: pre-checks wallet uniqueness across players. If the address
 *    is already linked to ANOTHER account, force-disconnects and fires `onMismatch`
 *    so the page can show a modal. Otherwise persists the address to `players.wallet_address`.
 *  - On disconnect: session-only. The wallet stays linked in the DB so the user
 *    auto-reconnects next session. Use `unlinkWallet()` for explicit unbinding.
 *  - On wrong chain: auto-prompts a switch to Base (8453).
 */
import { useEffect, useRef } from 'react';
import {
  useActiveAccount,
  useActiveWalletChain,
  useSwitchActiveWalletChain,
  useDisconnect,
  useActiveWallet,
} from 'thirdweb/react';
import { supabase } from '@/integrations/supabase/client';
import { linkWallet } from '@/lib/walletSystem';
import { nebulaChain, NEBULA_CHAIN_ID } from '@/lib/thirdweb/chains';
import { toast } from 'sonner';

interface Options {
  /** Current authenticated Supabase user id (auth.users.id). Null if signed-out. */
  userId: string | null;
  /** Optional: called after a successful link so the page can refresh state. */
  onLinked?: (address: string) => void;
  /** Called when this wallet is already linked to a different account. */
  onMismatch?: (address: string) => void;
}

export function useWalletSync({ userId, onLinked, onMismatch }: Options) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const chain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();
  const { disconnect } = useDisconnect();
  const lastLinkedRef = useRef<string | null>(null);

  /* ── Auto-switch to Base if connected to wrong chain ── */
  useEffect(() => {
    if (!account || !chain) return;
    if (chain.id !== NEBULA_CHAIN_ID) {
      switchChain(nebulaChain).catch(err => {
        console.warn('[useWalletSync] switchChain failed:', err);
        toast.error('Please switch your wallet to Base (chain 8453).');
      });
    }
  }, [account, chain, switchChain]);

  /* ── Link wallet to Supabase account on connect ── */
  useEffect(() => {
    if (!account || !userId) return;
    const address = account.address;
    if (lastLinkedRef.current === address) return;

    let cancelled = false;
    (async () => {
      const { data: existing } = await supabase
        .from('players')
        .select('user_id')
        .ilike('wallet_address', address)
        .maybeSingle();

      if (cancelled) return;

      if (existing && existing.user_id !== userId) {
        if (wallet) {
          try { disconnect(wallet); } catch { /* ignore */ }
        }
        onMismatch?.(address);
        return;
      }

      const ok = await linkWallet(userId, address, 'thirdweb');
      if (cancelled) return;
      if (ok) {
        lastLinkedRef.current = address;
        toast.success('Wallet linked ✓', { description: address.slice(0, 6) + '…' + address.slice(-4) });
        onLinked?.(address);
      } else {
        toast.error('Failed to link wallet — please try again.');
      }
    })();

    return () => { cancelled = true; };
  }, [account, userId, wallet, disconnect, onLinked, onMismatch]);

  /* ── Reset link guard on disconnect (session-only; DB record stays) ── */
  useEffect(() => {
    if (!account) lastLinkedRef.current = null;
  }, [account]);

  return { address: account?.address ?? null, chainId: chain?.id ?? null };
}
