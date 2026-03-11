# Module 09: Stamp Duty & Total Cost

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

## Stamp Duty (Irish rates 2025/2026)

| Band | Rate |
|------|------|
| First €1,000,000 | 1% |
| €1,000,001–€1,500,000 | 2% |
| Above €1,500,000 | 6% |

New builds: calculated on VAT-exclusive price (÷1.135).

## Purchase Price Logic

The total cost calculator uses the **most realistic purchase price**, not just the asking price:

| House Status | Price Used | Rationale |
|-------------|-----------|-----------|
| wishlist / viewing_scheduled / viewed | askingPrice | No bids yet — asking is the best estimate |
| bidding | max(currentBid, askingPrice) | Current bid is the likely price; use whichever is higher |
| sale_agreed+ | currentBid or askingPrice | The agreed price (currentBid reflects what was accepted) |

When the total cost estimate is auto-created (on sale_agreed trigger) or manually initialized, it uses `house.currentBid ?? house.askingPrice` as the purchase price. The user can always override.

When a new bid is placed, the total cost estimate is **auto-recalculated** if one exists — stamp duty and deposit update to reflect the new likely price.

## Entity: TotalCostEstimate

purchasePrice (from bid or asking), deposit (10%), stampDuty (auto), legalFees (€2.5k), landRegistryFees (€700), surveyFee (€500), valuationFee (€185), mortgageProtection, homeInsurance, movingCosts (€800), otherCosts. Computed at read time: totalUpfront, cashNeededAtClosing.

## Funding Stack

Stacked bar: Mortgage (90%) + Deposit (10%) + HTB refund. Per-house on schemes page.

## API

```
GET    /api/stamp-duty?price=X&newBuild=Y
GET/PUT /api/houses/:id/total-cost
```
