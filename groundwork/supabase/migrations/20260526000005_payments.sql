-- Migration 005: Payments + payment_events tables
-- payments: one row per stage per project (the "invoice")
-- payment_events: one row per installment paid against a payment record

create table public.payments (
  id             uuid        primary key default gen_random_uuid(),
  project_id     uuid        not null references public.projects(id) on delete cascade,
  stage_id       uuid        not null references public.stages(id) on delete cascade,
  amount         numeric     not null check (amount > 0),
  currency       text        not null default 'NGN',
  status         text        not null default 'pending'
    check (status in ('pending', 'partial', 'paid', 'refunded')),
  payment_method text
    check (payment_method in ('bank_transfer','cash','mobile_money','cheque','other')),
  receipt_url    text,
  notes          text,
  recorded_by    uuid        references public.profiles(id) on delete set null,
  paid_at        timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (project_id, stage_id)
);

create table public.payment_events (
  id          uuid        primary key default gen_random_uuid(),
  payment_id  uuid        not null references public.payments(id) on delete cascade,
  amount      numeric     not null check (amount > 0),
  receipt_url text,
  notes       text,
  recorded_by uuid        references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Trigger: keep payments.updated_at current
create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.update_updated_at();

-- Indexes
create index payments_project_id_idx on public.payments (project_id);
create index payments_stage_id_idx   on public.payments (stage_id);
create index payments_status_idx     on public.payments (project_id, status);
create index payment_events_payment_id_idx on public.payment_events (payment_id);

-- RLS
alter table public.payments enable row level security;
alter table public.payment_events enable row level security;

-- Realtime
alter publication supabase_realtime add table public.payments;

-- payments policies
create policy "Owner reads own project payments"
  on public.payments for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

create policy "Professionals read assigned project payments"
  on public.payments for select
  using (has_role('jala_professional') or has_role('admin') or has_role('super_admin'));

create policy "Owner inserts payments for own projects"
  on public.payments for insert
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

create policy "Owner updates own project payments"
  on public.payments for update
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

create policy "Professionals update assigned project payments"
  on public.payments for update
  using (has_role('jala_professional') or has_role('admin') or has_role('super_admin'));

-- payment_events policies
create policy "Owner reads own payment events"
  on public.payment_events for select
  using (
    exists (
      select 1 from public.payments pm
      join public.projects p on p.id = pm.project_id
      where pm.id = payment_id and p.owner_id = auth.uid()
    )
  );

create policy "System inserts payment events"
  on public.payment_events for insert
  with check (true);
