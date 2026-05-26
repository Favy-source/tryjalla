/**
 * NotificationBell — shows an unread count badge and opens a dropdown
 * with the latest 20 notifications. Subscribes via Realtime so the
 * badge updates live without polling.
 *
 * Used in the authenticated layout header and the mobile top bar.
 */
import { useState, useCallback, useEffect } from "react";
import { Bell, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/types";

type Notification = Tables<"notifications">;

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  // ── Fetch notifications ──────────────────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      setNotifications(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  // ── Live updates via Realtime ────────────────────────────────────────────

  useRealtime<Record<string, unknown>>({
    table: "notifications",
    filter: user ? `user_id=eq.${user.id}` : undefined,
    enabled: !!user,
    onEvent: useCallback(() => {
      void fetchNotifications();
    }, [fetchNotifications]),
  });

  // ── Mark as read ─────────────────────────────────────────────────────────

  async function markRead(id: string) {
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    }
  }

  async function markAllRead() {
    if (!user) return;
    const unreadIds = notifications
      .filter((n) => !n.read_at)
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", unreadIds);

    if (!error) {
      setNotifications((prev) =>
        prev.map((n) =>
          unreadIds.includes(n.id)
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex items-center justify-center w-9 h-9 rounded-md text-brand-mid-grey hover:bg-brand-light-grey hover:text-brand-near-black transition-colors"
        aria-label={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
            : "Notifications"
        }
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-near-black text-[10px] font-semibold text-white"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <>
          {/* Backdrop (close on outside click) */}
          <div
            className="fixed inset-0 z-40"
            aria-hidden="true"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-lg border border-brand-border-grey bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-brand-border-grey px-4 py-3">
              <h2 className="text-sm font-semibold text-brand-near-black">
                Notifications
              </h2>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAllRead()}
                    className="flex items-center gap-1 text-xs text-brand-mid-grey hover:text-brand-near-black transition-colors"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-brand-mid-grey hover:text-brand-near-black transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-border-grey border-t-brand-near-black" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <Bell className="mx-auto mb-2 h-8 w-8 text-brand-border-grey" />
                  <p className="text-sm text-brand-mid-grey">
                    No notifications yet
                  </p>
                </div>
              ) : (
                <ul role="list">
                  {notifications.map((n) => (
                    <li
                      key={n.id}
                      className={[
                        "flex items-start gap-3 px-4 py-3 border-b border-brand-border-grey last:border-b-0",
                        !n.read_at ? "bg-brand-light-grey" : "",
                      ].join(" ")}
                    >
                      {/* Unread indicator */}
                      <div className="flex-shrink-0 mt-1.5">
                        <span
                          className={[
                            "block w-2 h-2 rounded-full",
                            !n.read_at
                              ? "bg-brand-near-black"
                              : "bg-transparent",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-brand-near-black leading-snug">
                          {n.title}
                        </p>
                        <p className="text-xs text-brand-mid-grey mt-0.5 leading-snug">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-brand-muted-grey mt-1">
                          {timeAgo(n.created_at)}
                        </p>
                      </div>

                      {/* Mark read */}
                      {!n.read_at && (
                        <button
                          type="button"
                          onClick={() => void markRead(n.id)}
                          className="flex-shrink-0 text-brand-mid-grey hover:text-brand-near-black transition-colors mt-0.5"
                          aria-label="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer — link to full notifications page */}
            {notifications.length > 0 && (
              <div className="border-t border-brand-border-grey px-4 py-3">
                <a
                  href="/notifications"
                  className="block text-center text-xs font-medium text-brand-mid-grey hover:text-brand-near-black transition-colors"
                  onClick={() => setOpen(false)}
                >
                  View all notifications
                </a>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
