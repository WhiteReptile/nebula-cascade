

## Marketplace overhaul: MainMenu-style galaxy + fix scroll + fix images

Three problems, one cohesive fix. The marketplace will look and feel like a natural continuation of the start menu — same animated galaxy canvas, same neon-red typography, same minimalist vibe — while keeping all the NFT logic you've already built.

---

### 1. Galaxy canvas background (continuity with MainMenu)

Extract the MainMenu's animated canvas (200 stars + 3 drifting nebulas + radial vignette + scanlines) into a reusable component `<GalaxyBackground />` and mount it as a **fixed full-screen layer behind the marketplace**. Same colors, same drift speeds, same vignette mask. Replaces the current static `.market-galaxy` CSS gradient + 80 pulsing dots (which don't match the menu's quality).

The marketplace content sits on top in a transparent layer — no solid black panels, just glassmorphism (`bg-black/40 backdrop-blur-xl`) so the galaxy shows through everything. Same fade-in transition as the menu when arriving on the page.

### 2. Scroll fix (real root cause)

Two bugs compounding:
- The sidebar is `sticky top-0 self-start max-h-screen` but the parent flex row has no `min-h-screen`, so on tall content the sidebar collapses and the page doesn't establish a scroll context properly at certain viewport ratios.
- The outer wrapper uses `min-h-screen` + `overflow-x-hidden` but the body itself sometimes inherits `overflow: hidden` from the global game styles intended for the gameplay page.

Fix:
- Outer wrapper becomes a normal scrollable document: `min-h-screen` + no overflow lock.
- Sidebar uses `sticky top-[73px]` (below header height) + `h-[calc(100vh-73px)]` so it stays fixed while content scrolls naturally.
- Add a body-level guard `<style>` that explicitly sets `overflow-y: auto` on `html, body` while the marketplace is mounted, overriding any leftover `overflow: hidden` from `Index.tsx`'s fixed-screen game shell.

### 3. Card images — use the working gateway

Network logs prove the metadata JSON loads fine from `https://0ee0974906e5b6b9d18c8f635d4a3df0.ipfscdn.io/ipfs/...` (your project's dedicated Thirdweb CDN). But `NFTCard.tsx` rewrites the image URL to `https://ipfs.thirdwebcdn.com/ipfs/...` (a different, generic gateway) — that's why images don't render: the generic gateway is either rate-limited, slow, or rejecting requests for your project.

Fix: rewrite `ipfs://` URLs to your **project-specific Thirdweb CDN** using the client ID already in the SDK config:
```
https://0ee0974906e5b6b9d18c8f635d4a3df0.ipfscdn.io/ipfs/<hash>/<file>
```
Same domain that's already serving your metadata successfully. Zero new infra, zero rate limits.

### 4. Visual polish to match the menu

- Header: drop the boxy bordered bar, use the same big neon title treatment as the menu (`menu-neon-title` / `menu-neon-title-red`). Title becomes **NEBULA HUB** in red neon, just like CASCADE on the menu.
- Sidebar: minimalist text-only nav (no emoji icons), neon-red active state with a glowing left bar — visually identical to the menu's selected-item treatment.
- Tab bar (Mint / Trade): same red neon underline style, no boxes.
- Cards: thinner borders, more breathing room, the galaxy shows through the gaps.
- "BACK" button → small ghost button top-left like Roadmap on menu.

### Files touched

- **New**: `src/components/shared/GalaxyBackground.tsx` — reusable canvas (extracted from MainMenu)
- `src/components/menu/MainMenu.tsx` — refactor to use the new shared component (no visual change)
- `src/pages/Marketplace.tsx` — galaxy mount, scroll fix, header/sidebar restyle
- `src/components/marketplace/NFTCard.tsx` — IPFS gateway swap to project CDN
- `src/index.css` — remove now-unused `.market-galaxy` rules; add scroll-unlock guard

### What you'll see after

- Click MARKETPLACE on the menu → seamless transition into the same galaxy, just with NFT cards layered on top. No jarring change of aesthetic.
- Page scrolls cleanly at any zoom level / viewport.
- All card art renders sharply via your dedicated CDN — King Cold, Advanced Dragon, Goofy Dragon, Powermon, all of them.
- Monsterous + Mortal Escape still show amber **COMING SOON** (no regression).
- Sidebar feels like a natural extension of the menu, not a generic admin panel.

