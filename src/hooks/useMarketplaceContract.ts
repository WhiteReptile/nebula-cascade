/**
 * useMarketplaceContract — Thirdweb v5 hooks for the NebulaMarketplace contract.
 *
 * Exports:
 *   useActiveListings()    → active listings, refetched every 15s + after writes
 *   useListCard()          → list(nftAddr, tokenId, priceEth)
 *   useBuyCard()           → buy(listingId, priceWei)
 *   useCancelListing()     → cancel(listingId)
 *   useApprovalStatus()    → isApprovedForAll + approve() for the collection
 *   useIsLocked()          → 24h cooldown check
 *
 * All writes show toasts. React Query cache is invalidated after each tx.
 */
import { useCallback, useEffect, useState } from 'react';
import { prepareContractCall, readContract, eth_getBalance, getRpcClient, getContractEvents, prepareEvent } from 'thirdweb';
import { useActiveAccount, useSendTransaction, useReadContract } from 'thirdweb/react';
import { thirdwebClient } from '@/lib/thirdweb/client';
import { nebulaChain, NEBULA_CHAIN_ID } from '@/lib/thirdweb/chains';
import { toast } from 'sonner';
import {
  marketplaceContract,
  MARKETPLACE_CONFIGURED,
  MARKETPLACE_ADDRESS,
  nebulaCollectionForApproval,
  NEBULA_COLLECTION_ADDRESS,
} from '@/lib/marketplace/contract';
import { trackTx } from '@/lib/tx/txToast';
import { getVolumeCache, setVolumeCache } from '@/lib/marketplace/volumeCache';

const REFRESH_MS = 15_000;
const PAGE = 100n;

export interface OnChainListing {
  id: bigint;
  seller: string;
  nftAddress: string;
  tokenId: bigint;
  priceWei: bigint;
  createdAt: bigint;
  active: boolean;
}

/** Walks getActiveListings(cursor, limit) until exhausted. Safe for low listing counts. */
async function fetchAllActive(): Promise<OnChainListing[]> {
  if (!marketplaceContract) return [];
  const out: OnChainListing[] = [];
  let cursor = 0n;
  // Hard guard: never loop more than 20 pages
  for (let i = 0; i < 20; i++) {
    const res = (await readContract({
      contract: marketplaceContract,
      method: 'getActiveListings',
      params: [cursor, PAGE],
    })) as unknown as [OnChainListing[], bigint];
    const [page, nextCursor] = res;
    out.push(...page);
    if (nextCursor === cursor || page.length === 0) break;
    cursor = nextCursor;
    // Also stop when we've reached the end (next == prev end)
    const next = (await readContract({
      contract: marketplaceContract,
      method: 'nextListingId',
      params: [],
    })) as bigint;
    if (cursor >= next) break;
  }
  return out;
}

/** Active listings owned by the connected wallet (filtered client-side). */
export function useUserActiveListings() {
  const account = useActiveAccount();
  const { listings, loading, error, refresh } = useActiveListings();
  const mine = account
    ? listings.filter((l) => l.seller.toLowerCase() === account.address.toLowerCase())
    : [];
  return { listings: mine, loading, error, refresh };
}

export function useActiveListings() {
  const [listings, setListings] = useState<OnChainListing[]>([]);
  const [loading, setLoading] = useState(MARKETPLACE_CONFIGURED);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!MARKETPLACE_CONFIGURED) return;
    try {
      const data = await fetchAllActive();
      setListings(data);
      setError(null);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!MARKETPLACE_CONFIGURED) return;
    const id = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return { listings, loading, error, refresh };
}

