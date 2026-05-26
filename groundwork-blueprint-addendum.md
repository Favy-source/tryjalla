# Groundwork — Blueprint Addendum (Screenshot Review)

**Date:** 26 May 2026
**Applies to:** groundwork-engineering-blueprint.md
**Source:** 17 screenshots across client app, admin panel, public pages

---

## New pages and routes discovered

These screenshots reveal pages and navigation items not in the original blueprint. Add them.

### Client sidebar (updated from screenshots)

The client sidebar varies slightly across screenshots but the consolidated navigation is:

```
Client sidebar:
├── Dashboard
├── My Projects
├── Tasks                    ← NEW: not in blueprint
├── Schedule                 ← NEW: not in blueprint
├── Budget                   ← NEW: not in blueprint (may be sub-nav of project)
├── Find Contractors
│   ├── Messages             ← NEW: contractor messaging inbox
│   ├── Quotes               ← NEW: quote tracking
│   ├── Bookings             ← NEW: booking management
│   └── Reviews              ← NEW: reviews written/received
├── Payments
├── Documents
├── Team                     ← NEW: not in blueprint
├── Site Reports             ← NEW: not in blueprint
├── Notifications
├── Tools                    ← link to public tools
├── Settings
│   ├── Profile tab
│   ├── Notifications tab
│   ├── Security tab         ← NEW: password change, 2FA
│   └── Billing tab          ← NEW: subscription management
├── Help & Support
└── [User card at bottom: name, role, tier badge, "View plan" link]
```

### Admin sidebar (updated from screenshots)

```
Admin sidebar:
├── Dashboard / Overview
├── Projects
│   └── Create for Client    ← separate nav item in some screenshots
├── Users
├── Professionals            ← NEW: dedicated professionals management
├── Contractors
├── Clients                  ← NEW: separate from Users
├── Organizations            ← NEW: not in blueprint
├── Verifications            ← NEW: verification queue/management
├── Reports                  ← NEW: report generation
├── Templates                ← NEW: email/document templates
├── Analytics                ← NEW: separate from dashboard
├── Funnel
├── Engagement               ← NEW: user engagement tools
├── Emails                   ← NEW: dedicated email management
├── Segments                 ← NEW: user segmentation
├── Flags                    ← NEW: feature flags
├── Subscriptions
├── Invoices                 ← NEW: separate from payments
├── Transactions             ← NEW: transaction log
├── Payments / Payments Queue
├── Disputes                 ← NEW: payment disputes
├── Certificates
├── Documents
├── Audit Log
├── Email Health
├── Settings
├── Support                  ← NEW: support ticket management
└── Sign Out
```

### New routes to add

```
src/app/routes/
├── contractors/
│   ├── messages.tsx          # Contractor messaging inbox
│   ├── quotes.tsx            # Quote tracking
│   ├── bookings.tsx          # Booking management
│   └── reviews.tsx           # Reviews written/received
├── settings/
│   ├── index.tsx             # Redirects to profile
│   ├── profile.tsx           # Profile + avatar upload
│   ├── notifications.tsx     # Notification preference toggles
│   ├── security.tsx          # Password change, sessions
│   └── billing.tsx           # Subscription card, upgrade CTA
├── admin/
│   ├── professionals.tsx     # Jala Professional management
│   ├── clients.tsx           # Client-only user view
│   ├── organizations.tsx     # Organization management
│   ├── verifications.tsx     # Verification queue
│   ├── reports.tsx           # Report generation
│   ├── invoices.tsx          # Invoice management
│   ├── transactions.tsx      # Transaction log
│   ├── disputes.tsx          # Payment disputes
│   └── analytics.tsx         # Separate analytics page
```

---

## UI details captured per screenshot

### 1. Admin Subscriptions & Revenue

**Page title:** "Subscriptions & Revenue"

**Stat cards (top row, 4 cards):**
- MRR: `$8,420 USD` with `+12% vs last month` trend indicator + dollar icon
- Active Subscriptions: `47` with people icon
- Self Verify: `312 (Free)` with checkmark icon
- Jalla Verify: `47 ($199/mo)` with shield icon
- Jalla Management: `8 (Custom)` with building icon

