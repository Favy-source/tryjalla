/**
 * Settings page — 4-tab layout matching the blueprint screenshot.
 * Tabs: Profile · Notifications · Security · Billing
 *
 * Day 2: Tab chrome + placeholder content.
 * Content will be filled in on dedicated settings days.
 */
import { useState } from "react";
import { User, Bell, Shield, CreditCard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTier } from "@/hooks/useTier";
import { TIER_LABELS } from "@/lib/constants";

// ── Tab definition ────────────────────────────────────────────────────────────

type TabId = "profile" | "notifications" | "security" | "billing";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: Tab[] = [
  { id: "profile",       label: "Profile",       icon: User       },
  { id: "notifications", label: "Notifications", icon: Bell       },
  { id: "security",      label: "Security",      icon: Shield     },
  { id: "billing",       label: "Billing",       icon: CreditCard },
];

// ── Tab content placeholders ──────────────────────────────────────────────────

function ProfileTab() {
  const { user, profile } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-brand-near-black">
          Personal information
        </h3>
        <p className="text-sm text-brand-mid-grey mt-1">
          Update your display name, avatar, and contact details.
        </p>
      </div>

      {/* Placeholder form */}
      <div className="rounded-lg border border-brand-border-grey bg-white p-6 space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-brand-near-black mb-1">
              Display name
            </label>
            <div className="h-9 rounded-md border border-brand-border-grey bg-brand-light-grey px-3 flex items-center">
              <span className="text-sm text-brand-mid-grey">
                {profile?.display_name ?? "—"}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-near-black mb-1">
              Email address
            </label>
            <div className="h-9 rounded-md border border-brand-border-grey bg-brand-light-grey px-3 flex items-center">
              <span className="text-sm text-brand-mid-grey">{user?.email ?? "—"}</span>
            </div>
          </div>
        </div>

        <p className="text-xs text-brand-mid-grey italic">
          Profile editing form — coming soon.
        </p>
      </div>
    </div>
  );
}

function NotificationsTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-brand-near-black">
          Notification preferences
        </h3>
        <p className="text-sm text-brand-mid-grey mt-1">
          Choose which events send you in-app and email notifications.
        </p>
      </div>

      <div className="rounded-lg border border-brand-border-grey bg-white p-6">
        <p className="text-xs text-brand-mid-grey italic">
          Notification preference toggles — coming soon.
        </p>
      </div>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-brand-near-black">
          Password & security
        </h3>
        <p className="text-sm text-brand-mid-grey mt-1">
          Change your password and manage sign-in sessions.
        </p>
      </div>

      <div className="rounded-lg border border-brand-border-grey bg-white p-6">
        <p className="text-xs text-brand-mid-grey italic">
          Password change form and session management — coming soon.
        </p>
      </div>
    </div>
  );
}

function BillingTab() {
  const { tier, features } = useTier();
  const tierLabel = TIER_LABELS[tier] ?? "Self Verify";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-brand-near-black">
          Plan & billing
        </h3>
        <p className="text-sm text-brand-mid-grey mt-1">
          Manage your subscription and payment method.
        </p>
      </div>

      {/* Current plan */}
      <div className="rounded-lg border border-brand-border-grey bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-brand-mid-grey uppercase tracking-wider mb-1">
              Current plan
            </p>
            <p className="text-lg font-semibold text-brand-near-black">
              {tierLabel}
            </p>
            <p className="text-sm text-brand-mid-grey mt-0.5">
              {features.priceDisplay}
              {features.price === 0 && " — free forever"}
            </p>
          </div>
          <a
            href="/pricing"
            className="inline-flex items-center rounded-md border border-brand-border-grey bg-white px-4 py-2 text-sm font-medium text-brand-near-black hover:bg-brand-light-grey transition-colors"
          >
            Change plan
          </a>
        </div>

        {tier === "self_serve" && (
          <div className="mt-4 rounded-md border border-dashed border-brand-border-grey p-4">
            <p className="text-xs font-semibold text-brand-near-black">
              Unlock professional verification
            </p>
            <p className="text-xs text-brand-mid-grey mt-0.5">
              Upgrade to Jalla Verify for stage completion certificates,
              site visit reports, and professional approval.
            </p>
            <a
              href="/pricing"
              className="mt-3 inline-flex items-center rounded-md bg-brand-near-black px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-rich-black transition-colors"
            >
              See plans →
            </a>
          </div>
        )}

        {tier !== "self_serve" && (
          <p className="mt-4 text-xs text-brand-mid-grey italic">
            Subscription management — coming soon.
          </p>
        )}
      </div>
    </div>
  );
}

// ── Page component ────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");

  const tabContent: Record<TabId, React.ReactNode> = {
    profile:       <ProfileTab />,
    notifications: <NotificationsTab />,
    security:      <SecurityTab />,
    billing:       <BillingTab />,
  };

  return (
    <div className="min-h-full">
      {/* Page header */}
      <div className="border-b border-brand-border-grey bg-white px-6 py-5">
        <h1 className="text-xl font-semibold text-brand-near-black">Settings</h1>
        <p className="text-sm text-brand-mid-grey mt-1">
          Manage your account preferences and subscription.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* ── Tab navigation — side on lg, top on mobile ────────────────── */}
        <nav
          className="flex flex-row lg:flex-col gap-0.5 px-4 py-3 lg:px-4 lg:py-6 lg:w-52 lg:border-r lg:border-brand-border-grey lg:min-h-[calc(100vh-130px)] overflow-x-auto lg:overflow-x-visible"
          aria-label="Settings sections"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-left transition-colors whitespace-nowrap flex-shrink-0",
                  isActive
                    ? "bg-brand-near-black text-white font-medium"
                    : "text-brand-mid-grey hover:bg-brand-light-grey hover:text-brand-near-black",
                ].join(" ")}
                aria-selected={isActive}
                role="tab"
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* ── Tab content ──────────────────────────────────────────────── */}
        <div className="flex-1 p-6" role="tabpanel">
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-brand-mid-grey">
        Failed to load settings. Please refresh.
      </p>
    </div>
  );
}
