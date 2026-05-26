# CLAUDE.md

## Project

You are building **Groundwork by Jalla** — a construction project management platform for the African market (Nigeria-first, 13 countries). It helps diaspora homeowners plan, track, verify, and pay for residential construction stage by stage.

The full engineering specification is in `docs/groundwork-engineering-blueprint.md` and `docs/groundwork-blueprint-addendum.md`. Read both before writing any code. They contain the exact database schema, edge function logic, component list, design tokens, build order, and UI reference notes from 17 production screenshots.

---

## Stack

- **Frontend:** React 18 + TypeScript + Vite + React Router v7 (file-based routing)
- **Styling:** Tailwind CSS 4 + shadcn/ui components
- **Backend:** Supabase (Postgres + Auth + Storage + Edge Functions + Realtime)
- **Email:** Resend
- **Charts:** Recharts
- **Animation:** Framer Motion
- **Testing:** Vitest (unit + component) · Deno test (edge functions) · Playwright (e2e)
- **PDF generation:** pdf-lib (certificates, invoices, budget reports)

---

## Brand & design rules

This is a strict greyscale brand. No accent colors anywhere. Ever.

```
Colors:
  White:       #FFFFFF
  Near Black:  #0A0A0A
  Rich Black:  #1A1A1A
  Mid Grey:    #888888
  Light Grey:  #F5F5F5
  Black:       #000000
  Muted Grey:  #9CA3AF
  Border Grey: #E5E5E5

Typography:  Inter only, weights 300–800
Buttons:     Primary = black fill + white text. Secondary = white fill + grey border.
Borders:     1px solid #E5E5E5, border-radius 8px default, 12px for cards
Shadows:     Minimal — hover states and modals only
Status:      Differentiate via font weight, borders, and icons — never color
Dark mode:   Admin panel uses dark theme (Rich Black #1A1A1A background). Client app uses light theme.
Mobile:      375px is the baseline. Every page must work at this width. Test before moving on.
```

Do not use colored badges, colored status indicators, or any non-greyscale element. Status is communicated through weight (bold vs regular), borders (solid vs dashed), and icons (checkmark vs clock vs lock).

---

## Architecture rules — non-negotiable

These rules exist because the previous build had bugs when they were violated. Enforce them on every file you write.

### Auth & roles
- Roles live in the `user_roles` table. **Never** put roles on `profiles`.
- The `has_role()` function is SECURITY DEFINER and is used in every admin RLS policy.
- Use `requireRole()` and `requireMinTier()` from `supabase/functions/_shared/auth.ts` in every edge function.
- Five roles exist: `client`, `admin`, `super_admin`, `jala_professional`, `contractor`.
- Three subscription tiers exist: `self_serve` (Self Verify, $0), `hybrid` (Jalla Verify, $199/mo), `full_service` (Jalla Management, custom). Enum values stay as `self_serve`/`hybrid`/`full_service` internally; display labels are "Self Verify"/"Jalla Verify"/"Jalla Management".

### Database
- RLS on **every** table. No exceptions. Write the policy in the same migration that creates the table.
- All money fields are `numeric`, stored in local currency.
- Never edit auto-generated `types.ts` — run `supabase gen types typescript` to regenerate.
- Every schema change is a numbered migration file in `supabase/migrations/`. Never hand-edit the database.
- Realtime is enabled on: `stages`, `project_substages`, `messages`, `payments`, `notifications`.

### Edge functions
- Every edge function must: (1) verify auth via JWT, (2) validate input with Zod, (3) check role/tier server-side, (4) write to `audit_log`, (5) trigger relevant notifications.
- Never trust the client for tier or role checks. Always re-read from DB in the edge function.
- Every edge function ships with a Deno test file. Do not skip tests.
- Use the service role client (`getServiceClient()`) for cross-user operations. Use the user client (`getSupabaseClient(req)`) for auth verification.

