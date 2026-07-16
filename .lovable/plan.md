# Full Debug and Fix Plan

## Goal
Run a broad health pass across the app, then fix the concrete issues that affect loading, console cleanliness, mobile/game behavior, SEO-critical rendering, and the recently added 3D hero menu.

## What I found so far
- The live console is noisy with `Failed to fetch` from ad settings and Hall of Fame requests.
- Those paths already have fallbacks, but they still log scary errors and can wait on failed network calls.
- The `/hall-of-fame` route is currently behind auth even though the homepage links to it as public social proof.
- The 3D hero nav exists, but it may not read as a “3D scrolling UI” enough at the current desktop viewport.
- Dev server is running cleanly aside from a Browserslist warning.

## Implementation steps
1. **Runtime error cleanup**
   - Harden Supabase read helpers so transient fetch failures fall back silently where demo data/default settings are expected.
   - Keep real developer diagnostics available without spamming user-facing preview console for known offline/preview fetch failures.

2. **Ad settings resilience**
   - Refactor `useAdSettings` to avoid repeated failing requests and realtime subscriptions when the backend is unreachable.
   - Preserve default ad settings so ads and layout do not break.

3. **Hall of Fame resilience**
   - Refactor leaderboard/Hall of Fame fetching to safely return demo/fallback data when remote reads fail.
   - Ensure profile lookups do not fail the whole ranking render.

4. **Route/access fix**
   - Make `/hall-of-fame` accessible without login, matching the public homepage link and optional-login project rule.
   - Keep genuinely admin/private routes protected.

5. **3D hero menu visibility pass**
   - Make the hero navigation’s 3D scroll effect more obvious at rest and during scroll.
   - Verify desktop and mobile screenshots show depth clearly, not just subtle tilt.

6. **Game/start-state audit**
   - Search the game components for auto-start or completed-state-on-load patterns.
   - Fix any remaining games that can show a done/restart state before a manual start.

7. **Mobile/layout smoke test**
   - Use Playwright on the current preview to inspect home, play route, a game route, Hall of Fame, and the 3D menu at desktop and mobile widths.
   - Check for console errors, blank screens, broken navigation, obvious overlap, and touch/keyboard control regressions.

8. **Validation**
   - Run the relevant automated checks available in the project.
   - Use browser verification for the highest-risk flows before reporting completion.

## Files likely to change
- `src/hooks/useAdSettings.ts`
- `src/services/gameScores.ts`
- `src/components/HallOfFamePreview.tsx`
- `src/components/HeroNav3D.tsx`
- `src/App.tsx`
- Any game component still missing a clean manual start state, if found during the audit

## Expected outcome
- Cleaner preview console.
- More reliable homepage rendering when backend/network calls fail.
- Public Hall of Fame page works from the homepage.
- 3D hero menu is visibly 3D across desktop/mobile.
- Games consistently start from a plain manual start state.
- Verified with browser smoke testing before completion.