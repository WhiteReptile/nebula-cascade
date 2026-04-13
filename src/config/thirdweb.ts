/**
 * Thirdweb Configuration
 * 
 * ALL imports are lazy to avoid heavy Vite prebundling.
 * When client ID is not set, nothing loads.
 */
export const THIRDWEB_CLIENT_ID = import.meta.env.VITE_THIRDWEB_CLIENT_ID || "";
export const isThirdwebConfigured = !!THIRDWEB_CLIENT_ID;
export const BLOCKCHAIN_ENV = import.meta.env.VITE_BLOCKCHAIN_ENV || "testnet";

// Chain metadata for display (no imports needed)
export const chainInfo = {
  mainnet: {
    id: 8453,
    name: "Base",
    explorer: "https://basescan.org",
    symbol: "ETH",
  },
  testnet: {
    id: 84532,
    name: "Base Sepolia",
    explorer: "https://sepolia.basescan.org",
    symbol: "ETH",
  },
};

export const activeChainInfo =
  BLOCKCHAIN_ENV === "mainnet" ? chainInfo.mainnet : chainInfo.testnet;

/**
 * Lazy-load thirdweb client — only call when isThirdwebConfigured is true
 */
export async function getThirdwebClient() {
  const { createThirdwebClient } = await import("thirdweb");
  return createThirdwebClient({ clientId: THIRDWEB_CLIENT_ID });
}

/**
 * Lazy-load active chain — only call when isThirdwebConfigured is true
 */
export async function getActiveChain() {
  const chains = await import("thirdweb/chains");
  return BLOCKCHAIN_ENV === "mainnet" ? chains.base : chains.baseSepolia;
}
