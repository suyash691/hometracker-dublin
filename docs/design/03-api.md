# Design 03: API Contract

> Parent: [DESIGN.md](../../DESIGN.md)

## New Endpoints (Modules 17-30)

```
# Bidding Strategy (Module 17)
GET/PUT  /api/houses/:id/bidding-strategy

# Communications Tracker (Module 18)
GET      /api/comms?houseId=X&professional=Y
POST     /api/comms
PUT      /api/comms/:id

# Survey Findings (Module 19)
GET/POST /api/houses/:id/survey-findings
PUT/DEL  /api/houses/:id/survey-findings/:findingId

# Fall-Through (Module 20)
POST     /api/houses/:id/fall-through          # record + reset
GET      /api/houses/:id/fall-throughs          # history

# Contract Readiness (Module 21)
GET/PUT  /api/contract-readiness

# Snagging (Module 22)
GET/POST /api/houses/:id/snags
PUT      /api/houses/:id/snags/:snagId
GET      /api/houses/:id/snags/export           # PDF

# BER Cost Impact (Module 23)
GET      /api/houses/:id/ber-impact             # fully computed

# Post-Completion (Module 24)
# Uses existing checklist pattern — auto-created on status→closed

# Drawdown Conditions (Module 25)
# Uses existing MortgageDocument with drawdown_conditions category

# Seller Intelligence (Module 26)
GET/PUT  /api/houses/:id/seller-intel

# HomeBond & BCAR (Module 27)
GET/PUT  /api/houses/:id/new-build-compliance

# Agent Transparency (Module 28)
# Uses CommLog (Module 18) + PPRComparable — no new endpoints

# Planning Calculator (Module 29)
GET      /api/calculator/planning?type=X&size=Y&gardenSize=Z

# Journal (Module 30)
GET/POST /api/journal?houseId=X
```

## Key Response Shapes

```typescript
// GET /api/houses/:id/ber-impact
{
  ber: "D1",
  sqm: 95,
  estimatedAnnualHeating: 3040,
  retrofitCostLow: 25000,
  retrofitCostHigh: 45000,
  seaiGrantsAvailable: 25000,
  netRetrofitLow: 0,
  netRetrofitHigh: 20000,
  annualHeatingAfterRetrofit: 800,
  tenYearSaving: 22400,
  trueCostOfOwnership: { withoutRetrofit: 480400, withRetrofit: 465000 }
}

// GET /api/calculator/planning?type=rear_extension&size=35&gardenSize=60
{
  exempt: true,
  reason: "Under 40sqm rear exemption",
  conditions: ["Single storey only", "Garden remains ≥25sqm after extension", "Max height 3.5m at eaves"]
}

// GET /api/contract-readiness
{
  items: [
    { item: "Mortgage AIP valid", status: true, auto: true, detail: "Expires in 43 days" },
    { item: "Solicitor appointed", status: true, auto: true, detail: "Mary O'Brien" },
    { item: "Proof of funds", status: true, auto: true, detail: "€55,000 savings" },
    { item: "ID verified", status: false, auto: false },
    { item: "AML docs submitted", status: false, auto: false },
  ],
  readyPct: 60,
  shareable: true
}
```
