import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ethers } from 'ethers';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface GlobalAuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  walletAddress: string | null;
  isWalletConnected: boolean;
  isConnecting: boolean;
  web3Provider: ethers.providers.Web3Provider | null;
  connectWallet: () => Promise<string>;
  disconnectWallet: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<GlobalAuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [web3Provider, setWeb3Provider] = useState<ethers.providers.Web3Provider | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setWeb3Provider(null);
    setIsConnecting(false);
  };

  const connectWallet = async () => {
    const ethereum = window.ethereum;
    if (!ethereum) {
      throw new Error('No Web3 wallet detected in the browser.');
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      if (!accounts || accounts.length === 0) {
        throw new Error('No wallet accounts were returned.');
      }

      const address = ethers.utils.getAddress(accounts[0]);
      setWalletAddress(address);
      setIsWalletConnected(true);
      setWeb3Provider(provider);
      return address;
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    const ethereum = window.ethereum;
    if (!ethereum) return;

    const setInitialWallet = async () => {
      try {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setWalletAddress(ethers.utils.getAddress(accounts[0]));
          setIsWalletConnected(true);
          setWeb3Provider(provider);
        }
      } catch {
        disconnectWallet();
      }
    };

    setInitialWallet();

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
        return;
      }
      const address = ethers.utils.getAddress(accounts[0]);
      setWalletAddress(address);
      setIsWalletConnected(true);
      setWeb3Provider(new ethers.providers.Web3Provider(ethereum));
    };

    const handleChainChanged = (chainId: string) => {
      const baseChainId = '0x2105';
      if (chainId !== baseChainId) {
        window.location.reload();
      } else {
        window.location.reload();
      }
    };

    const handleDisconnect = () => {
      disconnectWallet();
    };

    ethereum.on?.('accountsChanged', handleAccountsChanged);
    ethereum.on?.('chainChanged', handleChainChanged);
    ethereum.on?.('disconnect', handleDisconnect);

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      ethereum.removeListener?.('chainChanged', handleChainChanged);
      ethereum.removeListener?.('disconnect', handleDisconnect);
    };
  }, []);

  const signOut = async () => {
    disconnectWallet();
    await supabase.auth.signOut();
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isAdmin,
      isLoading,
      walletAddress,
      isWalletConnected,
      isConnecting,
      web3Provider,
      connectWallet,
      disconnectWallet,
      signOut,
    }),
    [user, isAuthenticated, isAdmin, isLoading, walletAddress, isWalletConnected, isConnecting, web3Provider]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useGlobalAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useGlobalAuth must be used within an AuthProvider');
  }
  return context;
}