/** Tx wrapper: pending → BaseScan-linked toast → success/error, then refresh. */
function useTx(label: import('@/lib/tx/txToast').TxKind, onSuccess?: () => void) {
  const { mutateAsync, isPending } = useSendTransaction();
  const send = useCallback(
    async (tx: any) => {
      try {
        const result = await mutateAsync(tx);
        // Don't await — let the toast update in the background while UI proceeds.
        trackTx(label, result.transactionHash).then((receipt) => {
          if (receipt?.status === 'success') onSuccess?.();
        });
        return result;
      } catch (e: any) {
        const msg = String(e?.shortMessage ?? e?.message ?? e);
        if (/reject|denied/i.test(msg)) {
          // User cancelled — silent.
        } else {
          toast.error(`${label} failed`, { description: msg.slice(0, 140) });
        }
        throw e;
      }
    },
    [mutateAsync, label, onSuccess],
  );
  return { send, isPending };
}

export function useListCard(onSuccess?: () => void) {
  const { send, isPending } = useTx('List card', onSuccess);
  const list = useCallback(
    async (nftAddress: string, tokenId: bigint, priceWei: bigint) => {
      if (!marketplaceContract) throw new Error('Marketplace not configured');
      const tx = prepareContractCall({
        contract: marketplaceContract,
        method: 'listCard',
        params: [nftAddress, tokenId, priceWei],
      });
      return send(tx);
    },
    [send],
  );
  return { list, isPending };
}

export function useBuyCard(onSuccess?: () => void) {
  const { send, isPending } = useTx('Purchase', onSuccess);
  const buy = useCallback(
    async (listingId: bigint, priceWei: bigint) => {
      if (!marketplaceContract) throw new Error('Marketplace not configured');
      const tx = prepareContractCall({
        contract: marketplaceContract,
        method: 'buyCard',
        params: [listingId],
        value: priceWei,
      });
      return send(tx);
    },
    [send],
  );
  return { buy, isPending };
}

export function useCancelListing(onSuccess?: () => void) {
  const { send, isPending } = useTx('Cancel', onSuccess);
  const cancel = useCallback(
    async (listingId: bigint) => {
      if (!marketplaceContract) throw new Error('Marketplace not configured');
      const tx = prepareContractCall({
        contract: marketplaceContract,
        method: 'cancelListing',
        params: [listingId],
      });
      return send(tx);
    },
    [send],
  );
  return { cancel, isPending };
}

/** Returns approval status of the marketplace for the user's NFT collection + an approve() helper. */
export function useApprovalStatus() {
  const account = useActiveAccount();
  const enabled = !!(account && MARKETPLACE_CONFIGURED && MARKETPLACE_ADDRESS);
  const { data: isApproved, refetch } = useReadContract({
    contract: nebulaCollectionForApproval,
    method: 'isApprovedForAll',
    params: enabled ? [account!.address, MARKETPLACE_ADDRESS!] : ['0x0000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000'],
    queryOptions: { enabled, refetchInterval: 30_000 },
  });
  const { send, isPending } = useTx('Approve marketplace', () => { refetch(); });
  const approve = useCallback(async () => {
    if (!MARKETPLACE_ADDRESS) throw new Error('Marketplace not configured');
    const tx = prepareContractCall({
      contract: nebulaCollectionForApproval,
      method: 'setApprovalForAll',
      params: [MARKETPLACE_ADDRESS, true],
    });
    return send(tx);
  }, [send]);
  return { isApproved: Boolean(isApproved), approve, approving: isPending };
}

/** True if the (collection, tokenId) is within the 24h sale lock. */
export function useIsLocked(tokenId: bigint | null) {
  const enabled = !!(marketplaceContract && tokenId !== null);
  const { data } = useReadContract({
    contract: marketplaceContract ?? nebulaCollectionForApproval, // fallback so hook stays mounted
    method: 'isLocked',
    params: enabled
      ? [NEBULA_COLLECTION_ADDRESS, tokenId!]
      : ['0x0000000000000000000000000000000000000000', 0n],
    queryOptions: { enabled, refetchInterval: 30_000 },
  });
  return Boolean(data);
}

// ─────────────────────────────────────────────────────────────
// Owner / admin hooks
// ─────────────────────────────────────────────────────────────