**MRR chart:**
- Line chart titled "MRR Over Time (USD)"
- X-axis: monthly (Jun 2023 → May 2024)
- Y-axis: $0 → $10K
- Time range selector: "Last 12 Months" dropdown
- White line on dark background

**Subscriptions table:**
- Columns: User (avatar + name + email), Tier (badge), Started, MRR Contribution, Processing Fee (2%), Status, Actions
- Tier badges: "Self Verify" (grey), "Jalla Verify" (white), "Jalla Management" (grey)
- Status badges: Active (green-ish), Past Due (amber), Cancelled (red-ish)
- Actions: "Manage" dropdown per row
- Pagination: "Showing 1 to 6 of 47 results" with page numbers
- Search + Filter + Download buttons top-right

**Schema update needed:**
```sql
-- Add to audit_log or create subscriptions tracking table
alter table profiles add column subscription_started_at timestamptz;
alter table profiles add column subscription_status text default 'active'
  check (subscription_status in ('active', 'past_due', 'cancelled', 'trialing'));
```

### 2. Budget Calculator (Public Tool)

**Layout:** Split view — inputs left, results right

**Input panel (left):**
- Country dropdown (shows flag: Nigeria 🇳🇬)
- Building Type: radio cards with small illustrations (Residential ● / Commercial / Mixed-use)
- Total Square Meters: slider (50 → 1000) with input showing "320 sqm"
- Number of Floors: stepper (−/+) showing "2"
- Finish Level: toggle group (Standard / **Premium** / Luxury) — Premium is black filled
- Boys' Quarters: toggle switch (on/off)
- Roof Type: dropdown ("Long Span Aluminum (Metal)")
- **Calculate** button (full-width, black)

**Results panel (right):**
- Estimated Budget: `₦ 84,500,000` (large) with `≈ $54,200 USD` subtitle
- Budget Breakdown: 5 rows with icon, label, progress bar, percentage, amount
  - Materials: 45% — ₦38,025,000
  - Labor: 25% — ₦21,125,000
  - Engineering: 18% — ₦15,210,000
  - Permits: 2% — ₦1,690,000
  - Contingency: 10% — ₦8,450,000
- "Download PDF Report" button (outline)
- "Start Project with Jalla" button (black, full-width)

**Key difference from blueprint:** The calculator shows 5 breakdown categories (Materials, Labor, Engineering, Permits, Contingency) not the 9-section model from Vanessa's estimate. The 9-section model is for the internal project budget; the public tool uses the simplified 5-category view. Both should exist:
- Public tool: 5 categories (user-friendly)
- Project budget breakdown: 9 sections (engineering-accurate)

**Component:** Add `FinishLevelSelector.tsx` to shared components.

### 3. Admin Funnel

**Page title:** "User Lifecycle Funnel" with subtitle "Cohort tracking across 6 states"
**Date range:** picker top-right with Export button

**Funnel stat cards (6 cards in a row):**
Each card shows: number label, state name, count, drop % from previous, % of previous

| # | State | Count | Drop | % of previous |
|---|-------|-------|------|--------------|
| 1 | New Signups | 142 | — | 100% of total |
| 2 | Activated | 98 | ↓ 31.0% drop | 69.0% of previous |
| 3 | First Project | 64 | ↓ 34.7% drop | 65.3% of previous |
| 4 | Active Builders | 41 | ↓ 35.9% drop | 64.1% of previous |
| 5 | At Risk | 18 | ↓ 56.1% drop | 43.9% of previous |
| 6 | Churned | 12 | ↓ 33.3% drop | 66.7% of previous |

**Cohort retention chart:**
- Line chart: "Cohort retention over 90 days"
- X-axis: Day 0 → Day 90
- Y-axis: 0% → 100%
- Multiple cohort lines (New Signups, Activated, First Project, Active Builders, At Risk, Churned)
- Dropdown: "All Cohorts"
- Caption: "Retention = users who reached stage and were still active on or after day X"

**At-risk users table:**
- Title: "Users currently in 'At Risk' state 18"
- Columns: User (avatar + email), Last activity (relative), Email reminder status
- Email statuses: "Welcome sent", "Re-engage queued", "Winback"
- Actions: ••• menu per row
- Pagination

