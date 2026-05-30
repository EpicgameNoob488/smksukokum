# Handoff: Design Token Refactoring – Phase 1 & 2 Complete

**Conversation date:** 2026-05-30
**Branch:** `refactor/design-tokens-alignment`
**Next focus:** Phase 3 — StudentTable, SearchableDropdown, NotificationBell, NotificationPanel, ExcelUploadModal, EditTeacherModal
**Phase 3 handoff:** `plans/phase-3-handoff.md`

---

## Summary

Completed the first phase of aligning the codebase to the newly created DESIGN.md design system. Centralized design tokens now exist, the landing page has been refactored to use them, and the broken ThemeContext dark mode import has been patched.

## What was done

1. **`DESIGN.md` created** at project root — YAML frontmatter with 6 colors, 5 typography roles, radius/spacing scales, and component variants. Six spec sections (Overview, Colors, Typography, Elevation, Components, Do's and Don'ts). Documented "The Trusted Ledger" as the creative north star.

2. **`.impeccable/design.json` created** — sidecar with OKLCH tonal ramps, shadow/motion tokens, 8 self-contained component HTML/CSS snippets, and narrative block.

3. **`src/lib/designTokens.ts` expanded** — 6 new utility tokens added (`hoverBg`, `focusRing`, `lightBorder`, `lighterBorder`, `selectionBg`, `selectionText`) plus stub exports `lightTokens`/`darkTokens` to fix broken `ThemeContext.tsx` import.

4. **`src/components/LandingPage.tsx` refactored** — inline `tokens` object removed, replaced with centralized import. Color drift resolved (headings `#2B3674`→`#131f5d`, background `#F4F7F6`→`#f7f9ff`, muted text `#8F9BBA`→`#767681`). Tailwind utilities (`bg-slate-50`, `border-slate-100`, `shadow-sm/xl/2xl`, `rounded-md/2xl/3xl/full`) replaced with token references.

5. **Verification:** `npm run lint` passed, `npm run build` passed.

## Locked decisions (from 5-question grill)

| # | Decision |
|---|----------|
| 1 | Landing page headings use darker navy `#131f5d` (matches dashboard) |
| 2 | Same background `#f7f9ff` everywhere (no separate landing page bg) |
| 3 | Utility tokens added to `designTokens.ts` before refactoring starts |
| 4 | Broken `ThemeContext.tsx` left untouched for now |
| 5 | Red text selection highlight kept, tokenized as `selectionBg`/`selectionText` |

## Key files (paths relative to project root)

- `DESIGN.md` — design system spec
- `.impeccable/design.json` — sidecar with component snippets and tonal ramps
- `src/lib/designTokens.ts` — centralized token definitions (import this for all colors and DT utilities)
- `src/components/LandingPage.tsx` — Phase 1 refactored component (reference for how to apply tokens in Phase 2+)
- `src/contexts/ThemeContext.tsx` — broken dark mode, left alone per decision #4
- `PRODUCT.md` — product context (warm, supportive, teacher dashboard)

## What's next: Phase 2 — Dashboard + Sidebar + Header

Refactor Dashboard + Sidebar + DashboardHeader. These are the most token-leaky components in the app.

**Files to touch:**

- **`src/components/Dashboard.tsx`** — imports `tokens` and `DT` from centralized file but still uses extensive hardcoded Tailwind utilities (`bg-slate-100`, `border-slate-200`, `shadow-sm/md/lg/xl`, `rounded-lg/xl/2xl/3xl`, `duration-200/300`, `hover:bg-orange-100`, `focus:ring-red-200`, `text-slate-500/600/700`). Also hardcodes Recharts tooltip styles. This is the biggest file (~2000 lines) — be surgical, don't rewrite.

- **`src/components/DashboardSidebar.tsx`** — hardcodes `#F04444` and `#F4F7F6` directly. No token imports at all. Small file (73 lines), easy fix — just add import and replace hardcoded hexes.

- **`src/components/DashboardHeader.tsx`** — receives `tokens` as prop but still uses hardcoded Tailwind (`bg-white`, `border-slate-200`, `shadow-sm`, `hover:bg-slate-50`).

- **`src/lib/kpiCalculations.ts`** — hardcodes 5 chart colors (`#F04444`, `#FFB547`, `#2B3674`, `#059669`, `#EE5D50`).

**Approach:** Same pattern as LandingPage — replace hardcoded hexes with `tokens.colors.*`, replace `bg-slate-50/100` with `hoverBg`/`cardOuterBg`, replace `border-slate-100/200` with `lighterBorder`/`lightBorder`, replace `shadow-sm/md/lg/xl/2xl` with `DT.shadow.*`, replace `rounded-lg/xl/2xl/3xl` with `DT.radius.*`. Keep Tailwind semantic color utilities (`red-100`, `green-50`, etc.) since they match token values.

## Phases 3 and 4 (after Phase 2)

- **Phase 3:** `StudentTable.tsx` (delete inline DT, import centralized), `ExcelUploadModal.tsx`, `EditTeacherModal.tsx`, `SearchableDropdown.tsx`, `NotificationBell.tsx`, `NotificationPanel.tsx`.
- **Phase 4:** Auth pages (`LoginPage.tsx`, `RegisterPage.tsx`, `ResetPasswordPage.tsx`, `SettingsPage.tsx` — all have inline token objects), `App.tsx`, `ErrorBoundary.tsx`.
- Final: `npm run lint` + `npm run build` pass.

## Suggested skills

- **`smksukokum-workflows`** — project-specific workflows for adding features and modifying data fetching.
- **`impeccable`** — if the user wants visual design guidance during the refactor (e.g., `/impeccable critique` on the landing page after Phase 1, or `/impeccable live` to visually verify in browser).
- **`diagnose`** — if lint or build fails during refactoring.

## References (read these first)

- `DESIGN.md` — the shared design language. Colors, typography, elevation, components, dos/donts.
- `PRODUCT.md` — who uses this, why, and what "supportive clarity" means.
- `git diff` on branch `refactor/design-tokens-alignment` — shows exactly what changed in Phase 1.
- `AGENTS.md` — dev commands (`npm run dev`, `npm run lint`, `npx vitest`), and the rule: **do not modify `supabase/`**.
