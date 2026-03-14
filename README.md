# CreditBridge

CreditBridge is a cross-border credit intelligence platform that translates immigrant credit history into a US-readable lending profile.

## Stack

- Next.js 15 (App Router, TypeScript strict mode)
- Supabase (Auth + PostgreSQL + RLS)
- Tailwind CSS + shadcn/ui
- Recharts
- Zod validation
- Vercel deployment target

## Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CREDITBRIDGE_SERVICE_ROLE_KEY=your-service-role-key
CREDITBRIDGE_ALLOWED_ORIGIN=https://yourdomain.vercel.app
CREDITBRIDGE_WEBHOOK_SECRET=your-webhook-secret
```

`CREDITBRIDGE_SERVICE_ROLE_KEY` is used by `scripts/seed.ts`. If it is unset, the seed script also checks `SUPABASE_SERVICE_ROLE_KEY`.

For direct Postgres clients, use a pooled URL in production:

```bash
SUPABASE_DB_URL=postgresql://.../postgres?pgbouncer=true&connection_limit=1
```

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

## Database Setup

1. Open your Supabase SQL editor.
2. Run [`supabase/migrations/20260314102000_creditbridge_init.sql`](./supabase/migrations/20260314102000_creditbridge_init.sql).
3. Confirm all tables are created and RLS is enabled.

## Seed Demo Data

```bash
npx ts-node scripts/seed.ts
```

Seed script provisions:

- 5 supported countries
- 5 demo consumers (password: `Demo@1234`)
- 2 demo lenders (password: `Demo@1234`)
- credit profiles, risk assessments, timeline entries, documents, applications, and API keys

## Key Routes

- Landing page: `/`
- Consumer onboarding: `/onboard`
- Consumer dashboard: `/dashboard`
- Lender onboarding: `/lender/onboard`
- Lender dashboard: `/lender/dashboard`
- External API: `/api/v1/*`

## Verification Commands

```bash
npx tsc --noEmit
npx next build
```

## Deploy to Vercel

1. Push repository to GitHub.
2. Import in Vercel.
3. Add environment variables listed above.
4. Deploy.
5. Run `npx ts-node scripts/seed.ts` against production Supabase.

## Smoke Test Checklist

- Landing page renders all sections and is responsive.
- Consumer can complete 5-step onboarding.
- Consumer dashboard shows score, gauge, breakdown, flags.
- Document upload interactions work.
- Lender dashboard shows seeded applications and decisions.
- API endpoints require API key and return envelope format.
- Mobile layout works at 375px for landing + consumer dashboard.
