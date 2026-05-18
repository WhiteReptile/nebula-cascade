# Frontend Polish Plan

Scope is strictly frontend/presentation. No backend, auth, contract logic, or routing foundation changes. All new code stays modular so the upcoming OpenZeppelin + custom backend swap is a drop-in.

---

## 1. Marketplace polish + transaction UX

**New shared util `src/lib/tx/txToast.ts`**
- `notifyTx({ kind: 'list'|'buy'|'cancel'|'setTreasury'|'setFee', hash })` using existing `sonner` toast.
- Renders `Pending → Confirmed/Failed` with a BaseScan link (`https://basescan.org/tx/<hash>`), copy-hash button, and cosmic styling (`glow-yellow` border, mono font).
- Subscribes to receipt via thirdweb `waitForReceipt` so confirmations update the same toast id.

**Wire into existing flows** (no logic changes, only call `notifyTx` on returned hashes):
- `ListCardModal` (list + approval)
- `BuyCardModal` (buy)
- `MyCardTile` cancel
- `OwnerControlsPanel` (setTreasury, setFeeBps)

**Inline error + retry**
- New `src/components/marketplace/InlineError.tsx`: red glow card with message + "Retry" button.
- Use in `TradeGrid` (replaces raw error string), `TreasuryWidget`, `OwnerControlsPanel`, `useActiveListings`/`useLifetimeVolume` consumers. Each accepts an `onRetry` that re-invokes the hook's refresh.

**Skeleton loaders**
- New `src/components/marketplace/SkeletonPanel.tsx` (cosmic shimmer using existing `skeleton` primitive + `glow-blue` border).
- Use in `TreasuryWidget` while `contractBalanceWei`/`volumeWei` are loading, and in `OwnerControlsPanel` while owner check resolves.

**Empty division states**
- `TradeGrid`: when a non-`all` filter yields zero results, render a division-specific empty card ("No Division III listings yet — be the first") with the division color glow.

**Refresh buttons**
- `TreasuryWidget` already has one — add spin animation while in-flight.
- Add the same control to lifetime-volume row independently.

**LocalStorage volume cache**
- New `src/lib/marketplace/volumeCache.ts`: `get/set` keyed by `nebula:vol:<chainId>:<contract>`, stores `{ volumeWei: string, lastBlock: number, ts: number }`.
- `useLifetimeVolume` reads cache first (instant paint), then scans `getContractEvents` from `lastBlock + 1`, merges, writes back. 24h TTL safety reset.

---

## 2. MY CARDS polish

- **Sort**: in `Marketplace.tsx` MY CARDS section, sort cards: unlocked (not in 24h lock) first, then locked by ascending `secondsLeft`. Listed cards last.
- **Tooltip**: wrap the SELL button + lock badge in shadcn `Tooltip` showing "Anti-flip lock. Unlocks at `<localized time>`" using `new Date(Date.now()+secondsLeft*1000)`.
- **Progress ring**: in `MyCardTile`, add an SVG `<circle>` ring around the token avatar using `stroke-dasharray` from `secondsLeft / 86400`. Red glow, pulses under 60s (reuse existing pulse state).

---

## 3. Wallet UX

- **Network pill** (`src/components/wallet/NetworkPill.tsx`): reads active chain via thirdweb hook; shows "🟢 BASE" or "⚠ WRONG NETWORK · Switch" (calls existing switch helper). Mounted in the wallet area of `Marketplace.tsx` and any header showing wallet state.
- **Disconnect flow**: confirm dialog (`alert-dialog`) before disconnect, plus a small "Copied!" toast on address copy. No change to underlying connect logic.
- **ENS / Base name**: new `src/hooks/useResolvedName.ts` using thirdweb's `resolveName` (Base ENS / `.base.eth`); fallback to shortened address. Used inside `AddressLink` with an opt-in `resolveName` prop so it doesn't fire everywhere.

---

## 4. SEO + metadata

