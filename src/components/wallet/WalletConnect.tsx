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
      toast.info(`${WALLET_LABELS[type]} — Coming soon! Sui wallet connection will be available at launch.`);
      setConnecting(null);
    }, 600);
  };

  return (
    <div
      className="rounded-xl border border-cyan-500/15 bg-black/50 p-6 backdrop-blur-sm"
      style={{ boxShadow: '0 0 30px rgba(0, 200, 255, 0.03)' }}
    >
      <h2 className="text-sm uppercase tracking-widest text-cyan-300/50 font-mono mb-4">Connect Wallet</h2>

      {currentAddress && (
        <div className="mb-4 rounded-lg bg-white/3 border border-cyan-500/15 px-4 py-3">
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
            className="flex flex-col items-center gap-2 rounded-lg border border-cyan-500/15 bg-white/3 px-4 py-4 hover:bg-cyan-500/5 hover:border-cyan-500/25 transition-all disabled:opacity-50"
            style={{ boxShadow: '0 0 15px rgba(0, 200, 255, 0.02)' }}
          >
            <span className="text-2xl">{WALLET_ICONS[type]}</span>
            <span className="text-xs font-mono text-white/70">{WALLET_LABELS[type]}</span>
            {connecting === type && (
              <span className="text-[10px] text-cyan-400/60 animate-pulse">Connecting...</span>
            )}
          </button>
        ))}
      </div>

      <p className="text-[10px] text-white/20 mt-4 text-center font-mono">
        Sui wallet integration via Thirdweb is not yet live. Your progress is saved to your account.
      </p>
    </div>
  );
};

export default WalletConnect;