**Schema update:** The funnel states in the screenshot differ slightly from what's in the DB:
- DB has: lead, onboarded, active, wrapping_up, dormant, churned
- Screenshot shows: New Signups, Activated, First Project, Active Builders, At Risk, Churned

Update `get_client_funnel_state()` to use: `new_signup`, `activated`, `first_project`, `active_builder`, `at_risk`, `churned`

### 4. Admin Audit Log

**Page title:** "Audit Log" with subtitle "Every system action, immutable"

**Filters (top bar):**
- Actor: dropdown "All Actors"
- Action Type: dropdown "All Action Types"
- Date Range: date picker (from → to)
- Search: text input "Search actions, targets, IPs..."

**Table columns:**
- Timestamp: `2026-05-25 14:32:18` format
- Actor: avatar + name + role badge (Project Manager, Finance Lead, Super Admin, Admin, Site Manager, Compliance Officer, Contractor)
- Action: monospace text (`stage.approved`, `payment.recorded`, `user.invited`, `project.created`, `certificate.issued`, `stage.submitted`, `user.role_updated`, `settings.updated`, `stage.rejected`, `payment.refunded`)
- Target: entity name + context (e.g., "Harbour Walk Apartments / Stage 3 – Structure")
- IP Address: `203.0.113.42` format ← **NEW: not in blueprint schema**
- Diff: "View" button per row ← **NEW: diff viewer**

**Pagination:** "Showing 1 to 15 of 1,248 results"

**Schema update needed:**
```sql
-- Add IP address tracking to audit log
alter table audit_log add column ip_address inet;
-- Add diff/before-after data
alter table audit_log add column diff jsonb;
```

**New component:** `AuditDiffViewer.tsx` — modal showing before/after JSON diff for a given audit entry.

### 5. Client Settings

**Layout:** Tabbed interface — Profile | Notifications | Security | Billing

**Profile tab:**
- Avatar: circular with upload button ("Upload Photo — JPG, PNG or GIF. Max 2MB")
- Tier badge: top-right corner "Your Tier: Jalla Verify" as pill
- Form fields: Name, Email, Phone, Country (dropdown), Default Project Currency (dropdown showing "NGN – Nigerian Naira (₦)")
- Save Changes button (black, bottom-right)

**Notifications tab (visible in same screenshot):**
- Title: "Notification Preferences" with subtitle "Choose what updates you'd like to receive."
- Toggle rows:
  - Email updates: "Receive important updates and activity via email." — ON
  - Stage approvals: "Get notified when a project stage requires your approval." — ON
  - Payment reminders: "Receive reminders for upcoming and overdue payments." — ON
  - Weekly summary: "Receive a weekly summary of project activity." — OFF

**Sidebar decoration:** Construction crane illustration at bottom of sidebar (nice touch)

**Updates to blueprint:**
- Settings page becomes tabbed: `settings/profile.tsx`, `settings/notifications.tsx`, `settings/security.tsx`, `settings/billing.tsx`
- Add `default_currency` to profiles table
- Avatar upload uses Storage bucket

```sql
alter table profiles add column default_currency text default 'NGN';
```

### 6. Certificate Verification (Public Page)

**URL:** `groundwork.tryjalla.com/verify`

**Layout:** Centered card, white background, no sidebar (public page)

**Content (top to bottom):**
- Groundwork by Jalla logo (centered)
- Large black checkmark in circle
- "Certificate Verified" heading
- "This certificate of stage approval is authentic" subtitle
- Bordered card with stage details:
  - 🏗 Stage 3: Foundation & Substructure (with icon)
  - Project Name: Lekki 4-Bedroom Duplex
  - Project Type: Residential Build
  - Country: Nigeria
  - Issued By: Eng. Adaeze Nwosu, Jala Professional
  - Issued Date: May 18, 2026
  - Certificate Token: `JV-2026-0042-A8F3`
- QR code (centered, large)
- "View Full PDF" button (outline)
- Footer: "Verified at **groundwork.tryjalla.com/verify**"

**Certificate token format:** `JV-YYYY-NNNN-XXXX` (JV prefix + year + sequential + random suffix)

