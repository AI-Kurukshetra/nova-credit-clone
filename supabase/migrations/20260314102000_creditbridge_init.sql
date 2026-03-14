-- CreditBridge core schema
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text not null check (role in ('consumer', 'lender')),
  full_name text,
  metadata jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.countries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  bureau_name text not null,
  score_min int not null,
  score_max int not null,
  supported boolean not null default true
);

create table if not exists public.credit_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  home_country_id uuid not null references public.countries(id),
  foreign_score int,
  foreign_score_max int,
  translated_score int,
  risk_tier text check (risk_tier in ('excellent','good','fair','poor')),
  status text not null default 'pending' check (status in ('pending','processing','complete')),
  score_breakdown jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.credit_bureaus (
  id uuid primary key default gen_random_uuid(),
  country_id uuid not null references public.countries(id),
  name text not null,
  api_endpoint text
);

create table if not exists public.international_credit_reports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.credit_profiles(id) on delete cascade,
  bureau_id uuid not null references public.credit_bureaus(id),
  raw_data jsonb,
  processed_data jsonb,
  pulled_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  profile_id uuid not null references public.credit_profiles(id),
  doc_type text not null check (doc_type in ('credit_report','passport','bank_statement','other')),
  file_url text,
  status text not null default 'uploaded' check (status in ('uploaded','processing','verified','rejected')),
  uploaded_at timestamptz not null default now()
);

create table if not exists public.lenders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  company_name text not null,
  license_number text,
  webhook_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.credit_applications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.credit_profiles(id),
  lender_id uuid not null references public.lenders(id),
  status text not null default 'submitted' check (status in ('submitted','under_review','approved','denied','more_info_requested')),
  lender_notes text,
  recommendation text,
  decision_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.credit_profiles(id) on delete cascade,
  score_breakdown jsonb,
  flags text[],
  recommendation text,
  created_at timestamptz not null default now()
);

create table if not exists public.api_keys (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid not null references public.lenders(id) on delete cascade,
  key_hash text unique not null,
  key_prefix text not null,
  label text,
  last_used_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  lender_id uuid not null references public.lenders(id),
  event_type text not null,
  payload jsonb not null,
  delivered boolean not null default false,
  delivered_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trigger_credit_profiles_set_updated_at on public.credit_profiles;
create trigger trigger_credit_profiles_set_updated_at
before update on public.credit_profiles
for each row
execute function public.set_updated_at();

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_credit_profiles_user_id on public.credit_profiles(user_id);
create index if not exists idx_credit_profiles_home_country_id on public.credit_profiles(home_country_id);
create index if not exists idx_credit_profiles_status on public.credit_profiles(status);
create index if not exists idx_credit_bureaus_country_id on public.credit_bureaus(country_id);
create index if not exists idx_international_credit_reports_profile_id on public.international_credit_reports(profile_id);
create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_documents_profile_id on public.documents(profile_id);
create index if not exists idx_lenders_user_id on public.lenders(user_id);
create index if not exists idx_credit_applications_profile_id on public.credit_applications(profile_id);
create index if not exists idx_credit_applications_lender_id on public.credit_applications(lender_id);
create index if not exists idx_risk_assessments_profile_id on public.risk_assessments(profile_id);
create index if not exists idx_api_keys_lender_id on public.api_keys(lender_id);
create index if not exists idx_webhook_events_lender_id on public.webhook_events(lender_id);
create index if not exists idx_audit_logs_user_id on public.audit_logs(user_id);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);

alter table public.users enable row level security;
alter table public.countries enable row level security;
alter table public.credit_profiles enable row level security;
alter table public.credit_bureaus enable row level security;
alter table public.international_credit_reports enable row level security;
alter table public.documents enable row level security;
alter table public.lenders enable row level security;
alter table public.credit_applications enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.api_keys enable row level security;
alter table public.webhook_events enable row level security;
alter table public.audit_logs enable row level security;

-- users table policies
create policy users_select_own
on public.users
for select
using (auth.uid() = id);

create policy users_update_own
on public.users
for update
using (auth.uid() = id)
with check (auth.uid() = id);

