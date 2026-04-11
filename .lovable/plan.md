

# Vertical Carousel Menu — Show 2 at a Time

## What Changes

Rewrite the menu nav section in `MainMenu.tsx` to show only 2 items at a time in a sliding vertical carousel, with the new order and "PLAY" replacing "START".

## Menu Order
1. PLAY (was START)
2. WALLET
3. OPTIONS
4. MARKETPLACE
5. RULES & REWARDS

## How It Works

- A fixed-height viewport (`overflow: hidden`) shows exactly 2 menu item slots
- Items are rendered in a vertical list that translates up/down via `transform: translateY(...)` with a CSS transition
- The **selected item** is always in the top visible slot; the item below it is the second visible one
- **Arrow Down**: selected index increments (stops at the last item — no wrap)
- **Arrow Up**: selected index decrements (stops at 0)
- **Mouse click/hover**: sets the selected index directly; clicking confirms selection
- **Mouse wheel**: optional scroll through items
- Navigation loops cleanly — it **stops** at both ends (no wrapping)
- The `translateY` offset is calculated as `-(selected * itemHeight)px`
- Smooth `transition: transform 0.3s ease` for the sliding effect

## Visual Details
- Each item slot is ~48px tall with the existing font/spacing
- The viewport is `96px` tall (2 × 48px), centered below the title
- Selected item keeps the existing red glow + ▶ indicator + scale-105
- The second visible item shows in the dimmed `text-red-900/60` style
- Subtle fade masks at top/bottom edges of the viewport hint at more items

## Technical Changes

**`src/components/menu/MainMenu.tsx`**:
- Update `MENU_ITEMS` to `['PLAY', 'WALLET', 'OPTIONS', 'MARKETPLACE', 'RULES & REWARDS']`
- Update `handleSelect` to check for `'PLAY'` instead of `'START'`
- Replace the `<nav>` section with a clipped viewport + translateY sliding list
- Clamp keyboard navigation to `[0, length-1]` instead of wrapping with modulo
- Add mouse wheel handler on the viewport to scroll through items

**No other files change.**

