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

/**
 * Convert USD cents to Wei (for blockchain transactions)
 * @param usdCents - USD price in cents (e.g. 500 = $5.00)
 * @param ethUsd - current ETH price in USD (from price feed)
 * @returns price in Wei as a string (for BigNumber safety), or null if invalid
 */
export function usdCentsToWei(usdCents: number, ethUsd: number | null): string | null {
  if (ethUsd == null || !Number.isFinite(usdCents) || usdCents <= 0) return null;
  
  // Convert cents to USD (divide by 100)
  const usd = usdCents / 100;
  
  // Calculate ETH needed (USD / ETH price)
  const eth = usd / ethUsd;
  
  // Convert ETH to Wei (1 ETH = 10^18 Wei)
  // Use string arithmetic to avoid floating-point precision loss
  const weiPerEth = 1_000_000_000_000_000_000n; // 10^18
  const ethBigInt = BigInt(Math.round(eth * 1_000_000_000_000_000_000)); // multiply by 10^18 to get precision
  const wei = ethBigInt * BigInt(1); // already in Wei
  
  // Simpler approach: just multiply ETH * 10^18
  const preciseEth = (usd / ethUsd) * 1_000_000_000_000_000_000;
  return BigInt(Math.round(preciseEth)).toString();
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
