# Module 08: Government Schemes

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

## Schemes

**Help to Buy (HTB)**: Tax refund up to €30,000 on new builds. FTB only. Price ≤€500k. Mortgage ≥70%. Formula: min(price×10%, €30k, taxPaid4yr).

**First Home Scheme (FHS)**: Shared equity up to 30% (20% with HTB). New builds only. Dublin ceiling €475k. Service charge 1.75%/yr from year 6.

**Local Authority Home Loan (LAHL)**: Government mortgage €415k max (Dublin). Income limit: single €80k, joint €85k. Need 2 commercial refusals.

**SEAI Grants**: Heat pump €12.5k, attic/cavity €1.7k, external insulation €8k, windows €4k, doors €1.6k, solar PV €2.1k, solar thermal €1.2k.

## Entity: SchemeTracker

scheme (htb/fhs/lahl), eligible, estimatedAmount, applicationStatus, referenceId

## API

```
GET    /api/schemes
GET    /api/schemes/eligibility     # auto-calculates from BuyerProfile
PUT    /api/schemes/:scheme
```
