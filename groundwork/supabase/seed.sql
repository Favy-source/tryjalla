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
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
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
    '$2b$10$7GAfU5diYLandfvZrduhJOy8mkR5YURBz6Bue1teyZc1Sr3v8SKWC',
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Amara Okafor"}',
    now(), now(), 'authenticated', 'authenticated'
  ),
  -- Hybrid / Jalla Verify user
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'hybrid@test.groundwork.local',
    '$2b$10$7GAfU5diYLandfvZrduhJOy8mkR5YURBz6Bue1teyZc1Sr3v8SKWC',
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Chidi Okonkwo"}',
    now(), now(), 'authenticated', 'authenticated'
  ),
  -- Full Service / Jalla Management user
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'fullservice@test.groundwork.local',
    '$2b$10$7GAfU5diYLandfvZrduhJOy8mkR5YURBz6Bue1teyZc1Sr3v8SKWC',
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Ngozi Adeyemi"}',
    now(), now(), 'authenticated', 'authenticated'
  ),
  -- Admin user
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'admin@test.groundwork.local',
    '$2b$10$7GAfU5diYLandfvZrduhJOy8mkR5YURBz6Bue1teyZc1Sr3v8SKWC',
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Jalla Admin"}',
    now(), now(), 'authenticated', 'authenticated'
  ),
  -- Jalla Professional (reviewer for hybrid tier)
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'professional@test.groundwork.local',
    '$2b$10$7GAfU5diYLandfvZrduhJOy8mkR5YURBz6Bue1teyZc1Sr3v8SKWC',
    now(), '', '', '', '',
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Dr. Emeka Eze"}',
    now(), now(), 'authenticated', 'authenticated'
  ),
  -- Contractor user (invited by self-serve user)
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'contractor@test.groundwork.local',
    '$2b$10$7GAfU5diYLandfvZrduhJOy8mkR5YURBz6Bue1teyZc1Sr3v8SKWC',
    now(), '', '', '', '',
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

-- -----------------------------------------------------------------------
-- 4. Demo Project — Lekki 4-Bedroom Duplex
-- Owner: Amara Okafor (user 001, self_serve)
-- State: Stage 4 (Foundation) in progress. Stages 1–3 completed.
-- -----------------------------------------------------------------------

INSERT INTO public.projects (
  id, owner_id, name, country, project_type, building_type,
  floors, rooms, boys_quarters_count, roof_type,
  budget, status, is_demo
) VALUES (
  '00000000-0000-0000-0001-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Lekki 4-Bedroom Duplex',
  'NG',
  'residential_single',
  'duplex',
  2,
  '{"bedrooms": 4, "bathrooms": 3, "livingRooms": 1, "kitchens": 1}',
  1,
  'hip',
  85000000,
  'active',
  true
) ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------
-- 5. Demo Stages (10 stages, stages 1–3 completed, 4 in_progress, 5–10 locked)
-- -----------------------------------------------------------------------

