## Problem
The 3D perspective-tilt hero nav isn't visible as 3D. In the screenshot the pills render flat and never tilt on scroll.

Root causes in the current setup:
1. **Parent transform kills perspective.** The hero content wrapper in `Home.tsx` uses `style={{ transform: translateY(${heroOffset}px) }}` for parallax. `HeroNav3D` sits inside it and sets its own `perspective: 1000px` — but a transformed ancestor flattens child 3D transforms unless it also declares `transform-style: preserve-3d`. Result: `rotateX` / `translateZ` collapse to 2D.
2. **`overflow-hidden` on the hero `<section>`** clips any depth/tilt that extends outside the box.
3. **Scroll range never fires meaningfully.** `useScroll` targets the `<nav>` itself with `offset: ['start 0.15','end start']`. The nav is only ~50px tall, so it exits the viewport almost immediately and the animated range is compressed to a few pixels of scroll — you barely see any tilt before it's gone.
4. **No idle tilt.** Even at rest the menu is perfectly flat, so users who don't scroll (or scroll past fast) see nothing 3D at all.

## Fix

### 1. `src/pages/Home.tsx`
- Remove `overflow-hidden` from the hero `<section>` (keep the `HeroMiniGame` canvas contained another way if needed — it's `absolute inset-0` so it's fine).
- Replace the parallax `transform: translateY(...)` on the inner wrapper with `willChange: 'transform'` + a `translate3d` and add `transformStyle: 'preserve-3d'` so descendant 3D isn't flattened. Simpler alternative: move parallax off this wrapper and apply it directly to the `HeroMiniGame` background layer (which is what "parallax on the hero" was for anyway), leaving the content wrapper transform-free.

### 2. `src/components/HeroNav3D.tsx`
- Track scroll against the **window / hero section**, not the tiny nav element, so the tilt animates over a meaningful scroll distance:
  - Accept an optional `targetRef` prop (the hero section) OR use `useScroll()` with no target and drive off `window.scrollY` in the 0–600px range via `useTransform`.
- Give the menu a **subtle resting tilt** (`rotateX: 8deg`) so the 3D is visible before any scroll, then animate to `rotateX: 55deg` + recede as the user scrolls.
- Add `perspective-origin: 50% 120%` for a nicer vanishing point.
- Add `will-change: transform` on the animated wrapper.
- Keep `transformStyle: 'preserve-3d'` on both the perspective container and the motion wrapper (already set).
- Keep the reduced-motion fallback.

### 3. Verify
- Playwright at 1280×1800 and 392×800: screenshot at scrollY=0 (should show a slight tilt), scrollY=200, scrollY=500 (pills clearly tilted back and receded). Confirm anchor jumps still work.

## Files
| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Remove `overflow-hidden`; move parallax off the content wrapper so it no longer flattens 3D descendants |
| `src/components/HeroNav3D.tsx` | Drive tilt off window scroll (not the nav element); add resting tilt + perspective-origin; ensure preserve-3d chain |

No backend, routing, or game logic touched.
