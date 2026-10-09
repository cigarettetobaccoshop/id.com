
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null default '',
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

revoke all on table public.contact_messages from anon, authenticated;

create or replace function public.submit_contact_message(
  p_name text,
  p_email text,
  p_subject text,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if exists (
    select 1
    from public.contact_messages
    where lower(email) = lower(trim(p_email))
      and message = trim(p_message)
      and subject = trim(coalesce(p_subject, ''))
      and created_at > now() - interval '5 minutes'
  ) then
    raise exception 'Duplicate submission';
  end if;

  insert into public.contact_messages (name, email, subject, message)
  values (
    trim(p_name),
    lower(trim(p_email)),
    trim(coalesce(p_subject, '')),
    trim(p_message)
  );
end;
$$;

revoke all on function public.submit_contact_message(text, text, text, text) from public;
grant execute on function public.submit_contact_message(text, text, text, text) to anon, authenticated;
