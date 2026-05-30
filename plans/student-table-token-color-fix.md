# Plan: Student Table Token-Based Color Fix

## Problem
`src/components/StudentTable.tsx` uses hardcoded Tailwind colors (`bg-white`, `bg-transparent`, `bg-slate-50`, `border-slate-200`, `text-slate-*`) instead of the project's design tokens (`tokens.colors.*`). This causes:
1. Ugly zebra striping (odd rows transparent show `cardOuterBg` blue-gray through white container)
2. Broken dark mode (hardcoded colors don't adapt)
3. Sticky student column `bg-white` clashes with alternating rows

## Solution
Replace all hardcoded color classes with inline `style` props using `tokens.colors.*`. No structural or logic changes.

## Detailed Changes

### 1. Table Container (around line 427)
- **Keep:** `backgroundColor: tokens.colors.cardOuterBg`

### 2. Table Row Backgrounds (around line 470-474)
- **Current:** `isEvenRow ? "bg-white" : "bg-transparent"`
- **Fix:** Remove both classes. Add `style={{ backgroundColor: tokens.colors.cardInnerBg }}` to the `<tr>` element.
- **Also remove:** `hover:bg-orange-50` (card-style hover inappropriate for table rows)

### 3. Expanded Row (around line 556)
- **Current:** `style={{ backgroundColor: tokens.colors.trendGreenBg }}`
- **Fix:** Change to `tokens.colors.cardOuterBg` or remove the green glow

### 4. Sticky Student Header `th` (around line 441)
- **Current:** `bg-white` in className
- **Fix:** Remove `bg-white`, add `style={{ backgroundColor: tokens.colors.cardInnerBg }}`

### 5. Sticky Student Cell `td` (around line 486)
- **Current:** `bg-white` in className
- **Fix:** Remove `bg-white`, add `style={{ backgroundColor: tokens.colors.cardInnerBg }}` (already has style prop for color, add backgroundColor)

### 6. Filter Panel (around line 338)
- **Current:** `bg-white border border-slate-200`
- **Fix:** Change to use token backgrounds/borders

### 7. PAJSK Breakdown Cards (around line 681-713)
- **Current:** `bg-slate-50`
- **Fix:** `style={{ backgroundColor: tokens.colors.cardOuterBg }}`

### 8. Pagination Text Colors (around lines 728-787)
- **Current:** `text-slate-300`, `text-slate-400`, `text-slate-600`, `text-slate-300`, `text-white`
- **Fix:** Use `tokens.colors.textMuted`, `tokens.colors.textNavy`, `tokens.colors.cardInnerBg`

### 9. Show Filters Button (around line 281)
- **Current:** `bg-slate-800 text-white border-slate-800`
- **Fix:** Use token colors for active state

### 10. Filter Labels (around line 340)
- **Current:** `text-slate-400` in `ChevronDown` icons
- **Fix:** `style={{ color: tokens.colors.textMuted }}`

### 11. No Students Found Message (around line 429)
- **Current:** `text-slate-400` background area
- **Fix:** Already uses `tokens.colors.textMuted` — fine

## Verification
- `npm run lint`
- `npx vitest run`
- Manual check at 320px / 768px / 1536px viewports