### Frontend
- `useTier()` hook reads `profiles.subscription_tier` and returns the tier + feature map.
- `<TierGate feature="...">` wraps gated UI. Three modes: `lock` (show with lock icon + upgrade CTA), `blur` (show blurred with overlay), `hide` (don't render). Prefer `lock` or `blur` — hiding features makes users unaware they exist.
- `TIER_FEATURES` in `src/lib/tier-features.ts` is the single source of truth for what each tier can do. Both the frontend and the marketing pricing page read from this.
- Every page must have: loading state, empty state, error boundary. No blank screens.
- Commit after every completed component or function. Small commits, descriptive messages.

---

## Tier-aware approval routing

This is the most important logic in the system. The `approve-stage` edge function routes differently based on the project owner's subscription tier:

**Self Verify (`self_serve`):**
- Owner clicks "Mark stage completed"
- No admin review. Stage completes immediately.
- Next stage unlocks. Payment releases.
- No certificate issued.

**Jalla Verify (`hybrid`):**
- Owner clicks "Submit for approval"
- Stage status → `awaiting_approval`
- Assigned Jalla Professional reviews evidence and substages
- Professional approves → stage completes, next unlocks, payment releases, **certificate auto-issued**
- Professional rejects → targets specific substages with notes, stage returns to `in_progress`

**Jalla Management (`full_service`):**
- Admin/professional manages the entire project on behalf of the client
- Admin updates substages, uploads evidence, approves stages
- Client view is read-only — they receive status updates only
- Certificate issued on every stage approval

Always check the tier by reading `profiles.subscription_tier` for the project owner, not the acting user.

---

## The 10 stages and 60 substages

Every project gets exactly 10 stages and ~60 substages seeded by `create-project`. The full substage map is in the blueprint under "Part 7 — Substage Seed Data". Payment allocation across stages:

```
1: Land Secured           5%
2: Design                10%
3: Site Preparation       5%
4: Foundation            15%
5: Structure & Walls     20%
6: Roofing               10%
7: Electrical & Plumbing 10%
8: Finishing             10%
9: Exterior              10%
10: Final Handover        5%
```

---

## Contractor model

Users **bring their own contractor** via invite (email → magic link → scoped account). This is the primary flow. The contractor directory is secondary — it helps users find professionals if they don't already have one.

Contractor scoped access: `{ upload_evidence: true, message: true, approve: false, manage_substages: false }`.

Self Verify users: max 1 contractor per project. Hybrid+: unlimited. Enforce server-side in `invite-contractor`.

All users can browse the contractor directory. Free users see names, specialties, ratings, and location. Contact details (phone, email, portfolio) are blurred with a `<TierGate mode="blur">` overlay and an upgrade CTA. The data is in the DOM but visually obscured — `pointer-events: none` prevents interaction.

---

## File organization

Follow the directory structure in the blueprint exactly. Key conventions:
- Routes in `src/app/routes/` using React Router v7 file-based routing
- Shared components in `src/components/shared/`
- Feature components grouped by domain: `projects/`, `contractors/`, `admin/`, `pricing/`, `tier/`
- Hooks in `src/hooks/`
- Business logic in `src/lib/` (budget engine, floor costs, substage seed, tier features, constants)
- Edge functions in `supabase/functions/` with shared helpers in `_shared/`
- Migrations in `supabase/migrations/` numbered sequentially

---

## Build order

Follow the phases in the blueprint. Don't jump ahead. Each phase depends on the previous one.

1. **Foundation** (auth, profiles, roles, sidebar, routing)
2. **Project Creation** (9-step wizard, budget engine, create-project edge function)
3. **Project Detail** (stages, substages, approvals, budget, payments, chat, documents, team)
4. **Contractor Directory** (cards with blur gating, profiles, inquiries, reviews)
5. **Subscriptions + Pricing** (pricing page, tier badge, upgrade flows, lead capture)
6. **Admin Panel** (dark theme, command center, all management pages)
7. **Certificates + Full-Service** (PDF generation, QR verification, admin-on-behalf)
8. **Testing + Polish** (unit tests, e2e tests, seed data, SEO, onboarding)

Within each phase, work through the days listed in the blueprint. After each day's work: test at 375px, commit, move on.

---

## Testing requirements

- **After every edge function:** Write a Deno test covering auth check, validation, happy path, and error cases.
- **After every page:** Verify at 375px viewport width. No horizontal scrolling. Tables become cards on mobile.
- **After Phase 3 (project detail):** Run the full stage workflow end-to-end: create project → update substages → upload evidence → approve stage → verify next stage unlocks.
- **Unit tests for:** `floor-costs.ts` (multiple scenarios × budgets × countries), `budget-engine.ts`, `tier-features.ts`, `substage-seed.ts`.
- **Playwright e2e for:** auth flow, project creation, stage workflow, contractor invite, mobile smoke.

---

## Common mistakes to prevent

1. **Don't put roles on profiles.** Use `user_roles` table + `has_role()` function. Always.
2. **Don't skip RLS.** Every table gets policies in the same migration that creates it.
3. **Don't trust client-side tier checks.** Always re-read `profiles.subscription_tier` in edge functions.
4. **Don't use colored UI elements.** This is a greyscale brand. Status uses weight/border/icon.
5. **Don't build admin pages before the client app works.** Admin reads client data — it needs the tables to exist first.
6. **Don't hardcode stage or substage names in components.** Read from the database. The seed data is the source of truth.
7. **Don't create a single large migration.** One migration per logical group. Number them sequentially.
8. **Don't skip the audit log write.** Every edge function that mutates data must insert into `audit_log` with `actor_id`, `entity_type`, `entity_id`, `action`, `metadata`, and `ip_address`.
9. **Don't forget notifications.** Every state change (stage approved/rejected, payment recorded, contractor invited, certificate issued) triggers an in-app notification and a transactional email (if the user's preferences allow).
10. **Don't assume 6 stages.** The platform uses 10 stages with ~60 substages. The payment page may display grouped milestones, but the underlying model is always 10 stages.

---

## When I say "build [feature]"

If I ask you to build a specific feature, page, or component:

1. **Read the blueprint first.** Check both `docs/groundwork-engineering-blueprint.md` and `docs/groundwork-blueprint-addendum.md` for the exact specification.
2. **Check if a migration is needed.** If yes, create the migration file first, then the edge function, then the frontend component. Always database → backend → frontend.
3. **Follow the schema exactly.** Don't improvise column names or types. The blueprint specifies them.
4. **Match the UI to the screenshots.** The addendum describes every page from the screenshots in detail — layout, columns, badges, button placements, filter bars.
5. **Write the test.** Edge function → Deno test. Component → Vitest test if it has logic. Page → verify at 375px.
6. **Commit with a descriptive message.** Format: `feat(projects): add stage approval with tier routing` or `fix(auth): enforce role check in approve-stage`.
