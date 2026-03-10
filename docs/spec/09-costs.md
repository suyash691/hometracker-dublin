# Module 09: Stamp Duty & Total Cost

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

## Stamp Duty (Irish rates 2025/2026)

| Band | Rate |
|------|------|
| First €1,000,000 | 1% |
| €1,000,001–€1,500,000 | 2% |
| Above €1,500,000 | 6% |

New builds: calculated on VAT-exclusive price (÷1.135).

## Entity: TotalCostEstimate

purchasePrice, deposit (10%), stampDuty (auto), legalFees (€2.5k), landRegistryFees (€700), surveyFee (€500), valuationFee (€185), mortgageProtection, homeInsurance, movingCosts (€800), otherCosts. Computed: totalUpfront, cashNeededAtClosing.

## Funding Stack

Stacked bar: Mortgage (90%) + Deposit (10%) + HTB refund. Per-house on schemes page.

## API

```
GET    /api/stamp-duty?price=X&newBuild=Y
GET/PUT /api/houses/:id/total-cost
```
