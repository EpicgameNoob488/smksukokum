# Handoff: Design Token Refactoring – Phase 3

**Conversation date:** 2026-05-30
**Branch:** `refactor/design-tokens-alignment`
**Previous phases:** Phases 1 & 2 complete (see `plans/design-token-refactor-handoff.md`)
**Phase 2 summary:** Dashboard.tsx, DashboardHeader.tsx, DashboardSidebar.tsx, kpiCalculations.ts refactored. New tokens added (`chartEliteRed`, `DT.transition.slower`). Lint, build, and 71/71 tests pass.

---

## Phase 3 Target Files

Six components need centralizing. Unlike Phase 2 (which changed the giant Dashboard.tsx), these are smaller, more self-contained files.

| File | Lines | Issue |
|------|-------|-------|
| **StudentTable.tsx** | ~620 | Defines **inline duplicate** of `DT` object (lines 30-58). Delete local, import from `designTokens.ts`. Also uses structural Tailwind classes via `tokens` prop. |
| **SearchableDropdown.tsx** | ~170 | Hardcodes `#2B3674` (accentNavy value) in 3 places. No token imports. No `tokens` prop. |
| **NotificationBell.tsx** | ~120 | Already imports `tokens` directly. Needs structural Tailwind cleanup (bg-white, border-slate, shadow-sm). |
| **NotificationPanel.tsx** | ~200 | Fully hardcoded. No token usage. Hardcodes `#2B3674`. Uses extensive structural Tailwind. |
| **ExcelUploadModal.tsx** | ~300 | Receives `tokens` as prop but uses hardcoded structural Tailwind. |
| **EditTeacherModal.tsx** | ~350 | Receives `tokens` as prop but uses hardcoded structural Tailwind. |

---

## Per-File Approach

### 1. StudentTable.tsx — Delete Inline DT

Priority: **High** (most broken — complete duplicate of centralized DT)

```typescript
// DELETE lines 30-58 (the entire inline DT definition):
const DT = {
  radius: { sm: 'rounded-lg', md: 'rounded-xl', lg: 'rounded-2xl', xl: 'rounded-3xl', full: 'rounded-full' },
  shadow: { sm: 'shadow-sm', md: 'shadow-md', lg: 'shadow-lg', xl: 'shadow-xl', modal: 'shadow-2xl', ... },
  spacing: { ... },
  transition: { ... },
};

// ADD import:
import { tokens, DT } from '../lib/designTokens';
```

**IMPORTANT:** StudentTable already receives `tokens` as a prop. After adding the centralized `DT` import, remove `DT` from the prop interface. The prop `tokens` should stay until the component is refactored to import its own (or we keep prop-passing for now).

**Approach for remaining structural Tailwind:** Same pattern as Phase 2 — replace `bg-white`/`border-slate-200`/`bg-slate-*` with inline `style={{ backgroundColor: tokens.colors.cardInnerBg }}` etc. Replace `shadow-sm`/`rounded-*` with `DT.*` in className template literals. Keep semantic colors (`red-100`, `green-50`, `orange-50`, etc.).

### 2. SearchableDropdown.tsx — Add Token Imports

