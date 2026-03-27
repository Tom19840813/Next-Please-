

# 2026 Retro-Futurist Visual Overhaul

## Overview
Transform the current monochrome black/white design into a **neon-accented retro-futurist** aesthetic with interactive hero, glassmorphism, CRT effects, micro-animations, and haptic feedback. Dark mode stays default; accent palette shifts to **cyan/magenta/yellow** neons.

---

## 1. New Color System & CRT Effects

**`src/index.css`** — Replace the grayscale palette with neon-accented dark theme:
- Background stays near-black (`hsl(240 10% 4%)`)
- Card surfaces get a subtle blue-tint (`hsl(240 10% 8%)`)
- Primary becomes cyan (`hsl(185 100% 55%)`)
- Accent colors: magenta (`hsl(330 100% 55%`), yellow (`hsl(50 100% 55%)`)
- Add CSS for optional **CRT scanline overlay** (thin repeating horizontal lines at low opacity)
- Add **glow utility classes** (`.neon-glow-cyan`, `.neon-glow-magenta`, `.neon-glow-yellow`) using `box-shadow` and `text-shadow`
- Add **glassmorphism class** (`.glass`) with `backdrop-blur-xl`, semi-transparent background, subtle border

**`tailwind.config.ts`** — Extend with new neon color tokens (`neon-cyan`, `neon-magenta`, `neon-yellow`) and glow keyframe animations (`glow-pulse`).

**`index.html`** — Update `theme-color` meta from purple to the new dark value.

---

## 2. Interactive Hero with Mini-Game Canvas

**Create `src/components/HeroMiniGame.tsx`**:
- A lightweight **Canvas-based Tetris preview** that auto-plays in the hero background
- Blocks fall slowly in neon colors, purely decorative (no user input needed)
- Optional: let users tap/click to drop a block for engagement
- Uses `requestAnimationFrame` loop, no WebAssembly needed (keeps it lightweight)
- Renders behind the hero text with reduced opacity

**Update `src/pages/Home.tsx`** hero section:
- Layer the `HeroMiniGame` canvas behind the title text
- Add **parallax effect**: hero text shifts subtly on scroll using a simple `onScroll` transform
- Title gets neon glow effect (cyan text-shadow)
- Subtitle gets a **typewriter animation** cycling through phrases ("Endless games", "Random challenges", "Every round is different")

---

## 3. Glassmorphism & Micro-Animations on Game Cards

**Update `src/pages/Home.tsx`** game cards:
- Apply `.glass` class to cards (semi-transparent bg, blur, neon border on hover)
- Each card icon gets its own neon accent color (cycle through cyan/magenta/yellow)
- Hover: card border glows with the accent color, icon scales up with a spring animation
- Add staggered fade-in animation on mount (each card delayed by 50ms)

**Update `src/components/HallOfFamePreview.tsx`**:
- Glass-styled card with subtle neon trophy glow
- Medal icons get color: gold/silver/bronze instead of monochrome
- Add shimmer animation on the top player row

**Update `src/components/InfiniteGameFeed.tsx`**:
- Challenge cards get glass styling and neon difficulty-color coding
- Smooth scale-in animation as cards enter viewport

---

## 4. Confetti & Celebration Updates

**Update `src/utils/confetti.ts`**:
- Change confetti colors to match new neon palette (cyan, magenta, yellow, white)

---

## 5. CRT Scanline Toggle

**Update `src/pages/Home.tsx`**:
- Add a small toggle button (bottom-left corner) to enable/disable CRT scanline overlay
- Persisted in `localStorage`
- When enabled, a full-screen `pointer-events-none` overlay with CSS scanlines appears

---

## 6. Haptic Feedback Utility

**Create `src/utils/haptics.ts`**:
- Export `vibrate(pattern)` function that calls `navigator.vibrate()` when available
- Light tap (10ms), medium (25ms), success pattern ([10, 50, 10])
- Integrate into game card clicks and score events in Home page

---

## 7. Mobile Touch Optimization

**Update `src/index.css`**:
- Ensure `touch-action: manipulation` on interactive elements to remove 300ms tap delay
- Add `:active` states with scale-down for all buttons and cards on mobile

---

## 8. GameContainer Dark Theme Fix

**Update `src/components/GameContainer.tsx`**:
- Replace leftover white/purple references (`bg-white`, `text-game-purple`, `bg-gray-300`) with dark theme tokens

---

## Files Changed (Summary)

| File | Action |
|------|--------|
| `src/index.css` | Neon colors, CRT scanlines, glass class, glow utilities |
| `tailwind.config.ts` | Neon color tokens, glow-pulse keyframe |
| `index.html` | Update theme-color meta |
| `src/components/HeroMiniGame.tsx` | **New** — Canvas auto-play Tetris background |
| `src/pages/Home.tsx` | Interactive hero, parallax, glass cards, CRT toggle, haptics |
| `src/components/HallOfFamePreview.tsx` | Glass styling, colored medals, shimmer |
| `src/components/InfiniteGameFeed.tsx` | Glass cards, neon difficulty colors |
| `src/components/GameContainer.tsx` | Fix white/purple remnants |
| `src/utils/confetti.ts` | Update colors to neon palette |
| `src/utils/haptics.ts` | **New** — Vibration API wrapper |

