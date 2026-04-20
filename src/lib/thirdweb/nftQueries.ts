/**
 * nftQueries.ts — Live NFT data hooks for the Nebula collection on Base.
 *
 * Built on Thirdweb v5 `useReadContract` (auto React-Query backed: dedupe, cache, retry).
 * Reads are paginated to keep RPC pressure low (≤ 13 calls per page of 12).
 */
import { useReadContract } from 'thirdweb/react';
import { getNFTs } from 'thirdweb/extensions/erc1155';
import { getActiveClaimCondition } from 'thirdweb/extensions/erc1155';
import { nebulaCollection } from './contracts';

export const NFT_PAGE_SIZE = 12;

/**
 * Fetch a page of NFTs from the collection.
 * Page is 1-indexed in UI; converted to start offset internally.
 */
export function useCollectionNFTs(page: number, pageSize: number = NFT_PAGE_SIZE) {
  const start = Math.max(0, (page - 1) * pageSize);
  return useReadContract(getNFTs, {
    contract: nebulaCollection,
    start,
    count: pageSize,
    queryOptions: { retry: 1 },
  });
}

/**
 * Fetch the active claim condition for a single token.
 * Returns price (wei), currency, supply caps, start timestamp.
 */
export function useTokenClaimCondition(tokenId: bigint) {
  return useReadContract(getActiveClaimCondition, {
    contract: nebulaCollection,
    tokenId,
    queryOptions: { retry: 1 },
  });
}