Priority: **High** (hardcoded hex #2B3674)

```typescript
// ADD imports:
import { tokens, DT } from '../lib/designTokens';

// Replace hardcoded hex:
'text-[#2B3674]'       → style={{ color: tokens.colors.accentNavy }}
'font-bold text-[#2B3674]' → style={{ color: tokens.colors.accentNavy }}
```

Also replace structural Tailwind: `bg-white` → inline `cardInnerBg`, `border-slate-200` → inline `lightBorder`, `shadow-lg` → `${DT.shadow.lg}`, `rounded-xl` → `${DT.radius.md}`, `rounded-full` → `${DT.radius.full}`, `duration-150` → `${DT.transition.fast}`.

**Note:** SearchableDropdown does NOT receive `tokens` as a prop. Add direct import.

### 3. NotificationBell.tsx — Structural Tailwind Cleanup

Priority: **Medium** (already imports `tokens`, just needs class cleanups)

Already does `import { tokens } from '../lib/designTokens'`. Add `DT` to the import. Then replace:
- `bg-white` → inline `cardInnerBg`
- `border-slate-200` → inline `lightBorder`
- `shadow-sm` → `${DT.shadow.sm}`
- `rounded-full` → `${DT.radius.full}`
- `hover:bg-slate-50` → keep (matches hoverBg value)

### 4. NotificationPanel.tsx — Full Token Integration

Priority: **Medium** (fully hardcoded, no token usage)

```typescript
// ADD imports:
import { tokens, DT } from '../lib/designTokens';
```

Replace hardcoded `#2B3674` → `tokens.colors.accentNavy`. Apply structural Tailwind replacements per Phase 2 pattern.

### 5. ExcelUploadModal.tsx — Prop-Based Structural Cleanup

Priority: **Medium** (already receives `tokens` as prop)

```typescript
// ADD import (for DT utilities):
import { DT } from '../lib/designTokens';
```

Apply structural replacements using `tokens` prop values + `DT.*` for radius/shadow/transition. Keep semantic Tailwind colors.

### 6. EditTeacherModal.tsx — Prop-Based Structural Cleanup

Priority: **Medium** (already receives `tokens` as prop)

Same pattern as ExcelUploadModal — add `DT` import, apply structural replacements.

---

## Key Replacement Patterns (Identical to Phase 2)

| Tailwind Class | Replace With | Notes |
|---------------|-------------|-------|
| `bg-white` | `style={{ backgroundColor: tokens.colors.cardInnerBg }}` | Same hex (#ffffff) |
| `bg-slate-50` | `style={{ backgroundColor: tokens.colors.hoverBg }}` | Same hex (#f8fafc) |
| `bg-slate-100` | `style={{ backgroundColor: tokens.colors.cardOuterBg }}` | #f1f4fb |
| `border-slate-200` | `style={{ borderColor: tokens.colors.lightBorder }}` | Same hex (#e2e8f0) |
| `border-slate-100` | `style={{ borderColor: tokens.colors.lighterBorder }}` | Same hex (#f1f5f9) |
| `text-[#2B3674]` | `style={{ color: tokens.colors.accentNavy }}` | SearchableDropdown specific |
| `rounded-full` | `${DT.radius.full}` | |
| `rounded-xl` | `${DT.radius.md}` | |
| `rounded-2xl` | `${DT.radius.lg}` | |
| `rounded-lg` | `${DT.radius.sm}` | |
| `shadow-sm` | `${DT.shadow.sm}` | |
| `shadow-lg` | `${DT.shadow.lg}` | |
| `shadow-2xl` | `${DT.shadow.modal}` | |
| `duration-150` | `${DT.transition.fast}` | |
| `duration-200` | `${DT.transition.normal}` | |
| `duration-300` | `${DT.transition.slow}` | |
| `hover:bg-slate-50` | **Keep as-is** | Matches hoverBg value |
| Semantic colors | **Keep as-is** | red-*, green-*, amber-*, orange-*, etc. |

---

## Verification Gate

After refactoring each file, run:
```
npm run lint    # tsc --noEmit
npx vitest run  # 71 tests across 13 files
```

All must pass with zero regressions. No visual changes expected — this is internal architectural cleanup.

---

## Phase 4 (After Phase 3)

Auth pages and top-level files — see Phase 4 section in `plans/design-token-refactor-handoff.md`.

---

## Suggested Skills

- **`smksukokum-workflows`** — project-specific workflows for modifying UI and understanding component dependencies.
- **`diagnose`** — if lint, build, or tests fail during refactoring.

---

## Key Files Reference

- `src/lib/designTokens.ts` — centralized token definitions (colors + DT utilities)
- `src/components/Dashboard.tsx:30` — reference for correct import pattern
- `DESIGN.md` — design system spec (colors, typography, elevation, components)
- `plans/design-token-refactor-handoff.md` — Phase 1 & 2 history and locked decisions
- `AGENTS.md` — dev commands and important conventions
