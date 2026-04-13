/**
 * ThirdwebWalletConnect — Real wallet connection component
 * 
 * ALL thirdweb imports are dynamic/lazy to avoid heavy Vite prebundling.
 * 
 * When Thirdweb is not configured (no client ID),
 * shows a "Setup Required" message — no heavy imports loaded.
 * 
 * When configured, dynamically loads ConnectButton + wallets.
 */
import React, { useState, useEffect } from "react";
import { isThirdwebConfigured, activeChainInfo, getThirdwebClient, getActiveChain } from "../../config/thirdweb";
import { useWallet } from "../../context/WalletContext";

const ThirdwebWalletConnect: React.FC = () => {
  const { address, isConnected, setWalletData, disconnect } = useWallet();

  // Not configured — show setup info (zero thirdweb imports)
  if (!isThirdwebConfigured) {
    return (
      <div className="rounded-xl border border-purple-500/30 bg-[#151a3f]/80 p-6 text-center">
        <div className="mb-3 text-lg font-bold text-purple-300">
          Wallet Connection
        </div>
        <p className="mb-4 text-sm text-gray-400">
          Blockchain wallet integration is ready but not yet configured.
        </p>
        <div className="rounded-lg bg-[#0a0e27]/80 p-4 text-left text-xs text-gray-500">
          <p className="mb-1 font-mono">To enable:</p>
          <p className="font-mono">1. Get a Thirdweb Client ID from thirdweb.com</p>
          <p className="font-mono">2. Add VITE_THIRDWEB_CLIENT_ID to frontend .env</p>
          <p className="font-mono">3. Restart the app</p>
        </div>
        <div className="mt-4 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3">
          <p className="text-xs text-cyan-400">
            Chain: {activeChainInfo.name} (ERC-721) &bull; Framework Mode
          </p>
        </div>
      </div>
    );
  }

  // Connected state
  if (isConnected && address) {
    return (
      <div className="rounded-xl border border-green-500/30 bg-[#151a3f]/80 p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-bold text-green-400">Connected</span>
          <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-300">
            {activeChainInfo.name}
          </span>
        </div>
        <div className="mb-4 rounded-lg bg-[#0a0e27]/80 p-3">
          <p className="truncate font-mono text-sm text-gray-300">{address}</p>
        </div>
        <button
          onClick={disconnect}
          className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/20"
        >
          Disconnect Wallet
        </button>
      </div>
    );
  }

  // Configured but not connected — load Thirdweb dynamically
  return <LazyConnectButton />;
};

/**
 * Dynamically loads Thirdweb ConnectButton — only when configured
 */
const LazyConnectButton: React.FC = () => {
  const { setWalletData } = useWallet();
  const [Widget, setWidget] = useState<React.ReactNode>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadThirdweb() {
      try {
        const [client, chain, reactMod, walletsMod] = await Promise.all([
          getThirdwebClient(),
          getActiveChain(),
          import("thirdweb/react"),
          import("thirdweb/wallets"),
        ]);

        if (cancelled) return;

        const { ConnectButton } = reactMod;

        // Configure wallets
        const inApp = walletsMod.inAppWallet({
          auth: {
            options: ["email", "google", "apple", "passkey"],
            mode: "popup",
          },
        });
        const metamask = walletsMod.createWallet("io.metamask");
        const coinbase = walletsMod.createWallet("com.coinbase.wallet");

        const wallets = [inApp, metamask, coinbase];

        setWidget(
          <ConnectButton
            client={client}
            wallets={wallets}
            chain={chain}
            theme="dark"
            appMetadata={{
              name: "Nebula Cascade",
              url: "https://nebulacascade.game",
              description: "Collect NFT cards and solve cosmic puzzles",
            }}
            connectModal={{
              size: "compact",
              title: "Connect Wallet",
            }}
            onConnect={(wallet: any) => {
              try {
                const account = wallet?.getAccount?.();
                if (account?.address) {
                  setWalletData({
                    address: account.address,
                    isConnected: true,
                    walletType: "thirdweb",
                    chainId: 8453,
                  });
                }
              } catch (e) {
                console.error("Wallet connect error:", e);
              }
            }}
          />
        );
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          console.error("Failed to load Thirdweb:", err);
          setError(err.message || "Failed to load wallet SDK");
          setLoading(false);
        }
      }
    }

    loadThirdweb();
    return () => { cancelled = true; };
  }, [setWalletData]);

  if (loading) {
    return (
      <div className="flex h-24 items-center justify-center rounded-xl border border-purple-500/20 bg-[#151a3f]/60">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          <span className="text-xs text-gray-500">Loading wallet...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-[#151a3f]/80 p-4 text-center">
        <p className="text-xs text-red-400">Wallet loading error: {error}</p>
        <p className="mt-1 text-[10px] text-gray-600">Check console for details</p>
      </div>
    );
  }

  return <div className="thirdweb-connect-wrapper">{Widget}</div>;
};

export default ThirdwebWalletConnect;
