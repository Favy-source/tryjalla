/**
 * ContractorCard — directory card for a single contractor.
 *
 * Shows: name/company, specialty tags, star rating, location, verified badge.
 * Contact details (phone, email, portfolio) are blurred for self_serve users
 * via TierGate mode="blur" — the data is in the DOM but visually obscured.
 */
import { Link } from "react-router";
import { MapPin, Star, BadgeCheck } from "lucide-react";
import { TierGate } from "@/components/tier/TierGate";

export interface ContractorRow {
  id:               string;
  name:             string;
  company_name:     string | null;
  primary_specialty: string;
  specialties:      string[];
  country:          string;
  region:           string | null;
  bio:              string | null;
  phone:            string | null;
  email:            string | null;
  portfolio_url:    string | null;
  avatar_url:       string | null;
  is_verified:      boolean;
  rating:           number;
  review_count:     number;
}

interface ContractorCardProps {
  contractor: ContractorRow;
}

// ── Star rating ───────────────────────────────────────────────────────────────

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full  = Math.floor(rating);
  const empty = 5 - full;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center">
        {Array.from({ length: full  }).map((_, i) => (
          <Star key={`f${i}`} className="h-3.5 w-3.5 fill-brand-near-black text-brand-near-black" />
        ))}
        {Array.from({ length: empty }).map((_, i) => (
          <Star key={`e${i}`} className="h-3.5 w-3.5 text-brand-border-grey" />
        ))}
      </div>
      <span className="text-xs text-brand-mid-grey tabular-nums">
        {rating.toFixed(1)} ({count})
      </span>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

export function ContractorCard({ contractor: c }: ContractorCardProps) {
  const displayName = c.company_name ?? c.name;
  const tags = c.specialties.length > 0 ? c.specialties : [c.primary_specialty];

  return (
    <div className="flex flex-col rounded-xl border border-brand-border-grey bg-white p-5 hover:border-brand-near-black transition-colors">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Avatar */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-near-black text-white text-base font-semibold">
          {displayName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-sm font-semibold text-brand-near-black truncate">{displayName}</p>
            {c.is_verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-brand-near-black" aria-label="Verified" />
            )}
          </div>
          <p className="text-xs text-brand-mid-grey mt-0.5">{c.primary_specialty}</p>
        </div>
      </div>

      {/* Specialty tags */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {tags.slice(0, 3).map((tag) => (
          <span key={tag} className="inline-flex items-center rounded-md border border-brand-border-grey px-2 py-0.5 text-xs text-brand-mid-grey">
            {tag}
          </span>
        ))}
        {tags.length > 3 && (
          <span className="text-xs text-brand-mid-grey">+{tags.length - 3}</span>
        )}
      </div>

      {/* Rating */}
      <StarRating rating={c.rating} count={c.review_count} />

      {/* Location */}
      <div className="flex items-center gap-1 mt-2">
        <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-mid-grey" />
        <span className="text-xs text-brand-mid-grey">
          {c.region ? `${c.region}, ` : ""}{c.country}
        </span>
      </div>

      {/* Contact details — blurred for self_serve */}
      <TierGate minTier="hybrid" mode="blur" upgradeCta="Upgrade to Jalla Verify to contact professionals">
        <div className="mt-3 space-y-1 text-xs text-brand-mid-grey">
          {c.phone && <p>{c.phone}</p>}
          {c.email && <p>{c.email}</p>}
          {c.portfolio_url && (
            <p className="truncate">{c.portfolio_url.replace(/^https?:\/\//, "")}</p>
          )}
        </div>
      </TierGate>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-brand-border-grey">
        <Link
          to={`/contractors/${c.id}`}
          className="block w-full rounded-lg border border-brand-near-black px-4 py-2 text-center text-sm font-medium text-brand-near-black hover:bg-brand-near-black hover:text-white transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
