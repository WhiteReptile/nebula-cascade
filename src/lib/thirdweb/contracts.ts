/**
 * Nebula NFT collection on Base.
 */
import { getContract } from 'thirdweb';
import { thirdwebClient } from './client';
import { nebulaChain } from './chains';

export const NEBULA_COLLECTION_ADDRESS = '0xa89C9d428321291fF9b3609D62861123690aa07e';

export const nebulaCollection = getContract({
  client: thirdwebClient,
  chain: nebulaChain,
  address: NEBULA_COLLECTION_ADDRESS,
});
