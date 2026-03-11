# Design 04: Business Logic

> Parent: [DESIGN.md](../../DESIGN.md)

## BER Cost Impact Calculator (Module 23)

```typescript
const BER_HEATING_PER_SQM = { // EUR/sqm/year
  A1: 4, A2: 5, A3: 6, B1: 7, B2: 9, B3: 12,
  C1: 14, C2: 17, C3: 20, D1: 27, D2: 32,
  E1: 38, E2: 42, F: 48, G: 55,
};
const RETROFIT_TO_B2 = { // [low, high] EUR for 100sqm
  A1: [0,0], A2: [0,0], A3: [0,0], B1: [0,2000], B2: [0,0], B3: [3000,5000],
  C1: [8000,15000], C2: [12000,20000], C3: [15000,25000],
  D1: [25000,40000], D2: [30000,45000],
  E1: [35000,55000], E2: [40000,65000], F: [50000,75000], G: [55000,80000],
};
```

## Planning Permission Calculator (Module 29)

```typescript
function checkExemption(type: string, sizeSqm: number, gardenSqm: number) {
  if (type === "rear_extension") {
    if (sizeSqm > 40) return { exempt: false, reason: "Exceeds 40sqm limit" };
    if (gardenSqm - sizeSqm < 25) return { exempt: false, reason: "Garden would be <25sqm" };
    return { exempt: true, reason: "Under 40sqm rear exemption", conditions: [...] };
  }
  // ... garage (25sqm), porch (2sqm), attic (no floor area increase)
}
```

## Automation Triggers

| Trigger | Creates |
|---------|---------|
| status → `sale_agreed` | ConveyancingTracker + 18 milestones, TotalCostEstimate, 4 action items |
| status → `sale_agreed` + isNewBuild | SnagItem checklist, NewBuildCompliance checklist |
| status → `closed` | Post-completion moving checklist (22 items) |
| status → `dropped` (from sale_agreed+) | FallThroughRecord prompt |
| MortgageTracker.status → `full_approval` | Drawdown conditions checklist |
| viewingDate passes | Journal gut-check prompt |
| CommLog.responseNeeded + 5 days | Overdue alert in activity feed |
| BiddingStrategy.hardCeiling reached | Walk-away prompt |

## Total Cost — Purchase Price Selection

```typescript
// Used by: sale-agreed trigger, total-cost API, bid creation
function getEffectivePrice(house: { askingPrice?: number; currentBid?: number }): number {
  return house.currentBid ?? house.askingPrice ?? 0;
}
```

When a bid is placed (POST /api/houses/:id/bids), if a TotalCostEstimate exists, auto-recalculate:
```
new bid → update house.currentBid → recalculate TotalCostEstimate.purchasePrice, deposit, stampDuty
```
