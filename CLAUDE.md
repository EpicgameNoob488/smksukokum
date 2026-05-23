# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `npm install`
- **Start development server**: `npm run dev` (runs Vite on http://localhost:3000)
- **Build production bundle**: `npm run build` (outputs to `dist/`)
- **Preview built app**: `npm run preview`
- **Run linting**: `npm run lint` (TypeScript type checking via `tsc --noEmit`)
- **Clean build artifacts**: `npm run clean`

Environment variables: `GEMINI_API_KEY` and Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) should be set in `.env.local` (see `.env.example`).

## Project Overview

This is a **kokurikulum (co-curricular) management system** for SM KONVEN ST. URSULA school. It tracks student activities, teacher assignments, PAJSK scores, and provides analytics dashboards for school administrators and teachers.

## High-Level Architecture

```
Supabase Database (Auth + Tables)
      ↓
dataService.ts (fetchSchoolData)
      ↓
DataContext → Dashboard → Data Processing
      ↓
kpiCalculations.ts + pajskCalculator.ts
      ↓
Charts (Recharts) + KPI Cards + Tables
```

- **Frontend**: React 19 with TypeScript, Vite 6, Tailwind CSS 4. Path alias `@/*` maps to project root.
- **State Management**: Three context providers — `DataContext` (school data fetching/caching), `SettingsContext` (school name/logo, localStorage persistence), `NotificationContext` (notifications, pending role refresh).
- **Backend**: Supabase (`@supabase/supabase-js`) for auth, database, and realtime. Edge functions via `src/lib/api.ts` for access requests, name matching, password reset. Google Gemini AI (`@google/genai`) is also integrated.
- **Routing**: State-based navigation in `App.tsx` — no React Router. Flow: `LandingPage → LoginPage → Dashboard → SettingsPage`.
- **Styling**: Design tokens in `src/lib/designTokens.ts` (primary red `#F04444`, navy `#131f5d`, etc.) mixed with Tailwind classes. The `cn()` utility in `src/lib/utils.ts` uses `clsx` + `tailwind-merge` for safe class merging.

## Data Flow Details

1. **Supabase Tables**: `management_team`, `form_classes`, `kokurikulum_units`, `students`, `user_roles`
2. **Data Service** (`src/lib/dataService.ts`): `fetchSchoolData()` queries Supabase or falls back to offline data
3. **Mappers** (`src/lib/supabaseMappers.ts`): Transform DB rows to UI-friendly formats (`mapUnit`, `mapManagement`, etc.)
4. **Calculations**: `kpiCalculations.ts` (dashboard KPIs, tri-pillar data, leadership density) and `pajskCalculator.ts` (student PAJSK scoring with grade scale)
5. **Offline Mode**: When Supabase env vars are missing, the app uses local/mock data from `src/data/*`

## Key Files

| Category | File Path |
|----------|-----------|
| Root App | `src/App.tsx` — auth flow, role-based access, layout |
| Dashboard | `src/components/Dashboard.tsx` — main UI (~1900 lines), tabs, filters |
| Supabase Client | `src/lib/supabase.ts` |
| Data Service | `src/lib/dataService.ts` |
| Edge Functions API | `src/lib/api.ts` |
| Data Context | `src/contexts/DataContext.tsx` |
| Settings Context | `src/contexts/SettingsContext.tsx` |
| Notification Context | `src/contexts/NotificationContext.tsx` |
| Supabase Mappers | `src/lib/supabaseMappers.ts` |
| KPI Calculations | `src/lib/kpiCalculations.ts` |
| PAJSK Calculator | `src/lib/pajskCalculator.ts` |
| Design Tokens | `src/lib/designTokens.ts` |
| CSV Export | `src/lib/csvExport.ts` |
| Name Matching | `src/lib/nameMatching.ts` |
| Utility (cn) | `src/lib/utils.ts` |
| Type Definitions | `src/types/dashboard.ts` |
| Auth Pages | `src/components/LoginPage.tsx`, `RegisterPage.tsx`, `ResetPasswordPage.tsx` |
| Modal Editing | `src/components/EditTeacherModal.tsx` |
| Student Table | `src/components/StudentTable.tsx` |

## Typical Workflows

1. **Adding a new tab or view**:
   - Update `navItems` in the relevant component.
   - Add route-handling logic in `App.tsx` or `Dashboard`.
   - Create/modify the component rendering the view.

2. **Modifying data fetching**:
   - Adjust queries in `useSchoolData` (DataContext) or `dataService.ts`.
   - Update mapper functions in `src/lib/supabaseMappers.ts`.

3. **Changing UI style**:
   - Edit design tokens in `src/lib/designTokens.ts` or adjust Tailwind classes.
   - Some components define local `tokens` objects rather than importing from `designTokens.ts` — check both.

4. **Handling role-based access**:
   - Update `validateRoleAccess` logic in `App.tsx`.
   - Modify filter logic in `canEditStudent`, `canAddStudent` within `Dashboard`.

## Testing and Validation

- Run `npm run lint` for TypeScript type correctness.
- Verify UI changes via `npm run dev` and interact with the relevant sections.
- Confirm CSV exports by using the Export actions in the UI.

## Common Pitfalls

- **Offline Mode**: In offline mode the app uses mock data and bypasses Supabase calls. Ensure any changes to data fetching respect the `isOfflineMode` flag.
- **Role-Based Routing**: Access control is enforced client-side; do not rely solely on UI checks for security-critical operations.
- **Filter Mode Interactions**: Filters affect multiple chart datasets; changing one filter may affect others unexpectedly due to shared state.
- **Mixed Styling Patterns**: Components use both design token imports and inline style objects. Be aware of both patterns when modifying styles.
- **Dashboard Size**: `Dashboard.tsx` is ~1900 lines — the largest component. Consider splitting logic when adding significant new features.
