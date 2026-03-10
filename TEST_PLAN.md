# HomeTracker — Comprehensive Test Plan

**Author:** Senior SDE Design Review
**Date:** 2026-03-10
**Companion:** See [DESIGN_REVIEW.md](DESIGN_REVIEW.md) for architecture analysis

---

## Table of Contents

1. [Setup Instructions](#1-setup-instructions)
2. [Unit Tests — Business Logic](#2-unit-tests--business-logic)
3. [API Route Tests](#3-api-route-tests)
4. [Component & Page Tests](#4-component--page-tests)
5. [Integration Tests](#5-integration-tests)
6. [Accessibility Tests](#6-accessibility-tests)
7. [Test Matrix](#7-test-matrix)

---

## 1. Setup Instructions

### 1.1 Required Packages

```bash
npm install --save-dev \
  jest \
  @types/jest \
  ts-jest \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  jest-axe \
  @types/jest-axe \
  jest-environment-jsdom
```

### 1.2 Jest Configuration (`jest.config.ts`)

```typescript
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterSetup: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/src/$1" },
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  coveragePathIgnorePatterns: ["/node_modules/", "__tests__/helpers/"],
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "src/app/api/**/*.ts",
    "src/app/**/page.tsx",
    "src/components/**/*.tsx",
  ],
};

export default createJestConfig(config);
```

### 1.3 Jest Setup (`jest.setup.ts`)

```typescript
import "@testing-library/jest-dom";
import "jest-axe/extend-expect";
```

### 1.4 Expanded Prisma Mock (`__tests__/helpers/prismaMock.ts`)

The existing mock covers 8 models. It must be expanded to cover all 31 Prisma models. Each model needs mocks for every method used in route handlers:

```typescript
import { PrismaClient } from "@prisma/client";

function mockModel() {
  return {
    findMany: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn(),
    create: jest.fn(), createMany: jest.fn(),
    update: jest.fn(), upsert: jest.fn(),
    delete: jest.fn(), deleteMany: jest.fn(),
    count: jest.fn(),
  };
}

const prisma = {
  house: mockModel(),
  media: mockModel(),
  bidHistory: mockModel(),
  actionItem: mockModel(),
  mortgageTracker: mockModel(),
  mortgageDocument: mockModel(),
  mortgageExemption: mockModel(),
  renovationEstimate: mockModel(),
  viewingChecklist: mockModel(),
  checklistTemplate: mockModel(),
  activityLog: mockModel(),
  buyerProfile: mockModel(),
  schemeTracker: mockModel(),
  totalCostEstimate: mockModel(),
  conveyancingTracker: mockModel(),
  conveyancingMilestone: mockModel(),
  apartmentDetails: mockModel(),
  defectiveBlocksAssessment: mockModel(),
  pPRComparable: mockModel(),
  biddingStrategy: mockModel(),
  commLog: mockModel(),
  surveyFinding: mockModel(),
  fallThroughRecord: mockModel(),
  contractReadiness: mockModel(),
  snagItem: mockModel(),
  sellerIntel: mockModel(),
  newBuildCompliance: mockModel(),
  journalEntry: mockModel(),
  preferredAmenity: mockModel(),
  nearbyAmenity: mockModel(),
  commuteEstimate: mockModel(),
} as unknown as PrismaClient;

jest.mock("@/lib/db", () => ({ prisma }));
export { prisma };
```

### 1.5 Test File Naming Convention

```
__tests__/
├── helpers/
│   └── prismaMock.ts
├── lib/                          # Unit tests for business logic
│   ├── stamp-duty.test.ts
│   ├── central-bank.test.ts
│   ├── schemes.test.ts
│   ├── ber-calculator.test.ts
│   ├── planning.test.ts
│   ├── auth.test.ts
│   └── geo/
│       ├── osm.test.ts
│       ├── google.test.ts
│       └── index.test.ts
├── api/                          # API route tests
│   ├── houses.test.ts            # (existing)
│   ├── houses-id.test.ts         # (existing)
│   ├── houses-id-triggers.test.ts # NEW: sale-agreed/closed/dropped
│   ├── bids.test.ts              # (existing)
│   ├── actions.test.ts           # (existing)
│   ├── mortgage.test.ts          # (existing)
│   ├── checklists.test.ts        # (existing)
│   ├── estimates.test.ts         # (existing)
│   ├── checklist-templates.test.ts # (existing)
│   ├── conveyancing.test.ts
│   ├── total-cost.test.ts
│   ├── stamp-duty-api.test.ts
│   ├── borrowing.test.ts
│   ├── planning-api.test.ts
│   ├── ber-impact.test.ts
│   ├── profile.test.ts
│   ├── schemes-api.test.ts
│   ├── auth-api.test.ts
│   ├── import.test.ts
│   ├── apartment.test.ts
│   ├── defective-blocks.test.ts
│   ├── comparables.test.ts
│   ├── bidding-strategy.test.ts
│   ├── seller-intel.test.ts
│   ├── survey-findings.test.ts
│   ├── fall-through.test.ts
│   ├── snags.test.ts
│   ├── new-build-compliance.test.ts
│   ├── comms.test.ts
│   ├── contract-readiness.test.ts
│   ├── journal.test.ts
│   ├── neighbourhood.test.ts
│   ├── amenity-preferences.test.ts
│   └── seed-amenities.test.ts
├── components/                   # Component tests
│   ├── dashboard.test.tsx        # (existing)
│   ├── houses-list.test.tsx      # (existing)
│   ├── house-detail.test.tsx
│   ├── actions-page.test.tsx
│   ├── mortgage-page.test.tsx
│   ├── schemes-page.test.tsx
│   ├── profile-page.test.tsx
│   ├── login-page.test.tsx
│   ├── journal-page.test.tsx
│   ├── neighbourhood-tab.test.tsx
│   ├── survey-tab.test.tsx
│   ├── snagging-tab.test.tsx
│   ├── seller-tab.test.tsx
│   ├── journal-tab.test.tsx
│   └── compliance-tab.test.tsx
├── integration/                  # Multi-step flow tests
│   ├── house-lifecycle.test.ts
│   ├── mortgage-flow.test.ts
│   ├── scheme-eligibility.test.ts
│   └── neighbourhood-flow.test.ts
└── accessibility/                # jest-axe tests
    ├── dashboard.a11y.test.tsx
    ├── houses-list.a11y.test.tsx
    ├── house-detail.a11y.test.tsx
    ├── actions.a11y.test.tsx
    ├── mortgage.a11y.test.tsx
    ├── schemes.a11y.test.tsx
    ├── profile.a11y.test.tsx
    ├── login.a11y.test.tsx
    └── journal.a11y.test.tsx
```

---

## 2. Unit Tests — Business Logic

### 2.1 Stamp Duty (`__tests__/lib/stamp-duty.test.ts`)

**File under test:** `src/lib/stamp-duty.ts`
**Function:** `calculateStampDuty(price: number, isNewBuild: boolean)`

| # | Test Case | Input | Expected Output | Rationale |
|---|-----------|-------|-----------------|-----------|
| 1 | Band 1 — standard property at €400,000 | `(400000, false)` | `{ stampableAmount: 400000, stampDuty: 4000 }` | 1% of €400k = €4,000 |
| 2 | Band 1 — exactly €1,000,000 | `(1000000, false)` | `{ stampableAmount: 1000000, stampDuty: 10000 }` | 1% of €1M = €10,000 (boundary) |
| 3 | Band 2 — €1,200,000 | `(1200000, false)` | `{ stampableAmount: 1200000, stampDuty: 14000 }` | €10k + 2% of €200k = €14,000 |
| 4 | Band 2 — exactly €1,500,000 | `(1500000, false)` | `{ stampableAmount: 1500000, stampDuty: 20000 }` | €10k + €10k = €20,000 (boundary) |
| 5 | Band 3 — €2,000,000 | `(2000000, false)` | `{ stampableAmount: 2000000, stampDuty: 50000 }` | €10k + €10k + 6% of €500k = €50,000 |
| 6 | New build — €450,000 (VAT-exclusive) | `(450000, true)` | `{ stampableAmount: 396476, stampDuty: 3965 }` | €450k ÷ 1.135 = €396,476; 1% = €3,965 |
| 7 | New build — €1,200,000 | `(1200000, true)` | stampableAmount = round(1200000/1.135) = 1057269, duty = 10000 + (57269 * 0.02) = 11145 | Crosses into band 2 after VAT removal |
| 8 | Zero price | `(0, false)` | `{ stampableAmount: 0, stampDuty: 0 }` | Edge case — no duty on €0 |
| 9 | Very small price — €100 | `(100, false)` | `{ stampableAmount: 100, stampDuty: 1 }` | 1% of €100 = €1 |
| 10 | Negative price | `(-100000, false)` | `{ stampableAmount: -100000, stampDuty: -1000 }` | No validation — documents current behavior |
| 11 | New build at exactly €500,000 | `(500000, true)` | stampableAmount = 440529, stampDuty = 4405 | Common FTB new-build price point |
| 12 | Rounding behavior — €333,333 | `(333333, false)` | `{ stampableAmount: 333333, stampDuty: 3333 }` | Verify Math.round on non-round numbers |

### 2.2 Central Bank Rules (`__tests__/lib/central-bank.test.ts`)

**File under test:** `src/lib/central-bank.ts`
**Function:** `calculateBorrowingLimits(income1: number, income2: number, ftb: boolean)`

| # | Test Case | Input | Expected Output | Rationale |
|---|-----------|-------|-----------------|-----------|
| 1 | FTB couple — €60k + €50k | `(60000, 50000, true)` | combinedIncome: 110000, multiplier: 4, maxLTI: 440000, maxPropertyPrice: 489000 (rounded 440000/0.9), minDeposit: 48900 | Standard FTB couple |
| 2 | Non-FTB couple — €60k + €50k | `(60000, 50000, false)` | multiplier: 3.5, maxLTI: 385000, maxPropertyPrice: 428000 (rounded) | Lower multiplier for non-FTB |
| 3 | Single buyer FTB — €80k + €0 | `(80000, 0, true)` | combinedIncome: 80000, maxLTI: 320000, maxPropertyPrice: 356000 | Single income |
| 4 | Zero income | `(0, 0, true)` | maxLTI: 0, maxPropertyPrice: 0, minDeposit: 0 | Edge case |
| 5 | Monthly payment at 4% is reasonable | `(60000, 50000, true)` | monthlyAt4pct should be ~2101 | PMT formula: (440000 * 0.04/12) / (1 - (1+0.04/12)^-360) |
| 6 | Monthly payment at 6% (stress test) | `(60000, 50000, true)` | monthlyAt6pct should be ~2638 | Stress test rate |
| 7 | Very high income — €200k + €200k | `(200000, 200000, true)` | maxLTI: 1600000, maxPropertyPrice: 1778000 | High earners |
| 8 | Verify deposit is exactly 10% of maxPropertyPrice | any input | minDeposit === Math.round(maxPropertyPrice * 0.1) | LTV 90% rule |

### 2.3 Government Schemes (`__tests__/lib/schemes.test.ts`)

**File under test:** `src/lib/schemes.ts`

#### 2.3.1 calculateHTB

| # | Test Case | Input | Expected | Rationale |
|---|-----------|-------|----------|-----------|
| 1 | Eligible FTB new build under €500k | `(true, true, 400000, 50000)` | eligible: true, maxRefund: 30000 | min(40000, 30000, 50000) = 30000 |
| 2 | Eligible but tax-limited | `(true, true, 400000, 15000)` | maxRefund: 15000 | min(40000, 30000, 15000) = 15000 |
| 3 | Eligible but price-limited (10%) | `(true, true, 200000, 50000)` | maxRefund: 20000 | min(20000, 30000, 50000) = 20000 |
| 4 | Not FTB | `(false, true, 400000, 50000)` | eligible: false, reason contains "first-time" | FTB requirement |
| 5 | Not new build | `(true, false, 400000, 50000)` | eligible: false, reason contains "new builds" | New build requirement |
| 6 | Price over €500k | `(true, true, 550000, 50000)` | eligible: false, reason contains "500,000" | Price cap |
| 7 | Exactly €500k | `(true, true, 500000, 50000)` | eligible: true, maxRefund: 30000 | Boundary — should be eligible |
| 8 | Zero tax paid | `(true, true, 400000, 0)` | eligible: true, maxRefund: 0 | Eligible but no refund |

#### 2.3.2 calculateFHS

| # | Test Case | Input | Expected | Rationale |
|---|-----------|-------|----------|-----------|
| 9 | Eligible without HTB — 30% equity | `(true, true, 400000, false)` | eligible: true, maxEquity: 120000 | 30% of €400k |
| 10 | Eligible with HTB — 20% equity | `(true, true, 400000, true)` | maxEquity: 80000 | 20% when using HTB |
| 11 | Not FTB | `(false, true, 400000, false)` | eligible: false | FTB requirement |
| 12 | Not new build | `(true, false, 400000, false)` | eligible: false | New build requirement |
| 13 | Over Dublin ceiling €475k | `(true, true, 500000, false)` | eligible: false, reason contains "475,000" | Dublin ceiling |
| 14 | Exactly €475k | `(true, true, 475000, false)` | eligible: true, maxEquity: 142500 | Boundary |

#### 2.3.3 calculateLAHL

| # | Test Case | Input | Expected | Rationale |
|---|-----------|-------|----------|-----------|
| 15 | Eligible single — €70k | `(70000, 0, true)` | eligible: true, maxLoan: 415000 | Under €80k single limit |
| 16 | Eligible couple — €80k total | `(50000, 30000, true)` | eligible: true, maxLoan: 415000 | Under €85k joint limit |
| 17 | Single over limit — €85k | `(85000, 0, true)` | eligible: false, reason contains "80,000" | Single limit is €80k |
| 18 | Couple over limit — €90k | `(50000, 40000, true)` | eligible: false, reason contains "85,000" | Joint limit is €85k |
| 19 | Not FTB | `(50000, 30000, false)` | eligible: false | FTB requirement |
| 20 | Exactly at single limit — €80k | `(80000, 0, true)` | eligible: false | €80k exceeds €80k (> not >=) |

#### 2.3.4 Constants

| # | Test Case | Expected | Rationale |
|---|-----------|----------|-----------|
| 21 | CONVEYANCING_MILESTONES has 18 items | length === 18 | Spec requires exactly 18 |
| 22 | First milestone is "Solicitor appointed" | [0] === "Solicitor appointed" | Correct ordering |
| 23 | Last milestone is "LPT registration updated" | [17] === "LPT registration updated" | Correct ordering |
| 24 | OMC_CHECKLIST has 14 items | length === 14 | Spec requires exactly 14 |
| 25 | SEAI_GRANTS has 9 items | length === 9 | Spec requires exactly 9 |
| 26 | Heat Pump grant is €12,500 | SEAI_GRANTS[0].amount === 12500 | Correct amount |

### 2.4 BER Calculator (`__tests__/lib/ber-calculator.test.ts`)

**File under test:** `src/lib/ber-calculator.ts`
**Function:** `calculateBerImpact(ber: string, sqm: number, askingPrice?: number)`

| # | Test Case | Input | Expected Key Values | Rationale |
|---|-----------|-------|---------------------|-----------|
| 1 | A1 rating, 100sqm | `("A1", 100)` | annual: 400, retrofitLow: 0, retrofitHigh: 0, grants: 0 | Best rating, no retrofit needed |
| 2 | B2 rating, 100sqm | `("B2", 100)` | annual: 900, retrofitLow: 0, retrofitHigh: 0 | Target rating, no retrofit |
| 3 | D1 rating, 100sqm | `("D1", 100)` | annual: 2700, retrofitLow: 25000, retrofitHigh: 40000, grants: 25000 | Common Dublin rating |
| 4 | D1 rating, 100sqm, net retrofit | `("D1", 100)` | netLow: 0, netHigh: 15000 | 40000 - 25000 = 15000 |
| 5 | G rating, 100sqm | `("G", 100)` | annual: 5500, retrofitLow: 55000, retrofitHigh: 80000, grants: 30000 | Worst rating |
| 6 | D1 rating, 95sqm (scaled) | `("D1", 95)` | annual: 2565, retrofitLow: 23750, retrofitHigh: 38000 | Scale factor 0.95 |
| 7 | Ten-year saving calculation | `("D1", 100)` | tenYearSaving: (2700 - 900) * 10 = 18000 | Saving vs B2 target |
| 8 | Annual after retrofit is B2 rate | `("D1", 100)` | annualAfter: 900 | Always targets B2 (9 * sqm) |
| 9 | True cost with asking price | `("D1", 100, 450000)` | trueCostWithout: 450000 + 27000 = 477000, trueCostWith: 450000 + 15000 + 9000 = 474000 | Total ownership cost |
| 10 | No asking price | `("D1", 100)` | trueCostWithout: 27000, trueCostWith: 24000 | Price defaults to 0 |
| 11 | Unknown BER rating | `("X", 100)` | annual: 2000 (fallback 20 * 100) | Fallback for unknown ratings |
| 12 | Zero sqm | `("D1", 0)` | annual: 0, all costs: 0 | Edge case |
| 13 | F rating, 150sqm | `("F", 150)` | annual: 7200, retrofitLow: 75000, retrofitHigh: 112500 | Scale 1.5x |

### 2.5 Planning Permission (`__tests__/lib/planning.test.ts`)

**File under test:** `src/lib/planning.ts`
**Function:** `checkPlanningExemption(type: string, sizeSqm: number, gardenSqm?: number)`

| # | Test Case | Input | Expected | Rationale |
|---|-----------|-------|----------|-----------|
| 1 | Rear extension under 40sqm | `("rear_extension", 35)` | exempt: true, conditions includes "Single storey" | Within exemption |
| 2 | Rear extension exactly 40sqm | `("rear_extension", 40)` | exempt: true | Boundary — 40 is allowed |
| 3 | Rear extension over 40sqm | `("rear_extension", 41)` | exempt: false, reason contains "40sqm" | Exceeds limit |
| 4 | Rear extension — garden too small | `("rear_extension", 35, 55)` | exempt: false, reason contains "25sqm" | 55 - 35 = 20 < 25 |
| 5 | Rear extension — garden exactly 25sqm remaining | `("rear_extension", 35, 60)` | exempt: true | 60 - 35 = 25, exactly at limit |
| 6 | Garage under 25sqm | `("garage_shed", 20)` | exempt: true, conditions includes "4m height" | Within exemption |
| 7 | Garage over 25sqm | `("garage_shed", 30)` | exempt: false | Exceeds limit |
| 8 | Porch under 2sqm | `("porch", 1.5)` | exempt: true | Within exemption |
| 9 | Porch over 2sqm | `("porch", 3)` | exempt: false | Exceeds limit |
| 10 | Attic conversion | `("attic_conversion", 0)` | exempt: true, conditions includes "Dormer to rear" | Generally exempt |
| 11 | Unknown type | `("swimming_pool", 50)` | exempt: false, reason contains "Unknown" | Fallback |
| 12 | Rear extension with no garden size | `("rear_extension", 35)` | exempt: true | gardenSqm undefined, skip garden check |

### 2.6 Auth (`__tests__/lib/auth.test.ts`)

**File under test:** `src/lib/auth.ts`

| # | Test Case | Expected | Rationale |
|---|-----------|----------|-----------|
| 1 | createAuthCookie with valid credentials | Returns base64 string | Happy path |
| 2 | createAuthCookie with invalid password | Returns null | Auth failure |
| 3 | createAuthCookie with no AUTH_USERS env | Returns cookie (auth disabled) | Permissive when unconfigured |
| 4 | getAuthUser with valid cookie | Returns username | Cookie parsing |
| 5 | getAuthUser with no cookie | Returns null | Missing cookie |
| 6 | getAuthUser with invalid base64 | Returns null | Malformed cookie |
| 7 | getAuthUser with no AUTH_USERS env | Returns name from cookie | Auth disabled mode |
| 8 | requireAuth returns 401 for missing cookie | NextResponse with status 401 | Middleware behavior |
| 9 | requireAuth returns null for valid cookie | null (pass-through) | Middleware behavior |

### 2.7 Geo Providers (`__tests__/lib/geo/`)

#### OsmProvider (`osm.test.ts`)

| # | Test Case | Expected | Rationale |
|---|-----------|----------|-----------|
| 1 | geocode — successful response | Returns { lat, lng } | Parse Nominatim JSON |
| 2 | geocode — empty results | Throws error | No results found |
| 3 | nearbySearch — supermarket query | Returns Place[] with name, lat, lng | Parse Overpass response |
| 4 | nearbySearch — named search (Tesco) | Builds correct Overpass query with name regex | Name-based filtering |
| 5 | nearbySearch — empty results | Returns [] | No nearby amenities |
| 6 | walkingRoute — OSRM success | Returns { distanceMetres, durationMinutes } | Parse OSRM response |
| 7 | walkingRoute — OSRM failure, haversine fallback | Returns haversine-based estimate | Fallback path |
| 8 | haversine calculation accuracy | ~1.3x straight-line distance | Walking factor applied |
| 9 | Custom Nominatim URL from env | Uses NOMINATIM_URL env var | Configurable endpoints |

#### GoogleMapsProvider (`google.test.ts`)

| # | Test Case | Expected | Rationale |
|---|-----------|----------|-----------|
| 10 | geocode — successful response | Returns { lat, lng } | Parse Google Geocoding response |
| 11 | geocode — no results | Throws error | Empty results |
| 12 | nearbySearch — type-based query | Builds URL with type param | Google Places type search |
| 13 | nearbySearch — keyword query | Builds URL with keyword param | Named search (Tesco) |
| 14 | nearbySearch — limits to 5 results | Returns max 5 places | Slice behavior |
| 15 | walkingRoute — success | Returns distance and duration | Parse Directions response |
| 16 | walkingRoute — no routes | Returns { 0, 0 } | Empty response handling |
| 17 | API key included in all requests | All fetch URLs contain key param | Auth requirement |

#### Provider Factory (`index.test.ts`)

| # | Test Case | Expected | Rationale |
|---|-----------|----------|-----------|
| 18 | GEO_PROVIDER=osm returns OsmProvider | instanceof OsmProvider | Default provider |
| 19 | GEO_PROVIDER=google with key returns GoogleMapsProvider | instanceof GoogleMapsProvider | Google provider |
| 20 | GEO_PROVIDER=google without key returns OsmProvider | instanceof OsmProvider | Fallback to OSM |
| 21 | No GEO_PROVIDER env returns OsmProvider | instanceof OsmProvider | Default behavior |


---

## 3. API Route Tests

### Mock Pattern

All API route tests use the expanded `prismaMock.ts`. Each test file:
1. Imports `prisma` from `../helpers/prismaMock`
2. Imports route handlers directly: `import { GET, POST } from "@/app/api/..."`
3. Creates `NextRequest` objects with appropriate URL, method, and body
4. Calls the handler function directly
5. Asserts on response status and JSON body

```typescript
// Standard pattern for parameterized routes:
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });
```

### 3.1 Houses List (`GET/POST /api/houses`) — EXISTING, extend

| # | Test | Expected | Status |
|---|------|----------|--------|
| 1 | GET returns all houses | 200, array | ✅ Exists |
| 2 | GET filters by status | Prisma called with where.status | ✅ Exists |
| 3 | GET filters by neighbourhood | Prisma called with where.neighbourhood | ✅ Exists |
| 4 | POST creates house | 201, house object | ✅ Exists |
| 5 | POST serializes pros/cons | JSON.stringify called | ✅ Exists |
| 6 | GET with both status and neighbourhood filters | where has both fields | NEW |
| 7 | GET returns houses ordered by updatedAt desc | orderBy verified | NEW |
| 8 | GET includes bids (take 1) and media | include verified | NEW |
| 9 | POST with minimal data (address only) | 201, creates successfully | NEW |

### 3.2 House Detail (`GET/PUT/DELETE /api/houses/[id]`) — EXISTING, extend

| # | Test | Expected | Status |
|---|------|----------|--------|
| 10 | GET returns house with all relations | 200, includes media/bids/etc | ✅ Exists |
| 11 | GET returns 404 for missing house | 404 | ✅ Exists |
| 12 | PUT updates house | 200 | ✅ Exists |
| 13 | PUT serializes pros/cons | JSON.stringify | ✅ Exists |
| 14 | DELETE removes house | 200, { ok: true } | ✅ Exists |
| 15 | GET includes biddingStrategy relation | include has biddingStrategy | NEW |
| 16 | GET includes sellerIntel relation | include has sellerIntel | NEW |
| 17 | GET includes surveyFindings relation | include has surveyFindings | NEW |
| 18 | GET includes snagItems ordered by room | orderBy room asc | NEW |

### 3.3 Sale-Agreed Trigger (`PUT /api/houses/[id]` with status changes) — NEW

This is the most critical test suite. Tests the cascade logic in the PUT handler.

| # | Test | Setup | Expected | Rationale |
|---|------|-------|----------|-----------|
| 19 | status→sale_agreed creates ConveyancingTracker | No existing tracker | conveyancingTracker.create called with 18 milestones | Core trigger |
| 20 | status→sale_agreed creates TotalCostEstimate | House has askingPrice €450k | totalCostEstimate.upsert with deposit=45000, stampDuty=4500 | Auto-calc |
| 21 | status→sale_agreed creates 4 action items | — | actionItem.create called 4 times (solicitor, survey, mortgage, insurance) | Auto-actions |
| 22 | status→sale_agreed skips if conveyancing exists | Existing tracker | conveyancingTracker.create NOT called | Idempotency |
| 23 | status→sale_agreed + isNewBuild creates snag items | house.isNewBuild=true | snagItem.createMany called, newBuildCompliance.upsert called | New build path |
| 24 | status→sale_agreed + NOT isNewBuild skips snags | house.isNewBuild=false | snagItem.createMany NOT called | Non-new-build path |
| 25 | status→sale_agreed with no askingPrice skips cost estimate | house.askingPrice=null | totalCostEstimate.upsert NOT called | Missing price |
| 26 | **BUG TEST:** sale_agreed stamp duty uses isNewBuild=false always | house.isNewBuild=true, askingPrice=450k | stampDuty should be 3965 (new build) but code passes false → stampDuty=4500 | Documents known bug |
| 27 | status→closed creates post-completion checklist | — | viewingChecklist.create with 22 items containing "MPRN" | Post-completion |
| 28 | status→closed creates congratulations journal entry | — | journalEntry.create with "Congratulations" | Milestone celebration |
| 29 | status→closed skips checklist if already exists | Existing checklist with "MPRN" | viewingChecklist.create NOT called | Idempotency |
| 30 | status→dropped from sale_agreed creates journal entry | Current status is sale_agreed | journalEntry.create with "fell through" | Fall-through support |
| 31 | status→dropped from conveyancing creates journal entry | Current status is conveyancing | journalEntry.create called | Also triggers from conveyancing |
| 32 | status→dropped from wishlist does NOT create journal | Current status is wishlist | journalEntry.create NOT called | Only from sale_agreed+ |
| 33 | status→bidding (no trigger) | — | No side effects beyond house.update | No trigger for bidding |

### 3.4 Conveyancing (`/api/houses/[id]/conveyancing`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 34 | GET returns tracker with milestones | 200, includes milestones ordered by stepOrder | Happy path |
| 35 | GET returns null for no tracker | 200, null | No conveyancing yet |
| 36 | POST creates tracker with 18 milestones | 201, milestones.length === 18 | Creation |
| 37 | POST returns existing if already created | 200 (not 201), existing tracker | Idempotency |
| 38 | POST auto-creates TotalCostEstimate | totalCostEstimate.upsert called | Side effect |
| 39 | POST auto-creates 4 action items | actionItem.create called 4 times | Side effect |
| 40 | PUT updates solicitor details | 200, solicitorName updated | Edit |

### 3.5 Total Cost (`/api/houses/[id]/total-cost`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 41 | GET returns cost with computed totalUpfront | totalUpfront = deposit + stampDuty + legal + registry + survey + valuation | Computed field |
| 42 | GET returns null when no estimate exists | 200, null | Missing data |
| 43 | PUT auto-calculates stamp duty from purchasePrice | stampDuty computed, not from body | Auto-calc |
| 44 | PUT auto-calculates deposit as 10% | deposit = purchasePrice * 0.1 | Default deposit |
| 45 | PUT uses isNewBuild from house for stamp duty | Reads house.isNewBuild | Correct new-build handling |
| 46 | PUT creates via upsert if not exists | upsert called | Create-or-update |

### 3.6 Stamp Duty API (`GET /api/stamp-duty`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 47 | Returns stamp duty for valid price | 200, { stampableAmount, stampDuty } | Happy path |
| 48 | Returns 400 for missing price | 400, error message | Validation |
| 49 | Handles newBuild=true param | Passes true to calculateStampDuty | Query param parsing |
| 50 | Defaults newBuild to false | Passes false when param missing | Default behavior |

### 3.7 Borrowing Calculator (`GET /api/calculator/borrowing`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 51 | Returns limits for valid incomes | 200, { combinedIncome, maxLTI, maxPropertyPrice, ... } | Happy path |
| 52 | Defaults ftb to true | multiplier === 4 when ftb param missing | Default behavior |
| 53 | ftb=false uses 3.5x | multiplier === 3.5 | Non-FTB path |
| 54 | Zero incomes return zero limits | All values 0 | Edge case |

### 3.8 Planning Calculator (`GET /api/calculator/planning`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 55 | Rear extension exempt | 200, { exempt: true } | Happy path |
| 56 | Rear extension too large | 200, { exempt: false } | Over limit |
| 57 | Includes gardenSize param | Passes to checkPlanningExemption | Optional param |
| 58 | Missing type defaults to empty string | Returns "Unknown" result | Default handling |

### 3.9 BER Impact (`GET /api/houses/[id]/ber-impact`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 59 | Returns impact for house with BER and sqm | 200, full impact object | Happy path |
| 60 | Returns null if no BER | 200, null | Missing BER |
| 61 | Returns null if no squareMetres | 200, null | Missing sqm |
| 62 | Passes askingPrice to calculator | trueCostWithout includes price | Price integration |

### 3.10 Profile (`GET/PUT /api/profile`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 63 | GET returns profile | 200, profile object | Happy path |
| 64 | GET returns null if no profile | 200, null | First-time user |
| 65 | PUT creates profile if none exists | create called | First save |
| 66 | PUT updates existing profile | update called | Subsequent saves |

### 3.11 Schemes Eligibility (`GET /api/schemes/eligibility`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 67 | Returns eligibility for FTB profile | 200, { htb, fhs, lahl } | Happy path |
| 68 | Returns 400 if no profile | 400, error message | Missing profile |
| 69 | Uses hardcoded €400k sample price | HTB calculated with 400000 | Known limitation |

### 3.12 Auth Login (`POST /api/auth/login`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 70 | Successful login sets cookie | 200, Set-Cookie header with ht_user | Happy path |
| 71 | Missing name returns 400 | 400 | Validation |
| 72 | Invalid credentials return 401 | 401 | Auth failure |
| 73 | Cookie is httpOnly and sameSite=lax | Cookie attributes correct | Security |

### 3.13 Import (`POST /api/houses/import`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 74 | Missing URL returns 400 | 400, "URL required" | Validation |
| 75 | Successful import creates house | 201, house object | Happy path (mock scraper) |
| 76 | Creates media records for images | media.createMany called | Image handling |
| 77 | Creates apartment details for apartment type | apartmentDetails.create called | Auto-stub |
| 78 | Creates defective blocks assessment | defectiveBlocksAssessment.create called | Auto-flag |
| 79 | Logs activity | activityLog.create called | Audit trail |
| 80 | Scraper failure returns 500 | 500, error message | Error handling |

### 3.14 Bidding Strategy (`GET/PUT /api/houses/[id]/bidding-strategy`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 81 | GET returns strategy | 200, strategy object | Happy path |
| 82 | GET returns null if none | 200, null | No strategy set |
| 83 | PUT creates via upsert | upsert called with hardCeiling | Create |
| 84 | PUT updates existing | upsert called | Update |

### 3.15 Seller Intel (`GET/PUT /api/houses/[id]/seller-intel`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 85 | GET returns intel | 200, intel object | Happy path |
| 86 | GET returns null | 200, null | No intel |
| 87 | PUT upserts intel | upsert called | Create/update |

### 3.16 Survey Findings (`GET/POST /api/houses/[id]/survey-findings`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 88 | GET returns findings | 200, array | Happy path |
| 89 | POST creates finding | 201, finding object | Creation |
| 90 | POST includes houseId | data.houseId === id | Correct association |

### 3.17 Survey Finding Detail (`PUT/DELETE /api/houses/[id]/survey-findings/[findingId]`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 91 | PUT updates finding | 200 | Edit |
| 92 | DELETE removes finding | 200 | Deletion |

### 3.18 Fall-Through (`GET/POST /api/houses/[id]/fall-through`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 93 | GET returns fall-through records | 200, array | History |
| 94 | POST creates record and sets status to dropped | 201, house.update with status=dropped | Dual action |
| 95 | POST creates "review what went wrong" action item | actionItem.create called | Auto-action |

### 3.19 Snags (`GET/POST /api/houses/[id]/snags`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 96 | GET returns snags ordered by room | 200, array | Happy path |
| 97 | POST creates individual snag | 201, snag object | Manual add |
| 98 | POST with seedDefaults creates all default snags | createMany called with DEFAULT_SNAG_ITEMS | Bulk seed |
| 99 | POST seedDefaults skips if snags exist | createMany NOT called | Idempotency |

### 3.20 Snag Detail (`PUT /api/houses/[id]/snags/[snagId]`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 100 | PUT updates snag status | 200 | Status change |

### 3.21 New Build Compliance (`GET/PUT /api/houses/[id]/new-build-compliance`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 101 | GET returns compliance | 200, compliance object | Happy path |
| 102 | GET returns null | 200, null | No compliance record |
| 103 | PUT upserts compliance | upsert called | Create/update |

### 3.22 Communications (`GET/POST /api/comms`, `PUT /api/comms/[commId]`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 104 | GET returns all comms | 200, array | Happy path |
| 105 | GET filters by houseId | where.houseId set | Filter |
| 106 | GET filters by professional | where.professional set | Filter |
| 107 | POST creates comm log | 201, comm object | Creation |
| 108 | PUT updates comm (mark responded) | 200, updated comm | Response tracking |

### 3.23 Contract Readiness (`GET/PUT /api/contract-readiness`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 109 | GET returns computed readiness items | 200, { items, readyPct } | Aggregation |
| 110 | GET auto-detects mortgage AIP status | item "Mortgage AIP valid" has correct status | Auto-detection |
| 111 | GET auto-detects solicitor appointed | item "Solicitor appointed" has correct status | Auto-detection |
| 112 | GET auto-detects proof of funds | item "Proof of funds" based on savings | Auto-detection |
| 113 | GET includes manual checkboxes | idVerified, amlDocsSubmitted from ContractReadiness | Manual items |
| 114 | GET calculates readyPct correctly | readyPct = (ready/total) * 100 | Percentage |
| 115 | PUT creates ContractReadiness if none exists | create called | First save |
| 116 | PUT updates existing | update called | Subsequent saves |

### 3.24 Journal (`GET/POST /api/journal`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 117 | GET returns entries with house address | 200, includes house.address | Join |
| 118 | GET filters by houseId | where.houseId set | Filter |
| 119 | POST creates journal entry | 201, entry object | Creation |

### 3.25 Neighbourhood (`GET/POST /api/houses/[id]/neighbourhood`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 120 | GET returns amenities and commute | 200, { amenities, commute } | Happy path |
| 121 | POST triggers refresh | refreshNeighbourhood called | Refresh flow |
| 122 | POST returns 500 on failure | 500, error message | Error handling |

### 3.26 Amenity Preferences (`GET/POST /api/amenity-preferences`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 123 | GET returns all amenities | 200, array | Happy path |
| 124 | POST creates custom amenity | 201, isCustom: true | Custom amenity |

### 3.27 Seed Amenities (`POST /api/seed-amenities`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 125 | POST seeds defaults | 201, count: 20 | First seed |
| 126 | POST skips if already seeded | 200, "Already seeded" | Idempotency |

### 3.28 Apartment Details (`GET/PUT /api/houses/[id]/apartment`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 127 | GET returns apartment details | 200, details object | Happy path |
| 128 | PUT upserts with OMC checklist | upsert, omcChecklist has 14 items | Auto-checklist |

### 3.29 Defective Blocks (`GET/PUT /api/houses/[id]/defective-blocks`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 129 | GET returns assessment | 200, assessment object | Happy path |
| 130 | PUT upserts assessment | upsert called | Create/update |

### 3.30 Comparables (`GET/POST /api/houses/[id]/comparables`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 131 | GET returns PPR comparable | 200, comparable object | Happy path |
| 132 | POST triggers refresh | refreshComparables called | Refresh |
| 133 | POST returns 500 on failure | 500, error message | Error handling |


---

## 4. Component & Page Tests

### Mock Pattern for Pages

All page tests mock `global.fetch` to intercept API calls. Each page test:
1. Mocks `next/link` as a plain `<a>` tag
2. Sets up `global.fetch` with URL-based routing to return mock data
3. Renders the page component
4. Uses `waitFor` for async data loading
5. Asserts on rendered text, elements, and interactions

```typescript
// Standard fetch mock pattern:
global.fetch = jest.fn((url: string | URL | Request) => {
  const urlStr = typeof url === "string" ? url : url instanceof URL ? url.toString() : url.url;
  if (urlStr.includes("/api/houses")) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockData) } as Response);
  return Promise.resolve({ ok: true, json: () => Promise.resolve([]) } as Response);
}) as jest.Mock;
```

### 4.1 Dashboard (`src/app/page.tsx`) — EXISTING, extend

| # | Test | Expected | Status |
|---|------|----------|--------|
| 134 | Renders stat cards | "Total Houses", count visible | ✅ Exists |
| 135 | Shows bidding count | "Bidding" label with count | ✅ Exists |
| 136 | Shows overdue actions | Overdue action titles visible | ✅ Exists |
| 137 | Shows upcoming viewings | "Upcoming Viewings" section | ✅ Exists |
| 138 | Renders kanban columns | Status columns visible | ✅ Exists |
| 139 | Shows loading state before data loads | Loading indicator or skeleton | NEW |
| 140 | Handles API error gracefully | Error message or fallback UI | NEW |
| 141 | Empty state — no houses | "No houses" or empty kanban | NEW |
| 142 | Quick import form visible | Import URL input present | NEW |
| 143 | Activity feed section renders | "Recent Activity" section | NEW |

### 4.2 Houses List (`src/app/houses/page.tsx`) — EXISTING, extend

| # | Test | Expected | Status |
|---|------|----------|--------|
| 144 | Renders house cards | Address, price visible | ✅ Exists |
| 145 | Shows house metadata | Beds, BER, neighbourhood | ✅ Exists |
| 146 | Empty state | "No houses yet" message | ✅ Exists |
| 147 | Status badge shows correct status | "viewing scheduled" text | NEW |
| 148 | Current bid displayed when present | "Bid: €X" visible | NEW |
| 149 | Links to house detail page | href="/houses/[id]" | NEW |
| 150 | Filter by status works | Filtered list after selection | NEW |

### 4.3 House Detail (`src/app/houses/[id]/page.tsx`) — NEW

This is the largest page (30KB, 8+ tabs). Needs extensive testing.

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 151 | Renders house address and price | Address in heading, price visible | Basic render |
| 152 | Shows status badge | Current status displayed | Status display |
| 153 | Tab navigation — Details tab default | Details content visible | Default tab |
| 154 | Tab navigation — Bids tab | Bid history visible when clicked | Tab switch |
| 155 | Tab navigation — Checklist tab | Checklist items visible | Tab switch |
| 156 | Tab navigation — Estimates tab | Estimates visible | Tab switch |
| 157 | Tab navigation — Media tab | Photo gallery visible | Tab switch |
| 158 | Tab navigation — Costs tab | Cost breakdown visible | Tab switch |
| 159 | Tab navigation — Legal tab (after sale_agreed) | Conveyancing milestones visible | Conditional tab |
| 160 | Tab navigation — Snagging tab (new build + sale_agreed) | Snag items visible | Conditional tab |
| 161 | Tab navigation — Apartment tab (apartment type) | OMC details visible | Conditional tab |
| 162 | Tab navigation — Seller tab (bidding+) | Seller intel form visible | Conditional tab |
| 163 | Tab navigation — Journal tab | Journal entries visible | Always visible |
| 164 | Tab navigation — Neighbourhood tab | Amenities and commute visible | Always visible |
| 165 | Status change dropdown works | Status update triggers API call | Interaction |
| 166 | Edit form saves changes | PUT called with updated data | Form submission |
| 167 | Pros/cons display correctly | Parsed from JSON string | JSON handling |
| 168 | BER impact panel shows when BER set | Heating cost, retrofit cost visible | Conditional display |
| 169 | 404 handling for invalid house ID | Error message or redirect | Error state |
| 170 | Loading state while fetching | Loading indicator | Async state |

### 4.4 Actions Page (`src/app/actions/page.tsx`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 171 | Renders action items list | Action titles visible | Basic render |
| 172 | Shows overdue items highlighted | Overdue items have red styling | Visual indicator |
| 173 | Filter by status works | Filtered list | Interaction |
| 174 | Filter by category works | Filtered list | Interaction |
| 175 | Create new action form | Form visible, submission works | CRUD |
| 176 | Mark action as done | Status changes to "done" | Interaction |
| 177 | Delete action | Item removed from list | CRUD |
| 178 | Empty state | "No actions" message | Edge case |
| 179 | Shows house association | House address linked | Relation display |

### 4.5 Mortgage Page (`src/app/mortgage/page.tsx`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 180 | Renders lender cards | Lender names visible | Basic render |
| 181 | Shows interest rate and monthly payment | Rate and payment displayed | Key data |
| 182 | Shows AIP expiry countdown | "Expires in X days" | Countdown |
| 183 | Document progress bar | "X/16 documents" | Progress tracking |
| 184 | Add new lender form | Form visible, submission works | CRUD |
| 185 | Edit lender details | PUT called | Interaction |
| 186 | Empty state — no lenders | "Add your first lender" | Edge case |
| 187 | Status badges per lender | Status displayed correctly | Visual |

### 4.6 Schemes Page (`src/app/schemes/page.tsx`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 188 | Renders HTB eligibility | "Help to Buy" section visible | Basic render |
| 189 | Renders FHS eligibility | "First Home Scheme" section | Basic render |
| 190 | Renders LAHL eligibility | "Local Authority Home Loan" section | Basic render |
| 191 | Shows SEAI grants table | 9 grant items listed | Constants display |
| 192 | Eligible schemes show green indicator | Eligible styling | Visual |
| 193 | Ineligible schemes show reason | Reason text visible | Feedback |
| 194 | Shows estimated amounts | "Up to €X" visible | Key data |
| 195 | Handles no profile gracefully | "Set up profile" prompt | Error state |

### 4.7 Profile Page (`src/app/profile/page.tsx`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 196 | Renders profile form | Name, income, savings fields | Basic render |
| 197 | Pre-fills existing profile data | Fields populated | Data loading |
| 198 | Save button submits form | PUT called with form data | Submission |
| 199 | Shows borrowing limits after save | "Max budget: €X" | Computed display |
| 200 | FTB toggle changes multiplier display | 4x vs 3.5x shown | Dynamic calc |
| 201 | Empty state — first time | Empty form | New user |

### 4.8 Login Page (`src/app/login/page.tsx`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 202 | Renders login form | Name and password fields | Basic render |
| 203 | Submit calls auth API | POST /api/auth/login called | Submission |
| 204 | Successful login redirects | Navigation to dashboard | Success flow |
| 205 | Failed login shows error | Error message visible | Error handling |

### 4.9 Journal Page (`src/app/journal/page.tsx`) — NEW

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 206 | Renders journal entries | Entry content visible | Basic render |
| 207 | Shows gut ratings | Star ratings displayed | Rating display |
| 208 | Shows house association | House address linked | Relation |
| 209 | Create new entry form | Form visible, submission works | CRUD |
| 210 | Empty state | "No journal entries" | Edge case |
| 211 | Entries ordered by date desc | Most recent first | Ordering |

### 4.10 Extracted Components (`src/components/house-detail/`)

#### NeighbourhoodTab

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 212 | Renders commute estimates | Workplace labels and times visible | Basic render |
| 213 | Renders nearby amenities | Amenity names and distances | Basic render |
| 214 | Refresh button triggers API call | POST /neighbourhood/refresh called | Interaction |
| 215 | Shows "last updated" timestamp | Date visible | Freshness indicator |
| 216 | Empty state — no data yet | "Refresh to load" prompt | First load |

#### SurveyTab

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 217 | Renders survey findings | Finding descriptions visible | Basic render |
| 218 | Category badges (cosmetic/structural/deal_breaker) | Correct styling per category | Visual |
| 219 | Cost range displayed | "€X - €Y" format | Data display |
| 220 | Add finding form | Form visible, submission works | CRUD |
| 221 | Action selector (accept/renegotiate/walk_away) | Dropdown works | Interaction |
| 222 | Summary stats | Count by category, total cost range | Aggregation |

#### SnaggingTab

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 223 | Renders snag items grouped by room | Room headings visible | Grouping |
| 224 | Status badges per snag | identified/reported/fixed/accepted | Visual |
| 225 | Update snag status | PUT called | Interaction |
| 226 | Priority indicators | low/medium/high styling | Visual |

#### SellerTab

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 227 | Renders seller intel form | All fields visible | Basic render |
| 228 | Pre-fills existing data | Fields populated | Data loading |
| 229 | Save updates intel | PUT called | Submission |
| 230 | Shows pre-bid questionnaire prompts | Question list visible | Guidance |

#### JournalTab

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 231 | Renders journal entries for house | Entries visible | Basic render |
| 232 | Gut rating input (1-5) | Star selector works | Interaction |
| 233 | Add new entry | POST called | CRUD |

#### ComplianceTab

| # | Test | Expected | Rationale |
|---|------|----------|-----------|
| 234 | Renders compliance checklist | Warranty, BCAR fields visible | Basic render |
| 235 | Toggle checkboxes | PUT called with updated booleans | Interaction |
| 236 | Warranty provider selector | Dropdown with options | Interaction |


---

## 5. Integration Tests

Integration tests verify multi-step flows that span multiple API routes and business logic modules. These use the expanded Prisma mock with chained mock return values to simulate realistic data flow.

### 5.1 House Lifecycle (`__tests__/integration/house-lifecycle.test.ts`)

Tests the complete journey of a house from creation to closing.

| # | Test | Steps | Assertions | Rationale |
|---|------|-------|------------|-----------|
| 237 | Wishlist → Viewing → Bidding → Sale Agreed → Closed | 1. POST /api/houses (create) 2. PUT status=viewing_scheduled 3. PUT status=viewed 4. PUT status=bidding 5. PUT status=sale_agreed 6. PUT status=closed | After step 5: conveyancing created with 18 milestones, total cost created, 4 action items created. After step 6: post-completion checklist created, congratulations journal entry | Full happy path |
| 238 | Sale agreed → Dropped (fall-through) | 1. Create house 2. PUT status=sale_agreed 3. PUT status=dropped | Fall-through journal entry created, conveyancing data preserved | Recovery path |
| 239 | New build lifecycle | 1. Create house with isNewBuild=true 2. PUT status=sale_agreed | Snag items created (8 rooms), NewBuildCompliance created, plus standard sale_agreed items | New build path |
| 240 | Import → Sale Agreed | 1. POST /api/houses/import 2. PUT status=sale_agreed | House created from scrape, apartment details if apartment, defective blocks stub, then full sale_agreed cascade | Import flow |
| 241 | Multiple houses in pipeline | 1. Create 3 houses 2. Set all to bidding 3. Set one to sale_agreed | All 3 coexist, only sale_agreed house gets conveyancing | Parallel pipeline |

### 5.2 Mortgage Flow (`__tests__/integration/mortgage-flow.test.ts`)

| # | Test | Steps | Assertions | Rationale |
|---|------|-------|------------|-----------|
| 242 | Full mortgage application | 1. POST /api/mortgage (create lender) 2. PUT status=submitted 3. PUT status=approval_in_principle 4. PUT status=full_approval | Status transitions work, documents trackable at each stage | Mortgage lifecycle |
| 243 | Multi-lender comparison | 1. Create 3 mortgage trackers 2. GET /api/mortgage | All 3 returned with documents | Comparison feature |
| 244 | Borrowing limits match profile | 1. PUT /api/profile (set incomes) 2. GET /api/calculator/borrowing | Limits match calculateBorrowingLimits output | Profile → calculator flow |
| 245 | AIP expiry affects contract readiness | 1. Create mortgage with future expiry 2. GET /api/contract-readiness | "Mortgage AIP valid" shows true with expiry detail | Cross-module integration |
| 246 | Expired AIP detected | 1. Create mortgage with past expiry 2. GET /api/contract-readiness | "Mortgage AIP valid" shows false | Expiry detection |

### 5.3 Scheme Eligibility (`__tests__/integration/scheme-eligibility.test.ts`)

| # | Test | Steps | Assertions | Rationale |
|---|------|-------|------------|-----------|
| 247 | FTB eligible for all schemes | 1. Create profile (FTB, income under limits) 2. GET /api/schemes/eligibility | HTB eligible, FHS eligible, LAHL eligible | Full eligibility |
| 248 | Non-FTB ineligible for all | 1. Create profile (not FTB) 2. GET /api/schemes/eligibility | All three ineligible with correct reasons | FTB gate |
| 249 | High income blocks LAHL | 1. Create profile (FTB, €100k combined) 2. GET /api/schemes/eligibility | HTB/FHS eligible, LAHL ineligible | Income gate |
| 250 | BER impact + scheme integration | 1. Create house with BER D1, 100sqm 2. GET /api/houses/[id]/ber-impact | Shows SEAI grants available: €25,000 | Cross-module |

### 5.4 Neighbourhood Flow (`__tests__/integration/neighbourhood-flow.test.ts`)

| # | Test | Steps | Assertions | Rationale |
|---|------|-------|------------|-----------|
| 251 | Seed → Preferences → Refresh | 1. POST /api/seed-amenities 2. GET /api/amenity-preferences 3. POST /api/houses/[id]/neighbourhood/refresh | 20 amenities seeded, preferences returned, neighbourhood data cached | Full flow |
| 252 | Custom amenity added and used | 1. POST /api/amenity-preferences (custom) 2. POST /api/houses/[id]/neighbourhood/refresh | Custom amenity included in refresh | Custom amenity flow |
| 253 | Provider fallback | 1. Set GEO_PROVIDER=google without key 2. getGeoProvider() | Returns OsmProvider | Fallback behavior |

### 5.5 Conveyancing Flow (`__tests__/integration/conveyancing-flow.test.ts`)

| # | Test | Steps | Assertions | Rationale |
|---|------|-------|------------|-----------|
| 254 | Full conveyancing progression | 1. Create conveyancing 2. Update milestones 1-18 sequentially | Each milestone transitions pending→in_progress→completed | Milestone progression |
| 255 | Solicitor details + comms tracking | 1. PUT conveyancing (solicitor details) 2. POST /api/comms (log call to solicitor) 3. GET /api/contract-readiness | Solicitor appointed shows true, comm log exists | Cross-module |
| 256 | Blocked milestone with reason | 1. PUT milestone status=blocked, blockerReason="Title issue" | Milestone shows blocked status | Blocker tracking |

---

## 6. Accessibility Tests

### Setup

All accessibility tests use `jest-axe` with the `toHaveNoViolations` matcher. Each test renders the page component and runs axe-core against the rendered DOM.

```typescript
import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);

it("has no accessibility violations", async () => {
  const { container } = render(<Page />);
  // Wait for async data to load
  await waitFor(() => { /* assert data loaded */ });
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### WCAG 2.1 AA Requirements to Verify

- **1.1.1 Non-text Content** — All images have alt text
- **1.3.1 Info and Relationships** — Headings, lists, tables use semantic HTML
- **1.4.3 Contrast** — Text meets 4.5:1 ratio (Tailwind colors should comply)
- **2.1.1 Keyboard** — All interactive elements keyboard-accessible
- **2.4.1 Bypass Blocks** — Skip navigation link
- **2.4.2 Page Titled** — Each page has a descriptive title
- **3.1.1 Language** — `lang` attribute on `<html>`
- **3.3.1 Error Identification** — Form errors identified
- **3.3.2 Labels** — All form inputs have labels
- **4.1.1 Parsing** — Valid HTML
- **4.1.2 Name, Role, Value** — Custom components have ARIA attributes

### 6.1 Page-Level Accessibility Tests

| # | Page | Test File | Key Checks |
|---|------|-----------|------------|
| 257 | Dashboard | `dashboard.a11y.test.tsx` | No violations, stat cards have aria-labels, kanban columns have headings, links are descriptive |
| 258 | Houses List | `houses-list.a11y.test.tsx` | No violations, house cards are in a list, status badges have aria-labels, filter controls labeled |
| 259 | House Detail | `house-detail.a11y.test.tsx` | No violations, tab panel has role="tablist", active tab has aria-selected, form inputs labeled |
| 260 | Actions | `actions.a11y.test.tsx` | No violations, action items in list, status toggles labeled, overdue items have aria-live |
| 261 | Mortgage | `mortgage.a11y.test.tsx` | No violations, lender cards have headings, progress bars have aria-valuenow, forms labeled |
| 262 | Schemes | `schemes.a11y.test.tsx` | No violations, scheme cards have headings, eligibility status announced, SEAI table has headers |
| 263 | Profile | `profile.a11y.test.tsx` | No violations, all form inputs have labels, required fields marked, error messages associated |
| 264 | Login | `login.a11y.test.tsx` | No violations, form inputs labeled, submit button descriptive, error messages in aria-live region |
| 265 | Journal | `journal.a11y.test.tsx` | No violations, entries in list, gut rating has aria-label, timestamps readable |

### 6.2 Component-Level Accessibility Tests

| # | Component | Key Checks |
|---|-----------|------------|
| 266 | NeighbourhoodTab | Tables have headers, distances have units, refresh button labeled |
| 267 | SurveyTab | Finding list accessible, category badges have text alternatives, cost ranges readable |
| 268 | SnaggingTab | Room groups have headings, status selectors labeled, priority indicators have text |
| 269 | SellerTab | Form inputs labeled, boolean toggles accessible, questionnaire items in list |
| 270 | JournalTab | Rating input accessible (aria-label per star), entries in ordered list |
| 271 | ComplianceTab | Checkboxes labeled, warranty selector accessible, date inputs labeled |

### 6.3 Specific WCAG Checks

| # | Check | Test | Expected |
|---|-------|------|----------|
| 272 | Color contrast — emerald on white | Check stat card text | Ratio ≥ 4.5:1 |
| 273 | Color contrast — red on white (overdue) | Check overdue action text | Ratio ≥ 4.5:1 |
| 274 | Color contrast — orange on white (warning) | Check warning text | Ratio ≥ 4.5:1 |
| 275 | Focus visible on all interactive elements | Tab through page | Focus ring visible |
| 276 | Form error messages associated with inputs | Submit invalid form | aria-describedby links error to input |
| 277 | Status changes announced | Change house status | aria-live region updates |
| 278 | Images have alt text | Check all img elements | alt attribute present and descriptive |
| 279 | Tables have caption or aria-label | Check data tables | Accessible name present |
| 280 | Heading hierarchy | Check h1-h6 order | No skipped levels |

---

## 7. Test Matrix

### 7.1 Summary by Category

| Category | Test Count | New | Existing |
|----------|-----------|-----|----------|
| Unit Tests — Business Logic | 80 | 80 | 0 |
| API Route Tests | 133 | 119 | 14 |
| Component & Page Tests | 103 | 89 | 14 |
| Integration Tests | 20 | 20 | 0 |
| Accessibility Tests | 24 | 24 | 0 |
| **TOTAL** | **360** | **332** | **28** |

### 7.2 Coverage by Module

| Module | Spec | Unit | API | Component | Integration | A11y | Total |
|--------|------|------|-----|-----------|-------------|------|-------|
| 01 Houses & Listings | ✅ | — | 18 | 20 | 5 | 2 | 45 |
| 02 Bids & Offr.io | ✅ | — | 2 | (in house detail) | 1 | — | 3 |
| 03 Viewing Checklists | ✅ | — | 6 | (in house detail) | — | — | 6 |
| 04 Media & Photos | ✅ | — | — | (in house detail) | — | — | 0 |
| 05 Action Items | ✅ | — | 6 | 9 | — | 1 | 16 |
| 06 Mortgage Tracker | ✅ | — | 4 | 8 | 5 | 1 | 18 |
| 07 Renovation Estimates | ✅ | — | 2 | (in house detail) | — | — | 2 |
| 08 Government Schemes | ✅ | 14 | 3 | 8 | 4 | 1 | 30 |
| 09 Stamp Duty & Costs | ✅ | 12 | 10 | (in house detail) | — | — | 22 |
| 10 Conveyancing | ✅ | — | 7 | (in house detail) | 3 | — | 10 |
| 11 Apartment / OMC | ✅ | — | 2 | (in house detail) | — | — | 2 |
| 12 Defective Blocks | ✅ | — | 2 | (in house detail) | — | — | 2 |
| 13 Buyer Profile | ✅ | 8 | 8 | 6 | — | 1 | 23 |
| 14 PPR Comparables | ✅ | — | 3 | — | — | — | 3 |
| 15 Dashboard | ✅ | — | — | 10 | — | 1 | 11 |
| 16 Auth & Infrastructure | ✅ | 9 | 4 | 4 | — | 1 | 18 |
| 17 Bidding Strategy | 📋 | — | 4 | (in house detail) | — | — | 4 |
| 18 Comms Tracker | 📋 | — | 5 | — | 1 | — | 6 |
| 19 Survey Report | 📋 | — | 5 | 6 | — | 1 | 12 |
| 20 Fall-Through | 📋 | — | 3 | — | 2 | — | 5 |
| 21 Contract Readiness | 📋 | — | 8 | — | 1 | — | 9 |
| 22 Snagging | 📋 | — | 5 | 4 | — | 1 | 10 |
| 23 BER Cost Impact | 📋 | 13 | 4 | (in house detail) | 1 | — | 18 |
| 24 Post-Completion | 📋 | — | (in house trigger) | — | 1 | — | 1 |
| 25 Drawdown | 📋 | — | — | — | — | — | 0 |
| 26 Seller Intel | 📋 | — | 3 | 4 | — | 1 | 8 |
| 27 HomeBond & BCAR | 📋 | — | 3 | 3 | — | 1 | 7 |
| 28 Agent Transparency | 📋 | — | — | — | — | — | 0 |
| 29 Planning Permission | 📋 | 12 | 4 | — | — | — | 16 |
| 30 Emotional / Journal | 📋 | — | 3 | 9 | — | 2 | 14 |
| 31 Neighbourhood | 📋 | 21 | 5 | 5 | 3 | 1 | 35 |
| **Cross-cutting** | — | — | 15 | — | — | 8 | 23 |

### 7.3 Priority Order for Implementation

**Phase 1 — Highest Value (do first, ~80 tests)**
1. Unit tests for all 5 business logic modules (stamp-duty, central-bank, schemes, ber-calculator, planning) — 80 tests
   - These are pure functions, easiest to write, highest confidence gain
   - Will immediately catch the `isNewBuild` stamp duty bug

**Phase 2 — Critical Path Coverage (~50 tests)**
2. Sale-agreed trigger tests (houses-id-triggers.test.ts) — 15 tests
3. Conveyancing route tests — 7 tests
4. Total cost route tests — 6 tests
5. Contract readiness route tests — 8 tests
6. Fall-through route tests — 3 tests
7. Profile + borrowing calculator tests — 8 tests
8. Auth tests — 4 tests

**Phase 3 — Breadth Coverage (~70 tests)**
9. All remaining API route tests — 70 tests
   - Each route gets happy path + key error cases

**Phase 4 — UI Coverage (~100 tests)**
10. Page tests for all 9 pages — 80 tests
11. Component tests for 6 extracted components — 20 tests

**Phase 5 — Quality & Compliance (~60 tests)**
12. Integration tests — 20 tests
13. Accessibility tests — 24 tests
14. Geo provider tests — 21 tests

---

## Appendix A: Known Bugs to Verify with Tests

| Bug | Location | Test # | Expected Behavior |
|-----|----------|--------|-------------------|
| `isNewBuild` always false in sale-agreed stamp duty | `PUT /api/houses/[id]` | #26 | Should use `house.isNewBuild` |
| Schemes eligibility uses hardcoded €400k | `GET /api/schemes/eligibility` | #69 | Should accept price parameter |
| Duplicate conveyancing creation logic | PUT houses/[id] + POST conveyancing | #37 vs #19 | Both paths should produce identical results |
| Fall-through dual path inconsistency | POST fall-through vs PUT status=dropped | #94 vs #30 | Journal entry should be created regardless of path |

## Appendix B: Test Data Fixtures

### Standard House Fixture
```typescript
const mockHouse = {
  id: "h1", address: "42 Phibsborough Road", eircode: "D07 X8Y9",
  neighbourhood: "Phibsborough", askingPrice: 425000, currentBid: 440000,
  status: "bidding", bedrooms: 3, bathrooms: 2, propertyType: "terraced",
  ber: "C2", isNewBuild: false, squareMetres: 95, notes: "Nice garden",
  pros: JSON.stringify(["South-facing garden", "Close to LUAS"]),
  cons: JSON.stringify(["Needs new kitchen"]),
  viewingDate: new Date("2026-03-15T10:00:00Z"), addedBy: "Sarah",
  createdAt: new Date(), updatedAt: new Date(),
};
```

### Standard Profile Fixture
```typescript
const mockProfile = {
  id: "p1", name1: "Sarah", name2: "John",
  isFirstTimeBuyer: true, grossIncome1: 65000, grossIncome2: 55000,
  existingMonthlyDebt: 0, totalSavings: 55000,
  taxPaid4Years1: 40000, taxPaid4Years2: 35000,
  workplaceAddress: "Grand Canal Dock, Dublin 2",
};
```

### Standard Mortgage Fixture
```typescript
const mockMortgage = {
  id: "m1", lender: "AIB", approvalAmount: 430000,
  approvalExpiry: new Date(Date.now() + 86400000 * 43), // 43 days
  interestRate: 3.95, fixedPeriod: 5, term: 30,
  monthlyRepayment: 2040, status: "approval_in_principle",
  documents: [], exemptions: [],
};
```

### New Build House Fixture
```typescript
const mockNewBuild = {
  ...mockHouse, id: "h2", address: "Unit 5, New Development, Clondalkin",
  isNewBuild: true, ber: "A2", squareMetres: 110, askingPrice: 395000,
  propertyType: "apartment",
};
```
