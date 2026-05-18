# Final Bug-Check & Stability Pass

Plan-mode report. No files were modified. Below is what I tested, what's clean, what's broken/inconsistent, and the minimal fix list I'd apply on approval.

## What I tested

- TypeScript compile (`tsc --noEmit`) across the project
- `react-helmet-async` provider wiring (`src/main.tsx`) and per-page `SEO` usage
- `index.html` head tags + Organization JSON-LD
- Sitemap generator (`scripts/generate-sitemap.ts`) — ran it, inspected output
- Routes in `src/App.tsx` vs sitemap entries
- `WalletMenu` integration in `Marketplace.tsx` (mount, hooks, dropdown, AlertDialog)
- `useResolvedName` against thirdweb v5 `resolveName` signature
- `AddressLink` (copy / BaseScan / resolution toggle)
- Mobile layout assumptions at 1047×672 and at 390px (reading `index.css`, route layouts)
- Docs consistency: `EXPORT_READINESS_CHECKLIST.md`, `MARKETPLACE_ADMIN.md`

## What's clean

- `tsc --noEmit` passes with zero errors.
- `HelmetProvider` correctly wraps `<App />` in `src/main.tsx`.
- `WalletMenu` imports, hooks (`useActiveAccount`, `useActiveWallet`, `useDisconnect`), Radix dropdown, and AlertDialog are all consistent. Disconnect path is guarded by the confirm dialog and fires the sonner toast.
- `useResolvedName` matches thirdweb's `ResolveNameOptions` shape (`client`, `address`, `resolverChain: ethereum`) and caches in-memory; failures fall back silently to short address.
- Sitemap generator runs cleanly, writes 7 entries to `public/sitemap.xml`, matches the public routes in `App.tsx`.
- Organization JSON-LD in `index.html` is valid.
- 7 of 9 pages render an `<SEO>` block.

## What's broken / inconsistent

1. **`NotFound.tsx` has no `<SEO>` and no `noindex`.** 404s will be indexed with whatever sitewide title the previous route left in `document.head`. Minor SEO bug.
2. **`AdminRewards.tsx` has no `<SEO>` and is not gated from indexing.** It's an admin route; it should be `noindex, nofollow` and excluded from the sitemap (it already is excluded — good — but the page itself doesn't emit a robots meta).
3. **`sitemap.xml` `<loc>` values are relative (`/marketplace`, etc.).** The sitemap spec requires absolute URLs. Crawlers will reject the file until `BASE_URL` is set. This is expected (TODO in the script) but the `EXPORT_READINESS_CHECKLIST.md` doesn't call it out as a blocker before publish.
4. **`index.html` `<meta property="og:url">` is missing** (only `og:title`, `og:description`, `og:type`, `og:site_name` are present). Per-route Helmet sets it, but JS-disabled social crawlers (LinkedIn, Slack, Facebook) won't see it.
5. **`docs/EXPORT_READINESS_CHECKLIST.md` env block** lists `VITE_MARKETPLACE_ADDRESS` but the surrounding sentence still reads "All three are publishable values" — should be "All four".
6. **`useResolvedName` resolves ENS off the `ethereum` chain only.** Base-native names (`*.base.eth` via Basenames) actually resolve through ENS mainnet too, so this is correct in practice — flagging here so it isn't "fixed" by mistake later.
7. **Mobile (≤390px) — `Marketplace.tsx` header row** mounts `<NetworkPill>` + `<WalletMenu>` + tab strip on the same flex line. On a 360px viewport this can overflow because `WalletMenu`'s trigger button has no `max-width` and the resolved ENS name (e.g. `somethinglong.base.eth`) won't truncate. Cosmetic, not a crash.
8. **`WalletMenu`** calls `useDisconnect()` and then `disconnect(wallet)` without awaiting. Works, but the toast fires before the wallet actually disconnects; if the wallet rejects (rare), the toast is misleading.

No crashes, no broken imports, no runtime errors observed.

## Proposed fixes (small, contained)

1. Add `<SEO ... />` with `noindex` support to `NotFound.tsx` and `AdminRewards.tsx`. Extend `SEO.tsx` with an optional `noindex?: boolean` prop that emits `<meta name="robots" content="noindex, nofollow" />`.
2. Add `<meta property="og:url" content="/" />` to `index.html` to round out the static fallback head.
3. In `EXPORT_READINESS_CHECKLIST.md`:
   - Fix "All three" → "All four".
   - Add a one-line warning: "Set `BASE_URL` in `scripts/generate-sitemap.ts` before publishing — relative `<loc>` values are invalid per sitemap spec."
4. In `WalletMenu.tsx`: add `max-w-[140px] truncate` to the label `<span>` so long ENS names don't blow out the header on mobile.
5. In `WalletMenu.tsx`: move the success toast into a `.then()` / `try` after `disconnect(wallet)` resolves so the user only sees confirmation on actual disconnect.

## Out of scope (per your instructions)

- No new features, no redesign.
- No changes to gameplay, contracts, auth, routing foundations, or backend.
- No changes to ENS resolver chain (correct as-is).
- No SSR / pre-render work for social crawlers — that needs a hosting change.

## What may still need attention later (not fixing now)

- Social-preview crawlers won't see per-route Helmet tags — accept until SSR or a published custom domain.
- `BASE_URL` in the sitemap will need updating the moment a custom domain is live.
- `NetworkPill` + `WalletMenu` row could use a dedicated mobile reflow if a real device review reveals overflow on 320px.

Approve and I'll apply fixes 1–5 in a single pass.
