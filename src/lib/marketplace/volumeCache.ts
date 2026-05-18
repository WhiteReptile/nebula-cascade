/**
 * volumeCache — localStorage cache for marketplace lifetime volume scans.
 * Keyed by chainId + contract address so swapping contracts can't reuse stale totals.
 * 24h TTL safety reset.
 */
const TTL_MS = 24 * 60 * 60 * 1000;

export interface VolumeCacheEntry {
  volumeWei: string; // bigint stringified
  lastBlock: number;
  ts: number;
}

function keyFor(chainId: number, contract: string): string {
  return `nebula:vol:${chainId}:${contract.toLowerCase()}`;
}

export function getVolumeCache(chainId: number, contract: string): VolumeCacheEntry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(keyFor(chainId, contract));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VolumeCacheEntry;
    if (!parsed || typeof parsed.volumeWei !== 'string') return null;
    if (Date.now() - parsed.ts > TTL_MS) return null;
    return parsed;
  } catch { return null; }
}

export function setVolumeCache(chainId: number, contract: string, entry: Omit<VolumeCacheEntry, 'ts'>) {
  if (typeof window === 'undefined') return;
  try {
    const payload: VolumeCacheEntry = { ...entry, ts: Date.now() };
    localStorage.setItem(keyFor(chainId, contract), JSON.stringify(payload));
  } catch { /* quota / disabled */ }
}

export function clearVolumeCache(chainId: number, contract: string) {
  if (typeof window === 'undefined') return;
  try { localStorage.removeItem(keyFor(chainId, contract)); } catch { /* noop */ }
}
