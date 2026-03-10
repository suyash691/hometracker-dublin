export function calculateHTB(ftb: boolean, newBuild: boolean, price: number, taxPaid: number) {
  if (!ftb) return { eligible: false, reason: "Not a first-time buyer", maxRefund: 0 };
  if (!newBuild) return { eligible: false, reason: "HTB only applies to new builds", maxRefund: 0 };
  if (price > 500_000) return { eligible: false, reason: "Price exceeds €500,000 limit", maxRefund: 0 };
  return { eligible: true, reason: "Eligible", maxRefund: Math.round(Math.min(price * 0.1, 30_000, taxPaid)) };
}

export function calculateFHS(ftb: boolean, newBuild: boolean, price: number, usingHTB: boolean) {
  if (!ftb) return { eligible: false, reason: "Not a first-time buyer", maxEquity: 0 };
  if (!newBuild) return { eligible: false, reason: "FHS only applies to new builds", maxEquity: 0 };
  const ceiling = 475_000;
  if (price > ceiling) return { eligible: false, reason: `Price exceeds Dublin ceiling €${ceiling.toLocaleString()}`, maxEquity: 0 };
  const pct = usingHTB ? 0.2 : 0.3;
  return { eligible: true, reason: "Eligible", maxEquity: Math.round(price * pct), ceiling };
}

export function calculateLAHL(income1: number, income2: number, ftb: boolean) {
  if (!ftb) return { eligible: false, reason: "Not a first-time buyer", maxLoan: 0 };
  const total = income1 + income2;
  const limit = income2 === 0 ? 80_000 : 85_000;
  if (total > limit) return { eligible: false, reason: `Income €${total.toLocaleString()} exceeds €${limit.toLocaleString()} limit`, maxLoan: 0 };
  return { eligible: true, reason: "Eligible (need 2 commercial refusals)", maxLoan: 415_000 };
}

export const CONVEYANCING_MILESTONES = [
  "Solicitor appointed", "Booking deposit paid to estate agent",
  "Contracts received from seller's solicitor", "Title investigation completed",
  "Requisitions on title raised", "Requisitions satisfactorily replied to",
  "Mortgage loan offer received from lender", "Contracts reviewed and approved by solicitor",
  "Contracts signed by buyer", "Contracts exchanged (legally binding)",
  "Balance deposit paid (10% minus booking deposit)", "Closing date agreed",
  "Mortgage funds drawn down to solicitor", "Final searches completed",
  "Closing completed — keys received", "Stamp duty paid to Revenue (within 30 days)",
  "Property deed lodged with Tailte Éireann", "LPT registration updated",
];

export const OMC_CHECKLIST = [
  "Request OMC annual accounts (last 3 years)", "Check sinking fund balance and contribution rate",
  "Verify fire safety certificate is current", "Check block insurance policy and excess amounts",
  "Review minutes of last 3 AGMs", "Confirm management agent details and contract terms",
  "Check for planned special levies or major works", "Verify parking/storage included in title",
  "Check if balcony/terrace is demised or licensed", "Review house rules and pet policy",
  "Check broadband/cable infrastructure", "Verify bin collection arrangements",
  "Check lift maintenance contract", "Review any ongoing OMC litigation",
];

export const SEAI_GRANTS = [
  { item: "Heat Pump System", amount: 12500, note: "€9,500 for apartments" },
  { item: "Attic Insulation", amount: 1700, note: "Pre-2011 homes" },
  { item: "Cavity Wall Insulation", amount: 1700, note: "Pre-2011 homes" },
  { item: "External Wall Insulation", amount: 8000, note: "" },
  { item: "Internal Wall Insulation", amount: 4500, note: "" },
  { item: "Windows", amount: 4000, note: "Pre-2011 homes" },
  { item: "Doors (max 2)", amount: 1600, note: "2 × €800" },
  { item: "Solar PV", amount: 2100, note: "" },
  { item: "Solar Thermal", amount: 1200, note: "" },
];
