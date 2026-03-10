// Default viewing checklist template — composite of realtor + buyer perspectives
// Seeded on first run via /api/seed

export const DEFAULT_CHECKLIST_ITEMS = [
  // === STRUCTURAL & EXTERIOR ===
  "Check exterior walls for cracking, bulging, or render damage",
  "Inspect roof condition — missing/slipped slates, sagging ridgeline",
  "Look for damp patches, mould, or musty smells on ground floor walls and ceilings",
  "Test for rising damp in ground floor rooms (especially Victorian terraces)",
  "Check window frames for rot, condensation between panes, and draughtiness",
  "Examine gutters, downpipes, and drainage for blockages or overflow staining",
  "Inspect chimney stacks for leaning, cracked pots, or missing cowls",
  "Check foundations and boundary walls for settlement cracks",
  "Look for cracks in internal and external walls indicating structural issues",
  "Check for evidence of Japanese knotweed or invasive species in garden",

  // === INTERIOR CONDITION ===
  "Open and close all internal doors — sticking doors suggest structural movement",
  "Open and close all windows — check for draughts, double/triple glazing",
  "Check condition of kitchen units, countertops, and appliances included in sale",
  "Look for signs of woodworm or timber decay in floors, stairs, and attic joists",
  "Inspect attic for insulation quality, ventilation, and signs of roof leaks",
  "Count plug sockets in each room — older Dublin houses often have too few",
  "Check storage space: hot press size, attic access, under-stairs cupboard",
  "Check if there is enough room for washing machine, dryer, and kitchen storage",
  "Note orientation of rear garden — south-facing is premium in Dublin",
  "Check if garden is overlooked by neighbours or nearby apartments",

  // === UTILITIES & SERVICES ===
  "Test water pressure in all taps and flush all toilets",
  "Run showers to check pressure and drainage speed",
  "Check all light switches, plug sockets, and note age of fuse board",
  "Confirm heating system type, age, and last service date",
  "Bleed a radiator to check for sludge and test heating in multiple rooms",
  "Ask about annual heating costs and what system is used (gas, oil, heat pump)",
  "Ask about age of boiler and when wiring was last updated",
  "Check mobile phone signal strength in every room",
  "Test broadband speed / confirm fibre availability (SIRO/eir coverage checker)",
  "Ask about bin collection provider and annual cost",

  // === ENERGY & BER ===
  "Assess BER rating and ask for the BER certificate",
  "Check if attic is insulated and if cavity wall insulation has been done",
  "Note: anything below B3 means significant heating bills",

  // === NEIGHBOURHOOD & LOCATION ===
  "Visit the property at night to assess noise, street lighting, and safety",
  "Visit on a weekday morning to gauge rush-hour traffic and commute reality",
  "Check proximity to nearest LUAS or DART stop and actual walk time",
  "Check Dublin Bus routes serving the area and frequency at peak hours",
  "Walk the route to nearest shop, café, and green space",
  "Ask neighbours how long they have lived there and what the area is like",
  "Check proximity to GP surgeries, pharmacies, and nearest hospital/ED",
  "Research local school catchment areas if relevant",
  "Assess road noise — especially if near M50, N roads, or busy junction",
  "Check if property is under a flight path (especially north Dublin near airport)",
  "Note condition of neighbouring properties — dereliction affects value",

  // === PARKING & TRANSPORT ===
  "Check if there is designated parking or permit parking",
  "Assess how competitive on-street parking is",

  // === LEGAL, PLANNING & DUBLIN-SPECIFIC ===
  "Check if property is in a flood risk zone (floodinfo.ie — Dodder/Tolka/Liffey)",
  "For 2001–2013 builds: request pyrite assessment or IS 398 certificate",
  "Check for planned developments nearby on local authority ePlanning portal",
  "Verify property has valid planning permission and compliance certs for extensions",
  "Check Property Price Register for what similar homes on the street sold for",
  "Ask how long property has been on the market and if price was reduced",
  "Check boundary walls/fences — understand who is responsible for maintenance",
  "Ask about any boundary disputes or rights of way",
  "Confirm solicitor has checked for easements and rights of way",

  // === APARTMENTS (if applicable) ===
  "For apartments: ask about annual management fee and what it covers",
  "For apartments: check sinking fund balance and any planned special levies",
  "For apartments: review management company accounts",
  "For apartments: inspect common areas and bin storage",

  // === COSTS & FUTURE-PROOFING ===
  "Ask about property tax (LPT) amount and when last assessed",
  "Check if there is space/planning feasibility for future extension or attic conversion",
  "Note: roof replacement in Dublin can cost €15k+, rewire €5k–€10k",
];