INSERT INTO public.stages (
  id, project_id, stage_number, name, status, is_locked,
  payment_percentage, payment_amount, payment_status,
  started_at, completed_at
) VALUES
  -- Stage 1: Land Secured (completed)
  ('00000000-0000-0000-0002-000000000001',
   '00000000-0000-0000-0001-000000000001',
   1, 'Land Secured', 'completed', false,
   5, 4250000, 'paid',
   NOW() - INTERVAL '90 days', NOW() - INTERVAL '80 days'),

  -- Stage 2: Design (completed)
  ('00000000-0000-0000-0002-000000000002',
   '00000000-0000-0000-0001-000000000001',
   2, 'Design', 'completed', false,
   10, 8500000, 'paid',
   NOW() - INTERVAL '79 days', NOW() - INTERVAL '60 days'),

  -- Stage 3: Site Preparation (completed)
  ('00000000-0000-0000-0002-000000000003',
   '00000000-0000-0000-0001-000000000001',
   3, 'Site Preparation', 'completed', false,
   5, 4250000, 'paid',
   NOW() - INTERVAL '59 days', NOW() - INTERVAL '40 days'),

  -- Stage 4: Foundation (in_progress)
  ('00000000-0000-0000-0002-000000000004',
   '00000000-0000-0000-0001-000000000001',
   4, 'Foundation', 'in_progress', false,
   15, 12750000, 'unpaid',
   NOW() - INTERVAL '39 days', NULL),

  -- Stages 5–10: locked
  ('00000000-0000-0000-0002-000000000005',
   '00000000-0000-0000-0001-000000000001',
   5, 'Structure & Walls', 'not_started', true,
   20, 17000000, 'unpaid', NULL, NULL),

  ('00000000-0000-0000-0002-000000000006',
   '00000000-0000-0000-0001-000000000001',
   6, 'Roofing', 'not_started', true,
   10, 8500000, 'unpaid', NULL, NULL),

  ('00000000-0000-0000-0002-000000000007',
   '00000000-0000-0000-0001-000000000001',
   7, 'Electrical & Plumbing', 'not_started', true,
   10, 8500000, 'unpaid', NULL, NULL),

  ('00000000-0000-0000-0002-000000000008',
   '00000000-0000-0000-0001-000000000001',
   8, 'Finishing', 'not_started', true,
   10, 8500000, 'unpaid', NULL, NULL),

  ('00000000-0000-0000-0002-000000000009',
   '00000000-0000-0000-0001-000000000001',
   9, 'Exterior', 'not_started', true,
   10, 8500000, 'unpaid', NULL, NULL),

  ('00000000-0000-0000-0002-000000000010',
   '00000000-0000-0000-0001-000000000001',
   10, 'Final Handover', 'not_started', true,
   5, 4250000, 'unpaid', NULL, NULL)

ON CONFLICT (project_id, stage_number) DO NOTHING;

-- -----------------------------------------------------------------------
-- 6. Demo Substages — Stage 4 (Foundation) — 7 substages
-- First 3 complete, 4th in_progress, last 3 not_started
-- -----------------------------------------------------------------------

INSERT INTO public.project_substages (
  id, stage_id, project_id, substage_number, name, description,
  status, completed_at
) VALUES
  ('00000000-0000-0000-0003-000000000001',
   '00000000-0000-0000-0002-000000000004',
   '00000000-0000-0000-0001-000000000001',
   1, 'Excavation', 'Excavation of foundation pits and trenches',
   'complete', NOW() - INTERVAL '35 days'),

  ('00000000-0000-0000-0003-000000000002',
   '00000000-0000-0000-0002-000000000004',
   '00000000-0000-0000-0001-000000000001',
   2, 'Backfill', 'Fill and compact excavated areas',
   'complete', NOW() - INTERVAL '30 days'),

  ('00000000-0000-0000-0003-000000000003',
   '00000000-0000-0000-0002-000000000004',
   '00000000-0000-0000-0001-000000000001',
   3, 'Lean concrete', '5cm layer, 150kg/m³',
   'complete', NOW() - INTERVAL '25 days'),

  ('00000000-0000-0000-0003-000000000004',
   '00000000-0000-0000-0002-000000000004',
   '00000000-0000-0000-0001-000000000001',
   4, 'Reinforced concrete footings', '350kg/m³ structural footings',
   'in_progress', NULL),

  ('00000000-0000-0000-0003-000000000005',
   '00000000-0000-0000-0002-000000000004',
   '00000000-0000-0000-0001-000000000001',
   5, 'Foundation pillars and beams', 'Reinforced concrete columns and tie beams',
   'not_started', NULL),

  ('00000000-0000-0000-0003-000000000006',
   '00000000-0000-0000-0002-000000000004',
   '00000000-0000-0000-0001-000000000001',
   6, 'Floor slab', 'Lightly concreted slab, 250kg/m³',
   'not_started', NULL),

  ('00000000-0000-0000-0003-000000000007',
   '00000000-0000-0000-0002-000000000004',
   '00000000-0000-0000-0001-000000000001',
   7, 'Foundation blocks', 'Blocks, polystyrene insulation, and sand layer',
   'not_started', NULL)

ON CONFLICT (stage_id, substage_number) DO NOTHING;

