import type { ExternalProvider } from 'ethers';

declare global {
  interface Window {
    ethereum?: ExternalProvider & {
      on?: (...args: any[]) => void;
      removeListener?: (...args: any[]) => void;
    };
  }
}

export {};
