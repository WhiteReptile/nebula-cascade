

# Split "RULES & REWARDS" into Two Separate Menu Items

## What Changes

Split the single "RULES & REWARDS" menu entry into two items — "RULES" and "REWARDS" — each with its own page and route.

## New Menu Order (7 items, still 2 visible at a time)
1. PLAY
2. WALLET
3. OPTIONS
4. MARKETPLACE
5. RULES
6. REWARDS

## Files to Create

**`src/pages/Rewards.tsx`** — New page, same "Coming soon" placeholder style as the current Rules page, with title "REWARDS" and a back button.

## Files to Modify

**`src/components/menu/MainMenu.tsx`**:
- Update `MENU_ITEMS` to `['PLAY', 'WALLET', 'OPTIONS', 'MARKETPLACE', 'RULES', 'REWARDS']`
- Add `'REWARDS'` case in `handleSelect` routing to `/rewards`
- Update `'RULES & REWARDS'` case to `'RULES'` routing to `/rules`

**`src/pages/Rules.tsx`**:
- Change the title from "RULES & REWARDS" to "RULES"

**`src/App.tsx`**:
- Import the new `Rewards` page
- Add route `<Route path="/rewards" element={<Rewards />} />`

## No Other Changes
- Carousel logic, looping navigation, styling, and all other pages remain untouched
- NFT/gems infrastructure is already in place and ready

