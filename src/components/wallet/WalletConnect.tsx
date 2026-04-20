/**
 * WalletConnect — Thirdweb-powered connect panel.
 * Supports in-app (email/Google) + external wallets (MetaMask, Coinbase, Rainbow).
 * Locked to Base (chain 8453) with auto-switch via useWalletSync.
 */
import { ConnectButton } from 'thirdweb/react';
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { thirdwebClient } from '@/lib/thirdweb/client';
import { nebulaChain } from '@/lib/thirdweb/chains';

interface WalletConnectProps {
  currentAddress?: string | null;
}

const wallets = [
  inAppWallet({ auth: { options: ['email', 'google'] } }),
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
];

const WalletConnect = ({ currentAddress }: WalletConnectProps) => {
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

      <div className="flex justify-center">
        <ConnectButton
          client={thirdwebClient}
          chain={nebulaChain}
          chains={[nebulaChain]}
          wallets={wallets}
          theme="dark"
          connectButton={{
            label: 'Connect Wallet',
            style: {
              minWidth: '100%',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid rgba(255, 51, 68, 0.4)',
              color: '#ff8899',
              fontFamily: 'monospace',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              fontWeight: 700,
              boxShadow: '0 0 20px rgba(255, 51, 68, 0.25)',
            },
          }}
          connectModal={{
            size: 'compact',
            title: 'Enter Nebula',
            titleIcon: '',
            showThirdwebBranding: false,
          }}
          appMetadata={{
            name: 'Nebula Cascade',
            description: 'Cosmic skill-based card competition on Base.',
            url: typeof window !== 'undefined' ? window.location.origin : 'https://nebula.app',
          }}
        />
      </div>

      <p className="text-[10px] text-white/30 mt-4 text-center font-mono leading-relaxed">
        Locked to Base · Chain 8453 · Auto-switch on connect.
        <br />
        One wallet = one Nebula account.
      </p>
    </div>
  );
};

export default WalletConnect;