-- countries can be read by authenticated users
create policy countries_select_all
on public.countries
for select
using (auth.role() = 'authenticated');

-- consumers read/update only own profiles
create policy credit_profiles_consumer_select
on public.credit_profiles
for select
using (auth.uid() = user_id);

create policy credit_profiles_consumer_update
on public.credit_profiles
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- lenders can read profiles linked to assigned applications
create policy credit_profiles_lender_select
on public.credit_profiles
for select
using (
  exists (
    select 1
    from public.credit_applications ca
    join public.lenders l on l.id = ca.lender_id
    where ca.profile_id = credit_profiles.id
      and l.user_id = auth.uid()
  )
);

create policy documents_consumer_select
on public.documents
for select
using (auth.uid() = user_id);

create policy documents_consumer_insert
on public.documents
for insert
with check (auth.uid() = user_id);

create policy documents_consumer_update
on public.documents
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy lenders_select_own
on public.lenders
for select
using (auth.uid() = user_id);

create policy lenders_update_own
on public.lenders
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy credit_applications_consumer_select
on public.credit_applications
for select
using (
  exists (
    select 1
    from public.credit_profiles cp
    where cp.id = credit_applications.profile_id
      and cp.user_id = auth.uid()
  )
);

create policy credit_applications_consumer_update
on public.credit_applications
for update
using (
  exists (
    select 1
    from public.credit_profiles cp
    where cp.id = credit_applications.profile_id
      and cp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.credit_profiles cp
    where cp.id = credit_applications.profile_id
      and cp.user_id = auth.uid()
  )
);

create policy credit_applications_lender_select
on public.credit_applications
for select
using (
  exists (
    select 1
    from public.lenders l
    where l.id = credit_applications.lender_id
      and l.user_id = auth.uid()
  )
);

create policy credit_applications_lender_update
on public.credit_applications
for update
using (
  exists (
    select 1
    from public.lenders l
    where l.id = credit_applications.lender_id
      and l.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lenders l
    where l.id = credit_applications.lender_id
      and l.user_id = auth.uid()
  )
);

create policy risk_assessments_consumer_select
on public.risk_assessments
for select
using (
  exists (
    select 1
    from public.credit_profiles cp
    where cp.id = risk_assessments.profile_id
      and cp.user_id = auth.uid()
  )
);

create policy risk_assessments_consumer_update
on public.risk_assessments
for update
using (
  exists (
    select 1
    from public.credit_profiles cp
    where cp.id = risk_assessments.profile_id
      and cp.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.credit_profiles cp
    where cp.id = risk_assessments.profile_id
      and cp.user_id = auth.uid()
  )
);

create policy risk_assessments_lender_select
on public.risk_assessments
for select
using (
  exists (
    select 1
    from public.credit_profiles cp
    join public.credit_applications ca on ca.profile_id = cp.id
    join public.lenders l on l.id = ca.lender_id
    where cp.id = risk_assessments.profile_id
      and l.user_id = auth.uid()
  )
);

create policy api_keys_lender_select
on public.api_keys
for select
using (
  exists (
    select 1
    from public.lenders l
    where l.id = api_keys.lender_id
      and l.user_id = auth.uid()
  )
);

create policy api_keys_lender_insert
on public.api_keys
for insert
with check (
  exists (
    select 1
    from public.lenders l
    where l.id = api_keys.lender_id
      and l.user_id = auth.uid()
  )
);

create policy api_keys_lender_update
on public.api_keys
for update
using (
  exists (
    select 1
    from public.lenders l
    where l.id = api_keys.lender_id
      and l.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.lenders l
    where l.id = api_keys.lender_id
      and l.user_id = auth.uid()
  )
);

create policy webhook_events_lender_select
on public.webhook_events
for select
using (
  exists (
    select 1
    from public.lenders l
    where l.id = webhook_events.lender_id
      and l.user_id = auth.uid()
  )
);

create policy audit_logs_insert_authenticated
on public.audit_logs
for insert
with check (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- explicitly deny non-service role reads on audit logs
revoke select on public.audit_logs from anon, authenticated;
