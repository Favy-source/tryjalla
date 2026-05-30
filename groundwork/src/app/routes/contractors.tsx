/**
 * /contractors — Contractor directory.
 *
 * All users can browse. Contact details (phone, email, portfolio) are
 * blurred for self_serve via TierGate in ContractorCard.
 * Filters: search, country, specialty.
 */
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router";
import { Search, Loader2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ContractorCard, type ContractorRow } from "@/components/contractors/ContractorCard";

const SPECIALTIES = [
  "All Specialties",
  "Architecture",
  "Structural Engineering",
  "Foundation Work",
  "Masonry",
  "Electrical",
  "Solar Installation",
  "Plumbing",
  "Sanitary",
  "Roofing",
  "Waterproofing",
  "Finishing",
  "Tiling",
  "Painting",
  "Interior",
  "Project Management",
];

const COUNTRIES = [
  { code: "all", name: "All Countries" },
  { code: "NG",  name: "Nigeria"       },
  { code: "GH",  name: "Ghana"         },
  { code: "KE",  name: "Kenya"         },
  { code: "ZA",  name: "South Africa"  },
  { code: "SN",  name: "Senegal"       },
  { code: "CM",  name: "Cameroon"      },
  { code: "GH",  name: "Ghana"         },
];

export default function ContractorDirectoryPage() {
  const [contractors, setContractors] = useState<ContractorRow[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [search,      setSearch]      = useState("");
  const [country,     setCountry]     = useState("all");
  const [specialty,   setSpecialty]   = useState("All Specialties");
  const [page,        setPage]        = useState(1);

  const PAGE_SIZE = 6;

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data, error: err } = await supabase
        .from("contractors")
        .select("*")
        .order("is_verified", { ascending: false })
        .order("rating", { ascending: false });
      if (!err) setContractors((data ?? []) as ContractorRow[]);
      else setError(err.message);
      setLoading(false);
    }
    void load();
  }, []);

  const filtered = useMemo(() => {
    return contractors.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        (c.company_name ?? "").toLowerCase().includes(q) ||
        c.primary_specialty.toLowerCase().includes(q) ||
        c.specialties.some((s) => s.toLowerCase().includes(q));
      const matchesCountry  = country === "all" || c.country === country;
      const matchesSpec     =
        specialty === "All Specialties" ||
        c.primary_specialty === specialty ||
        c.specialties.includes(specialty);
      return matchesSearch && matchesCountry && matchesSpec;
    });
  }, [contractors, search, country, specialty]);

  const totalPages  = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleFilterChange() {
    setPage(1);
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="border-b border-brand-border-grey bg-white px-4 py-5 sm:px-6">
        <h1 className="text-xl font-semibold text-brand-near-black">Find Contractors</h1>
        <p className="text-sm text-brand-mid-grey mt-1">
          Vetted construction professionals across West Africa
        </p>
      </div>

      {/* Filters */}
      <div className="border-b border-brand-border-grey bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-mid-grey" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
              placeholder="Search by name or specialty"
              className="w-full rounded-lg border border-brand-border-grey pl-9 pr-3 py-2 text-sm text-brand-near-black placeholder:text-brand-mid-grey focus:border-brand-near-black focus:outline-none"
            />
          </div>

          {/* Country */}
          <select
            value={country}
            onChange={(e) => { setCountry(e.target.value); handleFilterChange(); }}
            className="rounded-lg border border-brand-border-grey px-3 py-2 text-sm text-brand-near-black bg-white focus:border-brand-near-black focus:outline-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>

          {/* Specialty */}
          <select
            value={specialty}
            onChange={(e) => { setSpecialty(e.target.value); handleFilterChange(); }}
            className="rounded-lg border border-brand-border-grey px-3 py-2 text-sm text-brand-near-black bg-white focus:border-brand-near-black focus:outline-none"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 sm:px-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-brand-mid-grey" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-brand-mid-grey mb-2">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-brand-near-black underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Users className="h-10 w-10 text-brand-border-grey mb-4" />
            <p className="text-sm font-medium text-brand-near-black mb-1">No contractors found</p>
            <p className="text-xs text-brand-mid-grey">Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            {/* Result count */}
            <p className="text-xs text-brand-mid-grey mb-4">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} contractor{filtered.length !== 1 ? "s" : ""}
            </p>

            {/* Card grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((c) => (
                <ContractorCard key={c.id} contractor={c} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-brand-border-grey px-3 py-1.5 text-sm text-brand-mid-grey hover:border-brand-near-black hover:text-brand-near-black disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                      page === i + 1
                        ? "bg-brand-near-black text-white"
                        : "border border-brand-border-grey text-brand-mid-grey hover:border-brand-near-black hover:text-brand-near-black"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg border border-brand-border-grey px-3 py-1.5 text-sm text-brand-mid-grey hover:border-brand-near-black hover:text-brand-near-black disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex h-64 items-center justify-center">
      <p className="text-sm text-brand-mid-grey">Failed to load contractors. Please refresh.</p>
    </div>
  );
}
