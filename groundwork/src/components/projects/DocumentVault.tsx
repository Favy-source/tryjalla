/**
 * DocumentVault — project document listing with upload, filter, and share.
 *
 * Documents are loaded from project_documents table.
 * Upload: user provides a URL (file hosting via Storage or external link).
 * Share: calls document-share edge function to create an expiring link.
 * Filter: by category (contract, permit, receipt, invoice, report, certificate, other).
 *
 * Full file upload (drag-and-drop to Supabase Storage) is deferred to a
 * later day when the stage-media bucket is configured.
 */
import { useEffect, useState, useCallback } from "react";
import {
  FileText, Link2, Upload, Share2, Filter,
  FileCheck, Receipt, FileSignature, BarChart2,
  Award, Package, Loader2, Plus, ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

// ── Types ─────────────────────────────────────────────────────────────────────

type DocCategory = "contract" | "permit" | "receipt" | "invoice" | "report" | "certificate" | "other";

interface DocumentRow {
  id:          string;
  name:        string;
  category:    DocCategory;
  file_url:    string;
  file_size:   number | null;
  mime_type:   string | null;
  version:     number;
  is_current:  boolean;
  notes:       string | null;
  created_at:  string;
  uploaded_by: string;
  stage_id:    string | null;
}

interface DocumentVaultProps {
  projectId: string;
  canUpload: boolean;
}

// ── Category config ───────────────────────────────────────────────────────────

const CATEGORIES: { value: DocCategory | "all"; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "all",         label: "All",          Icon: FileText      },
  { value: "contract",    label: "Contracts",     Icon: FileSignature },
  { value: "permit",      label: "Permits",       Icon: FileCheck     },
  { value: "receipt",     label: "Receipts",      Icon: Receipt       },
  { value: "invoice",     label: "Invoices",      Icon: Receipt       },
  { value: "report",      label: "Reports",       Icon: BarChart2     },
  { value: "certificate", label: "Certificates",  Icon: Award         },
  { value: "other",       label: "Other",         Icon: Package       },
];

function categoryIcon(category: DocCategory) {
  const cat = CATEGORIES.find((c) => c.value === category);
  return cat ? cat.Icon : FileText;
}

// ── Upload form ───────────────────────────────────────────────────────────────

