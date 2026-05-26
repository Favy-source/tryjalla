# Groundwork — Complete Engineering Blueprint

**Purpose:** Rebuild Groundwork from scratch using Claude Code in IDE with proper engineering practices.
**Date:** 26 May 2026
**For:** Favour Nwachukwu (Lead Engineer), Philip N. Tete (Founder)

---

## Part 1 — Project Setup

### Stack

```
Frontend:    React 18 + TypeScript + Vite
Styling:     Tailwind CSS 4 + shadcn/ui
Backend:     Supabase (Postgres + Auth + Storage + Edge Functions + Realtime)
Email:       Resend
Charts:      Recharts
Animation:   Framer Motion
Testing:     Vitest (unit) + Playwright (e2e)
Deployment:  Supabase-hosted Edge Functions + Vercel (or Netlify) for frontend
```

### Directory structure

```
groundwork/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # lint + type-check + test on every PR
│       └── deploy.yml                # deploy frontend + edge functions
├── src/
│   ├── app/
│   │   ├── routes/                   # file-based routing (React Router v7)
│   │   │   ├── _layout.tsx           # root layout (sidebar, auth gate)
│   │   │   ├── _auth-layout.tsx      # auth pages layout (split screen)
│   │   │   ├── auth/
│   │   │   │   ├── login.tsx
│   │   │   │   ├── signup.tsx
│   │   │   │   ├── reset-password.tsx
│   │   │   │   ├── callback.tsx
│   │   │   │   └── accept-invite.$token.tsx
│   │   │   ├── dashboard.tsx
│   │   │   ├── projects/
│   │   │   │   ├── index.tsx         # My Projects grid
│   │   │   │   ├── new/
│   │   │   │   │   └── index.tsx     # 9-step creation wizard
│   │   │   │   └── $projectId/
│   │   │   │       ├── index.tsx     # Project detail (overview tab)
│   │   │   │       ├── stages.tsx
│   │   │   │       ├── payments.tsx
│   │   │   │       ├── documents.tsx
│   │   │   │       ├── chat.tsx
│   │   │   │       └── team.tsx
│   │   │   ├── contractors/
│   │   │   │   ├── index.tsx         # Directory listing
│   │   │   │   └── $contractorId.tsx # Contractor profile
│   │   │   ├── payments.tsx          # Payment history
│   │   │   ├── notifications.tsx
│   │   │   ├── settings.tsx
│   │   │   ├── help.tsx
│   │   │   ├── pricing.tsx           # Public pricing page
│   │   │   ├── verify.$token.tsx     # Public certificate verification
│   │   │   ├── tools/
│   │   │   │   ├── index.tsx         # Tools landing
│   │   │   │   ├── budget-calculator.tsx
│   │   │   │   ├── stage-planner.tsx
│   │   │   │   ├── payment-milestones.tsx
│   │   │   │   ├── project-tracker.tsx
│   │   │   │   └── resources/
│   │   │   │       ├── index.tsx
│   │   │   │       └── $slug.tsx
│   │   │   └── admin/
│   │   │       ├── _layout.tsx       # Admin layout (dark sidebar)
│   │   │       ├── index.tsx         # Command center dashboard
│   │   │       ├── projects/
│   │   │       │   ├── index.tsx     # All projects table
│   │   │       │   ├── new.tsx       # Create-for-client wizard
│   │   │       │   └── $projectId.tsx # Admin project detail
│   │   │       ├── professionals.tsx
│   │   │       ├── contractors.tsx
│   │   │       ├── clients.tsx
│   │   │       ├── users.tsx         # Users table (all roles)
│   │   │       ├── payments.tsx
│   │   │       ├── certificates.tsx
│   │   │       ├── documents.tsx
│   │   │       ├── subscriptions.tsx
│   │   │       ├── funnel.tsx
│   │   │       ├── audit-log.tsx
│   │   │       ├── email-health.tsx
│   │   │       ├── leads.tsx         # Budget calculator leads
│   │   │       └── settings.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── ui/                       # shadcn/ui primitives (button, input, dialog, etc.)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   ├── TierBadge.tsx
│   │   │   └── NotificationBell.tsx
│   │   ├── auth/
│   │   │   ├── AuthForm.tsx
│   │   │   ├── GoogleOAuthButton.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectWizard/
│   │   │   │   ├── WizardShell.tsx       # progress bar + navigation
│   │   │   │   ├── StepCountry.tsx
│   │   │   │   ├── StepProjectType.tsx
│   │   │   │   ├── StepBuildingType.tsx  # with illustrations
│   │   │   │   ├── StepFloors.tsx
│   │   │   │   ├── StepRooms.tsx         # total or per-floor toggle
│   │   │   │   ├── StepBoysQuarters.tsx
│   │   │   │   ├── StepRoofType.tsx
│   │   │   │   ├── StepDetails.tsx       # name + budget
│   │   │   │   └── StepSummary.tsx
│   │   │   ├── StageList.tsx
│   │   │   ├── StageAccordion.tsx
│   │   │   ├── SubstageRow.tsx
│   │   │   ├── SubstageProgress.tsx
│   │   │   ├── BudgetDonut.tsx
│   │   │   ├── FloorCostBreakdown.tsx
│   │   │   ├── PaymentMilestones.tsx
│   │   │   ├── ProjectChat.tsx
│   │   │   ├── DocumentVault.tsx
│   │   │   ├── ContractorTeamCard.tsx
│   │   │   ├── AssignedProfessionalCard.tsx
│   │   │   ├── DeliverableChecklist.tsx
│   │   │   ├── StageApprovalControls.tsx # tier-aware: self-verify vs submit for review
│   │   │   ├── RejectionBanner.tsx
│   │   │   ├── CertificateCard.tsx
│   │   │   └── ProgressGauge.tsx
│   │   ├── contractors/
│   │   │   ├── ContractorCard.tsx        # with blurred contact for free tier
│   │   │   ├── ContractorProfile.tsx
│   │   │   ├── InquiryForm.tsx
│   │   │   ├── ReviewsList.tsx
│   │   │   ├── LeaveReviewDialog.tsx
│   │   │   └── InviteContractorDialog.tsx
│   │   ├── pricing/
│   │   │   ├── PricingCards.tsx
│   │   │   └── PricingFAQ.tsx
│   │   ├── admin/
│   │   │   ├── StatCard.tsx
│   │   │   ├── MRRSparkline.tsx
│   │   │   ├── ProjectTypeDonut.tsx
│   │   │   ├── CountryChart.tsx
│   │   │   ├── SpendChart.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── ProjectsTable.tsx
│   │   │   ├── UsersTable.tsx
│   │   │   ├── ApproveStageDrawer.tsx
│   │   │   ├── RejectWithNotesDialog.tsx
│   │   │   ├── AssignProfessionalDialog.tsx
│   │   │   ├── OverridePaymentDialog.tsx
│   │   │   ├── PricingPlansEditor.tsx
│   │   │   ├── CostAllocationsEditor.tsx
│   │   │   ├── EmailHealthPanel.tsx
│   │   │   └── AuditLogTable.tsx
│   │   ├── tier/
│   │   │   ├── TierGate.tsx              # lock / blur / hide modes
│   │   │   └── SubscriptionCard.tsx
│   │   └── shared/
│   │       ├── EmptyState.tsx
│   │       ├── LoadingSpinner.tsx
│   │       ├── FileUploader.tsx
│   │       ├── CountrySelectorGrid.tsx
│   │       ├── NumberStepper.tsx
│   │       └── OptionCard.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useTier.ts                    # reads profiles.subscription_tier
│   │   ├── useRole.ts                    # reads user_roles
│   │   ├── useProject.ts
│   │   ├── useStages.ts
│   │   ├── useSubstages.ts
│   │   ├── useNotifications.ts
│   │   ├── useRealtime.ts               # generic realtime subscription
│   │   └── useCountrySettings.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # browser client
│   │   │   ├── server.ts                # server client (for SSR if needed)
│   │   │   └── types.ts                 # auto-generated (supabase gen types)
│   │   ├── floor-costs.ts               # per-floor cost computation engine
│   │   ├── budget-engine.ts             # 9-section budget calculation
│   │   ├── substage-seed.ts             # 60 substage definitions across 10 stages
│   │   ├── tier-features.ts             # TIER_FEATURES map (single source of truth)
│   │   ├── countries.ts                 # 13 supported countries + metadata
│   │   ├── constants.ts                 # stage names, payment allocations, etc.
│   │   └── utils.ts
│   ├── styles/
│   │   ├── globals.css                  # Tailwind imports + design tokens
│   │   └── brand.ts                     # color constants for programmatic use
│   └── main.tsx
├── supabase/
│   ├── migrations/
│   │   ├── 001_profiles_and_roles.sql
│   │   ├── 002_projects_and_stages.sql
│   │   ├── 003_substages.sql
│   │   ├── 004_payments.sql
│   │   ├── 005_documents.sql
│   │   ├── 006_contractors.sql
│   │   ├── 007_notifications.sql
│   │   ├── 008_subscriptions.sql
│   │   ├── 009_funnel.sql
│   │   ├── 010_email.sql
│   │   ├── 011_audit.sql
│   │   ├── 012_certificates.sql
│   │   ├── 013_team_members.sql
│   │   ├── 014_contractor_invites.sql
│   │   ├── 015_leads.sql
│   │   └── 016_cost_allocations.sql
│   ├── functions/
│   │   ├── _shared/
│   │   │   ├── auth.ts                  # requireRole(), requireMinTier(), getClaims()
│   │   │   ├── cors.ts
│   │   │   ├── response.ts
│   │   │   ├── substage-seed.ts         # shared substage definitions
│   │   │   └── email-templates.ts
│   │   ├── create-project/index.ts
│   │   ├── create-project-for-client/index.ts
│   │   ├── approve-stage/index.ts       # tier-aware routing
│   │   ├── update-substage/index.ts
│   │   ├── invite-contractor/index.ts
│   │   ├── accept-contractor-invite/index.ts
│   │   ├── assign-professional/index.ts
│   │   ├── issue-stage-certificate/index.ts
│   │   ├── verify-certificate/index.ts
│   │   ├── generate-invoice/index.ts
│   │   ├── document-share/index.ts
│   │   ├── request-tier-upgrade/index.ts
│   │   ├── send-transactional-email/index.ts
│   │   ├── process-email-queue/index.ts
│   │   ├── auth-email-hook/index.ts
│   │   ├── funnel-detector/index.ts
│   │   ├── refresh-fx-rates/index.ts
│   │   ├── snapshot-mrr/index.ts
│   │   ├── receipt-signed-url/index.ts
│   │   └── payment-reminder-detector/index.ts
│   ├── seed.sql                         # dev seed data (demo project, test users)
│   └── config.toml
├── tests/
│   ├── unit/
│   │   ├── floor-costs.test.ts
│   │   ├── budget-engine.test.ts
│   │   ├── tier-features.test.ts
│   │   └── substage-seed.test.ts
│   ├── edge/
│   │   ├── create-project.test.ts
│   │   ├── approve-stage.test.ts
│   │   ├── update-substage.test.ts
│   │   ├── invite-contractor.test.ts
│   │   ├── issue-certificate.test.ts
│   │   └── document-share.test.ts
│   ├── e2e/
│   │   ├── auth.spec.ts
│   │   ├── project-creation.spec.ts
│   │   ├── stage-workflow.spec.ts
│   │   ├── contractor-invite.spec.ts
│   │   └── mobile-smoke.spec.ts         # 375px viewport regression
│   └── fixtures/
│       ├── test-users.ts
│       └── test-projects.ts
├── public/
│   ├── favicon.svg
│   ├── og-image.png
│   └── building-illustrations/          # SVG illustrations for wizard
│       ├── single-family.svg
│       ├── multi-family.svg
│       ├── commercial.svg
│       └── mixed-use.svg
├── .env.example
├── .env.local                           # SUPABASE_URL, SUPABASE_ANON_KEY, RESEND_API_KEY
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
├── package.json
└── README.md
```