- Install `react-helmet-async`; wrap app in `<HelmetProvider>` in `src/main.tsx`.
- Per-route `<Helmet>` for: `/` (Index), `/marketplace`, `/leaderboard`, `/rewards`, `/roadmap`, `/options`, `/auth` (noindex), `/admin-rewards` (noindex).
- Each route: `<title>`, meta description, canonical (relative), og:title/description/type, twitter:card.
- Update `index.html` sitewide tags (keep current title as fallback) and add `Organization` JSON-LD.
- Add `VideoGame` JSON-LD in `Index` via Helmet (name, description, genre, gamePlatform, applicationCategory).
- Add `scripts/generate-sitemap.ts` + `predev`/`prebuild` hooks listing public routes (omit admin/auth). `BASE_URL=""` placeholder with TODO until domain is set.
- `public/robots.txt` already exists — leave as-is.

---

## 5. Accessibility + mobile

- Global focus-visible ring: extend `index.css` with `:focus-visible` outline using `--primary` / cyber-cyan glow; remove default browser outline only when our ring is present.
- `prefers-reduced-motion`: in `index.css` add `@media (prefers-reduced-motion: reduce)` that disables `animate-pulse`, transforms, and the locked-card progress ring spin.
- `MyCardTile` SELL button: ensure `aria-label` on locked state ("Locked, unlocks in HH:MM:SS").
- Marketplace mobile scrolling: add `overflow-x-auto overscroll-contain` + `scroll-snap-type: x mandatory` to the filter chip row in `TradeGrid`; ensure tab bar uses `-webkit-overflow-scrolling: touch`.
- Confirm icon-only buttons (refresh, copy) have `aria-label`.

---

## 6. Documentation

- `docs/EXPORT_READINESS_CHECKLIST.md`: add sections for new env vars (`VITE_MARKETPLACE_CONTRACT`), owner-controls flow, BaseScan tx toast behavior, volume cache key format.
- New `docs/MARKETPLACE_ADMIN.md`: how to find owner address, change treasury, change fee, redeploy under OpenZeppelin, and how the frontend will pick up the new contract via the env var. Notes for self-hosting (Codespaces/GitHub).

---

## Files (new)
```
src/lib/tx/txToast.ts
src/lib/marketplace/volumeCache.ts
src/components/marketplace/InlineError.tsx
src/components/marketplace/SkeletonPanel.tsx
src/components/wallet/NetworkPill.tsx
src/hooks/useResolvedName.ts
scripts/generate-sitemap.ts
docs/MARKETPLACE_ADMIN.md
```

## Files (edited, presentation only)
```
src/main.tsx                 (HelmetProvider)
index.html                   (sitewide meta + Org JSON-LD)
src/index.css                (focus-visible, reduced-motion)
src/pages/{Index,Marketplace,Leaderboard,Rewards,Roadmap,Options,Auth,AdminRewards}.tsx  (Helmet blocks)
src/pages/Marketplace.tsx    (sort MY CARDS, NetworkPill, disconnect dialog)
src/components/marketplace/{MyCardTile,TreasuryWidget,TradeGrid,OwnerControlsPanel,ListCardModal,BuyCardModal,AddressLink}.tsx
src/hooks/useMarketplaceContract.ts  (volume cache integration only)
package.json                 (helmet dep, predev/prebuild)
docs/EXPORT_READINESS_CHECKLIST.md
```

## Out of scope (explicit)
- No changes to auth, Supabase, edge functions, routing, gameplay, or contract code.
- No new gameplay systems, no marketplace re-architecture.
- Thirdweb v5 layer stays; abstractions kept so OZ/custom backend swap remains drop-in.

## Suggested commit batches
1. Tx toasts + InlineError + Skeleton (foundations)
2. Volume cache + refresh polish
3. MY CARDS sort/tooltip/ring
4. Wallet (NetworkPill, disconnect, name resolution)
5. SEO (Helmet + sitemap)
6. A11y + mobile
7. Docs

Ready to implement on approval.
