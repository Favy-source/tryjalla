/**
 * _shared/substage-seed.ts — The 60 canonical substages seeded on every project.
 *
 * Keep in sync with src/lib/substage-seed.ts.
 */

export interface SubstageTemplate {
  name: string;
  description: string;
}

export const SUBSTAGE_SEED: Record<number, SubstageTemplate[]> = {
  1: [ // Land Secured (5)
    { name: "Engage surveyor",          description: "Verify documents against regional survey map" },
    { name: "Verify land title",        description: "Cross-check for fraud — multiple titles on one plot" },
    { name: "Engage notary/lawyer",     description: "Purchase contract and legal binding" },
    { name: "Payment by bank transfer", description: "Traceability requirement for land purchase" },
    { name: "Land title transfer",      description: "3 weeks to 3 months depending on country" },
  ],
  2: [ // Design (6)
    { name: "Soil test",                   description: "Required for buildings with 3+ floors" },
    { name: "Architectural plans",         description: "Floor plans, roof, electrical, plumbing, sewage, elevations, sections" },
    { name: "Structural plan",             description: "Pillars, beams, slabs, foundation, footings" },
    { name: "Plan authorization",          description: "State-registered engineer/architect signatures" },
    { name: "Building permit application", description: "Document assembly varies by location and building type" },
    { name: "Bill of Quantities",          description: "Detailed material and labour cost schedule" },
  ],
  3: [ // Site Preparation (5)
    { name: "Energy supply",              description: "Contact utility company or install solar" },
    { name: "Water supply",               description: "Utility connection or borehole" },
    { name: "Clearing and leveling",      description: "Prepare the land for construction" },
    { name: "Magazine construction",      description: "Temporary site house for materials and worker lodging" },
    { name: "Site materials procurement", description: "Tools, spirit level, laser level, safety equipment" },
  ],
  4: [ // Foundation (7)
    { name: "Excavation",                    description: "Excavation of foundation pits and trenches" },
    { name: "Backfill",                      description: "Fill and compact excavated areas" },
    { name: "Lean concrete",                 description: "5cm layer, 150kg/m³" },
    { name: "Reinforced concrete footings",  description: "350kg/m³ structural footings" },
    { name: "Foundation pillars and beams",  description: "Reinforced concrete columns and tie beams" },
    { name: "Floor slab",                    description: "Lightly concreted slab, 250kg/m³" },
    { name: "Foundation blocks",             description: "Blocks, polystyrene insulation, and sand layer" },
  ],
  5: [ // Structure & Walls (8)
    { name: "Pillars",                   description: "Reinforced concrete, 350kg/m³" },
    { name: "Beams and lintels",         description: "Structural support over openings" },
    { name: "Staircase",                 description: "Required for multi-floor buildings" },
    { name: "Floor slab",                description: "Upper floor slab construction" },
    { name: "Block walls",               description: "Sandcrete block wall construction" },
    { name: "Plastering",                description: "Internal and external wall plastering" },
    { name: "Mortar flooring and tiles", description: "Floor finishing" },
    { name: "Wall tiles and staffing",   description: "Decorative plaster and wall tiles" },
  ],
  6: [ // Roofing (5)
    { name: "Hardwood truss assembly",        description: "Treated hardwood roof structure" },
    { name: "Purlin installation",            description: "Horizontal roof framing members" },
    { name: "Roofing sheet installation",     description: "Aluminium roofing sheets" },
    { name: "Roof accessories and finishing", description: "Ridge caps, fascia, guttering" },
    { name: "Ceiling boarding",               description: "POP or gypsum board ceiling installation" },
  ],
  7: [ // Electrical & Plumbing (8)
    { name: "Conduit and cabling",       description: "1.5mm, 2.5mm, and supply cables" },
    { name: "Switches and sockets",      description: "Switches, sockets, junction boxes" },
    { name: "Lighting fixtures",         description: "Lights, chandeliers, outdoor lighting" },
    { name: "Meter installation",        description: "Utility company electricity connection" },
    { name: "Water supply system",       description: "PVC piping for water distribution" },
    { name: "Drainage system",           description: "Waste water drainage network" },
    { name: "Sanitary fixtures",         description: "Toilets, sinks, bathtubs, showers" },
    { name: "Septic tank and soak-away", description: "Waste treatment system" },
  ],
  8: [ // Finishing (8)
    { name: "Wooden doors",           description: "Interior and exterior doors in various dimensions" },
    { name: "Windows",                description: "Aluminium and glass window installation" },
    { name: "Iron railings",          description: "Balcony and staircase railings" },
    { name: "Surface preparation",    description: "Sanding and priming for paint" },
    { name: "External paint",         description: "Weather-resistant exterior coating" },
    { name: "Internal paint",         description: "Interior wall and ceiling paint" },
    { name: "Ceiling and wood finish", description: "Ceiling paint and wood varnish" },
    { name: "Decoration",             description: "Final decorative touches and contingencies" },
  ],
  9: [ // Exterior (5)
    { name: "Exterior lighting",  description: "Outdoor lighting design and installation" },
    { name: "Water features",     description: "Pool, fountain, aquarium (optional)" },
    { name: "Exterior flooring",  description: "Pavement, concrete, gravel, or vegetation" },
    { name: "Fencing",            description: "Perimeter fencing per owner design" },
    { name: "Garden and seating", description: "Landscaping and outdoor seating" },
  ],
  10: [ // Final Handover (3)
    { name: "Full system inspection",  description: "Complete verification of all systems" },
    { name: "Furnishing coordination", description: "Meetings between engineer and owner for furniture" },
    { name: "Handover",               description: "Keys, complete documentation, and site journal" },
  ],
};
