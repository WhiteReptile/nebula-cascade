/**
 * NetworkPill — wallet network status indicator.
 * Green when connected to Base, amber/red with switch action when not.
 */
import { useActiveWalletChain, useSwitchActiveWalletChain, useActiveAccount } from 'thirdweb/react';
import { nebulaChain, NEBULA_CHAIN_ID } from '@/lib/thirdweb/chains';

export default function NetworkPill() {
  const account = useActiveAccount();
  const chain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();

  if (!account) return null;

  const onBase = chain?.id === NEBULA_CHAIN_ID;

  if (onBase) {
    return (
      <span
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/5 font-mono text-[10px] tracking-[0.25em] uppercase font-bold text-emerald-300"
        style={{ textShadow: '0 0 8px rgba(0,255,170,0.55)', boxShadow: '0 0 14px rgba(0,255,170,0.18)' }}
        aria-label="Connected to Base network"
      >
        <span
          className="w-1.5 h-1.5 rounded-full bg-emerald-400"
          style={{ boxShadow: '0 0 8px rgba(0,255,170,0.9)' }}
          aria-hidden
        />
        Base · 8453
      </span>
    );
  }

  return (
    <button
      onClick={() => switchChain(nebulaChain).catch(() => {})}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-red-400/50 bg-red-400/5 font-mono text-[10px] tracking-[0.25em] uppercase font-bold text-red-300 hover:bg-red-400/15 transition-all"
      style={{ textShadow: '0 0 8px rgba(255,60,80,0.7)', boxShadow: '0 0 14px rgba(255,60,80,0.2)' }}
      aria-label="Wrong network — switch to Base"
    >
      <span
        className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"
        style={{ boxShadow: '0 0 8px rgba(255,60,80,0.9)' }}
        aria-hidden
      />
      Wrong Network · Switch
    </button>
  );
}
