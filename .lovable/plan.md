

# Fix Preview + Clean Up Project

## Problem
The preview is broken because Lovable expects `package.json` at the project root, but all app files live under `frontend/`. The dev server can't find a dev command. Additionally, thirdweb/emergent.sh artifacts need removal.

## Plan

### Step 1 — Flatten project structure
Move all files from `frontend/` to the project root:
- `frontend/package.json` → `package.json`
- `frontend/vite.config.ts` → `vite.config.ts`
- `frontend/index.html` → `index.html`
- `frontend/src/` → `src/`
- `frontend/supabase/` → `supabase/`
- `frontend/tsconfig*.json` → root
- `frontend/tailwind.config.ts`, `postcss.config.js`, `components.json`, `eslint.config.js`, `vitest.config.ts`, `public/` → root

Delete the empty `frontend/` directory after.

### Step 2 — Remove thirdweb and wallet code
Delete these files:
- `src/config/thirdweb.ts`
- `src/context/WalletContext.tsx`
- `src/components/wallet/ThirdwebWalletConnect.tsx`
- `src/components/wallet/SwapWidget.tsx`
- `src/pages/Swap.tsx`

Remove `thirdweb` from `package.json` dependencies and `optimizeDeps.exclude` from `vite.config.ts`.

### Step 3 — Fix App.tsx
- Remove `WalletProvider` import and wrapper
- Remove `Swap` import and `/swap` route
- Keep all other pages and routes intact

### Step 4 — Fix Marketplace.tsx
- Remove `ThirdwebWalletConnect` import and usage
- Replace wallet section with a "Coming Soon (Solana)" placeholder panel

### Step 5 — Remove emergent.sh artifacts
Delete: `.emergent/`, `.gitconfig`, `backend/`, `tests/`, `backend_test.py`, `test_result.md`, `test_reports/`, root `bun.lock`, root `package-lock.json`

### Step 6 — Verify build
Run TypeScript check and confirm the preview loads.

## Result
Clean, flat project structure that Lovable can serve. Zero blockchain code. Preview works immediately.

