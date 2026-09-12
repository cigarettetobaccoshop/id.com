-- R2 NUSANTARA additive activity monitoring.
-- No existing tables, columns, auth flow, or business tables are modified.

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.form_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  form_name text not null,
  payload jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  status text not null default 'submitted'
);

create table if not exists public.presence_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text not null,
  started_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists audit_log_user_id_idx on public.audit_log(user_id);
create index if not exists audit_log_created_at_idx on public.audit_log(created_at);
create index if not exists form_submissions_user_id_idx on public.form_submissions(user_id);
create index if not exists form_submissions_submitted_at_idx on public.form_submissions(submitted_at);
create index if not exists presence_sessions_user_id_idx on public.presence_sessions(user_id);
create index if not exists presence_sessions_started_at_idx on public.presence_sessions(started_at);
create index if not exists presence_sessions_last_seen_at_idx on public.presence_sessions(last_seen_at);

alter table public.audit_log enable row level security;
alter table public.form_submissions enable row level security;
alter table public.presence_sessions enable row level security;

create policy audit_log_insert_own on public.audit_log for insert to authenticated
with check (user_id is null or user_id = auth.uid());
create policy audit_log_select_own on public.audit_log for select to authenticated
using (user_id = auth.uid());

create policy form_submissions_insert_own on public.form_submissions for insert to authenticated
with check (user_id is null or user_id = auth.uid());
create policy form_submissions_select_own on public.form_submissions for select to authenticated
using (user_id = auth.uid());

create policy presence_sessions_insert_own on public.presence_sessions for insert to authenticated
with check (user_id is null or user_id = auth.uid());
create policy presence_sessions_select_own on public.presence_sessions for select to authenticated
using (user_id = auth.uid());
create policy presence_sessions_update_own on public.presence_sessions for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
