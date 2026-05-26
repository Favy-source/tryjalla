import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FolderOpen,
  CreditCard,
  FileText,
  Bell,
  Settings,
  HelpCircle,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TIER_LABELS } from "@/lib/constants";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",     href: "/",              icon: LayoutDashboard },
  { label: "My Projects",   href: "/projects",      icon: FolderOpen      },
  { label: "Payments",      href: "/payments",      icon: CreditCard      },
  { label: "Documents",     href: "/documents",     icon: FileText        },
  { label: "Notifications", href: "/notifications", icon: Bell            },
  { label: "Settings",      href: "/settings",      icon: Settings        },
  { label: "Help & Support",href: "/help",          icon: HelpCircle      },
];

export function Sidebar() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const tierLabel =
    TIER_LABELS[profile?.subscription_tier ?? "self_serve"] ?? "Self Verify";

  // Derive initials for avatar fallback
  const initials = (profile?.display_name ?? user?.email ?? "U")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function isActive(href: string) {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r border-brand-border-grey bg-white flex flex-col">
      {/* ── Logo ─────────────────────────────────────────────────────── */}
      <div className="h-16 flex items-center px-6 border-b border-brand-border-grey">
        <Link to="/" className="block">
          <p className="text-sm font-bold text-brand-near-black tracking-tight leading-none">
            Groundwork
          </p>
          <p className="text-xs text-brand-mid-grey font-medium mt-0.5">
            by Jalla
          </p>
        </Link>
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-4 space-y-0.5" aria-label="Main navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                active
                  ? "bg-brand-near-black text-white font-medium"
                  : "text-brand-mid-grey hover:bg-brand-light-grey hover:text-brand-near-black",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* ── User card ────────────────────────────────────────────────── */}
      <div className="p-4 border-t border-brand-border-grey">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-brand-light-grey border border-brand-border-grey flex items-center justify-center flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name ?? "Avatar"}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-brand-near-black">
                {initials}
              </span>
            )}
          </div>

          {/* Name + tier */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-brand-near-black truncate">
              {profile?.display_name ?? user?.email ?? "User"}
            </p>
            <p className="text-xs text-brand-mid-grey">{tierLabel}</p>
          </div>

          {/* Dropdown toggle — functionality added Day 2 */}
          <button
            type="button"
            className="text-brand-mid-grey hover:text-brand-near-black transition-colors"
            aria-label="User menu"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => void signOut()}
          className="mt-3 w-full text-left text-xs text-brand-mid-grey hover:text-brand-near-black transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