---

## Part 2 — Database Schema

### Design principles
- RLS on every table — clients see own data only, admins see all
- Roles in `user_roles` table, never on `profiles`
- `has_role()` SECURITY DEFINER function used in every admin RLS policy
- All money stored as `numeric` in local currency
- All privileged mutations happen in edge functions, never raw SQL from client
- Realtime enabled on `stages`, `project_substages`, `messages`, `payments`, `notifications`

### Migration 001 — Profiles and roles

```sql
-- Enum for application roles
create type app_role as enum ('client', 'admin', 'super_admin', 'jala_professional', 'contractor');

-- Profiles (extends auth.users)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text,
  phone text,
  avatar_url text,
  country text default 'Nigeria',
  subscription_tier text not null default 'self_serve'
    check (subscription_tier in ('self_serve', 'hybrid', 'full_service')),
  is_disabled boolean not null default false,
  profile_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User roles (separate table — never on profiles)
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  role app_role not null default 'client',
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

-- Security definer function for RLS
create or replace function has_role(required_role app_role)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from user_roles
    where user_id = auth.uid()
    and role = required_role
  );
end;
$$;

-- Auto-create profile + client role on signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into profiles (id, email)
  values (new.id, new.email);

  insert into user_roles (user_id, role)
  values (new.id, 'client');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- RLS
alter table profiles enable row level security;
alter table user_roles enable row level security;

create policy "Users read own profile"
  on profiles for select using (auth.uid() = id);
create policy "Users update own profile"
  on profiles for update using (auth.uid() = id);
create policy "Admins read all profiles"
  on profiles for select using (has_role('admin') or has_role('super_admin'));

create policy "Users read own roles"
  on user_roles for select using (auth.uid() = user_id);
create policy "Admins manage roles"
  on user_roles for all using (has_role('super_admin'));
```

