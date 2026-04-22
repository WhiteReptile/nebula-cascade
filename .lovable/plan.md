
Implement a route-safe scrolling fix that makes every non-game page scroll normally with the mouse, while keeping the game/menu experience locked to the viewport.

## What to change

### 1. Remove the global scroll lock from the app root
The main blocker is the global CSS in `src/index.css`:

```css
html, body, #root {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
```

This forces the entire app into a fixed viewport and prevents normal document scrolling on pages like Marketplace and Rewards.

Update it so the app defaults to normal page flow:
- `html, body` should allow vertical scrolling
- `#root` should not be hard-locked to `100vh`
- keep `overflow-x: hidden`, but do not globally hide `overflow-y`

Target behavior:
```text
Default app = scrollable document
Game/menu route only = fixed fullscreen shell
```

### 2. Keep the game route isolated in its own fullscreen shell
`src/pages/Index.tsx` should remain the only place that uses:
- `fixed inset-0`
- `overflow-hidden`
- `width: 100vw`
- `height: 100vh`

That preserves:
- the main menu
- the game canvas
- the HUD
- the non-scroll gameplay experience

No other route should depend on the root document being locked.

### 3. Refactor Marketplace to be a real scrolling page
`src/pages/Marketplace.tsx` currently tries to fight the global lock with a `useEffect` that manually sets `html.style.overflow = 'auto'`. That is a patch, not a reliable fix.

Change Marketplace so it works as a normal document page:
- remove the overflow-forcing `useEffect`
- keep `min-h-screen`
- allow content to extend naturally below the fold
- keep the galaxy background fixed behind the page
- keep the header sticky if desired
- keep sidebar sticky only if it does not block content flow

Also simplify layout so the main content establishes page height naturally:
- header at top
- content wrapper below
- marketplace sections stack in document flow
- no hidden overflow on parent containers

### 4. Ensure Rewards & Rules scrolls with the mouse
`src/pages/Rewards.tsx` is structurally close, but it is still affected by the global root lock.

After the global fix:
- keep page wrapper as `min-h-screen`
- keep sticky header and sticky tab bar
- preserve bottom padding so the last content block is reachable
- make no parent container fixed-height or overflow-hidden

This page should scroll naturally without any per-page overflow hacks.

### 5. Align other non-game routes with the same rule
Audit and normalize these pages so they do not use fullscreen fixed wrappers unless absolutely necessary:
- `src/pages/Options.tsx`
- `src/pages/Auth.tsx`
- `src/pages/Leaderboard.tsx`
- `src/pages/Roadmap.tsx`
- `src/pages/AdminRewards.tsx`

Specific changes:
- `Options.tsx`: replace `fixed inset-0` with `min-h-screen`
- keep centered layout, but let the page exist in normal document flow
- other pages can stay mostly as-is if they already use `min-h-screen`

### 6. Add one consistent scrolling rule for all non-game pages
Create a simple pattern used everywhere outside gameplay:

```text
Page wrapper:
min-h-screen
w-full
relative
overflow-visible

Document:
html/body scroll normally
```

This avoids one-off fixes per page and prevents the same bug from returning.

## Files to modify
- `src/index.css`
- `src/pages/Index.tsx`
- `src/pages/Marketplace.tsx`
- `src/pages/Rewards.tsx`
- `src/pages/Options.tsx`
- optionally verify/adjust:
  - `src/pages/Leaderboard.tsx`
  - `src/pages/Roadmap.tsx`
  - `src/pages/Auth.tsx`
  - `src/pages/AdminRewards.tsx`

## Expected result
After implementation:
- Marketplace scrolls down with the mouse normally
- Rewards & Rules scrolls down with the mouse normally
- All non-game pages can extend past the viewport and remain reachable
- The game and menu stay fullscreen and non-scrollable
- No more needing to zoom out just to see full content
