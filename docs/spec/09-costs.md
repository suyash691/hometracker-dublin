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

## True Cost of Ownership

The costs tab shows three levels of cost:

| Level | What's Included | Purpose |
|-------|----------------|---------|
| **Cash at Closing** | deposit + stamp duty + legal + registry + survey + valuation | "How much cash do I need on closing day?" |
| **Total Purchase Cost** | cash at closing + mortgage protection + home insurance + moving | "What's the full first-year cost?" |
| **True Cost (incl. renovation)** | total purchase cost + renovation estimate (low–high range) | "What will this house actually cost me all-in?" |

The renovation estimate is pulled from the house's `RenovationEstimate` records (sum of `estimatedCostLow` and `estimatedCostHigh`). If AI estimates have been generated, they're included. If SEAI grants apply (from BER impact), the net-after-grant figure is shown.

```
Purchase Price                    €450,000
────────────────────────────────────────────
Deposit (10%)                      €45,000
Stamp Duty                          €4,500
Legal Fees                          €2,500
Land Registry                         €700
Survey                                €500
Valuation                             €185
────────────────────────────────────────────
Cash Needed at Closing             €53,385

Mortgage Protection (annual)          €600
Home Insurance (annual)               €450
Moving Costs                          €800
────────────────────────────────────────────
Total Purchase Cost                €55,235

Renovation Estimate          €25,000–€40,000
SEAI Grants Available              -€25,000
────────────────────────────────────────────
True All-In Cost         €55,235–€70,235
```

## Funding Stack

Stacked bar: Mortgage (90%) + Deposit (10%) + HTB refund. Per-house on schemes page.

## API

```
GET    /api/stamp-duty?price=X&newBuild=Y
GET/PUT /api/houses/:id/total-cost
```
