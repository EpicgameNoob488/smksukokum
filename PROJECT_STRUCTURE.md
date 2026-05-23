# Project: smksukokum-fix

**Type:** React + Vite + TypeScript + Supabase web application (Kokurikulum management system)

**Tech Stack:**
- Frontend: React 19, TypeScript, TailwindCSS 4, Recharts, Lucide React
- Backend: Express, better-sqlite3
- Database: Supabase (local + cloud)
- AI: Google Gemini API

**Key Directories:**
- `src/` - Main source code (App.tsx, components/, contexts/, data/, lib/, types/)
- `supabase/` - Local Supabase config
- `smksukokum-fix/` - Another app copy
- `dist/` - Build output

**Config Files:**
- `package.json` - Dependencies (react, vite, tailwindcss, supabase-js, express, better-sqlite3)
- `vite.config.ts`, `tsconfig.json`
- `.env` - Local environment variables
- `index.html` - Entry point

**Scripts:**
- `npm run dev` - Development server (port 3000)
- `npm run build` - Production build
- `npm run lint` - TypeScript check

**Project Purpose:** School curriculum (Kokurikulum) management system with AI features, supporting student data, curriculum units, and filtering capabilities. Uses Supabase for data storage.