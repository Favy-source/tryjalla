-- =============================================================================
-- Migration 002 — Projects, Stages, Project Substages
-- =============================================================================
-- Every project gets exactly 10 stages and ~60 substages seeded by the
-- create-project edge function. This migration defines the tables and RLS.
-- Realtime is enabled on stages and project_substages.
-- =============================================================================

-- ── projects ──────────────────────────────────────────────────────────────────

CREATE TABLE public.projects (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id                 uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name                     text        NOT NULL,
  country                  text        NOT NULL,
  project_type             text        NOT NULL
    CHECK (project_type IN ('residential_single', 'residential_multi', 'commercial', 'mixed_use')),
  building_type            text,                    -- bungalow, duplex, villa, apartment, etc.
  floors                   integer     NOT NULL DEFAULT 1 CHECK (floors >= 1 AND floors <= 20),
  rooms                    jsonb       NOT NULL DEFAULT '{}',
  boys_quarters_count      integer     NOT NULL DEFAULT 0,
  roof_type                text,
  budget                   numeric,                 -- total in local currency
  budget_breakdown         jsonb,                   -- 9-section breakdown {100: amount, 200: amount, ...}
  target_completion_date   date,
  status                   text        NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'on_hold', 'completed', 'cancelled')),
  assigned_professional_id uuid        REFERENCES public.profiles(id),
  is_demo                  boolean     NOT NULL DEFAULT false,
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX projects_owner_id_idx   ON public.projects (owner_id);
CREATE INDEX projects_status_idx     ON public.projects (status);
CREATE INDEX projects_is_demo_idx    ON public.projects (is_demo) WHERE is_demo = true;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Owners see their own projects + all demo projects
CREATE POLICY "projects: owners read own"
  ON public.projects FOR SELECT
  USING (auth.uid() = owner_id OR is_demo = true);

-- Owners create their own projects
CREATE POLICY "projects: owners insert"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Owners update their own projects (non-demo)
CREATE POLICY "projects: owners update own"
  ON public.projects FOR UPDATE
  USING (auth.uid() = owner_id AND is_demo = false)
  WITH CHECK (auth.uid() = owner_id);

-- Assigned professionals can read the project
CREATE POLICY "projects: professionals read assigned"
  ON public.projects FOR SELECT
  USING (assigned_professional_id = auth.uid());

-- Admins can do everything
CREATE POLICY "projects: admins all"
  ON public.projects FOR ALL
  USING (has_role('admin'));

-- ── stages ────────────────────────────────────────────────────────────────────

CREATE TABLE public.stages (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id         uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stage_number       integer     NOT NULL CHECK (stage_number BETWEEN 1 AND 10),
  name               text        NOT NULL,
  description        text,
  status             text        NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'awaiting_approval', 'completed')),
  is_locked          boolean     NOT NULL DEFAULT true,  -- only stage 1 starts unlocked
  payment_percentage numeric     NOT NULL,               -- 5/10/5/15/20/10/10/10/10/5
  payment_amount     numeric,                            -- computed from project.budget
  payment_status     text        NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  started_at         timestamptz,
  completed_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, stage_number)
);

CREATE INDEX stages_project_id_idx ON public.stages (project_id);
CREATE INDEX stages_status_idx     ON public.stages (project_id, status);

CREATE TRIGGER stages_updated_at
  BEFORE UPDATE ON public.stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.stages ENABLE ROW LEVEL SECURITY;

-- Project owner (or assigned professional) can read
CREATE POLICY "stages: project members read"
  ON public.stages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.owner_id = auth.uid() OR p.assigned_professional_id = auth.uid() OR p.is_demo)
    )
  );

-- Only edge functions (service role) insert / update stages
CREATE POLICY "stages: service role write"
  ON public.stages FOR ALL
  USING (has_role('admin'));

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.stages;

-- ── project_substages ─────────────────────────────────────────────────────────

CREATE TABLE public.project_substages (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  stage_id         uuid        NOT NULL REFERENCES public.stages(id) ON DELETE CASCADE,
  project_id       uuid        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  substage_number  integer     NOT NULL,
  name             text        NOT NULL,
  description      text,
  status           text        NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'complete', 'rejected')),
  notes            text,
  evidence_urls    text[]      NOT NULL DEFAULT '{}',
  completed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (stage_id, substage_number)
);

CREATE INDEX substages_project_id_idx ON public.project_substages (project_id);
CREATE INDEX substages_stage_id_idx   ON public.project_substages (stage_id);
CREATE INDEX substages_status_idx     ON public.project_substages (stage_id, status);

CREATE TRIGGER substages_updated_at
  BEFORE UPDATE ON public.project_substages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE public.project_substages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "substages: project members read"
  ON public.project_substages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id
        AND (p.owner_id = auth.uid() OR p.assigned_professional_id = auth.uid() OR p.is_demo)
    )
  );

CREATE POLICY "substages: service role write"
  ON public.project_substages FOR ALL
  USING (has_role('admin'));

-- Owners can update notes/evidence on substages (for self_serve tier)
CREATE POLICY "substages: owners update notes"
  ON public.project_substages FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_substages;