/** Returns marketplace owner address and whether the connected wallet is the owner. */
export function useMarketplaceOwner() {
  const account = useActiveAccount();
  const enabled = !!marketplaceContract;
  const { data: owner } = useReadContract({
    contract: marketplaceContract ?? nebulaCollectionForApproval,
    method: 'owner',
    params: [],
    queryOptions: { enabled, refetchInterval: 60_000 },
  });
  const ownerAddr = (owner as string | undefined) ?? null;
  const isOwner = !!(ownerAddr && account && ownerAddr.toLowerCase() === account.address.toLowerCase());
  return { owner: ownerAddr, isOwner };
}

/** Treasury address, fee bps, and live contract ETH balance. */
export function useTreasuryStats() {
  const enabled = !!marketplaceContract;
  const { data: treasury, refetch: refetchT } = useReadContract({
    contract: marketplaceContract ?? nebulaCollectionForApproval,
    method: 'treasury',
    params: [],
    queryOptions: { enabled, refetchInterval: 30_000 },
  });
  const { data: feeBps, refetch: refetchF } = useReadContract({
    contract: marketplaceContract ?? nebulaCollectionForApproval,
    method: 'feeBps',
    params: [],
    queryOptions: { enabled, refetchInterval: 30_000 },
  });

  const [contractBalanceWei, setContractBalanceWei] = useState<bigint>(0n);
  const [balanceLoading, setBalanceLoading] = useState<boolean>(MARKETPLACE_CONFIGURED);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const refreshBalance = useCallback(async () => {
    if (!MARKETPLACE_ADDRESS) return;
    setBalanceLoading(true);
    try {
      const rpc = getRpcClient({ client: thirdwebClient, chain: nebulaChain });
      const bal = await eth_getBalance(rpc, { address: MARKETPLACE_ADDRESS });
      setContractBalanceWei(bal);
      setBalanceError(null);
    } catch (e: any) {
      setBalanceError(String(e?.shortMessage ?? e?.message ?? e));
    } finally {
      setBalanceLoading(false);
    }
  }, []);
  useEffect(() => {
    refreshBalance();
    const id = setInterval(refreshBalance, 30_000);
    return () => clearInterval(id);
  }, [refreshBalance]);

  const refresh = useCallback(() => {
    refetchT(); refetchF(); refreshBalance();
  }, [refetchT, refetchF, refreshBalance]);

  return {
    treasury: (treasury as string | undefined) ?? null,
    feeBps: feeBps != null ? Number(feeBps as bigint) : null,
    contractBalanceWei,
    loading: balanceLoading || treasury == null || feeBps == null,
    error: balanceError,
    refresh,
  };
}

export function useSetTreasury(onSuccess?: () => void) {
  const { send, isPending } = useTx('Update treasury', onSuccess);
  const setTreasury = useCallback(
    async (addr: string) => {
      if (!marketplaceContract) throw new Error('Marketplace not configured');
      const tx = prepareContractCall({
        contract: marketplaceContract,
        method: 'setTreasury',
        params: [addr],
      });
      return send(tx);
    },
    [send],
  );
  return { setTreasury, isPending };
}

export function useSetFeeBps(onSuccess?: () => void) {
  const { send, isPending } = useTx('Update fee', onSuccess);
  const setFeeBps = useCallback(
    async (bps: number) => {
      if (!marketplaceContract) throw new Error('Marketplace not configured');
      const tx = prepareContractCall({
        contract: marketplaceContract,
        method: 'setFeeBps',
        params: [BigInt(bps)],
      });
      return send(tx);
    },
    [send],
  );
  return { setFeeBps, isPending };
}

