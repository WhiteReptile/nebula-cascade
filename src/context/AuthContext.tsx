import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@openformat/react';
import { BrowserProvider, getAddress } from 'ethers';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [web3Provider, setWeb3Provider] = useState<BrowserProvider | null>(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    try {
      setIsConnecting(true);
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      const address = getAddress(accounts[0]);
      setWalletAddress(address);
      setIsWalletConnected(true);
      setWeb3Provider(new BrowserProvider(ethereum));
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
    setIsWalletConnected(false);
    setWeb3Provider(null);
  };

  useEffect(() => {
    const ethereum = (window as any).ethereum;
    if (ethereum && isAuthenticated) {
      ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setWalletAddress(getAddress(accounts[0]));
          setIsWalletConnected(true);
          setWeb3Provider(new BrowserProvider(ethereum));
        }
      });

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletAddress(getAddress(accounts[0]));
          setIsWalletConnected(true);
          setWeb3Provider(new BrowserProvider(ethereum));
        }
      };

      ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [isAuthenticated]);

  return (
    <AuthContext.Provider value={{ walletAddress, isWalletConnected, isConnecting, connectWallet, disconnectWallet }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useGlobalAuth = () => useContext(AuthContext);
