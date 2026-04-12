

# Marketplace Hub — Navigation Restructure

## What Changes

1. **MainMenu.tsx** — Remove "CARDS" from the menu items array. New order: `PLAY, OPTIONS, MARKETPLACE, RULES, REWARDS` (5 items instead of 6).

2. **Marketplace.tsx** — Rebuild as a tabbed hub with two tabs:
   - **MARKETPLACE** tab — the existing listings browser (buy/sell/cancel)
   - **MY CARDS** tab — the existing Cards page content (owned cards grid, active card toggle, per-card energy, WalletConnect component)
   
   Uses the existing `Tabs`/`TabsList`/`TabsTrigger`/`TabsContent` components from `src/components/ui/tabs.tsx`, styled to match the dark cosmic theme.

3. **App.tsx** — Redirect `/cards` and `/wallet` to `/marketplace`. Remove the standalone Cards route.

4. **Cards.tsx** — Keep the file but extract its card display + wallet logic into the Marketplace page directly (or import it as a component). The page itself becomes unused.

## Technical Details

- **MainMenu.tsx line 8**: Change `MENU_ITEMS` to `['PLAY', 'OPTIONS', 'MARKETPLACE', 'RULES', 'REWARDS']`. Remove the `'CARDS'` case from `handleSelect`.

- **Marketplace.tsx**: Merge the Cards page data loading (player cards, energies, active card, wallet address) into the Marketplace's `useEffect`. Wrap both sections in `<Tabs defaultValue="marketplace">` with two `TabsTrigger` buttons styled with the existing red/yellow neon aesthetic. The marketplace listings go in one `TabsContent`, the cards grid + WalletConnect in the other.

- **App.tsx**: Change `/cards` route to `<Navigate to="/marketplace" replace />`. Keep `/wallet` also redirecting to `/marketplace`.

## Files Modified

| File | Change |
|------|--------|
| `src/components/menu/MainMenu.tsx` | Remove CARDS from menu items |
| `src/pages/Marketplace.tsx` | Add tabs: Marketplace + My Cards/Wallet |
| `src/App.tsx` | Redirect /cards → /marketplace |

