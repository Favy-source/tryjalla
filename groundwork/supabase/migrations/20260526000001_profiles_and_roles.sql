-- Migration 001: Profiles and Roles
-- Architecture rule: roles NEVER go on profiles. Always user_roles table + has_role() function.

-- Enum for application roles
create type app_role as enum (
  'client',
  'admin',
  'super_admin',
  'jala_professional',
  'contractor'
);

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

-- User roles (separate table — NEVER on profiles)
create table user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  role app_role not null default 'client',
  created_at timestamptz not null default now(),
  unique(user_id, role)
);

-- SECURITY DEFINER function for RLS policies
-- Used in every admin policy to check role without breaking RLS
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

-- Auto-create profile + client role on signup trigger
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

-- ===== Row Level Security =====

alter table profiles enable row level security;
alter table user_roles enable row level security;

-- Profiles policies
create policy "Users read own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on profiles for update
  using (auth.uid() = id);

create policy "Admins read all profiles"
  on profiles for select
  using (has_role('admin') or has_role('super_admin'));

create policy "Admins update all profiles"
  on profiles for update
  using (has_role('admin') or has_role('super_admin'));

-- User roles policies
create policy "Users read own roles"
  on user_roles for select
  using (auth.uid() = user_id);

create policy "Admins manage roles"
  on user_roles for all
  using (has_role('super_admin'));
