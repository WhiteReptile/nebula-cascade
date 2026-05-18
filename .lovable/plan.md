# Continue Frontend Polish — Round 3

Scope stays strictly frontend/presentation. No backend, auth, contract, or routing changes. Picks up the four items deferred from the last pass.

## 1. Wallet identity — ENS / Base name resolution

- Wire the existing `useResolvedName.ts` hook into `src/components/marketplace/AddressLink.tsx`.
- Display resolved name when present (e.g. `nebula.base.eth`), fall back to short `0x1234…abcd`.
- Keep BaseScan link on the full address; tooltip shows the raw `0x…` on hover.
- Same treatment in the wallet header chip on `Marketplace.tsx` (connected address pill) and `OwnerControlsPanel` treasury display.
- Resolution is cached in-memory per session inside the hook; no extra storage.

## 2. Wallet disconnect affordance

- Add a small `WalletMenu.tsx` next to the connected address: dropdown with `Copy address`, `View on BaseScan`, `Disconnect`.
- `Disconnect` opens shadcn `<AlertDialog>` confirming the action; on confirm calls thirdweb `disconnect(wallet)` and fires a `toast.success("Wallet disconnected")`.
- Reuses the existing thirdweb client + active wallet hooks — no new providers.

## 3. SEO pass (per-route metadata)

- Install `react-helmet-async`; wrap `<App>` once in `src/main.tsx` with `<HelmetProvider>`.
- Sitewide head in `index.html`: brand `<title>`, description, `og:*` fallback, `Organization` JSON-LD (Nebula Cascade). Remove static canonical so per-route Helmet owns it.
- Per-route `<Helmet>` blocks with `title`, `description`, `canonical`, `og:title/description/url/type` on:
  - `Index.tsx` (+ `VideoGame` JSON-LD: name, genre Puzzle, platform Web)
  - `Marketplace.tsx`, `Leaderboard.tsx`, `Rewards.tsx`, `Roadmap.tsx`, `Options.tsx`, `Auth.tsx`
- Add `scripts/generate-sitemap.ts` + `predev` / `prebuild` hooks in `package.json`, writing `public/sitemap.xml` for the public routes above. `BASE_URL = ""` placeholder with TODO until custom domain lands.
- Verify `public/robots.txt` exists; keep as-is or create minimal `User-agent: * / Allow: /`.

## 4. Documentation

- New `docs/MARKETPLACE_ADMIN.md` covering: owner controls panel, fee bps cap (10%), treasury widget, lock semantics, BaseScan verification flow.
- Update `docs/EXPORT_READINESS_CHECKLIST.md` with the new env vars and the predev sitemap step.

## Out of scope (unchanged)

- No auth, Supabase, edge functions, gameplay, contract, or routing changes.
- No new design system tokens; reuse existing neon-cyber palette.
- Thirdweb v5 layer stays; components remain modular for the future OpenZeppelin + custom backend swap.

## Files

**New:** `src/components/wallet/WalletMenu.tsx`, `scripts/generate-sitemap.ts`, `docs/MARKETPLACE_ADMIN.md`
**Edited:** `src/components/marketplace/AddressLink.tsx`, `src/components/marketplace/OwnerControlsPanel.tsx`, `src/pages/Marketplace.tsx`, `src/pages/{Index,Leaderboard,Rewards,Roadmap,Options,Auth}.tsx`, `src/main.tsx`, `index.html`, `package.json`, `docs/EXPORT_READINESS_CHECKLIST.md`

After this round the frontend shell is production-grade pending only your contract + domain work.
