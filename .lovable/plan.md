I found the real blocker: `index.html` hard-locks both `<body>` and `#root` to `height:100vh; overflow:hidden`, so the Roadmap page cannot scroll even though the Roadmap component tries to enable scrolling.

Plan:
1. Update `index.html` root/body inline styles so the app can grow taller than the viewport:
   - Change body from `overflow:hidden; height:100vh` to normal page scrolling.
   - Change `#root` from `height:100vh; overflow:hidden` to `min-height:100vh`.
2. Keep the game/menu page locked separately through the existing `game-shell-active` class and `Index.tsx` fixed wrapper, so the actual game screen remains 100vw/100vh and does not accidentally scroll.
3. Simplify the Roadmap scroll override so it reliably clears the game-shell lock, enables native mouse-wheel/page scrolling, and does not restore a broken hidden overflow state when leaving/returning.
4. Verify `/roadmap` in the preview by scrolling from April down to the later months and confirming the bottom timeline content is reachable.