**Schema update:**
```sql
-- Update token generation to use JV-YYYY-NNNN-XXXX format
-- Currently just uses random text
```

### 7. Contractor Directory

**Page title:** "Find Contractors" with subtitle "Vetted construction professionals across West Africa"

**Filters (horizontal bar):**
- Search: "Search by name or specialty"
- Country: dropdown (showing Nigeria)
- Specialty: multi-select dropdown (showing "Masonry / Electrical / Plumbing / Roofing")
- Rating: dropdown "All Ratings"

**Card grid:** 3 columns × 2 rows (6 per page)

**Each card:**
- Company logo/avatar (placeholder image)
- Company name (bold): "Adebayo Construction Ltd"
- Specialty tags: pill badges (Masonry, Electrical, Plumbing, Roofing)
- Rating: ★★★★★ 4.8 (32 reviews)
- Location: 📍 Lagos, NG
- ✓ Verified badge (bottom-left)
- "View Profile" button (bottom-right, outline)

**Pagination:** "Showing 1 to 6 of 120 contractors" with page numbers

**Client sidebar for contractor section:**
```
Find Contractors (active)
Messages
Quotes
Bookings
Payments
Reviews
Saved
```

**Key observations:**
- Cards show company names, not individual names — the `contractors` table may need a `company_name` field or the `name` field serves double duty
- Multiple specialty tags per contractor — schema currently has single `specialty text`. Change to `specialties text[]` or `specialties jsonb`
- "Saved" feature — need a `saved_contractors` table for bookmarking

```sql
-- Update contractors for multi-specialty and company support
alter table contractors add column company_name text;
alter table contractors rename column specialty to primary_specialty;
alter table contractors add column specialties text[] default '{}';

-- Saved/bookmarked contractors
create table saved_contractors (
  user_id uuid not null references profiles(id) on delete cascade,
  contractor_id uuid not null references contractors(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, contractor_id)
);
```

### 8. Client Payments

**Page title:** "Payments" with subtitle "Record payments you've made and review your history"

**Layout:** Per-project expandable sections

**Each project section:**
- Project thumbnail image (building photo)
- Project name: "Lekki Duplex Build"
- Total Paid / Budget: "$45,000 / $120,000 USD"
- Progress bar: "37.5% of budget paid"
- "Record Payment" button (black, top-right)
- Expandable milestone table:
  - Columns: Stage/Milestone, Amount (₦), Paid, Status, Date Paid, expand arrow
  - Status badges: Paid (green-ish), Partial (amber), Unpaid (grey)

**Key observation:** The payments page shows 6 stages, not 10:
1. Mobilization & Site Setup
2. Foundation & Slab
3. Structural Works
4. Roofing
5. Finishing & Fixtures
6. Handover

This is a simplified stage view for the payment milestones — different from the 10 construction stages. The payment milestones may consolidate stages. However, the project detail page (earlier screenshot) shows 10 stages. The payments page likely groups payments by milestone rather than by individual stage.

**Decision needed:** Keep payment milestones as 10 (matching stages 1:1) or consolidate to 6 for payment display? The screenshots show inconsistency — project detail has 10, payment page has 6. Recommend keeping 10 stages with 10 payment milestones internally, but allowing the payments view to group/display them however makes sense. No schema change needed.

### 9. Client Notifications

**Page title:** "Notifications" with "3 unread" count

**Filters:** Toggle group (All | Unread | Read) + "All types" dropdown

**Action:** "Mark all read" button (top-right, outline)

**Notification cards:**
Each notification is a full-width card with:
- Icon (left): circular icon matching notification type (bell, receipt, certificate, message)
- Title (bold): "Stage 3 Foundation approved"
- Body: "Your Stage 3 Foundation has been reviewed and approved by your Jala Professional."
- Timestamp (right): "2h ago"
- Read indicator: solid dot (unread) or none (read)
- Dismiss: × button (right)

**Notification types observed:**
- `stage.approved` — bell icon
- `payment.recorded` — receipt icon
- `certificate.issued` — checkmark icon
- `message.received` — chat icon

---

## Summary of schema changes needed

