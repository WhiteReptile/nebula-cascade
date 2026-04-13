import { useState } from 'react';
import { WALLET_LABELS, type WalletType } from '@/lib/walletSystem';
import { toast } from 'sonner';

const WALLET_ICONS: Record<WalletType, string> = {
  thirdweb: '🔗',
  guest: '👤',
};

interface WalletConnectProps {
  currentAddress?: string | null;
}

const WalletConnect = ({ currentAddress }: WalletConnectProps) => {
  const [connecting, setConnecting] = useState<WalletType | null>(null);

  const handleConnect = (type: WalletType) => {
    setConnecting(type);
    setTimeout(() => {
      toast.info(`${WALLET_LABELS[type]} — Coming soon! Wallet connection will be available when Web3 launches.`);
      setConnecting(null);
    }, 600);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/60 p-6 backdrop-blur-sm">
      <h2 className="text-sm uppercase tracking-widest text-white/40 font-mono mb-4">Connect Wallet</h2>

      {currentAddress && (
        <div className="mb-4 rounded-lg bg-white/5 border border-white/10 px-4 py-3">
          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Linked Wallet</div>
          <div className="text-xs text-white/80 font-mono truncate">{currentAddress}</div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {(Object.keys(WALLET_LABELS) as WalletType[]).map(type => (
          <button
            key={type}
            onClick={() => handleConnect(type)}
            disabled={connecting !== null}
            className="flex flex-col items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-4 hover:bg-white/10 hover:border-white/20 transition-all disabled:opacity-50"
          >
            <span className="text-2xl">{WALLET_ICONS[type]}</span>
            <span className="text-xs font-mono text-white/70">{WALLET_LABELS[type]}</span>
            {connecting === type && (
              <span className="text-[10px] text-white/40 animate-pulse">Connecting...</span>
            )}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/30 mt-4 text-center font-mono">
        Wallet connection is not yet live. Your game progress is saved to your account.
      </p>
    </div>
  );
};

export default WalletConnect;
