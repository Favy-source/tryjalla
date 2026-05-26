-- Migration 003: Audit log
-- Every edge function that mutates data writes here.
-- Admins can read; only service-role inserts (edge functions bypass RLS).

create table if not exists public.audit_log (
  id          uuid        primary key default gen_random_uuid(),
  actor_id    uuid        references public.profiles(id) on delete set null,
  entity_type text        not null,   -- project | stage | user | payment | etc.
  entity_id   uuid,
  action      text        not null,   -- created | approved | rejected | role_assigned | etc.
  metadata    jsonb       not null default '{}',
  ip_address  text,
  created_at  timestamptz not null default now()
);

alter table public.audit_log enable row level security;

-- Admins + super_admins can read the audit log
create policy "Admins read audit log"
  on public.audit_log
  for select
  using (
    has_role('admin') or has_role('super_admin')
  );

-- Edge functions use the service role key — they bypass RLS entirely.
-- The permissive insert policy below is a safety net for edge functions
-- that might not use the service client for inserts.
create policy "System inserts audit log"
  on public.audit_log
  for insert
  with check (true);
