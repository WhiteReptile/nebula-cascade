Update `src/pages/Roadmap.tsx`:

**1. Fix scrolling**
- The page sits inside `Index`/game-shell which locks `overflow:hidden` on html/body. The Roadmap route needs to opt out: on mount, remove `game-shell-active` classes from html/body (or just ensure they're not added on `/roadmap`). Add a `useEffect` that forces `overflow:auto` on html/body for this route and restores on unmount.
- Make the root container `min-h-screen` (not fixed) so the native page scroll works with mouse wheel.
- Remove any parent constraints blocking wheel events.

**2. Update content**
- **MAY 2026** — change goal/deliverable to reflect that **launch is May 25, 2026**. Add milestone "Public launch — May 25, 2026" marked done/in-progress as appropriate. Keep marketplace items.
- **JUNE 2026** — re-theme as **"Public Access & Overall Launch"**:
  - Goal: "Public access opens — full platform launch"
  - Milestones: public registration open to all, full marketplace live, first official season begins, onboarding flow polished, marketing push, community channels live, target 1k+ DAU.
  - Deliverable: "Nebula Cascade publicly live and open to all players."
- Keep April / July / August intact but lightly adjust wording so the timeline reads coherently after the June pivot.

**3. UI/UX polish**
- Sticky header gets a subtle gradient + stronger blur.
- Add a "Launch: May 25, 2026" highlighted banner near the top title.
- Improve timeline card hover: slight scale + brighter glow.
- Add smooth scroll behavior to the page.
- Better spacing between months on larger screens; ensure mobile (current 1038px viewport) cards remain readable.
- "Ahead of schedule" badge moves to MAY only if appropriate; add a "🎉 LAUNCH" badge on MAY.
- Ensure ChevronDown clearly indicates clickability with hover state.