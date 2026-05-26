// ============================================================
// Groundwork by Jalla — Tier Features Map
// SINGLE SOURCE OF TRUTH for what each tier can do.
// Both the frontend and the marketing pricing page read from this.
// ============================================================

export const TIER_FEATURES = {
  self_serve: {
    label: "Self Verify",
    price: 0,
    priceDisplay: "$0/mo",
    maxProjects: 3,
    maxContractorsPerProject: 1,
    canContactContractors: false,
    canChatWithJala: false,
    processingFeePct: 10,
    siteVisitReports: false,
    substageDetail: "status_only" as const,
    upgradeRequiresApproval: false,
    stageApproval: "self" as const,   // owner approves own stages, no review
    canViewBudgetBreakdown: true,
    canDownloadDocuments: true,
    canInviteContractors: true,
    canLeaveReviews: false,
    canAccessContractorContact: false,
    certificatesIssued: false,
    description: "Self-managed builds with full toolkit",
    features: [
      "Full access to all platform features",
      "Manage tasks, documents, and substages",
      "Budget and cost tracking",
      "Invite 1 contractor per project",
      "Daily progress tracking",
      "Export and reporting tools",
      "Email support",
    ],
  },
  hybrid: {
    label: "Jalla Verify",
    price: 199,
    priceDisplay: "$199/mo",
    maxProjects: Infinity,
    maxContractorsPerProject: Infinity,
    canContactContractors: true,
    canChatWithJala: true,
    processingFeePct: 3,
    siteVisitReports: true,
    substageDetail: "full" as const,
    upgradeRequiresApproval: false,   // direct checkout
    stageApproval: "professional" as const,  // jala professional approves
    canViewBudgetBreakdown: true,
    canDownloadDocuments: true,
    canInviteContractors: true,
    canLeaveReviews: true,
    canAccessContractorContact: true,
    certificatesIssued: true,
    description: "Independent verification by Jalla professionals",
    features: [
      "Everything in Self Verify",
      "Plan reviews by Jalla professionals",
      "Site visit verification and reporting",
      "Quality and code compliance checks",
      "Drawings and submittal verification",
      "Risk and issue identification",
      "Stage completion certificates",
      "Priority support",
    ],
  },
  full_service: {
    label: "Jalla Management",
    price: null,                       // custom pricing
    priceDisplay: "Custom",
    maxProjects: Infinity,
    maxContractorsPerProject: Infinity,
    canContactContractors: true,
    canChatWithJala: true,
    processingFeePct: null,            // negotiated
    siteVisitReports: true,
    substageDetail: "full" as const,
    upgradeRequiresApproval: true,     // request + sales call
    stageApproval: "admin" as const,   // admin manages everything
    canViewBudgetBreakdown: true,
    canDownloadDocuments: true,
    canInviteContractors: true,
    canLeaveReviews: true,
    canAccessContractorContact: true,
    certificatesIssued: true,
    description: "Full-service project management on your behalf",
    features: [
      "Everything in Jalla Verify",
      "Dedicated project manager",
      "Schedule and subcontractor management",
      "Procurement and vendor oversight",
      "Budget management and forecasting",
      "On-site representation",
      "Custom reporting and executive updates",
    ],
  },
} as const;

export type Tier = keyof typeof TIER_FEATURES;
export type TierFeatures = (typeof TIER_FEATURES)[Tier];

// Ordered tier list (for comparisons like "at least hybrid")
export const TIER_ORDER: Tier[] = ["self_serve", "hybrid", "full_service"];

/**
 * Returns true if `tier` meets the minimum required tier.
 * Example: meetsMinTier("hybrid", "self_serve") === true
 */
export function meetsMinTier(tier: Tier, minTier: Tier): boolean {
  return TIER_ORDER.indexOf(tier) >= TIER_ORDER.indexOf(minTier);
}

/**
 * Returns the features map for a given tier.
 * Falls back to self_serve if the tier is unknown.
 */
export function getTierFeatures(tier: string): TierFeatures {
  if (tier in TIER_FEATURES) {
    return TIER_FEATURES[tier as Tier];
  }
  return TIER_FEATURES.self_serve;
}
