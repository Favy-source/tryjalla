/**
 * ProjectChat — realtime per-project messaging between owner,
 * assigned professional, and admins.
 *
 * Messages are stored in the `messages` table and broadcast
 * via Supabase Realtime (INSERT subscription).
 * The message list auto-scrolls to the bottom on new messages.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtime } from "@/hooks/useRealtime";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

// ── Types ─────────────────────────────────────────────────────────────────────

interface MessageRow {
  id:         string;
  project_id: string;
  sender_id:  string;
  body:       string;
  created_at: string;
  profiles?: {
    display_name: string | null;
    email:        string;
  };
}

interface ProjectChatProps {
  projectId: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) {
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
    " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

function senderInitials(name: string | null, email: string): string {
  if (name) {
    const parts = name.trim().split(" ");
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message, isOwn }: { message: MessageRow; isOwn: boolean }) {
  const name    = message.profiles?.display_name ?? message.profiles?.email ?? "Unknown";
  const initials = senderInitials(message.profiles?.display_name ?? null, message.profiles?.email ?? "??");

  return (
    <div className={`flex gap-2.5 mb-3 ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-near-black text-white text-xs font-medium">
        {initials}
      </div>

      {/* Bubble */}
      <div className={`max-w-[75%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl px-3 py-2 text-sm ${
          isOwn
            ? "bg-brand-near-black text-white rounded-tr-sm"
            : "bg-brand-light-grey text-brand-near-black rounded-tl-sm"
        }`}>
          {!isOwn && (
            <p className="text-xs font-semibold mb-0.5 text-brand-mid-grey">{name}</p>
          )}
          <p className="whitespace-pre-wrap wrap-break-word">{message.body}</p>
        </div>
        <p className="mt-0.5 text-xs text-brand-mid-grey px-1">
          {formatTime(message.created_at)}
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ProjectChat({ projectId }: ProjectChatProps) {
  const { user }            = useAuth();
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sending,  setSending]  = useState(false);
  const [draft,    setDraft]    = useState("");
  const bottomRef              = useRef<HTMLDivElement>(null);
  const inputRef               = useRef<HTMLTextAreaElement>(null);

  // Load message history
  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from("messages")
      .select("*, profiles(display_name, email)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true })
      .limit(100);
    setMessages((data ?? []) as MessageRow[]);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { void loadMessages(); }, [loadMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime: append new messages live
  const handleRealtimeEvent = useCallback(
    (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
      if (payload.eventType === "INSERT") {
        const newMsg = payload.new as unknown as MessageRow;
        // Fetch profile for the new message sender
        supabase
          .from("profiles")
          .select("display_name, email")
          .eq("id", newMsg.sender_id)
          .single()
          .then(({ data: profile }: { data: MessageRow["profiles"] | null }) => {
            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              return [...prev, { ...newMsg, profiles: profile ?? undefined }];
            });
          });
      }
    },
    [],
  );

  useRealtime({
    table:   "messages",
    filter:  `project_id=eq.${projectId}`,
    event:   "INSERT",
    onEvent: handleRealtimeEvent,
    enabled: !!user,
  });

  async function handleSend() {
    const body = draft.trim();
    if (!body || !user) return;
    setSending(true);
    setDraft("");
    try {
      await supabase.from("messages").insert({
        project_id: projectId,
        sender_id:  user.id,
        body,
      });
    } catch {
      setDraft(body); // restore on error
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  }

  return (
    <div className="flex flex-col rounded-xl border border-brand-border-grey bg-white overflow-hidden" style={{ height: "500px" }}>
      {/* Header */}
      <div className="border-b border-brand-border-grey px-4 py-3">
        <p className="text-sm font-semibold text-brand-near-black">Project Chat</p>
        <p className="text-xs text-brand-mid-grey">Messages are visible to the owner, your Jalla Professional, and Jalla team.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-brand-mid-grey" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-brand-near-black mb-1">No messages yet</p>
            <p className="text-xs text-brand-mid-grey max-w-xs">
              Start a conversation with your Jalla Professional about this project.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={msg.sender_id === user?.id}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-brand-border-grey p-3 flex items-end gap-2">
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send, Shift+Enter for new line)"
          rows={2}
          maxLength={2000}
          disabled={sending}
          className="flex-1 resize-none rounded-lg border border-brand-border-grey px-3 py-2 text-sm text-brand-near-black placeholder:text-brand-mid-grey focus:border-brand-near-black focus:outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={sending || !draft.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-near-black text-white hover:bg-brand-rich-black transition-colors disabled:opacity-40"
        >
          {sending
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Send className="h-4 w-4" />
          }
        </button>
      </div>
    </div>
  );
}
