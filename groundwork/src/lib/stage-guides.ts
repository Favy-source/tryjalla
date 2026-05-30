/**
 * stage-guides.ts — Per-stage and per-substage guidance content for
 * Self-Verify (self_serve) tier users.
 *
 * Self-Verify users have no Jalla Professional reviewing their work.
 * These guides help them know what to look for and what evidence to capture
 * before marking a substage or stage complete.
 *
 * Structure:
 *   STAGE_GUIDES[stageNumber].overview     — what the stage is and why it matters
 *   STAGE_GUIDES[stageNumber].beforeApprove — checklist before marking complete
 *   SUBSTAGE_GUIDES[stageNumber][substageNumber] — per-substage guidance
 */

export interface SubstageGuideContent {
  whatToCheck: string[];    // bullet points: what to physically inspect
  evidenceToCapture: string[]; // what photos/documents to upload
  redFlags: string[];       // warning signs that something is wrong
  tip?: string;             // one practical tip from experience
}

export interface StageGuideContent {
  overview: string;
  whyItMatters: string;
  beforeApprove: string[];  // checklist items before marking stage complete
  substages: Record<number, SubstageGuideContent>;
}

export const STAGE_GUIDES: Record<number, StageGuideContent> = {
  1: {
    overview: "Land Secured covers all the legal and financial steps to confirm you own the land and it is free of disputes before construction begins.",
    whyItMatters: "A plot with a defective title can halt your entire build and result in loss of investment. This stage protects everything that follows.",
    beforeApprove: [
      "Original land title / Certificate of Occupancy (C of O) is in your name",
      "Surveyor's report confirms plot boundaries match your purchase",
      "No encumbrances or court orders on the title",
      "Payment was made via bank transfer (not cash) for traceability",
      "Legal agreement signed and notarised",
    ],
    substages: {
      1: {
        whatToCheck: ["Surveyor's credentials and registration number", "Survey plan matches the plot you inspected physically", "Bearings and dimensions on the survey plan are consistent"],
        evidenceToCapture: ["Photo of the survey plan", "Photo of the surveyor's registration certificate"],
        redFlags: ["Survey plan is undated or has corrections", "Surveyor refuses to show registration certificate", "Plot dimensions don't match what you were shown on site"],
        tip: "Ask the surveyor to walk the boundary pegs with you on site before signing off.",
      },
      2: {
        whatToCheck: ["Title document type (C of O, Deed of Assignment, Governor's Consent)", "Name on the title matches the seller's ID", "No third-party claims noted on the document"],
        evidenceToCapture: ["Clear photo of each page of the title document", "Screenshot of land registry verification (if available online)"],
        redFlags: ["Title is a photocopy only — no original", "Multiple names on the title (potential dispute)", "Any erasures or corrections on the document"],
        tip: "Engage a qualified property lawyer to run a search at the land registry. Cost: ~₦30,000–₦80,000 in Nigeria. Non-negotiable.",
      },
      3: {
        whatToCheck: ["Lawyer is registered with the local bar association", "Agreement clearly states sale price, plot details, and obligations", "Both parties have signed and the document is notarised"],
        evidenceToCapture: ["Signed purchase agreement (all pages)", "Lawyer's bar association membership card"],
        redFlags: ["Lawyer is recommended only by the seller", "Agreement omits penalty clauses for non-delivery of title", "No notarisation stamp"],
        tip: "Use your own lawyer, not the seller's. Conflict of interest is common.",
      },
      4: {
        whatToCheck: ["Bank transfer receipt shows the correct amount and beneficiary name", "Transfer was made to the seller's personal or company account (not a third party)"],
        evidenceToCapture: ["Bank transfer receipt or debit alert", "Screenshot of the beneficiary name confirmation"],
        redFlags: ["Seller requests cash or third-party transfer", "Receipt amount differs from agreed price"],
        tip: "Split large payments into two tranches: deposit on agreement, balance on title transfer. This protects you.",
      },
      5: {
        whatToCheck: ["New title is in your name (not the seller's)", "Transfer has been registered at the land registry", "You physically have the original document"],
        evidenceToCapture: ["New title document with your name", "Land registry receipt for the transfer"],
        redFlags: ["Seller requests to 'hold' the title after transfer", "Registry receipt is missing or undated"],
        tip: "Title transfer can take 3 weeks to 6 months in Nigeria. Chase the registry every 2 weeks.",
      },
      6: {
        whatToCheck: ["Bill of Quantities covers all major construction sections", "Rates are current (not outdated from 2–3 years ago)", "BOQ is signed by a qualified Quantity Surveyor"],
        evidenceToCapture: ["Photo of the signed BOQ cover page", "Upload the full BOQ as a PDF to the Document Vault"],
        redFlags: ["BOQ prepared without a site visit", "Rates seem unusually low (underquoting is a red flag)"],
        tip: "Get at least two BOQs from different QS firms and compare. Significant gaps in rates indicate one is wrong.",
      },
    },
  },

  2: {
    overview: "Design covers all technical plans, permit approvals, and professional sign-offs before a single shovel enters the ground.",
    whyItMatters: "Building without approved plans is illegal in most African countries and risks demolition orders. Good structural plans prevent future cracking and collapse.",
    beforeApprove: [
      "Architectural plans show all floors, roof, elevations, and sections",
      "Structural plan is stamped by a registered structural engineer",
      "Building permit has been issued by the local authority",
      "Bill of Quantities (BOQ) prepared by a Quantity Surveyor",
      "Soil test report available (mandatory for 3+ floors)",
    ],
    substages: {
      1: {
        whatToCheck: ["Soil test conducted by a certified geotechnical lab", "Report includes bearing capacity and recommended foundation depth", "Report is specific to your plot (not a neighbouring site)"],
        evidenceToCapture: ["Soil test report cover page", "Borehole log / test pit photos"],
        redFlags: ["Report has no site-specific GPS coordinates", "Bearing capacity stated without lab test data"],
        tip: "Mandatory for 3+ floors. For 1–2 floors, still recommended if the area has soft soil or prior construction history.",
      },
      2: {
        whatToCheck: ["All floor plans match your agreed room configuration", "Roof plan is included", "Electrical and plumbing layouts are shown", "Elevations show all four sides"],
        evidenceToCapture: ["Photo of each plan sheet", "Upload the full plan set as PDF"],
        redFlags: ["Plans don't match the agreed room count", "Sections are missing — only floor plans provided"],
        tip: "Walk through each room on the plan. Count doors, windows, and bathrooms. Mistakes here are expensive to fix on site.",
      },
      3: {
        whatToCheck: ["Structural plan shows column positions, beam sizes, and slab depths", "Foundation type matches the soil test recommendation", "Plan is stamped and signed by a COREN-registered engineer (Nigeria) or equivalent"],
        evidenceToCapture: ["Structural plan cover page with engineer's stamp", "Foundation detail drawings"],
        redFlags: ["No stamps or signatures on structural documents", "Engineer not registered with the local engineering council"],
        tip: "Ask the engineer to explain the foundation type choice in one paragraph. If they can't, find another engineer.",
      },
      4: {
        whatToCheck: ["State-registered architect's signature on architectural plans", "COREN-registered engineer's stamp on structural plan"],
        evidenceToCapture: ["Signature pages of both architectural and structural plans"],
        redFlags: ["Signatures are missing or unverifiable", "Plans are stamped with a rubber stamp only (no wet signature)"],
        tip: "Verify the professional's registration number on the relevant council's website before paying for authorisation.",
      },
      5: {
        whatToCheck: ["Permit is issued in the owner's name and for the correct plot address", "Permit specifies building type (residential), number of floors, and gross area", "Permit validity date hasn't expired"],
        evidenceToCapture: ["Photo of the permit (front and back)", "Upload permit to Document Vault"],
        redFlags: ["Permit is verbal or promised but not yet issued", "Permit is for a different address", "Permit issued for fewer floors than you plan to build"],
        tip: "Start the permit application on Day 1 of the Design stage. Approval can take 4–12 weeks.",
      },
      6: {
        whatToCheck: ["BOQ itemises all 9 cost sections (preliminary, foundation, structure, etc.)", "Quantities are verified against the architectural plan"],
        evidenceToCapture: ["BOQ summary page", "Full BOQ document uploaded to Document Vault"],
        redFlags: ["BOQ prepared without physical site measurement", "Quantities don't match plan dimensions"],
        tip: "A good BOQ is used to get contractor quotes. Share it with at least 3 contractors for comparison.",
      },
    },
  },

  3: {
    overview: "Site Preparation transforms raw land into a safe, equipped construction site. Utilities, access, and temporary facilities are established.",
    whyItMatters: "A disorganised site delays work, increases theft risk, and raises contractor costs. Good preparation means work starts productively on Day 1.",
    beforeApprove: [
      "Electricity supply confirmed (utility or generator/solar)",
      "Water source confirmed (mains or borehole)",
      "Site cleared and levelled — no trees, stumps, or debris",
      "Magazine (site house) constructed for materials and workers",
      "Basic tools and safety equipment present on site",
    ],
    substages: {
      1: { whatToCheck: ["Temporary electricity pole installed or generator/solar in place", "Wiring is safe and not exposed"], evidenceToCapture: ["Photo of power source on site"], redFlags: ["Using a neighbour's electricity without a meter — theft risk"], tip: "Solar + inverter is now cheaper than a generator over a 12-month build. Calculate the cost difference before deciding." },
      2: { whatToCheck: ["Water tank or borehole is functional", "Water tested if a borehole (check for salinity or contamination)", "Storage capacity is enough for a week's construction use"], evidenceToCapture: ["Photo of water source and storage tank"], redFlags: ["Relying on raincatch without a backup — work stops in dry season"], tip: "Minimum 5,000 litres of storage on site for concrete work." },
      3: { whatToCheck: ["Plot is level within 200mm across the building footprint", "All trees, stumps, and roots removed", "Topsoil stripped and stacked (useful for landscaping later)"], evidenceToCapture: ["Wide-angle photo of the cleared, levelled plot", "Photo showing the building corners staked out"], redFlags: ["Large tree stumps left in — roots cause foundation cracking"], tip: "Have your builder peg out the building corners before clearing to confirm nothing critical was removed." },
      4: { whatToCheck: ["Magazine is weather-tight (roof and walls)", "Has a lock and is used only for materials — no cooking or sleeping inside (fire risk)", "Located so materials aren't moved more than 20m to the work area"], evidenceToCapture: ["Interior and exterior photos of the magazine"], redFlags: ["Cement stored directly on bare ground (moisture damage)", "No lock — materials are vulnerable to theft"], tip: "Cement stored on a wooden pallet, 150mm off the ground, lasts weeks longer." },
      5: { whatToCheck: ["Spirit level and laser level are on site", "Personal protective equipment (PPE) present: hard hats, safety boots, high-vis vests"], evidenceToCapture: ["Photo of key tools laid out", "Photo of workers wearing PPE"], redFlags: ["No PPE — injuries slow work and create legal liability for the owner"], tip: "Ask your contractor for a safety briefing on Day 1. Non-negotiable on any insured project." },
    },
  },

  4: {
    overview: "Foundation is the most structurally critical stage of the build. Defects here are nearly impossible to fix without demolishing and starting over.",
    whyItMatters: "Foundation failures cause cracking, settling, and in worst cases structural collapse. The extra cost of doing it right is a fraction of the cost of failure.",
    beforeApprove: [
      "Excavation depth matches the structural engineer's specification",
      "Backfill material is approved (laterite, not topsoil or black cotton)",
      "Lean concrete (blinding) layer is present and cured before footings poured",
      "Reinforced footings use the specified rebar size and spacing",
      "Foundation pillars (columns) are at correct positions",
      "Floor slab is cast and cured (minimum 7 days before loading)",
      "Foundation blocks completed and mortar fully set",
    ],
    substages: {
      1: { whatToCheck: ["Depth matches structural plan (typically 900mm–1500mm for 2 floors)", "Width matches footing dimensions on plan", "Bottom of trench is firm — no loose soil or water"], evidenceToCapture: ["Photo of open trench with depth measurement visible", "Photo of trench bottom"], redFlags: ["Trench bottom is soft or has standing water — must be dewatered and compacted before concrete", "Depth is less than specified without engineer approval"], tip: "Measure the depth yourself with a tape measure before approving. Don't rely on the contractor's verbal confirmation." },
      2: { whatToCheck: ["Backfill material is laterite (red/orange compacted soil) not topsoil", "Compacted in layers of 150–200mm", "No voids or loose pockets"], evidenceToCapture: ["Photo of backfill material", "Photo during compaction"], redFlags: ["Black cotton soil used as backfill — it expands with moisture and causes cracking", "No compaction — just loosely tipped soil"], tip: "Test compaction by stamping the surface. A properly compacted layer has no give." },
      3: { whatToCheck: ["5cm (50mm) layer of concrete, mix ratio ~1:3:6 (lean)", "Flat surface — no major depressions", "Cured for at least 24 hours before rebar placement begins"], evidenceToCapture: ["Photo of lean concrete layer after casting", "Photo showing depth (place a tape measure)"], redFlags: ["Lean concrete skipped to save money — without it, the footing concrete bonds with earth and weakens"], tip: "Lean concrete is cheap insurance. If your contractor wants to skip it, pay for it yourself." },
      4: { whatToCheck: ["Rebar size matches structural plan (typically Y16 or Y20 main bars)", "Spacing matches plan (usually 150mm or 200mm centres)", "Links/stirrups are present and tight", "Concrete mix is 1:2:4 or as specified (350 kg/m³)"], evidenceToCapture: ["Close-up of rebar in position before concrete poured", "Photo of concrete being poured"], redFlags: ["Rebar is undersized or spaced wider than specified", "Concrete mix is visibly weak (too much water, too little cement)"], tip: "Request a concrete cube test. The lab crushes the cube at 28 days and gives you a strength certificate. Costs ~₦15,000 per test." },
      5: { whatToCheck: ["Column positions match the structural plan exactly", "Columns are plumb (vertical) — check with a spirit level", "Correct rebar starter bars extending upward for the next slab"], evidenceToCapture: ["Photo of column positions from above", "Photo of each column with spirit level showing plumb"], redFlags: ["Columns out of position by more than 25mm", "No starter bars protruding — you can't connect the next floor without them"], tip: "Position is checked before concrete is poured — once cast, it cannot be moved without demolition." },
      6: { whatToCheck: ["Slab thickness matches plan (typically 125–150mm for ground floor)", "Rebar mesh is correctly positioned (not on the ground)", "Concrete is well vibrated — no honeycombing visible after shuttering removed"], evidenceToCapture: ["Photo of slab during pour showing rebar elevation", "Photo of slab after shuttering removed"], redFlags: ["Honeycombing (voids) visible on slab underside — structural weakness", "Slab thinner than specified"], tip: "Cure the slab by keeping it wet for 7–10 days. Cover with hessian and water twice daily." },
      7: { whatToCheck: ["Block mortar is 1:6 mix (1 cement : 6 sand)", "Blocks are plumb and level", "Polystyrene insulation boards placed correctly if specified"], evidenceToCapture: ["Photo of block courses showing mortar joints", "Photo of polystyrene in place"], redFlags: ["Mortar crumbles when scratched — too much sand", "Blocks not soaked in water before laying (they pull moisture from mortar and weaken the bond)"], tip: "Soak blocks in water 30 minutes before laying. This doubles mortar bond strength." },
    },
  },

  5: {
    overview: "Structure & Walls is the frame of your building — columns, beams, slabs, and walls that carry all loads to the foundation.",
    whyItMatters: "Structural defects at this stage are costly to correct and can compromise safety for decades. Every column and beam position matters.",
    beforeApprove: [
      "All columns are plumb and at correct plan positions",
      "Beams and lintels over all openings (doors and windows)",
      "Staircase structure is complete and matches the plan",
      "Upper floor slab cured for at least 14 days before loading",
      "All block walls are plumb and level",
      "Internal and external plastering complete",
      "Floor mortar screed and base tiling done",
    ],
    substages: {
      1: { whatToCheck: ["Column size matches structural plan (e.g., 225×225mm or 300×300mm)", "Concrete is 350 kg/m³ or as specified", "No cold joints (breaks in pouring that create weakness)"], evidenceToCapture: ["Photo of column formwork before pour", "Photo of completed columns with dimensions visible"], redFlags: ["Column visibly tapered or off-square", "Pour stopped and resumed without proper treatment of cold joint"], tip: "Pour each column in one continuous operation. Stopping partway creates a permanent weakness." },
      2: { whatToCheck: ["Lintel provided over every door and window opening", "Beam depth matches structural plan", "Rebar is correctly specified and tied"], evidenceToCapture: ["Photo of beams with rebar visible before concrete", "Photo of lintels over all openings"], redFlags: ["Opening without a lintel — wall will crack above the door/window", "Beam depth reduced without engineer approval"], tip: "Every opening needs a lintel or beam. Non-negotiable — it's basic structural practice." },
      3: { whatToCheck: ["Staircase width is at least 900mm (habitable standard)", "Riser height is consistent (ideally 175mm)", "Stringer beams are reinforced concrete, not hollow block"], evidenceToCapture: ["Photo of staircase framework before concrete", "Completed staircase photo"], redFlags: ["Stringer is hollow block — will crack under repeated use", "Inconsistent risers cause trips and falls"], tip: "Measure each riser individually after casting. Maximum acceptable variation is 5mm." },
      4: { whatToCheck: ["Slab thickness verified before concrete (150–200mm for upper floors)", "Rebar specified on plan installed correctly", "Slab cured for minimum 14 days before removing props"], evidenceToCapture: ["Photo during pour showing depth", "Photo of prop arrangement during curing"], redFlags: ["Props removed before 14 days — slab may crack under self-weight", "Large deflection visible in slab after propping removed"], tip: "Never let contractors remove props early to reuse them elsewhere. Insist on the full 14-day curing period." },
      5: { whatToCheck: ["Walls are plumb (check with level and long straight edge)", "Block courses are level (use a spirit level every 3 courses)", "Mortar joints are filled — no hollow points"], evidenceToCapture: ["Photo of wall with spirit level in frame", "Wide-angle interior photo of completed walls"], redFlags: ["Wall off-plumb by more than 10mm — will require thick plaster to hide, or worse, cracks later", "Hollow mortar joints — moisture entry point"], tip: "Tap blocks with your knuckles after mortar sets. A dull thud means hollow joint — instruct the contractor to repoint." },
      6: { whatToCheck: ["Plaster is at least 12mm thick on internal walls", "External render is cement-based (not gypsum — it dissolves in rain)", "No cracks in fresh plaster — indicates poor surface prep or premature loading"], evidenceToCapture: ["Photo of plastered surfaces — internal and external", "Photo of external render texture"], redFlags: ["Gypsum plaster on external walls", "Visible cracking before 7 days — substrate not prepared correctly"], tip: "Wet the block wall surface 30 minutes before plastering. Dry blocks absorb water from plaster and cause delamination." },
      7: { whatToCheck: ["Mortar screed is at least 50mm thick", "Screed is level within 3mm across 3m (use a long level)", "Allow 28 days before laying final tiles on screed"], evidenceToCapture: ["Photo of screed with level in frame"], redFlags: ["Screed crumbles — mix was too weak", "Tiles laid immediately on fresh screed — will hollow-sound and crack"], tip: "Tap tiles with a coin after laying. A hollow sound means the bed is insufficient — the tile will crack." },
      8: { whatToCheck: ["Wall tiles are level and square", "Grout is fully filled — no voids", "Decorative plaster profiles are secure and straight"], evidenceToCapture: ["Close-up photo of tile lines and grout", "Photo of completed feature wall"], redFlags: ["Uneven grout width", "Loose tiles (tap to check)"], tip: "Check tile levelness both horizontally and vertically. Diagonal checks catch errors that individual rows miss." },
    },
  },

  6: {
    overview: "Roofing protects the entire structure from weather. A good roof lasts 30+ years; a poor one leaks within 3.",
    whyItMatters: "Rain penetration destroys interior finishes, causes mould, and degrades the structure. Roofing is not the place to cut costs.",
    beforeApprove: [
      "All roof trusses are installed and properly braced",
      "Purlins are at correct spacing (max 900mm for standard roofing sheets)",
      "Roofing sheets are lapped correctly (minimum 150mm side lap)",
      "Ridge caps, fascias, and gutters are installed",
      "Ceiling boarding is complete and secure",
    ],
    substages: {
      1: { whatToCheck: ["Truss members are full-size hardwood (no rejects or knots at joints)", "All joints are bolted or strapped — not just nailed", "Trusses are braced against lateral movement"], evidenceToCapture: ["Photo of truss assembly from above and below"], redFlags: ["Timber has large knots at critical joints", "Only nailed — no bolts, straps, or gang nail plates", "Trusses wobble when you push them — not braced"], tip: "Push each truss laterally after installation. It should be rigid. If it sways, demand additional bracing before sheeting." },
      2: { whatToCheck: ["Purlin spacing is 600–900mm for standard 0.55mm sheets", "Purlins are straight and level", "End purlins overhang sufficiently for fascia boarding"], evidenceToCapture: ["Photo of purlin layout from gable end"], redFlags: ["Spacing exceeds 900mm — sheets will flex and may blow off in strong wind"], tip: "Measure purlin spacing in several bays, not just the first. Inconsistency is common." },
      3: { whatToCheck: ["Sheets lapped at least 1.5 corrugations (side) and 150mm (end)", "Screws or hook bolts are at every purlin, every sheet", "No exposed screw heads without neoprene washers (rust and leaks)"], evidenceToCapture: ["Photo of sheet-to-sheet laps", "Photo of fixing detail at ridge and eaves"], redFlags: ["Sheets fastened only at ends — mid-sheet fixings missing (wind uplift failure)", "No neoprene washers on screws — will leak within 1 year"], tip: "Check fixings from inside the roof space after installation. Missing mid-span fixings are invisible from outside." },
      4: { whatToCheck: ["Ridge cap sealed with roofing putty or cap tape on laps", "Fascia boards are treated and painted", "Gutters fall toward downpipes (minimum 1:400 fall)"], evidenceToCapture: ["Photo of ridge cap installation", "Photo of gutter profile and downpipe positions"], redFlags: ["Ridge cap screws visible and unprotected", "Gutters without a fall — water will pond and overflow", "Fascia untreated — will rot within 3 years"], tip: "Test gutters by pouring a bucket of water and watching for ponding or overflow. Do this before plastering." },
      5: { whatToCheck: ["Boards are POP (Plaster of Paris), gypsum board, or treated ply (not plywood in bathrooms)", "Fixing is to ceiling joists — not to roof members", "Boards are taped at joints before skim coat"], evidenceToCapture: ["Photo of ceiling in different rooms", "Photo of ceiling-to-wall junction detail"], redFlags: ["Sagging boards — joists not at the right spacing", "Gaps at junctions — will crack with thermal movement"], tip: "For POP ceiling, the skim coat should be applied after the building is enclosed. Humidity changes crack fresh POP." },
    },
  },

  7: {
    overview: "Electrical & Plumbing installs all hidden services that will be inaccessible once walls are finished. Getting this right now avoids costly future repairs.",
    whyItMatters: "Electrical faults cause fires. Plumbing leaks cause structural damage. Both are hidden in walls and floors — verify before closing up.",
    beforeApprove: [
      "All electrical conduit is in place before plastering",
      "Cable sizes match the load design (do not use undersized cable)",
      "Water and drainage pipes pressure-tested before closing walls",
      "Septic tank and soak-away positioned correctly",
      "All sanitary fixtures are in the agreed positions",
    ],
    substages: {
      1: { whatToCheck: ["Conduit is rigid PVC (not flexible corrugated — it collapses over time)", "Conduit boxes (back boxes) at correct heights (switches: 1.3m, sockets: 300–400mm from floor)", "All cables are pulled through before plastering"], evidenceToCapture: ["Photo of conduit layout per room", "Photo of cable pull test (cable visible at both ends)"], redFlags: ["Flexible conduit used in walls — cables cannot be replaced later", "Conduit boxes not set flush — will require chasing after plastering"], tip: "Label each conduit at the consumer unit end before plastering. Future electricians will thank you." },
      2: { whatToCheck: ["Switches are at consistent heights throughout", "Double sockets at least 2 per room, 4 in kitchen", "Waterproof sockets in bathrooms, kitchen, and external areas"], evidenceToCapture: ["Photo of socket layout per room", "Close-up of socket heights with tape measure"], redFlags: ["Ordinary sockets in bathroom — fatal shock risk", "Fewer sockets than agreed — expensive to add later"], tip: "Count sockets in each room against the electrical plan. Discuss any discrepancy before plastering." },
      3: { whatToCheck: ["Light point heights are consistent (ceiling: centre; wall: 2.1m)", "Chandelier points have a steel hook rated for the fixture weight", "External lights are weather-rated (IP65 minimum)"], evidenceToCapture: ["Photo of light points in each room"], redFlags: ["No back box for chandeliers — hanging point unreliable", "Indoor-rated fittings in external positions"], tip: "Mark the ceiling centre for each room on the plan and verify it's been followed. Off-centre light points look poor." },
      4: { whatToCheck: ["Meter board is in position and accessible", "Circuit breakers are the correct amperage for each circuit", "Earthing system is properly installed and connected"], evidenceToCapture: ["Photo of meter board wiring", "Photo of earth rod installation"], redFlags: ["No dedicated earth system — RCD protection only is insufficient", "Overcurrent protection undersized for the installed load"], tip: "Have a licensed electrician issue a certificate of compliance before the meter is connected." },
      5: { whatToCheck: ["All supply pipes are plastic (PPR or CPVC) not galvanised steel (corrodes)", "No visible leaks at joints after pressure test", "Stopcock accessible for each floor"], evidenceToCapture: ["Photo of pipe layout before closing walls", "Photo of pressure test gauge reading"], redFlags: ["Pressure drops on test — there is a leak, find it before plastering", "No stopcock — shutting off water requires turning off the whole supply"], tip: "Pressure test at 1.5× working pressure for 30 minutes with no drop. If it drops, find the joint causing it." },
      6: { whatToCheck: ["Drainage pipes fall at 1:40 (25mm per 1m run)", "All gullies and traps are in place (prevents odour entry)", "Drain tested by filling with water and checking flow"], evidenceToCapture: ["Photo of drain pipe falls (use a spirit level in photo)", "Photo of trapped gullies"], redFlags: ["Flat drainage — will block constantly", "No P-traps under sinks — sewer gases enter the building"], tip: "Pour water in every drain and watch it leave. Slow draining means insufficient fall — fix before closing the floor." },
      7: { whatToCheck: ["All sanitary fixtures are at the agreed positions and specifications", "WC pan is level and secure (no rocking)", "Shower tray or base is waterproofed before tiling"], evidenceToCapture: ["Photo of each sanitary fixture installed", "Photo of shower tray waterproofing layer"], redFlags: ["WC pan rocks when sat on — bad seal, will leak over time", "No waterproofing in shower — water penetrates to floor slab"], tip: "Fill each bathtub or shower base to the overflow and leave for 24 hours. Check below for any water staining." },
      8: { whatToCheck: ["Septic tank is minimum 3m from the building foundation and 30m from any water source", "Soak-away is downhill from the septic tank", "Tank has an inspection cover accessible for pumping"], evidenceToCapture: ["Photo of septic tank installation with dimensions visible", "Photo of soak-away location"], redFlags: ["Tank too close to foundation — odour and structural risk", "No inspection cover — tank cannot be maintained"], tip: "Check the local authority requirements for septic tank setback distances. They vary by region." },
    },
  },

  8: {
    overview: "Finishing is what you and your guests see and touch every day. Quality here determines the feel of the home for decades.",
    whyItMatters: "Poor finishing is the most common complaint from homeowners and the most visible sign of a poorly managed build.",
    beforeApprove: [
      "All doors hang plumb and close without catching",
      "Windows open and close freely with no air gap when closed",
      "All railings are secure and at the correct height (900mm minimum)",
      "Paint is two-coat minimum — no bare patches visible",
      "All timber joinery is treated with varnish or sealant",
    ],
    substages: {
      1: { whatToCheck: ["Door leaf size matches opening + frame allowance", "Hinges are at least 3 per door (not 2 — sagging risk)", "Door handle is at correct height (1050mm from floor)"], evidenceToCapture: ["Photo of each external door installed", "Close-up of hinges and handles"], redFlags: ["Door scrapes floor when opened — frame is not plumb", "2 hinges on a solid hardwood door — will sag within 2 years"], tip: "Check every door by opening and closing it rapidly several times. Any catching or stiffness should be resolved before final paint." },
      2: { whatToCheck: ["Window frames are aluminium (not steel — corrodes) or uPVC", "Glass is at least 4mm — 6mm for large panes", "Weep holes at frame base allow condensation drainage"], evidenceToCapture: ["Photo of window installation", "Photo of frame-to-wall junction (no gap)"], redFlags: ["Gap visible between frame and wall — rain will penetrate", "Missing weep holes — water ponds in frame and causes rot"], tip: "Apply silicone sealant on the external frame-to-wall junction only. Never seal the weep holes." },
      3: { whatToCheck: ["Railing height is minimum 900mm (1100mm on stairs)", "Balusters are spaced max 100mm (child cannot pass head through)", "Top rail is secure — no wobble when loaded"], evidenceToCapture: ["Photo of railing with height measurement", "Photo of baluster spacing"], redFlags: ["Railing wobbles — welding or fixing is inadequate", "Spacing exceeds 100mm — child safety risk"], tip: "Grab each railing section and apply lateral force. Any movement needs immediate re-welding." },
      4: { whatToCheck: ["All surfaces sanded to 80-grit minimum before priming", "Primer coat applied to all surfaces including bare timber joints", "No skim coat cracks before top coat applied"], evidenceToCapture: ["Photo of primed surfaces", "Photo of wall texture before painting"], redFlags: ["Paint applied directly to plaster without primer — will peel within 12 months", "Visible cracks not filled before painting — will reappear"], tip: "Run your hand across primed walls. Ridges and bumps indicate insufficient surface prep — fix now." },
      5: { whatToCheck: ["External paint is elastomeric or masonry paint — not interior emulsion", "Two full coats applied", "No drips, runs, or brush marks on final coat"], evidenceToCapture: ["Wide-angle photo of each external elevation"], redFlags: ["Interior paint on external walls — will chalk and flake in 1 rain season", "Single coat application — will show brickwork or plaster texture through paint"], tip: "Request the paint product name and check the data sheet. Verify it is rated for external use." },
      6: { whatToCheck: ["Two coats of interior emulsion on walls", "Ceiling paint is white or off-white — not coloured (shows every stain)", "Cut-in lines at ceiling-wall junction are crisp"], evidenceToCapture: ["Room-by-room paint photos — all four walls and ceiling"], redFlags: ["Patchy coverage — one coat only", "Dirty brushes causing streaks in fresh paint"], tip: "View walls at a shallow angle in natural light. This reveals any missed areas invisible under direct lighting." },
      7: { whatToCheck: ["All exposed timber is varnished or painted — no bare wood", "Varnish is 2+ coats with sanding between coats", "Ceiling POP skim coat is smooth"], evidenceToCapture: ["Close-up of timber varnish finish", "Photo of ceiling skim coat quality"], redFlags: ["Single coat varnish — will crack in dry season within 1 year", "Bare timber in wet areas — will swell, crack, and rot"], tip: "Varnish timber in dry weather (below 80% humidity). Application in humid conditions causes blushing — a milky discolouration." },
      8: { whatToCheck: ["All punch list items from previous inspections are resolved", "Final clean-up is complete — no builder's rubble inside", "Snag list is signed off"], evidenceToCapture: ["Room-by-room walk-through photos after final clean"], redFlags: ["Outstanding defects accepted without written agreement from the contractor to fix them"], tip: "Create a formal snag list in writing. Give the contractor 14 days to resolve before releasing the final payment." },
    },
  },

  9: {
    overview: "Exterior works complete the property boundary, driveway, garden, and outdoor areas that define the street presence and security of the home.",
    whyItMatters: "A finished interior in an unfinished compound looks incomplete and reduces property value. Exterior security is also a basic safety requirement.",
    beforeApprove: [
      "Perimeter fence / wall is complete and structurally sound",
      "Gate is installed and lockable",
      "Driveway or exterior flooring is laid",
      "Exterior lighting is installed and functional",
      "Drainage from the compound runs away from the building",
    ],
    substages: {
      1: { whatToCheck: ["All exterior lights are IP65-rated (weather resistant)", "Sensor or timer controls functional", "No exposed wiring outside conduit"], evidenceToCapture: ["Photo of exterior light fittings", "Photo showing conduit protection on external runs"], redFlags: ["Indoor fittings used outside — will corrode in 6 months", "Exposed wiring — electrocution risk in rain"], tip: "Test all exterior lights at night before sign-off." },
      2: { whatToCheck: ["Pool/fountain sealed with fibreglass or appropriate waterproofing", "All water features have a pump and filtration system", "Aquarium has correct lighting and filtration for fish type"], evidenceToCapture: ["Photo of completed water feature", "Photo of filtration equipment"], redFlags: ["Pool without proper waterproofing — will leak into foundation", "No filtration — algae and mosquito risk"], tip: "Fill the pool and observe for 72 hours before adding fibreglass. Leaks are easier to find before the coating." },
      3: { whatToCheck: ["Driveway gradient falls away from building (positive drainage)", "Pavement joints filled with mortar or polymer sand", "No cracking or settlement visible"], evidenceToCapture: ["Photo of driveway completed", "Photo of drainage direction (pour water and observe)"], redFlags: ["Driveway slopes toward building — flooding risk", "Loose pavement stones — settlement will worsen"], tip: "Test drainage by pouring a bucket of water and verifying it flows away from the building." },
      4: { whatToCheck: ["Fence height is at least 1.8m for residential security", "Gate posts are in concrete foundations at least 600mm deep", "Gate swings freely and latch engages securely"], evidenceToCapture: ["Photo of fence/wall completion", "Photo of gate and latch mechanism"], redFlags: ["Gate post in soil only — will lean within 2 rain seasons", "Fence top without security profile (spikes or barbed wire) — easy to climb"], tip: "Push the gate post laterally with force. Any movement indicates inadequate foundation depth." },
      5: { whatToCheck: ["Lawn is laid level — no waterlogging areas", "Plants are established and watered", "Seating area is level and stable"], evidenceToCapture: ["Photo of landscaped garden", "Photo of outdoor seating area"], redFlags: ["Low points in lawn where water ponds — mosquito risk", "Unstable seating that rocks on uneven ground"], tip: "Water lawn daily for the first 2 weeks to establish root systems." },
    },
  },

  10: {
    overview: "Final Handover confirms that every system works, every punch list is resolved, and the building is ready for occupancy.",
    whyItMatters: "This is your final opportunity to formally accept the build. Once you sign off, it becomes your responsibility to resolve any defects.",
    beforeApprove: [
      "Full walk-through with the contractor completed and documented",
      "All mechanical, electrical, and plumbing systems tested",
      "All keys, codes, and warranties handed over",
      "Contractor has resolved all outstanding punch list items",
      "Final payment is due only after this stage sign-off",
    ],
    substages: {
      1: { whatToCheck: ["All electrical circuits tested with a circuit tester", "All plumbing outlets have pressure and flow", "All mechanical systems (pumps, gates, generators) are demonstrated"], evidenceToCapture: ["Video walkthrough of each room testing lights and sockets", "Photo of water pressure test at each floor"], redFlags: ["Any system not demonstrated — demand a demonstration before sign-off", "Circuit breaker trips on testing — electrical fault, not cosmetic"], tip: "Use a socket tester (< ₦3,000 at any electrical store) to verify live, neutral, and earth on every socket." },
      2: { whatToCheck: ["Floor plan and furniture dimensions have been reviewed together", "Clearances for movement (minimum 900mm between furniture) are verified", "Any structural changes required for furniture fit are documented"], evidenceToCapture: ["Photo of furniture plan review meeting", "Written note of any agreed modifications"], redFlags: ["Furniture layout conflicts with door swings or socket positions — needs resolution before move-in"], tip: "Walk each room with a measuring tape and the furniture plan. You will find surprises." },
      3: { whatToCheck: ["All keys (front, back, rooms, gate, store) accounted for and labelled", "Guarantee certificates for boreholes, gates, roofing, and windows received", "Site journal / daily log handed over", "As-built drawings (marked-up plans showing what was actually built) received"], evidenceToCapture: ["Photo of key handover", "Photo of all documents received"], redFlags: ["Handover without the site journal — you have no record of materials used", "No as-built drawings — future modifications will be guesswork"], tip: "Add all handover documents to the project Document Vault immediately. This is your most valuable set of documents after the title." },
    },
  },
};

/**
 * Retrieve guide content for a specific substage.
 * Returns null if no guide exists for the stage/substage combination.
 */
export function getSubstageGuide(
  stageNumber: number,
  substageNumber: number,
): SubstageGuideContent | null {
  return STAGE_GUIDES[stageNumber]?.substages[substageNumber] ?? null;
}

/**
 * Retrieve top-level stage guide (overview + before-approve checklist).
 */
export function getStageGuide(stageNumber: number): StageGuideContent | null {
  return STAGE_GUIDES[stageNumber] ?? null;
}
