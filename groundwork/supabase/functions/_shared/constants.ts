/**
 * _shared/constants.ts — Shared constants for edge functions.
 *
 * Keep in sync with src/lib/constants.ts.
 */

export const STAGE_PAYMENT_ALLOCATIONS = [
  { stage: 1,  name: "Land Secured",          pct: 5  },
  { stage: 2,  name: "Design",                pct: 10 },
  { stage: 3,  name: "Site Preparation",       pct: 5  },
  { stage: 4,  name: "Foundation",             pct: 15 },
  { stage: 5,  name: "Structure & Walls",      pct: 20 },
  { stage: 6,  name: "Roofing",               pct: 10 },
  { stage: 7,  name: "Electrical & Plumbing",  pct: 10 },
  { stage: 8,  name: "Finishing",              pct: 10 },
  { stage: 9,  name: "Exterior",              pct: 10 },
  { stage: 10, name: "Final Handover",         pct: 5  },
] as const;

export const COST_SECTION_PERCENTAGES: Record<number, number> = {
  100: 5,   // Preliminary Works
  200: 15,  // Foundation
  300: 20,  // Ground Floor Elevation
  400: 18,  // Upper Floor Elevation (0 for single floor)
  500: 12,  // Roof
  600: 8,   // Openings (doors/windows)
  700: 9,   // Electricity
  800: 8,   // Plumbing & Sanitary
  900: 5,   // Painting & Decoration
};