/** Reads lockedUntil(collection, tokenId) and exposes a per-second countdown. */
export function useLockExpiry(tokenId: bigint | null) {
  const enabled = !!(marketplaceContract && tokenId !== null);
  const { data } = useReadContract({
    contract: marketplaceContract ?? nebulaCollectionForApproval,
    method: 'lockedUntil',
    params: enabled
      ? [NEBULA_COLLECTION_ADDRESS, tokenId!]
      : ['0x0000000000000000000000000000000000000000', 0n],
    queryOptions: { enabled, refetchInterval: 60_000 },
  });
  const lockedUntil = (data as bigint | undefined) ?? 0n;

  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const expiry = Number(lockedUntil);
  const secondsLeft = Math.max(0, expiry - now);
  const isLocked = secondsLeft > 0;
  return { lockedUntil, isLocked, secondsLeft };
}

/**
 * useLocksMap — batch-reads lockedUntil for many tokenIds.
 * Returns Record<tokenIdString, secondsLeft>. Polls every 30s.
 * Used by parent components to sort lists by lock state without lifting per-row hooks.
 */
export function useLocksMap(tokenIds: (bigint | null)[]) {
  const [map, setMap] = useState<Record<string, number>>({});

  // Stable join so effect doesn't re-run on identical input
  const key = tokenIds.map((t) => (t === null ? '∅' : t.toString())).join(',');

  useEffect(() => {
    if (!marketplaceContract) return;
    let cancelled = false;
    const fetchAll = async () => {
      const entries = await Promise.all(
        tokenIds.map(async (t) => {
          if (t === null) return ['∅', 0] as const;
          try {
            const v = (await readContract({
              contract: marketplaceContract!,
              method: 'lockedUntil',
              params: [NEBULA_COLLECTION_ADDRESS, t],
            })) as bigint;
            const now = Math.floor(Date.now() / 1000);
            return [t.toString(), Math.max(0, Number(v) - now)] as const;
          } catch {
            return [t.toString(), 0] as const;
          }
        }),
      );
      if (cancelled) return;
      const next: Record<string, number> = {};
      for (const [k, v] of entries) next[k] = v;
      setMap(next);
    };
    fetchAll();
    const id = setInterval(fetchAll, 30_000);
    return () => { cancelled = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Tick countdown locally each second between fetches
  useEffect(() => {
    const id = setInterval(() => {
      setMap((m) => {
        const out: Record<string, number> = {};
        for (const k of Object.keys(m)) out[k] = Math.max(0, m[k] - 1);
        return out;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return map;
}

/**
 * Lifetime volume (sum of CardSold.priceWei). Reads localStorage cache first for
 * instant paint, then scans the chain. Surfaces an error string instead of throwing.
 */
export function useLifetimeVolume() {
  const cached =
    MARKETPLACE_ADDRESS ? getVolumeCache(NEBULA_CHAIN_ID, MARKETPLACE_ADDRESS) : null;
  const [volumeWei, setVolumeWei] = useState<bigint>(() => {
    try { return cached ? BigInt(cached.volumeWei) : 0n; } catch { return 0n; }
  });
  const [loading, setLoading] = useState<boolean>(!cached);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!marketplaceContract || !MARKETPLACE_ADDRESS) return;
    setLoading(true);
    try {
      const ev = prepareEvent({
        signature: 'event CardSold(uint256 indexed listingId, address indexed seller, address indexed buyer, address nftAddress, uint256 tokenId, uint256 priceWei, uint256 feePaid)',
      });
      const events = await getContractEvents({
        contract: marketplaceContract,
        events: [ev],
      });
      let total = 0n;
      let maxBlock = 0;
      for (const e of events as any[]) {
        const p = e?.args?.priceWei;
        if (typeof p === 'bigint') total += p;
        const bn = Number(e?.blockNumber ?? 0);
        if (bn > maxBlock) maxBlock = bn;
      }
      setVolumeWei(total);
      setError(null);
      setVolumeCache(NEBULA_CHAIN_ID, MARKETPLACE_ADDRESS, {
        volumeWei: total.toString(),
        lastBlock: maxBlock,
      });
    } catch (e: any) {
      setError(String(e?.shortMessage ?? e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  return { volumeWei, loading, error, refresh };
}