### Migration 002 — Projects and stages

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id),
  name text not null,
  country text not null,
  project_type text not null check (project_type in (
    'residential_single', 'residential_multi', 'commercial', 'mixed_use'
  )),
  building_type text,                           -- bungalow, duplex, villa, apartment, etc.
  floors integer not null default 1,
  rooms jsonb not null default '{}',            -- { total: {...}, per_floor: null | [...] }
  boys_quarters_count integer not null default 0,
  roof_type text,
  budget numeric,                               -- in local currency
  budget_breakdown jsonb,                       -- 9-section breakdown
  target_completion_date date,
  status text not null default 'active'
    check (status in ('active', 'on_hold', 'completed', 'cancelled')),
  assigned_professional_id uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10 stage names as constants
-- 1: Land Secured, 2: Design, 3: Site Preparation, 4: Foundation,
-- 5: Structure & Walls, 6: Roofing, 7: Electrical & Plumbing,
-- 8: Finishing, 9: Exterior, 10: Final Handover

create table stages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage_number integer not null check (stage_number between 1 and 10),
  name text not null,
  description text,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'awaiting_approval', 'completed')),
  is_locked boolean not null default true,      -- only stage 1 starts unlocked
  payment_percentage numeric not null,          -- 5/10/5/15/20/10/10/10/10/5
  payment_amount numeric,
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'partial', 'paid')),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, stage_number)
);

-- RLS
alter table projects enable row level security;
alter table stages enable row level security;

create policy "Owners read own projects"
  on projects for select using (auth.uid() = owner_id);
create policy "Admins read all projects"
  on projects for select using (has_role('admin') or has_role('super_admin'));
create policy "Professionals read assigned projects"
  on projects for select using (
    has_role('jala_professional')
    and assigned_professional_id = auth.uid()
  );

create policy "Owners read own stages"
  on stages for select using (
    exists (select 1 from projects where projects.id = stages.project_id and projects.owner_id = auth.uid())
  );
create policy "Admins read all stages"
  on stages for select using (has_role('admin') or has_role('super_admin'));

-- Realtime
alter publication supabase_realtime add table stages;
```

### Migration 003 — Substages

```sql
create table project_substages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage_id uuid not null references stages(id) on delete cascade,
  name text not null,
  description text,
  "order" integer not null,
  status text not null default 'not_started'
    check (status in ('not_started', 'in_progress', 'complete')),
  evidence_urls jsonb default '[]',
  rejection_note text,
  rejected_at timestamptz,
  rejected_by uuid references profiles(id),
  requires_reupload boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table project_substages enable row level security;
alter publication supabase_realtime add table project_substages;

-- RLS follows same pattern as stages (owner reads own, admin reads all)
```

### Migration 004 — Payments

```sql
create table payments (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage_id uuid not null references stages(id),
  amount numeric not null,
  currency text not null default 'NGN',
  status text not null default 'pending'
    check (status in ('pending', 'partial', 'paid', 'refunded')),
  payment_method text,
  receipt_url text,
  recorded_by uuid references profiles(id),
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table payment_events (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references payments(id),
  amount numeric not null,
  receipt_url text,
  notes text,
  created_at timestamptz not null default now()
);

alter table payments enable row level security;
alter table payment_events enable row level security;
alter publication supabase_realtime add table payments;
```

### Migration 005 — Documents

```sql
create type document_category as enum (
  'contract', 'permit', 'receipt', 'invoice', 'report', 'certificate', 'other'
);

create table project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  stage_id uuid references stages(id),
  category document_category not null default 'other',
  name text not null,
  file_url text not null,
  file_size bigint,
  mime_type text,
  parent_id uuid references project_documents(id),  -- versioning
  version integer not null default 1,
  is_current boolean not null default true,
  uploaded_by uuid not null references profiles(id),
  notes text,
  created_at timestamptz not null default now()
);

