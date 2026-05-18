/**
 * useResolvedName — best-effort ENS / Base name lookup for an address.
 * Uses thirdweb's resolveName against mainnet (ENS root). Falls back to short address.
 */
import { useEffect, useState } from 'react';
import { resolveName } from 'thirdweb/extensions/ens';
import { ethereum } from 'thirdweb/chains';
import { thirdwebClient } from '@/lib/thirdweb/client';

const cache = new Map<string, string | null>();

export function useResolvedName(address: string | null | undefined) {
  const [name, setName] = useState<string | null>(() =>
    address && cache.has(address.toLowerCase()) ? cache.get(address.toLowerCase())! : null,
  );

  useEffect(() => {
    let cancelled = false;
    if (!address) { setName(null); return; }
    const key = address.toLowerCase();
    if (cache.has(key)) { setName(cache.get(key)!); return; }
    (async () => {
      try {
        const n = await resolveName({ client: thirdwebClient, address, resolverChain: ethereum });
        if (!cancelled) { cache.set(key, n ?? null); setName(n ?? null); }
      } catch {
        if (!cancelled) { cache.set(key, null); setName(null); }
      }
    })();
    return () => { cancelled = true; };
  }, [address]);

  return name;
}
