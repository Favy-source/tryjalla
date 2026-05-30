-- Migration 007: Contractor directory
-- contractors: vetted construction professionals
-- contractor_inquiries: client → contractor contact requests (hybrid+ only)
-- contractor_reviews: client ratings after working with a contractor
-- saved_contractors: bookmarked contractors per user

create table public.contractors (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  company_name    text,
  primary_specialty text      not null,
  specialties     text[]      not null default '{}',
  country         text        not null,
  region          text,
  bio             text,
  phone           text,
  email           text,
  portfolio_url   text,
  avatar_url      text,
  is_verified     boolean     not null default false,
  verified_at     timestamptz,
  rating          numeric     not null default 0 check (rating >= 0 and rating <= 5),
  review_count    integer     not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger contractors_updated_at
  before update on public.contractors
  for each row execute function public.update_updated_at();

create index contractors_country_idx   on public.contractors (country);
create index contractors_specialty_idx on public.contractors (primary_specialty);
create index contractors_rating_idx    on public.contractors (rating desc);

create table public.contractor_inquiries (
  id                uuid        primary key default gen_random_uuid(),
  client_id         uuid        not null references public.profiles(id) on delete cascade,
  contractor_id     uuid        not null references public.contractors(id) on delete cascade,
  project_id        uuid        references public.projects(id) on delete set null,
  message           text        not null,
  budget_range      text,
  start_window      text,
  preferred_contact text,
  status            text        not null default 'new'
    check (status in ('new', 'in_review', 'introduced', 'hired', 'closed')),
  admin_note        text,
  resolved_at       timestamptz,
  created_at        timestamptz not null default now()
);

create index contractor_inquiries_client_idx     on public.contractor_inquiries (client_id);
create index contractor_inquiries_contractor_idx on public.contractor_inquiries (contractor_id);

create table public.contractor_reviews (
  id            uuid        primary key default gen_random_uuid(),
  contractor_id uuid        not null references public.contractors(id) on delete cascade,
  reviewer_id   uuid        not null references public.profiles(id) on delete cascade,
  rating        integer     not null check (rating between 1 and 5),
  headline      text,
  body          text,
  created_at    timestamptz not null default now(),
  unique (contractor_id, reviewer_id)
);

create table public.saved_contractors (
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  contractor_id uuid        not null references public.contractors(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (user_id, contractor_id)
);

-- RLS
alter table public.contractors          enable row level security;
alter table public.contractor_inquiries enable row level security;
alter table public.contractor_reviews   enable row level security;
alter table public.saved_contractors    enable row level security;

-- Public directory — anyone can read (contact details gated in app via TierGate)
create policy "Anyone reads contractor listing"
  on public.contractors for select using (true);

create policy "Admins manage contractors"
  on public.contractors for all
  using (has_role('admin') or has_role('super_admin'));

-- Inquiries: client reads/inserts own; admins read all
create policy "Client reads own inquiries"
  on public.contractor_inquiries for select using (client_id = auth.uid());
create policy "Admins read all inquiries"
  on public.contractor_inquiries for select
  using (has_role('admin') or has_role('super_admin'));
create policy "Client inserts inquiry"
  on public.contractor_inquiries for insert
  with check (client_id = auth.uid());

-- Reviews: public read; one review per user per contractor enforced by unique constraint
create policy "Anyone reads reviews"
  on public.contractor_reviews for select using (true);
create policy "Client inserts own review"
  on public.contractor_reviews for insert
  with check (reviewer_id = auth.uid());
create policy "Client updates own review"
  on public.contractor_reviews for update
  using (reviewer_id = auth.uid());

-- Saved contractors: per-user CRUD
create policy "User manages saved contractors"
  on public.saved_contractors for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
