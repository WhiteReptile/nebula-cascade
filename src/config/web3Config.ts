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
  // Marketplace V3 NOT used — primary sales via collection claim phases,
  // secondary trades currently off-chain (Supabase marketplace_listings).
} as const;
