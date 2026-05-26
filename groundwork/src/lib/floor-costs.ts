/**
 * floor-costs.ts — per-country cost estimates for the budget engine.
 *
 * Values are rough mid-range construction costs in local currency per m²
 * for a standard residential build. They are used to generate the budget
 * estimate displayed in the project creation wizard (Step 9 summary).
 *
 * Costs are NOT contractual. They give diaspora clients a realistic
 * starting budget before they engage contractors.
 *
 * Sources: local contractor averages, Q1 2026 pricing.
 * Update annually via a CMS entry or admin setting (future phase).
 */

/** 9 cost section codes matching COST_SECTIONS in the blueprint. */
export type CostSectionCode = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

/** Distribution of total construction cost across the 9 sections (as %). */
export const COST_SECTION_PERCENTAGES: Record<CostSectionCode, number> = {
  100: 5,   // Preliminary Works
  200: 12,  // Foundation
  300: 22,  // Ground Floor Elevation
  400: 15,  // Upper Floor Elevation (× additional floors)
  500: 8,   // Roof
  600: 10,  // Openings (doors, windows, railings)
  700: 8,   // Electricity
  800: 10,  // Plumbing & Sanitary
  900: 10,  // Painting & Decoration
};

export const COST_SECTIONS: { code: CostSectionCode; name: string; isPerFloor: boolean }[] = [
  { code: 100, name: "Preliminary Works",       isPerFloor: false },
  { code: 200, name: "Foundation",              isPerFloor: false },
  { code: 300, name: "Ground Floor Elevation",  isPerFloor: false },
  { code: 400, name: "Upper Floor Elevation",   isPerFloor: true  },
  { code: 500, name: "Roof",                    isPerFloor: false },
  { code: 600, name: "Openings",                isPerFloor: false },
  { code: 700, name: "Electricity",             isPerFloor: false },
  { code: 800, name: "Plumbing & Sanitary",     isPerFloor: false },
  { code: 900, name: "Painting & Decoration",   isPerFloor: false },
];

/** Building type multipliers applied on top of the base country cost. */
export const BUILDING_TYPE_MULTIPLIERS: Record<string, number> = {
  bungalow:   0.90,  // single-floor, simpler structure
  duplex:     1.00,  // baseline
  triplex:    1.05,
  villa:      1.20,  // larger footprint, higher spec
  apartment:  0.95,  // multi-unit efficiencies
  townhouse:  1.00,
  mansion:    1.50,  // premium finishes
};

/**
 * Base construction cost per m² in local currency.
 * "floor_sqm" is the assumed floor area per level for cost estimation
 * when the user hasn't provided an explicit area (uses rooms as a proxy).
 */
export interface CountryCostConfig {
  currency: string;
  currencySymbol: string;
  baseCostPerSqm: number;   // in local currency
  upperFloorMultiplier: number; // each additional floor costs this × ground floor section
  avgFloorSqm: number;      // assumed sqm per floor for estimation
}

export const COUNTRY_COSTS: Record<string, CountryCostConfig> = {
  NG: { currency: "NGN", currencySymbol: "₦", baseCostPerSqm: 280_000, upperFloorMultiplier: 0.83, avgFloorSqm: 120 },
  GH: { currency: "GHS", currencySymbol: "GH₵", baseCostPerSqm: 4_200,  upperFloorMultiplier: 0.83, avgFloorSqm: 110 },
  KE: { currency: "KES", currencySymbol: "KSh", baseCostPerSqm: 45_000, upperFloorMultiplier: 0.85, avgFloorSqm: 110 },
  ZA: { currency: "ZAR", currencySymbol: "R",   baseCostPerSqm: 18_500, upperFloorMultiplier: 0.88, avgFloorSqm: 130 },
  CM: { currency: "XAF", currencySymbol: "CFA", baseCostPerSqm: 185_000,upperFloorMultiplier: 0.83, avgFloorSqm: 110 },
  CI: { currency: "XOF", currencySymbol: "CFA", baseCostPerSqm: 175_000,upperFloorMultiplier: 0.83, avgFloorSqm: 110 },
  SN: { currency: "XOF", currencySymbol: "CFA", baseCostPerSqm: 165_000,upperFloorMultiplier: 0.83, avgFloorSqm: 105 },
  ET: { currency: "ETB", currencySymbol: "Br",  baseCostPerSqm: 22_000, upperFloorMultiplier: 0.85, avgFloorSqm: 105 },
  TZ: { currency: "TZS", currencySymbol: "TSh", baseCostPerSqm: 520_000,upperFloorMultiplier: 0.85, avgFloorSqm: 110 },
  RW: { currency: "RWF", currencySymbol: "RF",  baseCostPerSqm: 280_000,upperFloorMultiplier: 0.85, avgFloorSqm: 100 },
  UG: { currency: "UGX", currencySymbol: "USh", baseCostPerSqm: 1_800_000, upperFloorMultiplier: 0.85, avgFloorSqm: 105 },
  GB: { currency: "GBP", currencySymbol: "£",   baseCostPerSqm: 2_200,  upperFloorMultiplier: 0.90, avgFloorSqm: 140 },
  US: { currency: "USD", currencySymbol: "$",   baseCostPerSqm: 1_800,  upperFloorMultiplier: 0.90, avgFloorSqm: 140 },
};

/** Fallback when country not in map. */
export const DEFAULT_COST_CONFIG: CountryCostConfig = COUNTRY_COSTS.NG;

export function getCountryCost(countryCode: string): CountryCostConfig {
  return COUNTRY_COSTS[countryCode.toUpperCase()] ?? DEFAULT_COST_CONFIG;
}

/**
 * Estimate a project's total construction cost from specifications.
 * Returns a range [low, mid, high] in local currency.
 */
export function estimateProjectCost(params: {
  countryCode: string;
  buildingType: string;
  floors: number;
}): { low: number; mid: number; high: number; currency: string; currencySymbol: string } {
  const config = getCountryCost(params.countryCode);
  const buildingMult = BUILDING_TYPE_MULTIPLIERS[params.buildingType] ?? 1.0;
  const sqmPerFloor = config.avgFloorSqm;

  // Ground floor cost
  let totalSqm = sqmPerFloor;
  // Upper floors: each costs upperFloorMultiplier × ground floor sqm equivalent
  for (let f = 1; f < params.floors; f++) {
    totalSqm += sqmPerFloor * config.upperFloorMultiplier;
  }

  const mid = Math.round(totalSqm * config.baseCostPerSqm * buildingMult);

  return {
    low: Math.round(mid * 0.85),
    mid,
    high: Math.round(mid * 1.20),
    currency: config.currency,
    currencySymbol: config.currencySymbol,
  };
}