function AddDocumentForm({
  projectId,
  onAdded,
  onCancel,
}: {
  projectId: string;
  onAdded: (doc: DocumentRow) => void;
  onCancel: () => void;
}) {
  const [name,     setName]     = useState("");
  const [url,      setUrl]      = useState("");
  const [category, setCategory] = useState<DocCategory>("other");
  const [notes,    setNotes]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) { setError("Name and URL are required"); return; }
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const { data, error: insertErr } = await supabase
        .from("project_documents")
        .insert({
          project_id:  projectId,
          name:        name.trim(),
          file_url:    url.trim(),
          category,
          notes:       notes.trim() || null,
          uploaded_by: user.id,
        })
        .select()
        .single();
      if (insertErr) throw insertErr;
      onAdded(data as DocumentRow);
    } catch (e) {
      setError((e as Error).message ?? "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-brand-border-grey bg-white p-4 mb-4 space-y-3">
      <p className="text-sm font-semibold text-brand-near-black">Add document</p>

      <input
        value={name} onChange={(e) => setName(e.target.value)}
        placeholder="Document name"
        className="w-full rounded-lg border border-brand-border-grey px-3 py-2 text-sm focus:border-brand-near-black focus:outline-none"
      />

      <div className="flex gap-2 items-center rounded-lg border border-brand-border-grey px-3 py-2">
        <Link2 className="h-4 w-4 text-brand-mid-grey shrink-0" />
        <input
          type="url"
          value={url} onChange={(e) => setUrl(e.target.value)}
          placeholder="https://… (file URL or cloud link)"
          className="flex-1 text-sm text-brand-near-black focus:outline-none"
        />
      </div>

      <select
        value={category} onChange={(e) => setCategory(e.target.value as DocCategory)}
        className="w-full rounded-lg border border-brand-border-grey px-3 py-2 text-sm text-brand-near-black bg-white focus:border-brand-near-black focus:outline-none"
      >
        {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      <textarea
        value={notes} onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        maxLength={500}
        className="w-full resize-none rounded-lg border border-brand-border-grey px-3 py-2 text-sm text-brand-near-black placeholder:text-brand-mid-grey focus:border-brand-near-black focus:outline-none"
      />

      {error && <p className="text-xs text-brand-mid-grey">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit" disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-brand-near-black px-4 py-2 text-sm font-medium text-white hover:bg-brand-rich-black disabled:opacity-40"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Save
        </button>
        <button type="button" onClick={onCancel}
          className="rounded-lg border border-brand-border-grey px-4 py-2 text-sm text-brand-mid-grey hover:text-brand-near-black"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Document row ──────────────────────────────────────────────────────────────

function DocRow({ doc, canShare }: { doc: DocumentRow; canShare: boolean }) {
  const [sharing,  setSharing]  = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const Icon = categoryIcon(doc.category);

  async function handleShare() {
    setSharing(true);
    try {
      const { data, error } = await supabase.functions.invoke("document-share", {
        body: { document_id: doc.id, expires_in_days: 7 },
      });
      if (error) throw error;
      setShareUrl((data as { share_url: string }).share_url);
    } catch {
      /* ignore — user can retry */
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="flex items-start gap-3 border-b border-brand-border-grey last:border-0 py-3 px-4">
      <Icon className="h-5 w-5 shrink-0 mt-0.5 text-brand-mid-grey" />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-brand-near-black hover:underline truncate flex items-center gap-1"
          >
            {doc.name}
            <ExternalLink className="h-3 w-3 shrink-0 text-brand-mid-grey" />
          </a>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-brand-mid-grey capitalize">{doc.category}</span>
            {canShare && !shareUrl && (
              <button
                onClick={handleShare}
                disabled={sharing}
                className="inline-flex items-center gap-1 rounded border border-brand-border-grey px-2 py-0.5 text-xs text-brand-mid-grey hover:border-brand-near-black hover:text-brand-near-black transition-colors"
              >
                {sharing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Share2 className="h-3 w-3" />}
                Share
              </button>
            )}
          </div>
        </div>
        {doc.notes && <p className="text-xs text-brand-mid-grey mt-0.5">{doc.notes}</p>}
        {shareUrl && (
          <div className="mt-1.5 flex items-center gap-1.5 rounded border border-brand-border-grey bg-brand-light-grey px-2 py-1">
            <span className="text-xs text-brand-mid-grey truncate flex-1">{shareUrl}</span>
            <button
              onClick={() => navigator.clipboard.writeText(shareUrl)}
              className="text-xs text-brand-near-black shrink-0 hover:underline"
            >
              Copy
            </button>
          </div>
        )}
        <p className="text-xs text-brand-mid-grey mt-0.5">
          {new Date(doc.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          {doc.version > 1 && ` · v${doc.version}`}
        </p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DocumentVault({ projectId, canUpload }: DocumentVaultProps) {
  const [docs,       setDocs]       = useState<DocumentRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [category,   setCategory]   = useState<DocCategory | "all">("all");
  const [showUpload, setShowUpload] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await supabase
      .from("project_documents")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_current", true)
      .order("created_at", { ascending: false });
    if (!err) setDocs((data ?? []) as DocumentRow[]);
    else setError(err.message);
    setLoading(false);
  }, [projectId]);

  useEffect(() => { void load(); }, [load]);

  const filtered = category === "all" ? docs : docs.filter((d) => d.category === category);

  return (
    <div>
      {/* Controls */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        {/* Category filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="h-3.5 w-3.5 shrink-0 text-brand-mid-grey" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value as DocCategory | "all")}
              className={`shrink-0 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                category === cat.value
                  ? "border-brand-near-black bg-brand-near-black text-white"
                  : "border-brand-border-grey text-brand-mid-grey hover:border-brand-near-black hover:text-brand-near-black"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {canUpload && (
          <button
            onClick={() => setShowUpload((s) => !s)}
            className="flex items-center gap-1.5 rounded-lg bg-brand-near-black px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-rich-black shrink-0"
          >
            <Plus className="h-3.5 w-3.5" />
            Add document
          </button>
        )}
      </div>

      {/* Upload form */}
      {showUpload && (
        <AddDocumentForm
          projectId={projectId}
          onAdded={(doc) => { setDocs((prev) => [doc, ...prev]); setShowUpload(false); }}
          onCancel={() => setShowUpload(false)}
        />
      )}

      {/* Document list */}
      <div className="rounded-xl border border-brand-border-grey bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-brand-mid-grey" />
          </div>
        ) : error ? (
          <p className="px-4 py-8 text-center text-sm text-brand-mid-grey">{error}</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-8 w-8 text-brand-border-grey mb-3" />
            <p className="text-sm font-medium text-brand-near-black mb-1">No documents yet</p>
            <p className="text-xs text-brand-mid-grey max-w-xs">
              {canUpload ? "Add contracts, permits, receipts, and other project files." : "No documents have been uploaded for this project."}
            </p>
          </div>
        ) : (
          filtered.map((doc) => (
            <DocRow key={doc.id} doc={doc} canShare={canUpload} />
          ))
        )}
      </div>
    </div>
  );
}
