import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router";
import {
  LayoutDashboard,
  FolderOpen,
  CreditCard,
  FileText,
  Bell,
  Settings,
  HelpCircle,
  Menu,
  X,
  ChevronDown,
  HardHat,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { TIER_LABELS } from "@/lib/constants";
import { NotificationBell } from "@/components/shared/NotificationBell";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",         href: "/",              icon: LayoutDashboard },
  { label: "My Projects",       href: "/projects",      icon: FolderOpen      },
  { label: "Find Contractors",  href: "/contractors",   icon: HardHat         },
  { label: "Payments",          href: "/payments",      icon: CreditCard      },
  { label: "Documents",         href: "/documents",     icon: FileText        },
  { label: "Notifications",     href: "/notifications", icon: Bell            },
  { label: "Settings",          href: "/settings",      icon: Settings        },
  { label: "Help & Support",    href: "/help",          icon: HelpCircle      },
];

// ─── Shared inner content (desktop + mobile drawer use the same) ────────────

interface SidebarContentProps {
  onNavClick?: () => void;
}

function SidebarContent({ onNavClick }: SidebarContentProps) {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();

  const tierLabel =
    TIER_LABELS[profile?.subscription_tier ?? "self_serve"] ?? "Self Verify";

  const initials = (profile?.display_name ?? user?.email ?? "U")
    .split(" ")
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function isActive(href: string) {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Logo ───────────────────────────────────────────────────────── */}
      <div className="h-16 flex items-center px-6 border-b border-brand-border-grey flex-shrink-0">
        <Link to="/" className="block" onClick={onNavClick}>
          <p className="text-sm font-bold text-brand-near-black tracking-tight leading-none">
            Groundwork
          </p>
          <p className="text-xs text-brand-mid-grey font-medium mt-0.5">
            by Jalla
          </p>
        </Link>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav
        className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto"
        aria-label="Main navigation"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onNavClick}
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

      {/* ── User card ──────────────────────────────────────────────────── */}
      <div className="p-4 border-t border-brand-border-grey flex-shrink-0">
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

          {/* Dropdown toggle — expanded functionality added later */}
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
          onClick={() => { void signOut(); onNavClick?.(); }}
          className="mt-3 w-full text-left text-xs text-brand-mid-grey hover:text-brand-near-black transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

// ─── Desktop sidebar ────────────────────────────────────────────────────────

function DesktopSidebar() {
  return (
    <aside className="hidden lg:flex w-64 flex-shrink-0 border-r border-brand-border-grey bg-white flex-col">
      <SidebarContent />
    </aside>
  );
}

// ─── Mobile top bar ─────────────────────────────────────────────────────────

interface MobileTopBarProps {
  onOpen: () => void;
}

function MobileTopBar({ onOpen }: MobileTopBarProps) {
  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center justify-between px-4 bg-white border-b border-brand-border-grey">
      {/* Logo */}
      <Link to="/" className="block">
        <p className="text-sm font-bold text-brand-near-black tracking-tight leading-none">
          Groundwork
        </p>
        <p className="text-xs text-brand-mid-grey font-medium leading-none mt-0.5">
          by Jalla
        </p>
      </Link>

      {/* Right side: notification bell + hamburger */}
      <div className="flex items-center gap-1">
        <NotificationBell />
        <button
          type="button"
          onClick={onOpen}
          className="flex items-center justify-center w-9 h-9 rounded-md text-brand-mid-grey hover:bg-brand-light-grey hover:text-brand-near-black transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

// ─── Mobile drawer ──────────────────────────────────────────────────────────

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll while drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="lg:hidden fixed inset-0 z-40 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-64 bg-white shadow-xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* Close button inside drawer header */}
        <div className="absolute top-3 right-3">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-md text-brand-mid-grey hover:bg-brand-light-grey hover:text-brand-near-black transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <SidebarContent onNavClick={onClose} />
      </aside>
    </>
  );
}

// ─── Sidebar (exported) ─────────────────────────────────────────────────────
// Renders desktop sidebar + mobile top bar + mobile drawer in one component.
// _layout.tsx adds pt-14 lg:pt-0 to the main element to accommodate the
// fixed mobile header.

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <DesktopSidebar />
      <MobileTopBar onOpen={() => setMobileOpen(true)} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
