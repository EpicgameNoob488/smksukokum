# Handoff: Responsive Adaptation — SM Kokurikulum Dashboard

## Session Focus
Implement the responsive adaptation plan for the SM Kokurikulum Dashboard so it works cleanly on desktop, tablet, and mobile. The "sticky first column" approach was chosen for the student data table.

## Background
The dashboard (a React + Vite + TypeScript + Tailwind app) currently assumes a desktop viewport. On mobile and tablet the header, filters, data tables, and card grids jumble up or overflow. A full 8-phase plan was developed and approved; it now needs implementation.

## What Has Been Decided
- **Approach:** Mobile-first Tailwind refactor. No logic changes. Only `className` adjustments and minor CSS additions.
- **Student table strategy:** Horizontal scroll with a **sticky first column** (student name stays visible) rather than card transformation.
- **Breakpoints:** Tailwind defaults (`sm:640`, `md:768`, `lg:1024`, `xl:1280`). No custom breakpoints needed.
- **Safe areas:** Add `viewport-fit=cover` and `env(safe-area-inset-*)` padding for notched phones.
- **Touch targets:** Bump icon buttons to `min-w-[44px] min-h-[44px]` (WCAG 2.1 minimum).
- **Hover gating:** Card hover-lift effects should only apply on `@media (hover: hover)` devices.

## Files to Modify
1. `index.html` — add `viewport-fit=cover` to viewport meta
2. `src/index.css` — safe-area padding fallbacks on `body` / bottom-fixed elements
3. `src/components/Dashboard.tsx` — header stacking, filter wrapping, chart sizing, teacher card grids
4. `src/components/StudentTable.tsx` — filter panel full-width, sticky first column, scroll shadow, expanded-row grid breakdown
5. `src/components/DashboardSidebar.tsx` — safe-area top/bottom padding

## Reference Artifacts (Do Not Duplicate)
- **Product context:** `PRODUCT.md` (users, brand personality, design principles)
- **Design system:** `DESIGN.md` (colors, typography, elevation, components, do's/don'ts)
- **Project conventions:** `AGENTS.md` (dev commands, data flow, testing, important conventions)
- **Source files:** `src/components/Dashboard.tsx`, `src/components/StudentTable.tsx`, `src/components/DashboardSidebar.tsx`, `src/index.css`, `index.html`
- **Responsive reference:** `.opencode/skills/impeccable/reference/adapt.md`
- **Responsive design reference:** `.opencode/skills/impeccable/reference/responsive-design.md`

## Key Implementation Reminders
- Keep the existing color tokens from `useTheme()` / `tokens` — do not hardcode colors.
- The student table has `min-w-[900px]`. On mobile this must scroll horizontally; add a visual right-edge shadow to indicate scrollability.
- The expanded student row PAJSK breakdown currently uses `grid-cols-2 md:grid-cols-4`. On 320px phones this must become `grid-cols-1 sm:grid-cols-2 md:grid-cols-4`.
- Teacher Directory cards use `grid-cols-1 lg:grid-cols-2 xl:grid-cols-3`. Must add `md:grid-cols-2` so tablets get two columns.
- All `hover:-translate-y-1` card lifts must be gated to hover-capable devices (use a custom utility or media-query approach).
- Run `npm run lint` and `npx vitest run` after changes.

## Suggested Skills to Invoke
- **`smksukokum-workflows`** — for project-specific conventions, data flow, and testing procedures.
- **`impeccable`** — if the implementing agent needs to reference the `craft`, `shape`, `adapt`, `layout`, or `polish` command references during implementation.
- **`diagnose`** — if any unexpected rendering bugs or performance regressions appear during testing.

## Next Steps
1. Implement Phase 1 (Foundation) — `index.html` + `src/index.css`
2. Implement Phase 2–5 (Dashboard layout) — `src/components/Dashboard.tsx`
3. Implement Phase 6–7 (StudentTable) — `src/components/StudentTable.tsx`
4. Implement Phase 8 (Sidebar + touch targets) — `src/components/DashboardSidebar.tsx`
5. Run lint and tests, verify at 320px / 768px / 1024px / 1440px viewports.

---
*Handoff generated for next agent to continue implementation.*
