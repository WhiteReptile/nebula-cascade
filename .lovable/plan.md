

## Final scroll fix — targeted at the iframe preview

The reason scrolling has failed every previous attempt: the global CSS was fixed, but **inner containers still use `100vh` and flex layouts that prevent the page from ever growing taller than the iframe viewport.** With nothing taller than the viewport, the browser has nothing to scroll.

This pass fixes the actual blockers, in the embedded preview specifically.

### 1. Marketplace — remove the viewport-locked sidebar

In `src/pages/Marketplace.tsx`:

- Remove `height: calc(100vh - 92px)` from the sidebar (line 223). That single rule caps the entire flex row at viewport height.
- Keep the sidebar `sticky` with `top: 92px` and `self-start` so it stays in view while scrolling, but let its height be **content-driven**, not viewport-driven.
- Confirm no parent uses `overflow-hidden` or fixed height. The chain `min-h-screen` → `flex` → `<main className="flex-1 p-8">` is correct once the sidebar height cap is gone.
- Keep `GalaxyBackground` as the fixed background (z-0).

### 2. Rewards — fix sticky stack so content under the fold is reachable

In `src/pages/Rewards.tsx`:

- Keep the page wrapper as `min-h-screen`.
- Keep header sticky at `top-0`, but reduce its weight so the sticky tab bar at `top-[60px]` doesn't double-cover content.
- Add bottom padding (`pb-24`) on the content section so the last tab content isn't flush against the iframe's bottom edge.
- Verify no inner container sets a fixed height.

### 3. Confirm `index.css` global rules are clean

`src/index.css` already has the right defaults (`min-height: 100vh`, `overflow-y: auto`, `.game-shell-active` opt-in lock). No change needed here unless audit reveals a leftover.

### 4. Confirm `Index.tsx` is the only fullscreen route

Already correct — uses `.game-shell-active` toggling. Leave as-is.

### 5. Quick audit of remaining routes

Open and verify these don't have inner `100vh` / `h-screen` / `overflow-hidden` blockers:
- `src/pages/Options.tsx`
- `src/pages/Leaderboard.tsx`
- `src/pages/Roadmap.tsx`
- `src/pages/Auth.tsx`
- `src/pages/AdminRewards.tsx`

Fix any that do, using the same pattern: `min-h-screen` wrapper, no fixed-height inner containers, no `overflow-hidden` on wrappers.

### 6. Verify in the embedded preview

After changes, navigate the embedded preview to `/marketplace` and `/rewards`, scroll with the mouse wheel, and confirm:
- Page extends past the viewport
- Mouse wheel scrolls the document
- Sticky header/sidebar stay visible while content scrolls underneath
- Returning to `/` re-locks the game shell correctly

## Files to modify
- `src/pages/Marketplace.tsx` — remove sidebar `height: calc(100vh - 92px)` cap
- `src/pages/Rewards.tsx` — adjust sticky stack and add bottom padding
- Any of the audit-list pages that still contain inner viewport locks

## Why this will actually work this time
Previous fixes targeted the **document/root** level. The real blocker was **inside the page** — a `100vh`-locked sidebar inside a flex row, which flattened the entire content area to viewport height. Removing that single cap lets the page grow with its content, which is the only condition under which the iframe will scroll.

