-- =============================================================================
-- Groundwork by Jalla — Seed Data
-- Run via: supabase db reset  (applies migrations first, then this file)
-- Never commit real credentials. All passwords here are for local dev only.
-- =============================================================================
-- Add to this file every day. Structure:
--   1. Auth users (via auth.users directly — local dev only)
--   2. Profiles (one per user)
--   3. Roles (user_roles)
--   4. Contractors (Day 4+)
--   5. Projects (Day 4+)
--   6. Notifications (Day 2+)
--   7. Demo project substages + evidence (Day 5+)
-- =============================================================================

-- -----------------------------------------------------------------------
-- 1. Test Auth Users
-- Insert directly into auth.users for local dev (Supabase Studio admin UI
-- is the alternative, but SQL is reproducible on db reset).
-- Passwords are hashed with bcrypt — these resolve to "Password1234!"
-- -----------------------------------------------------------------------

INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  aud
) VALUES
  -- Self Serve / Self Verify user
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'selfserve@test.groundwork.local',
    '$2a$10$PpOtqmaFuE/RL0PsBx5FreDSy3WNjM4kIBkBpNkITTPk7VW6yLcPS',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Amara Okafor"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  ),
  -- Hybrid / Jalla Verify user
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'hybrid@test.groundwork.local',
    '$2a$10$PpOtqmaFuE/RL0PsBx5FreDSy3WNjM4kIBkBpNkITTPk7VW6yLcPS',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Chidi Okonkwo"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  ),
  -- Full Service / Jalla Management user
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'fullservice@test.groundwork.local',
    '$2a$10$PpOtqmaFuE/RL0PsBx5FreDSy3WNjM4kIBkBpNkITTPk7VW6yLcPS',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Ngozi Adeyemi"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  ),
  -- Admin user
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'admin@test.groundwork.local',
    '$2a$10$PpOtqmaFuE/RL0PsBx5FreDSy3WNjM4kIBkBpNkITTPk7VW6yLcPS',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Jalla Admin"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  ),
  -- Jalla Professional (reviewer for hybrid tier)
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'professional@test.groundwork.local',
    '$2a$10$PpOtqmaFuE/RL0PsBx5FreDSy3WNjM4kIBkBpNkITTPk7VW6yLcPS',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Dr. Emeka Eze"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  ),
  -- Contractor user (invited by self-serve user)
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'contractor@test.groundwork.local',
    '$2a$10$PpOtqmaFuE/RL0PsBx5FreDSy3WNjM4kIBkBpNkITTPk7VW6yLcPS',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"BuildRight Ltd"}',
    now(),
    now(),
    'authenticated',
    'authenticated'
  )
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 2. Profiles
-- handle_new_user() trigger fires on INSERT to auth.users and creates
-- the profile automatically with default tier + email from auth.users.
-- We still upsert here in case the trigger didn't fire (e.g., test env).
-- -----------------------------------------------------------------------

INSERT INTO public.profiles (
  id,
  email,
  display_name,
  subscription_tier,
  profile_completed,
  is_disabled,
  country
) VALUES
  ('00000000-0000-0000-0000-000000000001', 'selfserve@test.groundwork.local',  'Amara Okafor',  'self_serve',   true, false, 'NG'),
  ('00000000-0000-0000-0000-000000000002', 'hybrid@test.groundwork.local',     'Chidi Okonkwo', 'hybrid',       true, false, 'NG'),
  ('00000000-0000-0000-0000-000000000003', 'fullservice@test.groundwork.local','Ngozi Adeyemi', 'full_service', true, false, 'GB'),
  ('00000000-0000-0000-0000-000000000004', 'admin@test.groundwork.local',       'Jalla Admin',   'self_serve',   true, false, 'NG'),
  ('00000000-0000-0000-0000-000000000005', 'professional@test.groundwork.local','Dr. Emeka Eze', 'self_serve',   true, false, 'NG'),
  ('00000000-0000-0000-0000-000000000006', 'contractor@test.groundwork.local',  'BuildRight Ltd','self_serve',   true, false, 'NG')
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  subscription_tier = EXCLUDED.subscription_tier,
  profile_completed = EXCLUDED.profile_completed,
  country = EXCLUDED.country;

-- -----------------------------------------------------------------------
-- 3. Roles
-- -----------------------------------------------------------------------

-- handle_new_user() trigger inserts (user_id, 'client') for every new auth user.
-- Users 001–003 are clients — trigger already covered them, skip on conflict.
-- Users 004–006 need a non-client role — insert it alongside the trigger's 'client'.
INSERT INTO public.user_roles (user_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'client'),
  ('00000000-0000-0000-0000-000000000002', 'client'),
  ('00000000-0000-0000-0000-000000000003', 'client'),
  ('00000000-0000-0000-0000-000000000004', 'admin'),
  ('00000000-0000-0000-0000-000000000005', 'jala_professional'),
  ('00000000-0000-0000-0000-000000000006', 'contractor')
ON CONFLICT (user_id, role) DO NOTHING;

-- -----------------------------------------------------------------------
-- Placeholder sections — added incrementally as features are built:
-- -----------------------------------------------------------------------

-- [DAY 4] Projects table seed → uncomment and expand when migration 002 exists
-- INSERT INTO public.projects (...) VALUES (...);

-- [DAY 4] Stages + substages seed (10 stages × ~6 substages each)
-- These are seeded by the create-project edge function in production.
-- For dev, insert directly once the stages/substages tables exist.

-- [DAY 4] Contractor directory entries (3 contractors with varied ratings)
-- INSERT INTO public.contractor_profiles (...) VALUES (...);

-- [DAY 2] Notifications → uncomment once migration 007 exists
-- INSERT INTO public.notifications (...) VALUES (...);
