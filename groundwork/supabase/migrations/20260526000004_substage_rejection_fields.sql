-- Migration 004: Substage rejection fields + status constraint
-- Adds fields used by approve-stage (Day 9) to flag individual substages.
-- Also locks down the status CHECK so invalid values are rejected at DB level.

-- Ensure status constraint includes 'rejected' (migration 002 already covers 'complete')
-- Drop and re-add if the old constraint was narrower (idempotent via DO block)
do $$ begin
  alter table public.project_substages
    drop constraint if exists project_substages_status_check;
  alter table public.project_substages
    add constraint project_substages_status_check
    check (status in ('not_started', 'in_progress', 'complete', 'rejected'));
exception when others then null;
end $$;

-- Rejection fields — set by a jala_professional or admin when a substage
-- fails inspection. The owner sees these and must re-upload evidence.
alter table public.project_substages
  add column if not exists rejection_note     text,
  add column if not exists rejected_at        timestamptz,
  add column if not exists rejected_by        uuid references public.profiles(id) on delete set null,
  add column if not exists requires_reupload  boolean not null default false;

-- Also add diff column to audit_log (from addendum: before/after diff viewer)
alter table public.audit_log
  add column if not exists diff jsonb;

-- Stage status constraint (idempotent)
do $$ begin
  alter table public.stages
    add constraint stages_status_check
    check (status in ('not_started', 'in_progress', 'awaiting_approval', 'completed'));
exception when duplicate_object then null;
end $$;
