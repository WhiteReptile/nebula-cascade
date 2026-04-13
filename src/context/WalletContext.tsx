/**
 * Wallet Context — manages wallet state across the app
 * 
 * Provides:
 * - Wallet connection status
 * - Connected address
 * - Chain info
 * - Link/unlink to player account
 * 
 * Works with Thirdweb when configured,
 * falls back to "not configured" state when keys missing.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  walletType: string | null;
  chainId: number;
  isVerified: boolean;
  isLoading: boolean;
}

interface WalletContextType extends WalletState {
  setWalletData: (data: Partial<WalletState>) => void;
  disconnect: () => void;
  linkToPlayer: (playerId: string) => Promise<boolean>;
}

const defaultState: WalletState = {
  address: null,
  isConnected: false,
  walletType: null,
  chainId: 8453,
  isVerified: false,
  isLoading: false,
};

const WalletContext = createContext<WalletContextType>({
  ...defaultState,
  setWalletData: () => {},
  disconnect: () => {},
  linkToPlayer: async () => false,
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<WalletState>(defaultState);

  const setWalletData = useCallback((data: Partial<WalletState>) => {
    setState((prev) => ({ ...prev, ...data }));
  }, []);

  const disconnect = useCallback(() => {
    setState(defaultState);
  }, []);

  const linkToPlayer = useCallback(
    async (playerId: string): Promise<boolean> => {
      if (!state.address) return false;

      try {
        const backendUrl = import.meta.env.REACT_APP_BACKEND_URL || "";
        const res = await fetch(`${backendUrl}/api/wallet/link`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            player_id: playerId,
            wallet_address: state.address,
            wallet_type: state.walletType || "thirdweb",
          }),
        });
        const data = await res.json();
        if (data.success) {
          setState((prev) => ({ ...prev, isVerified: data.verified }));
        }
        return data.success;
      } catch (err) {
        console.error("Failed to link wallet:", err);
        return false;
      }
    },
    [state.address, state.walletType]
  );

  return (
    <WalletContext.Provider
      value={{ ...state, setWalletData, disconnect, linkToPlayer }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
