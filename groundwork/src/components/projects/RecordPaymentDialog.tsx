/**
 * RecordPaymentDialog — modal form to record a payment installment.
 *
 * Uses @radix-ui/react-dialog (already installed).
 * Calls record-payment edge function on submit.
 */
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface RecordPaymentDialogProps {
  open:       boolean;
  stageId:    string | null;
  stageName?: string;
  currency?:  string;
  onClose:    () => void;
  onSuccess:  (stageId: string, newStatus: string) => void;
}

const PAYMENT_METHODS = [
  { value: "bank_transfer",  label: "Bank Transfer"  },
  { value: "cash",           label: "Cash"           },
  { value: "mobile_money",   label: "Mobile Money"   },
  { value: "cheque",         label: "Cheque"         },
  { value: "other",          label: "Other"          },
] as const;

export function RecordPaymentDialog({
  open, stageId, stageName, currency = "NGN", onClose, onSuccess,
}: RecordPaymentDialogProps) {
  const today = new Date().toISOString().slice(0, 10);

  const [amount,        setAmount]        = useState("");
  const [method,        setMethod]        = useState<string>("");
  const [paidAt,        setPaidAt]        = useState(today);
  const [receiptUrl,    setReceiptUrl]    = useState("");
  const [notes,         setNotes]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);

  const currencySymbol = currency === "NGN" ? "₦" : currency;

  function reset() {
    setAmount("");
    setMethod("");
    setPaidAt(today);
    setReceiptUrl("");
    setNotes("");
    setError(null);
    setLoading(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stageId) return;

    const numericAmount = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Enter a valid amount greater than 0");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {
        stage_id: stageId,
        amount:   numericAmount,
        currency,
        paid_at:  paidAt || today,
      };
      if (method)     body.payment_method = method;
      if (receiptUrl) body.receipt_url    = receiptUrl;
      if (notes)      body.notes          = notes;

      const { data, error: fnErr } = await supabase.functions.invoke("record-payment", { body });

      if (fnErr) throw fnErr;

      const result = data as { stage_payment_status: string };
      onSuccess(stageId, result.stage_payment_status);
      handleClose();
    } catch (e) {
      setError((e as Error).message ?? "Failed to record payment. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-brand-border-grey bg-white shadow-lg focus:outline-none"
          aria-describedby="record-payment-desc"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-brand-border-grey px-5 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-brand-near-black">
                Record Payment
              </Dialog.Title>
              {stageName && (
                <p id="record-payment-desc" className="text-xs text-brand-mid-grey mt-0.5">
                  {stageName}
                </p>
              )}
            </div>
            <Dialog.Close asChild>
              <button className="rounded-md p-1 text-brand-mid-grey hover:text-brand-near-black transition-colors">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-brand-near-black mb-1">
                Amount <span className="text-brand-mid-grey font-normal">({currency})</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-brand-mid-grey select-none">
                  {currencySymbol}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  required
                  className="w-full rounded-lg border border-brand-border-grey pl-8 pr-3 py-2.5 text-sm text-brand-near-black placeholder:text-brand-mid-grey focus:border-brand-near-black focus:outline-none"
                />
              </div>
            </div>

            {/* Payment method */}
            <div>
              <label className="block text-xs font-medium text-brand-near-black mb-1">
                Payment method <span className="text-brand-mid-grey font-normal">(optional)</span>
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full rounded-lg border border-brand-border-grey px-3 py-2.5 text-sm text-brand-near-black focus:border-brand-near-black focus:outline-none bg-white"
              >
                <option value="">Select method…</option>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Date paid */}
            <div>
              <label className="block text-xs font-medium text-brand-near-black mb-1">
                Date paid
              </label>
              <input
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                max={today}
                className="w-full rounded-lg border border-brand-border-grey px-3 py-2.5 text-sm text-brand-near-black focus:border-brand-near-black focus:outline-none"
              />
            </div>

            {/* Receipt URL */}
            <div>
              <label className="block text-xs font-medium text-brand-near-black mb-1">
                Receipt URL <span className="text-brand-mid-grey font-normal">(optional)</span>
              </label>
              <input
                type="url"
                value={receiptUrl}
                onChange={(e) => setReceiptUrl(e.target.value)}
                placeholder="https://…"
                className="w-full rounded-lg border border-brand-border-grey px-3 py-2.5 text-sm text-brand-near-black placeholder:text-brand-mid-grey focus:border-brand-near-black focus:outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-brand-near-black mb-1">
                Notes <span className="text-brand-mid-grey font-normal">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
                rows={2}
                placeholder="e.g. Second instalment for foundation work"
                className="w-full resize-none rounded-lg border border-brand-border-grey px-3 py-2.5 text-sm text-brand-near-black placeholder:text-brand-mid-grey focus:border-brand-near-black focus:outline-none"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-brand-mid-grey">{error}</p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand-near-black py-2.5 text-sm font-medium text-white hover:bg-brand-rich-black transition-colors disabled:opacity-40"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save payment
              </button>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="rounded-lg border border-brand-border-grey px-4 py-2.5 text-sm text-brand-mid-grey hover:text-brand-near-black hover:border-brand-near-black transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