create table document_shares (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references project_documents(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

alter table project_documents enable row level security;
alter table document_shares enable row level security;
```

### Migration 006 — Contractors and directory

```sql
create table contractors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text not null,
  country text not null,
  region text,
  bio text,
  phone text,
  email text,
  portfolio_url text,
  is_verified boolean not null default false,
  verified_at timestamptz,
  rating numeric default 0,
  review_count integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contractor_inquiries (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references profiles(id),
  contractor_id uuid not null references contractors(id),
  project_id uuid references projects(id),
  message text not null,
  budget_range text,
  start_window text,
  preferred_contact text,
  status text not null default 'new'
    check (status in ('new', 'in_review', 'introduced', 'hired', 'closed')),
  admin_note text,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table contractor_reviews (
  id uuid primary key default gen_random_uuid(),
  contractor_id uuid not null references contractors(id),
  reviewer_id uuid not null references profiles(id),
  rating integer not null check (rating between 1 and 5),
  headline text,
  body text,
  created_at timestamptz not null default now(),
  unique(contractor_id, reviewer_id)
);

alter table contractors enable row level security;
alter table contractor_inquiries enable row level security;
alter table contractor_reviews enable row level security;

-- Public read for directory (names + specialty only for free tier; full details gated in app)
create policy "Anyone reads contractor listing"
  on contractors for select using (true);
```

### Migration 007 — Notifications

```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,       -- stage_approved, payment_recorded, contractor_invited, etc.
  title text not null,
  body text,
  metadata jsonb default '{}',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table notifications enable row level security;
alter publication supabase_realtime add table notifications;

create policy "Users read own notifications"
  on notifications for select using (auth.uid() = user_id);
create policy "Users update own notifications"
  on notifications for update using (auth.uid() = user_id);
```

### Migration 008 — Subscriptions

```sql
create table pricing_plans (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  tier text not null check (tier in ('self_serve', 'hybrid', 'full_service')),
  monthly_price numeric not null default 0,
  setup_fee numeric not null default 0,
  processing_fee_pct numeric not null default 0,  -- 10%, 3%, custom
  currency text not null default 'USD',
  features jsonb default '[]',
  is_custom boolean not null default false,
  created_at timestamptz not null default now(),
  unique(country, tier)
);

create table tier_upgrade_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  requested_tier text not null,
  current_tier text not null,
  note text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table pricing_plans enable row level security;
alter table tier_upgrade_requests enable row level security;

-- Public read for pricing page
create policy "Anyone reads pricing"
  on pricing_plans for select using (true);
```

### Migration 009 — Funnel

```sql
create table funnel_transition_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  from_state text,
  to_state text not null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

-- SQL function to derive funnel state
create or replace function get_client_funnel_state(p_user_id uuid)
returns text
language plpgsql
security definer
as $$
declare
  v_has_project boolean;
  v_has_active boolean;
  v_last_activity timestamptz;
  v_days_inactive integer;
begin
  select exists(select 1 from projects where owner_id = p_user_id) into v_has_project;
  if not v_has_project then return 'onboarded'; end if;

  select exists(
    select 1 from projects p
    join stages s on s.project_id = p.id
    where p.owner_id = p_user_id and s.status = 'in_progress'
  ) into v_has_active;

  select max(greatest(p.updated_at, coalesce(s.updated_at, p.updated_at)))
  into v_last_activity
  from projects p
  left join stages s on s.project_id = p.id
  where p.owner_id = p_user_id;

  v_days_inactive := extract(day from now() - v_last_activity);

  if v_days_inactive > 180 then return 'churned'; end if;
  if v_days_inactive > 60 then return 'dormant'; end if;
  if v_has_active then return 'active'; end if;
  return 'wrapping_up';
end;
$$;
```

### Migration 010 — Email infrastructure

```sql
create table email_send_log (
  id uuid primary key default gen_random_uuid(),
  to_email text not null,
  template text not null,
  subject text,
  status text not null default 'queued'
    check (status in ('queued', 'sent', 'failed', 'bounced')),
  idempotency_key text unique,
  error_message text,
  retry_count integer not null default 0,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table suppressed_emails (
  email text primary key,
  reason text not null,      -- bounce, complaint, unsubscribe
  created_at timestamptz not null default now()
);

create table email_unsubscribe_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  token text not null unique,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table email_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  stage_updates boolean not null default true,
  payment_alerts boolean not null default true,
  marketing boolean not null default true,
  weekly_report boolean not null default true,
  created_at timestamptz not null default now()
);
```

### Migration 011 — Audit log

```sql
create table audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  entity_type text not null,     -- project, stage, user, payment, etc.
  entity_id uuid,
  action text not null,          -- created, approved, rejected, role_assigned, etc.
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

alter table audit_log enable row level security;

create policy "Admins read audit log"
  on audit_log for select using (has_role('admin') or has_role('super_admin'));
create policy "System inserts audit log"
  on audit_log for insert with check (true);  -- edge functions handle auth
```

### Migration 012 — Certificates

```sql
create table stage_certificates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id),
  stage_id uuid not null references stages(id),
  issued_by uuid not null references profiles(id),     -- jala_professional
  token text not null unique,                           -- for public verification
  file_url text not null,                               -- stored PDF
  document_id uuid references project_documents(id),   -- linked to vault
  revoked boolean not null default false,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table stage_certificates enable row level security;
```

### Migration 013 — Project team members

```sql
create table project_team_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references profiles(id),
  team_role text not null check (team_role in (
    'professional', 'construction', 'verification'
  )),
  assigned_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique(project_id, user_id, team_role)
);

alter table project_team_members enable row level security;
```

### Migration 014 — Contractor invites

```sql
create table project_contractors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  contractor_user_id uuid references profiles(id),
  invited_email text not null,
  invite_token text unique,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'removed')),
  scopes jsonb not null default '{"upload_evidence": true, "message": true, "approve": false, "manage_substages": false}',
  invited_by uuid not null references profiles(id),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table project_contractors enable row level security;
```

### Migration 015 — Leads

```sql
create table budget_calculator_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  country text,
  project_type text,
  building_type text,
  bedrooms integer,
  estimated_budget numeric,
  marketing_consent boolean not null default false,
  created_at timestamptz not null default now()
);

alter table budget_calculator_leads enable row level security;

-- Public insert (no auth required — lead magnet)
create policy "Anyone can submit lead"
  on budget_calculator_leads for insert with check (true);
create policy "Admins read leads"
  on budget_calculator_leads for select using (has_role('admin') or has_role('super_admin'));
```

### Migration 016 — Cost allocations

```sql
create table cost_allocations (
  id uuid primary key default gen_random_uuid(),
  country text not null,
  project_type text not null,
  section_code integer not null,           -- 100, 200, 300, etc.
  section_name text not null,
  is_per_floor boolean not null default false,
  items jsonb not null default '[]',       -- [{article, designation, unit, quantity_formula, unit_price}]
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(country, project_type, section_code)
);

create table country_settings (
  country text primary key,
  currency text not null default 'NGN',
  labor_multiplier numeric not null default 1.0,
  engineering_pct numeric not null default 0.45,
  permits_pct numeric not null default 0.02,
  fx_rate_usd numeric not null default 1.0,
  fx_updated_at timestamptz,
  is_supported boolean not null default true,
  created_at timestamptz not null default now()
);

