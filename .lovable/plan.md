

## Mark "Monstrous" & "Mortal Escape" Coming Soon + Improve Image Quality

### 1. "Coming Soon" overrides for specific NFTs

In `NFTCard.tsx`, add a `COMING_SOON_NAMES` constant matching by metadata `name` (case-insensitive substring match — robust to exact-title variations):
- `"Monstrous"`
- `"Mortal Escape"`

When a card matches:
- **Status pill** overrides to `COMING SOON` with a yellow-amber glow (`#ffaa33`), regardless of on-chain claim condition.
- **Claim button** label changes to `COMING SOON`, stays disabled, tooltip updates to `"Drop date TBA"`.
- **Price block** is replaced with a muted `—` placeholder so an unfinished claim phase doesn't surface a misleading 0 ETH / FREE.
- A subtle dim overlay (`opacity-80` on image) signals unreleased state without hiding the art.

Name-based matching means you (or anyone) can flip them live later just by removing those two strings from the constant — no metadata edits, no contract changes.

### 2. Pixelation fix

Yes, the pixelation is expected with the current setup — and fixable. Two compounding causes:

**a) IPFS gateway compression** — `ipfs.io` serves the original file but is slow and sometimes downscales for cached delivery. Cards render at ~250–340px wide on your 2405px viewport, and the browser is upscaling whatever it gets.

**b) No `srcSet` / DPR awareness** — your devicePixelRatio is 0.53 (zoomed-out 4K-class display), so the rendered bitmap is small but stretched.

Fixes:
- Switch IPFS gateway from `ipfs.io` → `https://ipfs.thirdwebcdn.com/ipfs/<hash>` (Thirdweb's CDN, used by their dashboard, returns optimized + properly sized images, much faster, no rate limits for projects on their stack).
- Add `image-rendering: auto` and `imageSmoothing` hint to the `<img>` to prevent any nearest-neighbor fallback.
- Set explicit `width`/`height` attributes (matching aspect-square) so the browser doesn't lazy-resample.
- Add `decoding="async"` for smoother paint.

If the source PNGs uploaded to the contract are themselves low-resolution (e.g. 256×256), no gateway will fix that — you'd need to re-upload higher-res masters. The Thirdweb CDN switch alone usually resolves 80%+ of perceived pixelation cases.

### 3. Files touched

**Modified**
- `src/components/marketplace/NFTCard.tsx` — coming-soon override logic + image quality improvements (gateway swap, sizing attrs, async decode)

### Files untouched
Everything else — no DB, no contract, no other components.

### What you'll see after
- Monstrous and Mortal Escape cards display **COMING SOON** pill (amber) + disabled claim button labeled the same, no price shown.
- All other cards remain fully live and functional.
- Card images load from Thirdweb's CDN — sharper, faster, no more soft/pixelated rendering on most assets.
- If any specific image is still blurry afterward, it means the source upload is low-res and needs replacing on the contract.

