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



