-- Migration 006: project_documents, document_shares, messages
-- Documents: file vault per project with versioning and stage tagging
-- Document shares: expiring share tokens for external access
-- Messages: per-project realtime chat

-- ── Document category enum ────────────────────────────────────────────────────

create type document_category as enum (
  'contract', 'permit', 'receipt', 'invoice', 'report', 'certificate', 'other'
);

-- ── project_documents ─────────────────────────────────────────────────────────

create table public.project_documents (
  id           uuid               primary key default gen_random_uuid(),
  project_id   uuid               not null references public.projects(id) on delete cascade,
  stage_id     uuid               references public.stages(id) on delete set null,
  category     document_category  not null default 'other',
  name         text               not null,
  file_url     text               not null,
  file_size    bigint,
  mime_type    text,
  parent_id    uuid               references public.project_documents(id),
  version      integer            not null default 1,
  is_current   boolean            not null default true,
  uploaded_by  uuid               not null references public.profiles(id) on delete restrict,
  notes        text,
  created_at   timestamptz        not null default now()
);

create index project_documents_project_id_idx on public.project_documents (project_id);
create index project_documents_stage_id_idx   on public.project_documents (stage_id);
create index project_documents_category_idx   on public.project_documents (project_id, category);

alter table public.project_documents enable row level security;

create policy "Owner reads own project documents"
  on public.project_documents for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

create policy "Professionals read assigned project documents"
  on public.project_documents for select
  using (has_role('jala_professional') or has_role('admin') or has_role('super_admin'));

create policy "Owner inserts documents"
  on public.project_documents for insert
  with check (
    uploaded_by = auth.uid()
    and exists (
      select 1 from public.projects p
      where p.id = project_id and p.owner_id = auth.uid()
    )
  );

create policy "Professionals insert documents"
  on public.project_documents for insert
  with check (
    uploaded_by = auth.uid()
    and (has_role('jala_professional') or has_role('admin'))
  );

create policy "Owner updates own documents"
  on public.project_documents for update
  using (uploaded_by = auth.uid());

-- ── document_shares ───────────────────────────────────────────────────────────

create table public.document_shares (
  id          uuid        primary key default gen_random_uuid(),
  document_id uuid        not null references public.project_documents(id) on delete cascade,
  token       text        not null unique,
  expires_at  timestamptz not null,
  created_by  uuid        not null references public.profiles(id) on delete restrict,
  created_at  timestamptz not null default now()
);

create index document_shares_token_idx on public.document_shares (token);

alter table public.document_shares enable row level security;

create policy "Creator reads own shares"
  on public.document_shares for select
  using (created_by = auth.uid());

create policy "Creator inserts shares"
  on public.document_shares for insert
  with check (created_by = auth.uid());

-- Public select via token is handled in the document-share edge function
-- (service role client bypasses RLS for token validation)

-- ── messages ──────────────────────────────────────────────────────────────────

create table public.messages (
  id         uuid        primary key default gen_random_uuid(),
  project_id uuid        not null references public.projects(id) on delete cascade,
  sender_id  uuid        not null references public.profiles(id) on delete restrict,
  body       text        not null check (length(body) <= 2000),
  created_at timestamptz not null default now()
);

create index messages_project_id_idx on public.messages (project_id, created_at desc);

alter table public.messages enable row level security;
alter publication supabase_realtime add table public.messages;

create policy "Project participants read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and (
          p.owner_id = auth.uid()
          or p.assigned_professional_id = auth.uid()
          or has_role('admin')
          or has_role('super_admin')
        )
    )
  );

create policy "Project participants send messages"
  on public.messages for insert
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.projects p
      where p.id = project_id
        and (
          p.owner_id = auth.uid()
          or p.assigned_professional_id = auth.uid()
          or has_role('admin')
          or has_role('super_admin')
        )
    )
  );