alter table cost_allocations enable row level security;
alter table country_settings enable row level security;

create policy "Anyone reads country settings"
  on country_settings for select using (true);
```

---

## Part 3 — Edge Functions (Core Logic)

### _shared/auth.ts — Every edge function imports this

```typescript
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export function getSupabaseClient(req: Request) {
  const authHeader = req.headers.get("Authorization");
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader ?? "" } } }
  );
}

export function getServiceClient() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

export async function requireRole(client: any, role: string) {
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: roles } = await getServiceClient()
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id);

  if (!roles?.some(r => r.role === role)) {
    throw new Error(`Missing role: ${role}`);
  }
  return user;
}

export async function requireMinTier(client: any, minTier: string) {
  const { data: { user } } = await client.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const tiers = ["self_serve", "hybrid", "full_service"];
  const { data: profile } = await getServiceClient()
    .from("profiles")
    .select("subscription_tier")
    .eq("id", user.id)
    .single();

  if (!profile || tiers.indexOf(profile.subscription_tier) < tiers.indexOf(minTier)) {
    throw new Error(`Requires ${minTier} tier or higher`);
  }
  return { user, tier: profile.subscription_tier };
}
```

### approve-stage — Tier-aware approval routing

```typescript
// Simplified logic — full implementation would include Zod validation,
// audit logging, notifications, and certificate issuance

export async function handler(req: Request) {
  const { stage_id, action, rejected_substage_ids, rejection_notes } = await req.json();
  const client = getSupabaseClient(req);
  const svc = getServiceClient();

  // Get stage + project + owner tier
  const { data: stage } = await svc.from("stages")
    .select("*, projects(owner_id, assigned_professional_id)")
    .eq("id", stage_id).single();

  const { data: profile } = await svc.from("profiles")
    .select("subscription_tier")
    .eq("id", stage.projects.owner_id).single();

  const { data: { user } } = await client.auth.getUser();
  const tier = profile.subscription_tier;

  // ROUTING BY TIER
  if (action === "mark_completed" && tier === "self_serve") {
    // Self Verify: only owner can mark completed, no admin review
    if (user.id !== stage.projects.owner_id) throw new Error("Only owner can self-verify");
    await completeStage(svc, stage);

  } else if (action === "submit_for_approval" && tier === "hybrid") {
    // Jalla Verify: owner submits, professional/admin approves
    if (user.id !== stage.projects.owner_id) throw new Error("Only owner can submit");
    await svc.from("stages").update({ status: "awaiting_approval" }).eq("id", stage_id);

  } else if (action === "approve" && tier === "hybrid") {
    // Only jala_professional or admin can approve hybrid stages
    const roles = await getUserRoles(svc, user.id);
    if (!roles.includes("jala_professional") && !roles.includes("admin")) {
      throw new Error("Only professionals can approve Jalla Verify stages");
    }
    await completeStage(svc, stage);
    await issueCertificate(svc, stage);  // auto-issue on hybrid approval

  } else if (action === "reject") {
    // Targeted rejection: only flag specific substages
    const roles = await getUserRoles(svc, user.id);
    if (!roles.includes("jala_professional") && !roles.includes("admin")) {
      throw new Error("Only professionals/admins can reject");
    }
    await rejectSubstages(svc, stage_id, rejected_substage_ids, rejection_notes, user.id);

  } else if (tier === "full_service") {
    // Jalla Management: only admin actions
    await requireRole(client, "admin");
    if (action === "approve") await completeStage(svc, stage);
    if (action === "reject") await rejectSubstages(svc, stage_id, rejected_substage_ids, rejection_notes, user.id);
  }

  // Audit log
  await svc.from("audit_log").insert({
    actor_id: user.id, entity_type: "stage", entity_id: stage_id,
    action, metadata: { tier, rejected_substage_ids }
  });

  // Notify
  await notify(svc, stage, action);
}

async function completeStage(svc, stage) {
  await svc.from("stages").update({
    status: "completed", completed_at: new Date().toISOString()
  }).eq("id", stage.id);

  // Unlock next stage
  const nextNum = stage.stage_number + 1;
  if (nextNum <= 10) {
    await svc.from("stages").update({ is_locked: false, status: "not_started" })
      .eq("project_id", stage.project_id)
      .eq("stage_number", nextNum);
  }
}
```

---

## Part 4 — Design System

### Brand tokens (Tailwind config)

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          white: "#FFFFFF",
          "near-black": "#0A0A0A",
          "rich-black": "#1A1A1A",
          "mid-grey": "#888888",
          "light-grey": "#F5F5F5",
          black: "#000000",
          "muted-grey": "#9CA3AF",
          "border-grey": "#E5E5E5",
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
      }
    }
  }
}
```

### Design rules (enforced across all components)

```
Typography:     Inter only, weights 300–800
Colors:         Strict greyscale — no accent colors
                White (#FFFFFF), Near Black (#0A0A0A), Rich Black (#1A1A1A)
                Mid Grey (#888888), Light Grey (#F5F5F5), Muted Grey (#9CA3AF)
                Border Grey (#E5E5E5)
Status:         Differentiate via weight, border, icon — never color
Dark mode:      Admin panel uses dark theme (Rich Black background)
                Client app uses light theme
                Logo auto-inverts
Border radius:  8px default, 12px for cards
Shadows:        Minimal — only on hover states and modals
Buttons:        Primary = black fill + white text
                Secondary = white fill + grey border
                Destructive = same as primary but used for reject actions
Mobile:         375px baseline — every page must work at this width
```

---

## Part 5 — Build Order

### Phase 1 — Foundation (Week 1)
Build everything needed before any feature can work.

```
Day 1:  Project scaffold (Vite + React + TS + Tailwind + shadcn)
        Supabase project creation
        Migrations 001 (profiles/roles)
        Auth flow: signup, login, Google OAuth, password reset
        Auth layout (split screen with blueprint background)
        ProtectedRoute component

Day 2:  Migrations 002–003 (projects, stages, substages)
        Sidebar layout (client) with routing
        Dashboard page (empty state initially)
        Settings page (profile, email prefs)

Day 3:  Migration 007 (notifications)
        NotificationBell + notifications page
        useRealtime hook
        useTier hook + TierGate component
        tier-features.ts (single source of truth)
```

