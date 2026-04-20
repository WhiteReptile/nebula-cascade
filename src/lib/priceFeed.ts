/**
 * priceFeed.ts — ETH/USD price via CoinGecko free API.
 * Cached 60s in localStorage to respect free-tier rate limits (~10–30 req/min).
 */
import { useEffect, useState } from 'react';

const CACHE_KEY = 'nebula:eth-usd';
const TTL_MS = 60_000;
const ENDPOINT = 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd';

interface CacheEntry { price: number; ts: number; }

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (Date.now() - parsed.ts > TTL_MS) return null;
    return parsed;
  } catch { return null; }
}

function writeCache(price: number) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify({ price, ts: Date.now() })); } catch { /* ignore */ }
}

export async function fetchEthUsd(): Promise<number> {
  const cached = readCache();
  if (cached) return cached.price;
  const res = await fetch(ENDPOINT);
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const data = await res.json();
  const price = Number(data?.ethereum?.usd);
  if (!Number.isFinite(price)) throw new Error('Invalid price payload');
  writeCache(price);
  return price;
}

export function ethToUsd(ethAmount: number, ethUsd: number | null): number | null {
  if (ethUsd == null || !Number.isFinite(ethAmount)) return null;
  return ethAmount * ethUsd;
}

export function useEthUsdPrice() {
  const [ethUsd, setEthUsd] = useState<number | null>(() => readCache()?.price ?? null);
  const [loading, setLoading] = useState(ethUsd == null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchEthUsd()
      .then(p => { if (!cancelled) { setEthUsd(p); setError(null); } })
      .catch(e => { if (!cancelled) setError(String(e?.message ?? e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { ethUsd, loading, error };
}
