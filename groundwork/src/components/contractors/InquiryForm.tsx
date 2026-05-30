/**
 * InquiryForm — contact form for reaching out to a contractor.
 *
 * Only accessible to hybrid+ users (self_serve sees a TierGate upgrade prompt).
 * Inserts into contractor_inquiries table.
 */
import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { TierGate } from "@/components/tier/TierGate";

interface InquiryFormProps {
  contractorId:   string;
  contractorName: string;
  onSuccess?:     () => void;
}

const START_WINDOWS = [
  "Immediately", "Within 1 month", "1–3 months", "3–6 months", "Not sure yet",
];

export function InquiryForm({ contractorId, contractorName, onSuccess }: InquiryFormProps) {
  const { user } = useAuth();
  const [message,   setMessage]   = useState("");
  const [budget,    setBudget]    = useState("");
  const [startWin,  setStartWin]  = useState("");
  const [contact,   setContact]   = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [sent,      setSent]      = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || !user) return;
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from("contractor_inquiries")
        .insert({
          client_id:         user.id,
          contractor_id:     contractorId,
          message:           message.trim(),
          budget_range:      budget || null,
          start_window:      startWin || null,
          preferred_contact: contact || null,
        });
      if (err) throw err;
      setSent(true);
      onSuccess?.();
    } catch (e) {
      setError((e as Error).message ?? "Failed to send inquiry");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-brand-border-grey bg-white p-6 text-center">
        <p className="text-sm font-semibold text-brand-near-black mb-1">Inquiry sent!</p>
        <p className="text-xs text-brand-mid-grey">
          The Jalla team will introduce you to {contractorName} within 48 hours.
        </p>
      </div>
    );
  }

  return (
    <TierGate
      minTier="hybrid"
      mode="lock"
      upgradeCta="Upgrade to Jalla Verify to contact professionals"
    >
      <form onSubmit={handleSubmit} className="rounded-xl border border-brand-border-grey bg-white p-5 space-y-4">
        <p className="text-sm font-semibold text-brand-near-black">Contact {contractorName}</p>

        <div>
          <label className="block text-xs font-medium text-brand-near-black mb-1">
            Message <span className="text-brand-mid-grey font-normal">(required)</span>
          </label>
          <textarea
            value={message} onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your project and what you need help with…"
            rows={4} maxLength={1000} required
            className="w-full resize-none rounded-lg border border-brand-border-grey px-3 py-2.5 text-sm text-brand-near-black placeholder:text-brand-mid-grey focus:border-brand-near-black focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-brand-near-black mb-1">Budget range</label>
            <input
              value={budget} onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. ₦20M–₦30M"
              className="w-full rounded-lg border border-brand-border-grey px-3 py-2 text-sm focus:border-brand-near-black focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-brand-near-black mb-1">Start window</label>
            <select
              value={startWin} onChange={(e) => setStartWin(e.target.value)}
              className="w-full rounded-lg border border-brand-border-grey px-3 py-2 text-sm bg-white focus:border-brand-near-black focus:outline-none"
            >
              <option value="">Select…</option>
              {START_WINDOWS.map((w) => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-near-black mb-1">
            Preferred contact method
          </label>
          <input
            value={contact} onChange={(e) => setContact(e.target.value)}
            placeholder="e.g. WhatsApp, email, phone call"
            className="w-full rounded-lg border border-brand-border-grey px-3 py-2 text-sm focus:border-brand-near-black focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-brand-mid-grey">{error}</p>}

        <button
          type="submit" disabled={loading || !message.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-near-black py-2.5 text-sm font-medium text-white hover:bg-brand-rich-black disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send inquiry
        </button>
      </form>
    </TierGate>
  );
}
