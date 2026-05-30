/**
 * /contractors/:contractorId — Contractor profile page.
 *
 * Shows full contractor details. Contact info (phone, email, portfolio)
 * blurred for self_serve via TierGate. Inquiry form requires hybrid+.
 * Reviews listed at bottom.
 */
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, MapPin, Star, BadgeCheck, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { TierGate } from "@/components/tier/TierGate";
import { InquiryForm } from "@/components/contractors/InquiryForm";
import type { ContractorRow } from "@/components/contractors/ContractorCard";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReviewRow {
  id:          string;
  reviewer_id: string;
  rating:      number;
  headline:    string | null;
  body:        string | null;
  created_at:  string;
  profiles?: { display_name: string | null; email: string };
}

// ── Star rating ───────────────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? "fill-brand-near-black text-brand-near-black" : "text-brand-border-grey"}`}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ContractorProfilePage() {
  const { contractorId } = useParams<{ contractorId: string }>();
  const [contractor, setContractor] = useState<ContractorRow | null>(null);
  const [reviews,    setReviews]    = useState<ReviewRow[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);

  useEffect(() => {
    if (!contractorId) return;
    async function load() {
      setLoading(true);
      const cid = contractorId as string;
      const [contractorRes, reviewsRes] = await Promise.all([
        supabase.from("contractors").select("*").eq("id", cid).single(),
        supabase
          .from("contractor_reviews")
          .select("*, profiles(display_name, email)")
          .eq("contractor_id", cid)
          .order("created_at", { ascending: false }),
      ]);
      if (contractorRes.error) { setError(contractorRes.error.message); setLoading(false); return; }
      setContractor(contractorRes.data as ContractorRow);
      setReviews((reviewsRes.data ?? []) as ReviewRow[]);
      setLoading(false);
    }
    void load();
  }, [contractorId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-mid-grey" />
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-brand-mid-grey">{error ?? "Contractor not found."}</p>
        <Link to="/contractors" className="text-sm font-medium text-brand-near-black underline underline-offset-4">
          Back to directory
        </Link>
      </div>
    );
  }

  const displayName = contractor.company_name ?? contractor.name;
  const tags = contractor.specialties.length > 0 ? contractor.specialties : [contractor.primary_specialty];

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-brand-border-grey bg-white px-4 py-5 sm:px-6">
        <Link
          to="/contractors"
          className="mb-3 inline-flex items-center gap-1.5 text-sm text-brand-mid-grey hover:text-brand-near-black transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Contractor Directory
        </Link>

        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand-near-black text-white text-2xl font-semibold">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-brand-near-black">{displayName}</h1>
              {contractor.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-md border border-brand-near-black px-2 py-0.5 text-xs font-medium text-brand-near-black">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-sm text-brand-mid-grey mt-0.5">{contractor.primary_specialty}</p>

            <div className="flex items-center gap-4 mt-2 flex-wrap">
              {contractor.rating > 0 && (
                <div className="flex items-center gap-1.5">
                  <StarRating rating={contractor.rating} />
                  <span className="text-sm text-brand-mid-grey">
                    {contractor.rating.toFixed(1)} ({contractor.review_count} reviews)
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-sm text-brand-mid-grey">
                <MapPin className="h-4 w-4 shrink-0" />
                {contractor.region ? `${contractor.region}, ` : ""}{contractor.country}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3">
        {/* Left col: bio + specialties + contact */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {contractor.bio && (
            <div className="rounded-xl border border-brand-border-grey bg-white p-5">
              <h2 className="text-sm font-semibold text-brand-near-black mb-2">About</h2>
              <p className="text-sm text-brand-mid-grey leading-relaxed">{contractor.bio}</p>
            </div>
          )}

          {/* Specialties */}
          <div className="rounded-xl border border-brand-border-grey bg-white p-5">
            <h2 className="text-sm font-semibold text-brand-near-black mb-3">Specialties</h2>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-md border border-brand-border-grey px-3 py-1 text-sm text-brand-near-black"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Contact details — blurred for self_serve */}
          <div className="rounded-xl border border-brand-border-grey bg-white p-5">
            <h2 className="text-sm font-semibold text-brand-near-black mb-3">Contact Details</h2>
            <TierGate
              minTier="hybrid"
              mode="blur"
              upgradeCta="Upgrade to Jalla Verify to view contact details"
            >
              <div className="space-y-2 text-sm text-brand-near-black">
                {contractor.phone && (
                  <div className="flex items-center gap-2">
                    <span className="text-brand-mid-grey w-20 shrink-0 text-xs">Phone</span>
                    <span>{contractor.phone}</span>
                  </div>
                )}
                {contractor.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-brand-mid-grey w-20 shrink-0 text-xs">Email</span>
                    <span>{contractor.email}</span>
                  </div>
                )}
                {contractor.portfolio_url && (
                  <div className="flex items-center gap-2">
                    <span className="text-brand-mid-grey w-20 shrink-0 text-xs">Portfolio</span>
                    <a
                      href={contractor.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-brand-near-black hover:underline"
                    >
                      {contractor.portfolio_url.replace(/^https?:\/\//, "")}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </TierGate>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-sm font-semibold text-brand-near-black mb-3">
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-brand-border-grey bg-white p-6 text-center">
                <p className="text-sm text-brand-mid-grey">No reviews yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-brand-border-grey bg-white p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-medium text-brand-near-black">
                          {r.profiles?.display_name ?? r.profiles?.email ?? "Anonymous"}
                        </p>
                        <p className="text-xs text-brand-mid-grey">
                          {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                    {r.headline && (
                      <p className="text-sm font-semibold text-brand-near-black mb-1">{r.headline}</p>
                    )}
                    {r.body && (
                      <p className="text-sm text-brand-mid-grey leading-relaxed">{r.body}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right col: inquiry form */}
        <div>
          <h2 className="text-sm font-semibold text-brand-near-black mb-3">Send an Inquiry</h2>
          <InquiryForm
            contractorId={contractor.id}
            contractorName={displayName}
          />
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-brand-mid-grey">Failed to load contractor profile. Please refresh.</p>
    </div>
  );
}
