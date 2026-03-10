export function calculateBorrowingLimits(income1: number, income2: number, ftb: boolean) {
  const combined = income1 + income2;
  const mult = ftb ? 4 : 3.5;
  const maxLTI = combined * mult;
  const maxPrice = Math.round(maxLTI / 0.9);
  const pmt = (r: number, pv: number) => (pv * r / 12) / (1 - Math.pow(1 + r / 12, -360));
  return {
    combinedIncome: combined, multiplier: mult, maxLTI: Math.round(maxLTI),
    maxPropertyPrice: maxPrice, minDeposit: Math.round(maxPrice * 0.1),
    monthlyAt4pct: Math.round(pmt(0.04, maxLTI)), monthlyAt6pct: Math.round(pmt(0.06, maxLTI)),
  };
}