### Phase 2 — Project Creation (Week 2)
The core wizard that creates everything.

```
Day 4:  Project creation wizard shell (progress bar, step navigation)
        Steps 1–4: Country, Project Type, Building Type, Floors
        Building type illustrations (SVG)

Day 5:  Steps 5–9: Rooms (with per-floor toggle), Boys Quarters,
        Roof Type, Details, Summary
        Migration 016 (cost allocations)
        budget-engine.ts + floor-costs.ts

Day 6:  create-project edge function:
        - Zod validation
        - Insert project + 10 stages + 60 substages
        - Compute 9-section budget breakdown
        - Create payment milestones
        - Create timeline
        Tests for create-project
```

### Phase 3 — Project Detail (Week 3)
The most complex page — stages, substages, budget, payments, chat, documents.

```
Day 7:  My Projects grid (ProjectCard with stage progress dots)
        Project detail layout (overview tab)
        KPI stat cards (Budget, Spent, Stage, Days Active)
        ProgressGauge

Day 8:  StageList + StageAccordion + SubstageRow + SubstageProgress
        update-substage edge function
        Evidence upload (Storage bucket: stage-media)
        Substage status transitions

Day 9:  StageApprovalControls (tier-aware):
        - Self Verify: "Mark as completed" button
        - Jalla Verify: "Submit for approval" button
        approve-stage edge function (full tier routing)
        RejectionBanner for flagged substages

Day 10: BudgetDonut (9-section) + FloorCostBreakdown table
        PaymentMilestones view
        Payment recording (RecordPaymentDialog)
        generate-invoice edge function (PDF receipt)

Day 11: DocumentVault (upload, categorize, version, share)
        document-share edge function (expiring links)
        DeliverableChecklist per stage
        ProjectChat with realtime messaging

Day 12: ContractorTeamCard (invite/revoke contractors)
        invite-contractor edge function (magic link + email)
        accept-contractor-invite flow + /accept-invite/:token page
        AssignedProfessionalCard
```

### Phase 4 — Contractor Directory (Week 4)

```
Day 13: Migration 006 (contractors, inquiries, reviews)
        ContractorDirectory page (cards with blur gating)
        ContractorProfile page
        TierGate on contact details + inquiry form

Day 14: InquiryForm (Hybrid+ only)
        ReviewsList + LeaveReviewDialog
        Lawyer/Surveyor priority sorting
        Land Secured stage CTA → directory with ?specialty=Lawyer
```

### Phase 5 — Subscriptions + Pricing (Week 4 continued)

```
Day 15: Migration 008 (pricing plans, upgrade requests)
        Public /pricing page (3-card comparison, FAQ accordion)
        SubscriptionCard on settings page
        TierBadge in sidebar
        Tier upgrade flow:
        - Hybrid: direct activation (no admin approval)
        - Management: request → admin approve

Day 16: Migration 015 (leads)
        Budget Calculator with email-gated PDF export
        Stage Planner, Payment Milestones, Project Tracker (public tools)
        Resource Library
```

### Phase 6 — Admin Panel (Weeks 5–6)
Dark theme, full operational console.

```
Day 17: Admin layout (dark sidebar, role gate)
        Command Center dashboard:
        - StatCards (projects, clients, MRR, stages completed)
        - MRRSparkline, SpendChart, ProjectTypeDonut, CountryChart
        - ActivityFeed
        - RecentProjectsTable

Day 18: Admin Projects page (sortable table)
        Admin Project Detail:
        - All client features + admin controls
        - ApproveStageDrawer, RejectWithNotesDialog
        - OverridePaymentDialog (bypass unpaid balance)
        - AssignProfessionalDialog
        - Cost allocations editor

Day 19: Admin Users page:
        - All roles filter (Client, Jala Professional, Contractor, Admin)
        - All tiers filter
        - Change role, Change tier, Impersonate, Disable
        - Export CSV
        Admin Subscriptions page (pending requests + tier overview)

Day 20: Admin Contractors page (Directory + Inquiries tabs)
        Admin Certificates page
        Admin Leads page (Budget Calculator captures)
        PricingPlansEditor

Day 21: Admin Email Health page (queue, bounces, suppressions)
        Email infrastructure:
        - send-transactional-email edge function
        - process-email-queue edge function
        - auth-email-hook (branded auth emails)
        - Suppression + unsubscribe handling

Day 22: Admin Audit Log page
        Admin Funnel page (state distribution)
        funnel-detector edge function + daily cron
        snapshot-mrr edge function + monthly cron
        refresh-fx-rates edge function + daily cron
```

### Phase 7 — Certificates + Full-Service (Week 6 continued)

```
Day 23: Migration 012 (stage_certificates)
        issue-stage-certificate edge function:
        - Branded landscape A4 PDF (pdf-lib)
        - QR code embedding
        - Upload to storage + file in documents vault
        - Notify owner + contractors
        verify-certificate public endpoint + /verify/:token page
        CertificateCard on project detail

Day 24: create-project-for-client edge function
        Admin Create for Client page (wizard + client picker)
        Full-service project controls:
        - Admin can update substages, upload evidence, approve stages
        - Client view is read-only for full_service tier
```

### Phase 8 — Testing + Polish (Week 7)

```
Day 25: Vitest unit tests:
        - floor-costs.ts (102 tests: 5 scenarios × 4 budgets × 4 countries × 2 modes)
        - budget-engine.ts
        - tier-features.ts
        - substage-seed.ts

Day 26: Deno edge function tests:
        - create-project (validation, seeding, budget)
        - approve-stage (all tier paths + rejection)
        - update-substage (status transitions, evidence)
        - invite-contractor (cap enforcement, email)
        - issue-certificate (PDF generation)
        - document-share (token validation, expiry)

Day 27: Playwright e2e tests:
        - Auth flow (signup, login, Google OAuth)
        - Project creation wizard (full 9-step flow)
        - Stage workflow (substage updates → approval → unlock)
        - Contractor invite (send → accept → scoped access)
        - Mobile smoke (375px — no horizontal scroll on all pages)

Day 28: Seed data:
        - Demo project (read-only, all 10 stages, sample evidence)
        - Cost allocations for Cameroon (from Vanessa's estimate)
        - Multiplier-based allocations for Nigeria, Ghana
        - 30+ contractor directory entries
        - Resource library articles

        Polish:
        - First-run onboarding tooltip for Self Verify
        - Contextual substage tips
        - Privacy + ToS pages
        - SEO (JSON-LD, OG tags, canonical URLs)
```

