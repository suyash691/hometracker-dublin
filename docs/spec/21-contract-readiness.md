# Module 21: Contract Readiness Dashboard

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Source: Persona Audit (Reseller)

## Problem

Agents prioritize buyers who can demonstrate ability to complete. The winning buyer isn't always the highest bidder — it's the most "contract ready."

## Readiness Checklist (auto-aggregated)

| Item | Source | Auto-detected |
|------|--------|:-------------:|
| Mortgage AIP valid | MortgageTracker.approvalExpiry | ✓ |
| Solicitor appointed | ConveyancingTracker.solicitorName | ✓ |
| Proof of funds | BuyerProfile.totalSavings > 0 | ✓ |
| Deposit available | BuyerProfile.totalSavings ≥ 10% of target | ✓ |
| ID verified | Manual checkbox | |
| AML documents submitted | Manual checkbox | |
| Surveyor on standby | Manual checkbox | |
| Mortgage broker engaged | Manual checkbox | |

## Shareable Status

Generate a one-page PDF or shareable link showing readiness status (without financial details) that can be sent to the selling agent as a credibility signal.

## API

```
GET    /api/contract-readiness          # auto-computed + manual items
PUT    /api/contract-readiness          # update manual checkboxes
```
