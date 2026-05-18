/**
 * useNftMetadata — Cached fetch of a single NFT's metadata from the Nebula collection.
 * Uses Thirdweb v5 useReadContract via the erc1155 `getNFT` extension.
 */
import { useReadContract } from 'thirdweb/react';
import { getNFT } from 'thirdweb/extensions/erc1155';
import { nebulaCollection } from '@/lib/thirdweb/contracts';

export function useNftMetadata(tokenId: bigint | null) {
  const enabled = tokenId !== null;
  const { data, isLoading } = useReadContract(getNFT, {
    contract: nebulaCollection,
    tokenId: enabled ? tokenId! : 0n,
    queryOptions: { enabled, staleTime: 60_000 },
  });
  return { nft: data ?? null, loading: isLoading };
}

export function resolveIpfsImage(raw: string | undefined | null): string | null {
  if (!raw) return null;
  if (raw.startsWith('ipfs://')) {
    return `https://0ee0974906e5b6b9d18c8f635d4a3df0.ipfscdn.io/ipfs/${raw.slice(7)}`;
  }
  return raw;
}