---

## Part 6 — Claude Code Prompting Strategy

### How to use this document with Claude Code

This blueprint is designed to be fed to Claude Code in chunks. Don't paste the entire thing — work phase by phase.

**Session 1 — Scaffold:**
```
Create a new React + TypeScript + Vite project with Tailwind CSS and shadcn/ui.
Set up the directory structure as specified. Initialize Supabase.
Create Migration 001 (profiles and roles) with the exact SQL provided.
Build the auth flow: login, signup, password reset pages with the split-screen
layout (form left, architectural blueprint image right).
```

**Session 2 — Core schema:**
```
Apply Migrations 002–003 (projects, stages, substages).
Build the _shared/auth.ts helper with requireRole and requireMinTier functions.
Create the create-project edge function with Zod validation that seeds
10 stages, 60 substages, budget breakdown, and payment records.
Include the substage seed data from the SUBSTAGE_SEED constant.
```

**And so on for each phase.**

### Rules for Claude Code sessions

1. Always reference specific migration SQL from this document — don't let Claude improvise schema.
2. After every edge function, write a test. Don't accumulate test debt.
3. After every page, test at 375px. Fix mobile before moving on.
4. Never let Claude put roles on the profiles table.
5. Never let Claude skip RLS policies.
6. Review every edge function for: auth check, Zod validation, audit log write, notification trigger.
7. Commit after every completed component or function. Small commits, descriptive messages.

---

## Part 7 — Substage Seed Data

The full 60-substage map across 10 stages. This is the `SUBSTAGE_SEED` constant used by `create-project`.

```typescript
export const SUBSTAGE_SEED: Record<number, { name: string; description: string }[]> = {
  1: [ // Land Secured
    { name: "Engage surveyor", description: "Verify documents against regional survey map" },
    { name: "Verify land title", description: "Cross-check for fraud — multiple titles on one plot" },
    { name: "Engage notary/lawyer", description: "Purchase contract and legal binding" },
    { name: "Payment by bank transfer", description: "Traceability requirement for land purchase" },
    { name: "Land title transfer", description: "3 weeks to 3 months depending on country" },
  ],
  2: [ // Design
    { name: "Soil test", description: "Required for buildings with 3+ floors" },
    { name: "Architectural plans", description: "Floor plans, roof, electrical, plumbing, sewage, elevations, sections" },
    { name: "Structural plan", description: "Pillars, beams, slabs, foundation, footings" },
    { name: "Plan authorization", description: "State-registered engineer/architect signatures" },
    { name: "Building permit application", description: "Document assembly varies by location and building type" },
  ],
  3: [ // Site Preparation
    { name: "Energy supply", description: "Contact utility company or install solar" },
    { name: "Water supply", description: "Utility connection or borehole" },
    { name: "Clearing and leveling", description: "Prepare the land for construction" },
    { name: "Magazine construction", description: "Temporary site house for materials and worker lodging" },
    { name: "Site materials procurement", description: "Tools, spirit level, laser level, safety equipment" },
  ],
  4: [ // Foundation
    { name: "Excavation", description: "Excavation of foundation pits and trenches" },
    { name: "Backfill", description: "Fill and compact excavated areas" },
    { name: "Lean concrete", description: "5cm layer, 150kg/m³" },
    { name: "Reinforced concrete footings", description: "350kg/m³ structural footings" },
    { name: "Foundation pillars and beams", description: "Reinforced concrete columns and tie beams" },
    { name: "Floor slab", description: "Lightly concreted slab, 250kg/m³" },
    { name: "Foundation blocks", description: "Blocks, polystyrene insulation, and sand layer" },
  ],
  5: [ // Structure & Walls
    { name: "Pillars", description: "Reinforced concrete, 350kg/m³" },
    { name: "Beams and lintels", description: "Structural support over openings" },
    { name: "Staircase", description: "Required for multi-floor buildings" },
    { name: "Floor slab", description: "Upper floor slab construction" },
    { name: "Block walls", description: "Sandcrete block wall construction" },
    { name: "Plastering", description: "Internal and external wall plastering" },
    { name: "Mortar flooring and tiles", description: "Floor finishing" },
    { name: "Wall tiles and staffing", description: "Decorative plaster and wall tiles" },
  ],
  6: [ // Roofing
    { name: "Hardwood struss assembly", description: "Treated hardwood roof structure" },
    { name: "Purlin installation", description: "Horizontal roof framing members" },
    { name: "Roofing sheet installation", description: "Aluminium roofing sheets" },
    { name: "Roof accessories and finishing", description: "Ridge caps, fascia, guttering" },
  ],
  7: [ // Electrical & Plumbing
    { name: "Conduit and cabling", description: "1.5mm, 2.5mm, and supply cables" },
    { name: "Switches and sockets", description: "Switches, sockets, junction boxes" },
    { name: "Lighting fixtures", description: "Lights, chandeliers, outdoor lighting" },
    { name: "Meter installation", description: "Utility company electricity connection" },
    { name: "Water supply system", description: "PVC piping for water distribution" },
    { name: "Drainage system", description: "Waste water drainage network" },
    { name: "Sanitary fixtures", description: "Toilets, sinks, bathtubs, showers" },
    { name: "Septic tank and soak-away", description: "Waste treatment system" },
  ],
  8: [ // Finishing
    { name: "Wooden doors", description: "Interior and exterior doors in various dimensions" },
    { name: "Windows", description: "Aluminium and glass window installation" },
    { name: "Iron railings", description: "Balcony and staircase railings" },
    { name: "Surface preparation", description: "Sanding and priming for paint" },
    { name: "External paint", description: "Weather-resistant exterior coating" },
    { name: "Internal paint", description: "Interior wall and ceiling paint" },
    { name: "Ceiling and wood finish", description: "Ceiling paint and wood varnish" },
    { name: "Decoration", description: "Final decorative touches and contingencies" },
  ],
  9: [ // Exterior
    { name: "Exterior lighting", description: "Outdoor lighting design and installation" },
    { name: "Water features", description: "Pool, fountain, aquarium (optional)" },
    { name: "Exterior flooring", description: "Pavement, concrete, gravel, or vegetation" },
    { name: "Fencing", description: "Perimeter fencing per owner design" },
    { name: "Garden and seating", description: "Landscaping and outdoor seating" },
  ],
  10: [ // Final Handover
    { name: "Full system inspection", description: "Complete verification of all systems" },
    { name: "Furnishing coordination", description: "Meetings between engineer and owner for furniture" },
    { name: "Handover", description: "Keys, complete documentation, and site journal" },
  ],
};
```

