// ============================================================
// Groundwork by Jalla — App Constants
// ============================================================

// Stage names (10 stages, read-only — seed data is source of truth)
export const STAGE_NAMES: Record<number, string> = {
  1: "Land Secured",
  2: "Design",
  3: "Site Preparation",
  4: "Foundation",
  5: "Structure & Walls",
  6: "Roofing",
  7: "Electrical & Plumbing",
  8: "Finishing",
  9: "Exterior",
  10: "Final Handover",
};

// Payment allocation per stage (must sum to 100)
export const STAGE_PAYMENT_ALLOCATIONS: {
  stage: number;
  name: string;
  pct: number;
}[] = [
  { stage: 1, name: "Land Secured", pct: 5 },
  { stage: 2, name: "Design", pct: 10 },
  { stage: 3, name: "Site Preparation", pct: 5 },
  { stage: 4, name: "Foundation", pct: 15 },
  { stage: 5, name: "Structure & Walls", pct: 20 },
  { stage: 6, name: "Roofing", pct: 10 },
  { stage: 7, name: "Electrical & Plumbing", pct: 10 },
  { stage: 8, name: "Finishing", pct: 10 },
  { stage: 9, name: "Exterior", pct: 10 },
  { stage: 10, name: "Final Handover", pct: 5 },
] as const;

// Stage statuses
export const STAGE_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  AWAITING_APPROVAL: "awaiting_approval",
  COMPLETED: "completed",
} as const;

// Substage statuses
export const SUBSTAGE_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETE: "complete",
} as const;

// Subscription tiers (internal enum values)
export const SUBSCRIPTION_TIER = {
  SELF_SERVE: "self_serve",
  HYBRID: "hybrid",
  FULL_SERVICE: "full_service",
} as const;

// Tier display labels (internal → UI)
export const TIER_LABELS: Record<string, string> = {
  self_serve: "Self Verify",
  hybrid: "Jalla Verify",
  full_service: "Jalla Management",
};

// Supported countries (13 — Nigeria first)
export const SUPPORTED_COUNTRIES = [
  { code: "NG", name: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { code: "GH", name: "Ghana", currency: "GHS", flag: "🇬🇭" },
  { code: "CM", name: "Cameroon", currency: "XAF", flag: "🇨🇲" },
  { code: "KE", name: "Kenya", currency: "KES", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { code: "TZ", name: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  { code: "UG", name: "Uganda", currency: "UGX", flag: "🇺🇬" },
  { code: "ZM", name: "Zambia", currency: "ZMW", flag: "🇿🇲" },
  { code: "ZW", name: "Zimbabwe", currency: "ZWL", flag: "🇿🇼" },
  { code: "SL", name: "Sierra Leone", currency: "SLE", flag: "🇸🇱" },
  { code: "LR", name: "Liberia", currency: "LRD", flag: "🇱🇷" },
  { code: "GM", name: "Gambia", currency: "GMD", flag: "🇬🇲" },
  { code: "GQ", name: "Equatorial Guinea", currency: "XAF", flag: "🇬🇶" },
] as const;

// Project types
export const PROJECT_TYPES = [
  {
    value: "residential_single",
    label: "Residential — Single family",
    description: "Detached homes and townhomes designed for one household.",
  },
  {
    value: "residential_multi",
    label: "Residential — Multi-family",
    description: "Apartment buildings and condos with multiple dwelling units.",
  },
  {
    value: "commercial",
    label: "Commercial",
    description: "Office, retail, industrial, and other non-residential buildings.",
  },
  {
    value: "mixed_use",
    label: "Mixed Use",
    description: "Buildings with a combination of residential and non-residential uses.",
  },
] as const;

// App routes
export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/",
  PROJECTS: "/projects",
  NEW_PROJECT: "/projects/new",
  PAYMENTS: "/payments",
  DOCUMENTS: "/documents",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  HELP: "/help",
  PRICING: "/pricing",
  TOOLS: "/tools",
  AUTH: {
    LOGIN: "/auth/login",
    SIGNUP: "/auth/signup",
    RESET_PASSWORD: "/auth/reset-password",
    CALLBACK: "/auth/callback",
  },
} as const;
