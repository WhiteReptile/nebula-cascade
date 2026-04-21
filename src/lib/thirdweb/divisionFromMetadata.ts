/**
 * divisionFromMetadata.ts — Extracts a Division from an NFT's metadata `attributes`.
 *
 * Accepts: "I"…"V", "Division I"…"Division V", "gem_i"…"gem_v", or numeric "1"…"5".
 * Trait type matching is trim+lowercase tolerant ("Division " with trailing space works).
 * Returns null + console.warn when missing/unrecognized so the card renders without a badge.
 */
import type { NFT } from 'thirdweb';
import type { Division } from '@/lib/divisionSystem';

const ROMAN_TO_DIVISION: Record<string, Division> = {
  I: 'gem_i',
  II: 'gem_ii',
  III: 'gem_iii',
  IV: 'gem_iv',
  V: 'gem_v',
};

const NUMERIC_TO_DIVISION: Record<string, Division> = {
  '1': 'gem_i',
  '2': 'gem_ii',
  '3': 'gem_iii',
  '4': 'gem_iv',
  '5': 'gem_v',
};

const VALID: Division[] = ['gem_i', 'gem_ii', 'gem_iii', 'gem_iv', 'gem_v'];

function normalize(raw: unknown): Division | null {
  if (raw === null || raw === undefined) return null;
  const asString = typeof raw === 'number' ? String(raw) : typeof raw === 'string' ? raw : null;
  if (asString === null) return null;
  const v = asString.trim().toLowerCase();

  if ((VALID as string[]).includes(v)) return v as Division;
  if (NUMERIC_TO_DIVISION[v]) return NUMERIC_TO_DIVISION[v];

  // "division i" → "i"
  const stripped = v.replace(/^division\s+/i, '').toUpperCase();
  if (ROMAN_TO_DIVISION[stripped]) return ROMAN_TO_DIVISION[stripped];

  // bare "I" / "II" etc.
  const upper = asString.trim().toUpperCase();
  if (ROMAN_TO_DIVISION[upper]) return ROMAN_TO_DIVISION[upper];

  return null;
}

export function extractDivisionFromNFT(nft: NFT): Division | null {
  const attrs = nft?.metadata?.attributes;
  if (!attrs) {
    console.warn('[divisionFromMetadata] NFT missing attributes:', nft?.metadata?.name ?? nft?.id);
    return null;
  }

  const list = Array.isArray(attrs) ? attrs : Object.values(attrs);

  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue;
    const e = entry as Record<string, unknown>;
    const traitType = String(e.trait_type ?? e.traitType ?? '').trim().toLowerCase();
    if (traitType === 'division') {
      const div = normalize(e.value);
      if (div) return div;
      console.warn('[divisionFromMetadata] Unrecognized division value:', e.value, 'on', nft?.metadata?.name);
      return null;
    }
  }

  console.warn('[divisionFromMetadata] No "Division" trait on:', nft?.metadata?.name ?? nft?.id);
  return null;
}
