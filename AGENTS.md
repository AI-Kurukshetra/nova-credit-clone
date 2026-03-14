# CreditBridge Agent Instructions

## Project Overview
CreditBridge is a cross-border credit intelligence SaaS platform.

Two user roles:
- Consumer (immigrant)
- Lender (bank/credit union)

## Tech Stack
- Next.js 15, App Router, TypeScript (strict mode)
- Supabase (auth + PostgreSQL, RLS enabled on all tables)
- Tailwind CSS + shadcn/ui for UI components
- Zod for all input validation
- Recharts for charts
- Vercel deployment target

## Folder Structure
- `/app/(auth)` login, signup, onboarding
- `/app/(consumer)` consumer dashboard routes
- `/app/(lender)` lender portal routes
- `/app/api/v1` REST API route handlers only
- `/components/ui` shadcn components only
- `/components/shared` shared layout components
- `/lib/supabase` browser/server clients
- `/lib/credit-engine.ts` credit translation logic
- `/lib/validations.ts` all Zod schemas
- `/scripts/seed.ts` demo data seed script

## Naming
- Files: kebab-case
- Components: PascalCase
- Functions: camelCase
- DB tables: snake_case
- API routes: kebab-case

## Core Rules

### Supabase
- Never import `SUPABASE_SERVICE_ROLE_KEY` outside `/lib/supabase/server.ts` and `/app/api/**`.
- Route handlers and server components must use server client.
- Client components must use browser client.
- RLS must be enabled on every table.

### API Routes
- Validate `Authorization: Bearer <api_key>` first.
- Return `{ data, error, meta: { timestamp, request_id } }`.
- Write to `audit_logs` on every API call.
- Never expose internal error messages.
- Validate request body with Zod from `/lib/validations.ts`.

### Forms and UI
- Use Zod schemas from `/lib/validations.ts`.
- Show field-level errors.
- Disable submit while request is in flight.
- Use shadcn components.
- Show Skeleton states for data fetches.
- Show empty states for empty arrays.
- Use Sonner for notifications.

### TypeScript
- No `any`.
- Add return types on exported functions.
- Keep schemas in `/lib/validations.ts` and derive with `z.infer`.

### Security
- Never log sensitive fields (passwords, passport numbers, full reports).
- Hash API keys before storage, keep only `key_prefix` in plaintext.
- Sanitize and trim text inputs.
- Mask consumer PII in lender-facing views (`"Priya S."` format).

## Credit Translation Rules
Use formulas in `/lib/credit-engine.ts`:
- UK (0-999): `Math.round((score / 999) * 550 + 300)`
- CA (300-900): `Math.round((score - 300) / 600 * 550 + 300)`
- AU (0-1200): `Math.round((score / 1200) * 550 + 300)`
- IN (300-900): `Math.round((score - 300) / 600 * 500 + 300)`
- MX (400-850): `Math.round((score - 400) / 450 * 500 + 300)`

Risk tiers:
- `750-850`: excellent
- `670-749`: good
- `580-669`: fair
- `300-579`: poor

## Hard Rules
- Supabase auth only (no next-auth).
- Never call real external bureau APIs (mock data only).
- Never store API keys in plaintext.
- Never use localStorage for auth tokens.
- Never use `any`.

## Required Verification Before Completion
1. `npx tsc --noEmit`
2. `next build`
3. Confirm RLS enabled on any new table
4. Confirm no service role key in client files
5. Confirm Zod validation on new forms and API endpoints