---

## Part 8 — Payment Allocations

```typescript
export const STAGE_PAYMENT_ALLOCATIONS = [
  { stage: 1, name: "Land Secured",          pct: 5  },
  { stage: 2, name: "Design",                pct: 10 },
  { stage: 3, name: "Site Preparation",       pct: 5  },
  { stage: 4, name: "Foundation",             pct: 15 },
  { stage: 5, name: "Structure & Walls",      pct: 20 },
  { stage: 6, name: "Roofing",               pct: 10 },
  { stage: 7, name: "Electrical & Plumbing",  pct: 10 },
  { stage: 8, name: "Finishing",              pct: 10 },
  { stage: 9, name: "Exterior",              pct: 10 },
  { stage: 10, name: "Final Handover",        pct: 5  },
];
// Total: 100%
```

---

## Part 9 — 9-Section Budget Engine

```typescript
export const COST_SECTIONS = [
  { code: 100, name: "Preliminary Works",          isPerFloor: false },
  { code: 200, name: "Foundation",                   isPerFloor: false },
  { code: 300, name: "Ground Floor Elevation",       isPerFloor: true  },
  { code: 400, name: "Upper Floor Elevation",        isPerFloor: true  },
  { code: 500, name: "Roof",                         isPerFloor: false },
  { code: 600, name: "Openings",                     isPerFloor: false },
  { code: 700, name: "Electricity",                  isPerFloor: false },
  { code: 800, name: "Plumbing & Sanitary",          isPerFloor: false },
  { code: 900, name: "Painting & Decoration",        isPerFloor: false },
];

// Per-floor multiplier: each floor above ground costs ~83% of ground floor
// Ground floor = 1.00, Floor 2 = 0.83, Floor 3 = 0.83 * 1.10 (vertical complexity)
// Country multipliers applied on top from country_settings
```

---

## Part 10 — Supported Countries

```typescript
export const SUPPORTED_COUNTRIES = [
  { code: "NG", name: "Nigeria",           currency: "NGN", flag: "🇳🇬" },
  { code: "GH", name: "Ghana",             currency: "GHS", flag: "🇬🇭" },
  { code: "CM", name: "Cameroon",          currency: "XAF", flag: "🇨🇲" },
  { code: "KE", name: "Kenya",             currency: "KES", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa",      currency: "ZAR", flag: "🇿🇦" },
  { code: "TZ", name: "Tanzania",          currency: "TZS", flag: "🇹🇿" },
  { code: "UG", name: "Uganda",            currency: "UGX", flag: "🇺🇬" },
  { code: "ZM", name: "Zambia",            currency: "ZMW", flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabwe",          currency: "ZWL", flag: "🇿🇼" },
  { code: "SL", name: "Sierra Leone",      currency: "SLE", flag: "🇸🇱" },
  { code: "LR", name: "Liberia",           currency: "LRD", flag: "🇱🇷" },
  { code: "GM", name: "Gambia",            currency: "GMD", flag: "🇬🇲" },
  { code: "GQ", name: "Equatorial Guinea", currency: "XAF", flag: "🇬🇶" },
];
```

---

## Part 11 — Tier Features Map

```typescript
export const TIER_FEATURES = {
  self_serve: {
    label: "Self Verify",
    price: 0,
    maxProjects: 3,
    maxContractorsPerProject: 1,
    canContactContractors: false,
    canChatWithJala: false,
    processingFeePct: 10,
    siteVisitReports: false,
    substageDetail: "status_only",
    upgradeRequiresApproval: false,
    stageApproval: "self",           // owner approves own stages
  },
  hybrid: {
    label: "Jalla Verify",
    price: 199,
    maxProjects: Infinity,
    maxContractorsPerProject: Infinity,
    canContactContractors: true,
    canChatWithJala: true,
    processingFeePct: 3,
    siteVisitReports: true,
    substageDetail: "full",
    upgradeRequiresApproval: false,  // direct checkout
    stageApproval: "professional",   // jala professional approves
  },
  full_service: {
    label: "Jalla Management",
    price: null,                     // custom
    maxProjects: Infinity,
    maxContractorsPerProject: Infinity,
    canContactContractors: true,
    canChatWithJala: true,
    processingFeePct: null,          // negotiated
    siteVisitReports: true,
    substageDetail: "full",
    upgradeRequiresApproval: true,   // request + sales call
    stageApproval: "admin",          // admin manages everything
  },
} as const;
```

---

## Part 12 — Pre-Launch Checklist

```
[ ] All 16 migrations applied and tested
[ ] All 20 edge functions deployed with tests
[ ] All client pages work at 375px (mobile smoke test green)
[ ] All admin pages work at 375px
[ ] Auth flow: signup, login, Google OAuth, password reset, email change
[ ] Project creation: full 9-step wizard with budget computation
[ ] Stage workflow: substage updates → approval → unlock → payment for all 3 tiers
[ ] Contractor invite: send → accept → scoped access
[ ] Contractor directory: blur gating for free tier
[ ] Certificate: PDF generation + QR verification
[ ] Document vault: upload, version, share with expiring links
[ ] Notifications: in-app + email for all state changes
[ ] Pricing page: 3-card comparison, FAQ, country-aware
[ ] Budget Calculator: email-gated PDF export
[ ] Admin: command center, projects, users, contractors, certificates, audit log
[ ] Admin: email health, funnel, subscriptions, leads, settings
[ ] RLS: verify no data leaks across all tables
[ ] Audit log: every privileged action logged
[ ] Seed data: demo project, Cameroon cost allocations, 30+ contractors
[ ] SEO: JSON-LD, OG tags, canonical URLs on public pages
[ ] Privacy + ToS pages
[ ] Error boundaries on all route segments
[ ] 404 page
[ ] Loading states on all data-fetching components
[ ] Empty states on all list pages
```
