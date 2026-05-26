/**
 * useRealtime — generic Supabase Realtime subscription hook.
 *
 * Subscribes to row-level changes on a given table and calls `onEvent`
 * whenever a matching INSERT, UPDATE, or DELETE fires.
 *
 * Usage:
 *   useRealtime({
 *     table: "notifications",
 *     filter: `user_id=eq.${user.id}`,
 *     onEvent: (payload) => { refetch(); },
 *   });
 *
 * The subscription is torn down automatically when the component unmounts
 * or when the `enabled` flag flips to false.
 */
import { useEffect, useRef } from "react";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

type EventType = "INSERT" | "UPDATE" | "DELETE" | "*";

interface UseRealtimeOptions<T extends Record<string, unknown>> {
  /** The Postgres table to subscribe to */
  table: string;

  /**
   * Optional Supabase Realtime filter expression.
   * Format: "column=eq.value"
   * Example: "user_id=eq.abc-123"
   */
  filter?: string;

  /**
   * Which event types to listen for.
   * @default "*" — all events
   */
  event?: EventType;

  /**
   * Schema name. Almost always "public".
   * @default "public"
   */
  schema?: string;

  /**
   * Called on every matching event with the full Realtime payload.
   * Memoize with useCallback if you reference state inside the callback.
   */
  onEvent: (payload: RealtimePostgresChangesPayload<T>) => void;

  /**
   * Set to false to skip the subscription (e.g., while auth is loading).
   * @default true
   */
  enabled?: boolean;
}

export function useRealtime<T extends Record<string, unknown>>({
  table,
  filter,
  event = "*",
  schema = "public",
  onEvent,
  enabled = true,
}: UseRealtimeOptions<T>): void {
  // Keep a stable ref to the latest callback so the subscription
  // doesn't need to re-subscribe when only the callback changes.
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  }, [onEvent]);

  useEffect(() => {
    if (!enabled) return;

    let channel: RealtimeChannel | null = null;

    const channelName = filter
      ? `realtime:${schema}.${table}:${filter}`
      : `realtime:${schema}.${table}`;

    channel = supabase
      .channel(channelName)
      .on<T>(
        "postgres_changes" as Parameters<RealtimeChannel["on"]>[0],
        {
          event,
          schema,
          table,
          ...(filter ? { filter } : {}),
        },
        (payload) => {
          onEventRef.current(payload as RealtimePostgresChangesPayload<T>);
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, [table, filter, event, schema, enabled]);
}
