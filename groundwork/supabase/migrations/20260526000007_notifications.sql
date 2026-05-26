-- =============================================================================
-- Migration 007 — Notifications
-- =============================================================================
-- Every in-app notification sent to a user.
-- Realtime is enabled so NotificationBell updates live.
-- =============================================================================

-- ── Notification type enum ────────────────────────────────────────────────────

CREATE TYPE notification_type AS ENUM (
  'stage_approved',
  'stage_rejected',
  'stage_submitted',
  'substage_updated',
  'payment_recorded',
  'payment_released',
  'contractor_invited',
  'contractor_accepted',
  'contractor_rejected',
  'certificate_issued',
  'project_created',
  'message_received',
  'system'
);

-- ── Notifications table ───────────────────────────────────────────────────────

CREATE TABLE public.notifications (
  id            uuid             PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid             NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type          notification_type NOT NULL,
  title         text             NOT NULL,
  body          text             NOT NULL,
  -- Optional deep-link data so the client can navigate to the right resource
  entity_type   text,            -- "project" | "stage" | "payment" | "contractor" | null
  entity_id     uuid,            -- the referenced row's id
  read_at       timestamptz,     -- null = unread
  created_at    timestamptz      NOT NULL DEFAULT now()
);

-- Index: user's unread notifications (the most common query)
CREATE INDEX notifications_user_id_read_at_idx
  ON public.notifications (user_id, read_at)
  WHERE read_at IS NULL;

-- Index: full list ordered by newest (for the notification panel)
CREATE INDEX notifications_user_id_created_at_idx
  ON public.notifications (user_id, created_at DESC);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "notifications: users read own"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can mark their own notifications as read (UPDATE read_at only)
CREATE POLICY "notifications: users update own"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Only the service role (edge functions) can insert notifications
-- Client-side inserts are blocked — notifications are created server-side only.
CREATE POLICY "notifications: service role insert"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications (clear all)
CREATE POLICY "notifications: users delete own"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admins can read all notifications
CREATE POLICY "notifications: admins read all"
  ON public.notifications
  FOR SELECT
  USING (has_role('admin'));

-- ── Realtime ──────────────────────────────────────────────────────────────────

ALTER publication supabase_realtime ADD TABLE public.notifications;

-- ── Helper function: create_notification() ───────────────────────────────────
-- Called from edge functions and triggers to insert notifications.
-- Uses the service client implicitly (SECURITY DEFINER bypasses RLS).

CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id    uuid,
  p_type       notification_type,
  p_title      text,
  p_body       text,
  p_entity_type text  DEFAULT NULL,
  p_entity_id  uuid  DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, entity_type, entity_id)
  VALUES (p_user_id, p_type, p_title, p_body, p_entity_type, p_entity_id)
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;
