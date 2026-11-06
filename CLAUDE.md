# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

สมุดเงิน (Samut Ngoen) — a personal income/expense tracker. Next.js App Router + TypeScript + Supabase (Auth + Postgres with RLS). UI text, comments and README are in Thai; dates display in Buddhist Era (พ.ศ.).

`AGENTS.md` warns that this Next.js version (16.x) has breaking changes from older versions. Read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js-specific code. Note that `src/proxy.ts` (not `middleware.ts`) is the request interceptor here.

## Commands

```bash
npm run dev         # dev server on http://localhost:3000
npm run build       # production build
npm run typecheck   # tsc --noEmit
```

There is no linter and no test suite. Verify with `npm run typecheck`. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`). The database schema is applied manually by running `supabase/schema.sql` in the Supabase SQL Editor (no migrations tooling).

## Architecture

- **Auth gate lives in `src/proxy.ts` → `src/lib/supabase/proxy.ts` (`updateSession`).** It refreshes the Supabase session cookie on every request, redirects unauthenticated users to `/login` and logged-in users away from it. If Supabase env vars are missing (`isSupabaseConfigured` in `src/lib/supabase/env.ts`), every route redirects to `/login`, which shows setup instructions (`SetupNotice`). Keep `createServerClient` and `getClaims()` adjacent with nothing in between.
- **Supabase access is server-only.** `src/lib/supabase/server.ts` builds the client from `next/headers` cookies; `src/lib/data.ts` imports `server-only` and holds all queries plus `summarize()`. There is no browser Supabase client; mutations go through Server Actions.
- **Routes:** `src/app/(app)/` is the authenticated shell (overview `page.tsx`, `add`, `transactions`, `stats`, `account`) with mutations in `(app)/actions.ts` (add/delete transaction, sign out, using `useActionState`-style `FormState`). `src/app/login/` has its own actions. `src/app/api/export/route.ts` streams the CSV export.
- **Month selection** is a `?m=YYYY-MM` search param; pages call `getMonthTransactions(month)` then `summarize(month, txs)`.
- **Data model** (`supabase/schema.sql`, types in `src/lib/types.ts`): `categories` and `transactions`, both protected by Row Level Security per user; a trigger seeds default categories for new users. Security is enforced in the DB, and Server Actions additionally validate all input.

## Conventions

- **Money is stored as integer satang** (85 baht = 8500). Convert only for display/parsing via `src/lib/format.ts` (`parseBahtToSatang`, etc.).
- **Summaries are never stored**; always computed from transactions.
- **Dates use Asia/Bangkok** (`todayInBangkok`, `monthRange` in `format.ts`), not the server's local timezone.
- App name/tagline are defined only in `src/lib/config.ts`.
- Styling is a single `src/app/globals.css` (light/dark themes); dark mode toggled via `ThemeToggle`. Path alias `@/*` → `src/*`.
- Known unimplemented: editing transactions, custom category management, notifications, automated tests.