```sql
-- 1. Profiles additions
alter table profiles add column default_currency text default 'NGN';
alter table profiles add column subscription_started_at timestamptz;
alter table profiles add column subscription_status text default 'active'
  check (subscription_status in ('active', 'past_due', 'cancelled', 'trialing'));

-- 2. Audit log additions
alter table audit_log add column ip_address inet;
alter table audit_log add column diff jsonb;

-- 3. Contractors multi-specialty
alter table contractors add column company_name text;
alter table contractors rename column specialty to primary_specialty;
alter table contractors add column specialties text[] default '{}';

-- 4. Saved contractors
create table saved_contractors (
  user_id uuid not null references profiles(id) on delete cascade,
  contractor_id uuid not null references contractors(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, contractor_id)
);
alter table saved_contractors enable row level security;
create policy "Users manage own saves"
  on saved_contractors for all using (auth.uid() = user_id);

-- 5. Certificate token format
-- Generate as JV-YYYY-NNNN-XXXX in the edge function

-- 6. Funnel states update
-- Update get_client_funnel_state() to use:
-- new_signup, activated, first_project, active_builder, at_risk, churned
```

## Summary of new components needed

```
src/components/
├── admin/
│   ├── SubscriptionsRevenuePage.tsx    # MRR chart + subscriptions table
│   ├── FunnelPage.tsx                  # 6-state funnel + cohort retention + at-risk table
│   ├── AuditDiffViewer.tsx            # Before/after JSON diff modal
│   ├── VerificationsQueue.tsx         # Verification management
│   └── DisputesTable.tsx              # Payment disputes
├── contractors/
│   ├── ContractorMessaging.tsx        # Messaging inbox
│   ├── QuoteTracking.tsx             # Quote management
│   ├── BookingManagement.tsx         # Booking tracking
│   └── SaveContractorButton.tsx      # Bookmark toggle
├── settings/
│   ├── ProfileTab.tsx                # Avatar upload + form fields
│   ├── NotificationsTab.tsx          # Toggle rows for preferences
│   ├── SecurityTab.tsx               # Password change
│   └── BillingTab.tsx                # Subscription management
├── payments/
│   └── ProjectPaymentSection.tsx     # Expandable per-project milestone table
├── notifications/
│   └── NotificationCard.tsx          # Full-width card with icon, title, body, timestamp
├── tools/
│   └── FinishLevelSelector.tsx       # Standard/Premium/Luxury toggle
└── certificates/
    └── CertificateVerifyPage.tsx     # Public verification page
```

## Updated build order impact

The new pages add roughly 3–4 days to the original 28-day estimate:

- **Day 12.5:** Settings tabs (Profile, Notifications, Security, Billing) — was a single page
- **Day 14.5:** Contractor messaging, quotes, bookings, saved — alongside directory
- **Day 18.5:** Admin subscriptions revenue page, funnel with cohort chart, audit diff viewer
- **Day 22.5:** Admin verifications queue, disputes, invoices, transactions

**Revised total: ~32 working days (7–8 weeks)**

---

## Sidebar navigation consistency note

The screenshots show different sidebar configurations across different mockups — some have "Tasks" and "Schedule", others don't; some admin views have "Segments" and "Flags", others don't. This is normal for iterative design, but for the build, lock the navigation to one canonical set before starting. Recommend:

**Client sidebar (canonical):**
```
Dashboard
My Projects
Find Contractors
Payments
Documents
Notifications
Settings
Tools
Help & Support
```

Keep it simple. Tasks, Schedule, Team, Site Reports, Budget, Messages, Quotes, Bookings, Reviews, and Saved can be sub-navigation within project detail or contractor sections — not top-level sidebar items. A sidebar with 15 items overwhelms a non-technical homeowner.

**Admin sidebar (canonical):**
```
Dashboard
Projects
Users (with role/tier tabs inside)
Professionals
Contractors
Subscriptions
Payments
Certificates
Documents
Funnel
Audit Log
Email Health
Settings
```

Organizations, Verifications, Reports, Templates, Analytics, Engagement, Emails, Segments, Flags, Invoices, Transactions, Disputes, and Support are either future features or sub-views within existing pages. Don't build them as separate routes until there's a real need. Ship lean, expand later.
