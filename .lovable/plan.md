

## Fix Marketplace: scroll, heading, Monsterous label, missing art, division parsing

### 1. Page scroll fix (`src/pages/Marketplace.tsx`)

Root cause: outer wrapper is `min-h-screen` while `<main>` uses `overflow-y-auto` inside a fixed-height flex column. At zoom levels where content overflows, neither the page nor `<main>` scrolls cleanly.

**Fix**: Drop the `overflow-y-auto` on `<main>` and remove the rigid `min-h-[calc(100vh-73px)]` wrapper. Let the page scroll naturally. The sidebar becomes `sticky top-[73px]` so it stays in view while the content area scrolls with the document.

Result: works at 100%, 120%, 150% zoom on every viewport.

### 2. Heading text rename (`src/pages/Marketplace.tsx` line 275)

`Card Marketplace` → `Nebula Cascade: Collection Cards`. Same neon-red styling.

### 3. Monsterous "Coming Soon" fix (`src/components/marketplace/NFTCard.tsx`)

The `COMING_SOON_NAMES` array currently has `'monstrous'` (no second `e`). Your contract NFT is named **"Monsterous"**. Substring match misses.

**Fix**: change array to `['monster', 'mortal escape']` — `'monster'` matches both `Monsterous` and any future `Monstrous`/`Monster` variant. Belt-and-suspenders.

### 4. Missing card art (`src/components/marketplace/NFTCard.tsx`)

Thirdweb v5's `getNFTs` returns `metadata.image` which can be:
- `ipfs://Qm…/N.png` (raw, needs gateway)
- already resolved `https://…ipfscdn.io/ipfs/…` (some paths)
- missing entirely (rare)

Current code only handles `ipfs://` prefix. Some images from your contract appear to come back already resolved by Thirdweb to a different gateway, OR the field name differs between ERC-1155 token URIs.

**Fix**:
- Keep `ipfs://` → `https://ipfs.thirdwebcdn.com/ipfs/…` rewrite
- Also accept `https://` URLs as-is (already resolved)
- Add fallback: if `nft.metadata.image` is empty, try `(nft as any).metadata?.image_original_url`
- One-line console log of the raw metadata image field on first render to confirm the value (removable after verification)

### 5. Division parsing fixes (`src/lib/thirdweb/divisionFromMetadata.ts`)

Two bugs surfaced in your console:
- **Trailing space**: `trait_type: "Division "` (trailing space) doesn't match `'division'`. Fix: `.trim()` before `.toLowerCase()` on line 55.
- **Numeric values**: `"God of Craziness"` has `value: "2"`. Add numeric map: `1→gem_i, 2→gem_ii, 3→gem_iii, 4→gem_iv, 5→gem_v`. Catches all your Insight-API tokens automatically.

After this, the warnings disappear and division badges render on every card with proper metadata.

### Files touched
- `src/pages/Marketplace.tsx` — scroll fix + heading rename
- `src/components/marketplace/NFTCard.tsx` — Monsterous match + image fallback
- `src/lib/thirdweb/divisionFromMetadata.ts` — trim + numeric values

### What you'll see after
- Marketplace scrolls cleanly at any zoom level — sidebar stays put, content scrolls
- Section title reads **"Nebula Cascade: Collection Cards"**
- **Monsterous** card shows amber `COMING SOON` pill + button (no more "FREE")
- All NFT artwork renders (King Cold, Advanced Dragon, Goofy Dragon, Umbreal Reaver, etc.)
- Division badges appear on cards with `Division` trait, including "God of Craziness" (Division II)
- Console warnings cleared

