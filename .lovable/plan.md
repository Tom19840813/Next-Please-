# 3D Scrolling Hero Nav Menu

## Goal
Turn the 4 hero nav pills (Hall of Fame, Original Games, Random Games, Feedback) into an immersive **3D perspective-tilt** menu that reacts to scroll — items tilt in 3D space, scale, and fade as the user scrolls, using the Motion (Framer Motion) library. Anchor-scroll behavior to each section is preserved.

## Approach

### 1. Add Motion
- Install `motion` (the current package for Framer Motion, React 18 compatible).

### 2. New component: `src/components/HeroNav3D.tsx`
- Renders the same 4 nav items (label, icon, href, hover accent) that currently live inline in `Home.tsx`.
- Wraps the item list in a `perspective` container (CSS `perspective: 1000px`).
- Each item is a `motion.a`:
  - Uses `useScroll` (tracking the hero/viewport scroll progress) + `useTransform` to drive `rotateX`, `translateZ`, `scale`, and `opacity` so pills tilt and recede as the page scrolls.
  - Adds a subtle `whileHover` lift (rotateX→0, scale up, `translateZ`) and `whileTap` press.
  - Staggered entrance via `initial`/`animate` with `transition` delays.
- Keeps existing classes/tokens (glass, neon glow, `lightTap` haptic on click) so styling stays on-theme; anchors (`#hall-of-fame`, `#original-games`, `#random-games`, `#feedback`) unchanged.
- Respects `prefers-reduced-motion` (falls back to static pills).

### 3. Wire into `Home.tsx`
- Replace the inline `<nav>` pill block in the hero with `<HeroNav3D />`.
- Leave the scroll-down indicator and everything else intact.

### 4. Test before done
- Run typecheck/build.
- Drive the live preview with Playwright at mobile (392px) and desktop widths: confirm the menu renders, tilts on scroll, each pill still scrolls to its section, and no console errors. Capture screenshots to verify.

## Files
| File | Change |
|------|--------|
| `package.json` | Add `motion` dependency |
| `src/components/HeroNav3D.tsx` | **New** — 3D perspective-tilt nav driven by scroll + Motion |
| `src/pages/Home.tsx` | Swap inline hero nav for `<HeroNav3D />` |

## Notes
- Pure presentation change — no backend, routing, or game logic touched.
- Motion keeps bundle impact modest and enables spring physics for the tilt/hover.
