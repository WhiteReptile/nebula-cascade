
Let me check the current Marketplace state to plan the polish properly.
<lov-tool-use id="toolu_vrtx_01Upmbv3HsnLvD4oEtSqauyR" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/Marketplace.tsx\", \"lines\": \"1-120\"}">
</lov-tool-use>

<lov-tool-use id="toolu_vrtx_01GKQT2vKBtKvWvNb71CDS5x" name="code--view" integration-id="code" data="{\"file_path\": \"src/pages/Marketplace.tsx\", \"lines\": \"1-200\"}">
</lov-tool-use>
<lov-plan>

## Plan: Marketplace Polish (pre-Thirdweb)

Apply the cinematic galaxy + glow standards already added to `index.css` across the entire Marketplace UI. No logic changes — pure visual pass.

### 1. Background cinematography
- Replace the inline radial-gradient `<div>` wrapper with the new animated `.market-galaxy` layer.
- Add a subtle parallax starfield (slow drift) on top of the existing star dots.
- Add a faint nebula glow vignette around the viewport edges for depth.

### 2. Text glow pass — every single label
Apply only the 3-color palette: **yellow / blue / white**.
- **Page title + section headers** → `glow-yellow`, larger sizes (text-3xl → text-4xl, text-xl → text-2xl).
- **Card names, prices, division labels** → `glow-yellow` for prices, `glow-blue` for names, `glow-white` for meta.
- **Sidebar nav items** → `glow-blue` default, `glow-yellow` when active, bumped to text-base.
- **Buttons (Buy / List / Cancel / Set Active)** → `glow-yellow` text on dark transparent bg with `glow-border-yellow`.
- **Filter chips (ALL / V / IV / III…)** → `glow-white` default, `glow-yellow` active.
- **Form labels / inputs / fee preview** → `glow-blue` labels, `glow-white` values, `glow-yellow` totals.
- **Auth form** → all labels glow-blue, submit button glow-yellow.

### 3. Module containers (cards / panels)
- Wrap listing cards, sidebar, profile panel, wallet panel, auth form in semi-transparent dark panels with `glow-border-blue`.
- Hover state on listing cards: swap to `glow-border-yellow` + slight scale (`hover-scale`).
- Add `animate-fade-in` on section switches.

### 4. Interaction polish
- Larger tap targets: buttons min-height 44px.
- Clear visual hover/active states on every interactive element.
- Sidebar nav: add active glow bar on the left edge.
- Toast styling already global — leave alone.

### 5. Files touched
- `src/pages/Marketplace.tsx` — class swap + structural panel wrapping (no logic change)
- `src/index.css` — already has utilities; add 1-2 helpers if needed (parallax stars, panel base)

### Untouched
All marketplace logic, routes, supabase calls, listing flow, auth flow, wallet system. Thirdweb integration is the **next** step after this polish lands.

