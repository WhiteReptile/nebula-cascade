/**
 * web3Config.ts — Chain + contract addresses (public values only)
 *
 * NEVER put private keys here. The Thirdweb client ID is public by design.
 */

export const WEB3 = {
  CHAIN_ID: 8453,                    // Base (ETH L2)
  CHAIN_NAME: 'Base',
  THIRDWEB_CLIENT_ID: '0ee0974906e5b6b9d18c8f635d4a3df0',
  NFT_COLLECTION: '0xa89C9d428321291fF9b3609D62861123690aa07e',
  // Custom on-chain marketplace: deploy contracts/NebulaMarketplace.sol via Remix,
  // then set VITE_MARKETPLACE_CONTRACT in .env (read at runtime).
  MARKETPLACE_ADDRESS: (import.meta.env.VITE_MARKETPLACE_CONTRACT ?? '').trim() || null,
} as const;
