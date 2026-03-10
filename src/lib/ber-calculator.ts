const HEATING_PER_SQM: Record<string, number> = {
  A1: 4, A2: 5, A3: 6, B1: 7, B2: 9, B3: 12,
  C1: 14, C2: 17, C3: 20, D1: 27, D2: 32,
  E1: 38, E2: 42, F: 48, G: 55,
};
const RETROFIT: Record<string, [number, number]> = {
  A1: [0,0], A2: [0,0], A3: [0,0], B1: [0,2000], B2: [0,0], B3: [3000,5000],
  C1: [8000,15000], C2: [12000,20000], C3: [15000,25000],
  D1: [25000,40000], D2: [30000,45000],
  E1: [35000,55000], E2: [40000,65000], F: [50000,75000], G: [55000,80000],
};
const SEAI_MAX: Record<string, number> = {
  A1: 0, A2: 0, A3: 0, B1: 2100, B2: 0, B3: 5000,
  C1: 15000, C2: 15000, C3: 20000, D1: 25000, D2: 25000,
  E1: 28000, E2: 28000, F: 30000, G: 30000,
};

export function calculateBerImpact(ber: string, sqm: number, askingPrice?: number) {
  const rate = HEATING_PER_SQM[ber] ?? 20;
  const annual = Math.round(rate * sqm);
  const [rLow, rHigh] = RETROFIT[ber] ?? [15000, 30000];
  const scale = sqm / 100;
  const retrofitLow = Math.round(rLow * scale);
  const retrofitHigh = Math.round(rHigh * scale);
  const grants = SEAI_MAX[ber] ?? 0;
  const netLow = Math.max(0, retrofitLow - grants);
  const netHigh = Math.max(0, retrofitHigh - grants);
  const annualAfter = Math.round(9 * sqm); // B2 target
  const tenYearSaving = (annual - annualAfter) * 10;
  return {
    ber, sqm, estimatedAnnualHeating: annual,
    retrofitCostLow: retrofitLow, retrofitCostHigh: retrofitHigh,
    seaiGrantsAvailable: grants, netRetrofitLow: netLow, netRetrofitHigh: netHigh,
    annualHeatingAfterRetrofit: annualAfter, tenYearSaving,
    trueCostWithout: (askingPrice || 0) + annual * 10,
    trueCostWith: (askingPrice || 0) + netHigh + annualAfter * 10,
  };
}