-- -----------------------------------------------------------------------
-- 7. Notifications (demo)
-- -----------------------------------------------------------------------

INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id)
VALUES
  ('00000000-0000-0000-0000-000000000001',
   'stage_approved',
   'Stage 3 completed',
   'Site Preparation (Stage 3) has been marked complete. Stage 4 — Foundation is now active.',
   'stage',
   '00000000-0000-0000-0002-000000000004'),
  ('00000000-0000-0000-0000-000000000001',
   'project_created',
   'Project created',
   'Your project "Lekki 4-Bedroom Duplex" has been created. Stage 1 is now active.',
   'project',
   '00000000-0000-0000-0001-000000000001')
ON CONFLICT DO NOTHING;

-- -----------------------------------------------------------------------
-- 8. Contractor Directory (6 demo contractors)
-- Added when migration 007 is applied.
-- -----------------------------------------------------------------------

INSERT INTO public.contractors (
  id, name, company_name, primary_specialty, specialties,
  country, region, bio, phone, email, portfolio_url,
  is_verified, rating, review_count
) VALUES
  (
    '00000000-0000-0000-0004-000000000001',
    'Adebayo Okafor', 'Adebayo Construction Ltd',
    'Structural Engineering',
    ARRAY['Structural Engineering', 'Foundation Work', 'Masonry'],
    'NG', 'Lagos',
    'Over 15 years experience in residential and commercial construction across Lagos and Ogun State.',
    '+234 803 123 4567', 'adebayo@adebayoconstruction.ng',
    'https://adebayoconstruction.ng',
    true, 4.8, 32
  ),
  (
    '00000000-0000-0000-0004-000000000002',
    'Emeka Nwosu', 'Nwosu Electrical Services',
    'Electrical',
    ARRAY['Electrical', 'Solar Installation', 'Smart Home'],
    'NG', 'Abuja',
    'Certified electrician specialising in residential wiring, solar systems, and smart home automation.',
    '+234 805 234 5678', 'emeka@nwosuelectrical.ng',
    NULL,
    true, 4.6, 18
  ),
  (
    '00000000-0000-0000-0004-000000000003',
    'Funmi Adeyemi', 'Adeyemi Plumbing & Sanitary',
    'Plumbing',
    ARRAY['Plumbing', 'Sanitary', 'Water Treatment'],
    'NG', 'Ibadan',
    'Expert plumber with 10 years experience. Specialises in large residential builds and borehole installations.',
    '+234 807 345 6789', 'funmi@adeyemiplumbing.ng',
    NULL,
    false, 4.3, 9
  ),
  (
    '00000000-0000-0000-0004-000000000004',
    'Kwame Asante', 'Asante Roofing Co.',
    'Roofing',
    ARRAY['Roofing', 'Waterproofing', 'Ceiling'],
    'GH', 'Accra',
    'Top-rated roofing contractor in Ghana. All roof types including hip, gable, flat, and mansard.',
    '+233 24 456 7890', 'kwame@asanteroofing.gh',
    'https://asanteroofing.gh',
    true, 4.9, 47
  ),
  (
    '00000000-0000-0000-0004-000000000005',
    'Bisi Olorunfemi', 'Olorunfemi Finishing Works',
    'Finishing',
    ARRAY['Finishing', 'Tiling', 'Painting', 'Interior'],
    'NG', 'Lagos',
    'Interior finishing specialist. Expert in tiles, paints, wallpaper, false ceilings, and decorative plaster.',
    '+234 809 567 8901', 'bisi@olorunfemi.ng',
    NULL,
    false, 4.1, 11
  ),
  (
    '00000000-0000-0000-0004-000000000006',
    'Amara Diallo', 'Diallo Architecture & Build',
    'Architecture',
    ARRAY['Architecture', 'Structural Engineering', 'Project Management'],
    'SN', 'Dakar',
    'Architect and project manager covering Senegal and Francophone West Africa. Full-service build oversight.',
    '+221 77 678 9012', 'amara@diallo-build.sn',
    'https://diallo-build.sn',
    true, 4.7, 23
  )
ON CONFLICT (id) DO NOTHING;
