# HomeTracker — SOLID Principles & Database Normalization Review

**Reviewer:** Senior SDE
**Date:** 2026-03-11
**Scope:** All 25 lib modules, 57 API routes, 31 Prisma models

---

## SOLID Assessment Summary

| Principle | Score | Key Issue |
|-----------|-------|-----------|
| **S** — Single Responsibility | 7/10 | `schemes.ts` is a junk drawer; `fall-through/route.ts` duplicates trigger logic |
| **O** — Open/Closed | 8/10 | Geo provider abstraction is excellent; status triggers are not extensible |
| **L** — Liskov Substitution | 9/10 | GeoProvider interface is clean; both implementations are interchangeable |
| **I** — Interface Segregation | 8/10 | GeoProvider is well-scoped; House model is a god object |
| **D** — Dependency Inversion | 6/10 | Everything imports `prisma` directly; no DI for testability |

---

## S — Single Responsibility Principle

### Violations

**S1: `schemes.ts` has 4 unrelated responsibilities**

This file contains:
1. `calculateHTB()` — Help to Buy eligibility
2. `calculateFHS()` — First Home Scheme eligibility
3. `calculateLAHL()` — Local Authority Home Loan eligibility
4. `CONVEYANCING_MILESTONES` — 18-item array for conveyancing tracker
5. `OMC_CHECKLIST` — 14-item array for apartment module
6. `SEAI_GRANTS` — 9-item array for energy grants

Three calculation functions + three unrelated constant arrays. The conveyancing milestones have nothing to do with government schemes. The OMC checklist is an apartment concern. SEAI grants are energy-related.

**Recommendation:** Split into:
- `lib/schemes.ts` — `calculateHTB`, `calculateFHS`, `calculateLAHL` (scheme eligibility only)
- `lib/constants/conveyancing.ts` — `CONVEYANCING_MILESTONES`
- `lib/constants/omc.ts` — `OMC_CHECKLIST`
- `lib/constants/seai.ts` — `SEAI_GRANTS`

Or at minimum, a single `lib/constants.ts` for all static arrays, keeping `schemes.ts` for calculation logic only.

**S2: `POST /api/houses/[id]/fall-through` duplicates status-trigger logic**

The fall-through route does:
```typescript
await prisma.fallThroughRecord.create({ data: { houseId: id, ...body } });
await prisma.house.update({ where: { id }, data: { status: "dropped" } });
await prisma.actionItem.create({ data: { houseId: id, title: "Review what went wrong", ... } });
await prisma.journalEntry.create({ data: { houseId: id, type: "milestone", content: "💔 Sale fell through..." } });
```

Meanwhile, `handleDropped()` in `status-triggers.ts` also creates a journal entry when status changes to dropped. If a client calls the fall-through endpoint, the house gets set to dropped, but the PUT handler's `handleDropped()` won't fire because the status change happens via a different code path.

This means:
- Fall-through endpoint: creates FallThroughRecord + sets dropped + creates action item + creates journal entry
- PUT with status=dropped: calls `handleDropped()` which creates journal entry (but only if current status is sale_agreed+)

Two code paths, two different sets of side effects for the same conceptual operation.

**Recommendation:** The fall-through route should create the FallThroughRecord and then delegate to `handleDropped()` for the status change and journal entry, rather than reimplementing the side effects inline.

**S3: `POST /api/houses/import` has too many responsibilities**

This route handler:
1. Validates input
2. Calls the scraper
3. Creates the house record
4. Creates media records (photos + floorplans)
5. Logs activity
6. Conditionally creates apartment details
7. Creates defective blocks assessment

Seven distinct operations in one function. If any step fails partway through, you get partial data (house created but no media, or media but no defective blocks stub).

**Recommendation:** Extract a `handleImport(listing, user)` function in `lib/import-handler.ts` that wraps steps 3-7 in a Prisma transaction (`prisma.$transaction`). The route handler should only do validation + scraper call + delegate.

**S4: `scraper.ts` mixes scraping, parsing, and file I/O**

This file:
1. Extracts listing IDs from URLs
2. Calls the Daft API
3. Falls back to HTML scraping
4. Parses HTML with Cheerio
5. Infers property types from text
6. Infers neighbourhoods from address strings
7. Downloads images to the filesystem

The neighbourhood inference (`inferNeighbourhood`) is a general-purpose utility that could be reused elsewhere (e.g., when a user manually creates a house). The image download logic is file I/O that should be separate from parsing.

**Recommendation:** Extract:
- `lib/neighbourhood-detector.ts` — `inferNeighbourhood(address)` (reusable)
- `lib/media-downloader.ts` — `downloadImages(urls)` (reusable for any media download)

### What's Good

- **`status-triggers.ts`** — Clean SRP. Three functions, each handling one status transition. Idempotent. Well-named.
- **`stamp-duty.ts`**, **`central-bank.ts`**, **`ber-calculator.ts`**, **`planning.ts`** — Each is a single pure function with one job. Textbook SRP.
- **`geo/types.ts`**, **`geo/osm.ts`**, **`geo/google.ts`**, **`geo/index.ts`** — Clean separation: types, implementations, factory.
- **`neighbourhood.ts`** — Two functions with clear responsibilities: `refreshNeighbourhood` (orchestration) and `getTransitAccessibility` (query).
- **Most API routes** — Thin handlers that delegate to lib modules. The house detail PUT is a good example: validates, delegates to triggers, updates.

---

## O — Open/Closed Principle

### Violations

**O1: Status triggers require modifying `status-triggers.ts` to add new transitions**

If you want to add a trigger for `status → bidding` (which Design 04 specifies but isn't implemented), you'd need to:
1. Add a `handleBidding()` function to `status-triggers.ts`
2. Add an `if (body.status === "bidding")` check to the PUT route handler

This is modification, not extension. A more OCP-compliant approach would be a registry pattern:

```typescript
const triggers: Record<string, (houseId: string) => Promise<void>> = {
  sale_agreed: handleSaleAgreed,
  closed: handleClosed,
  dropped: handleDropped,
};
// In route: if (body.status in triggers) await triggers[body.status](id);
```

This is a minor point for an app this size, but worth noting.

**O2: `inferPropertyType` and `inferNeighbourhood` in scraper.ts are closed to extension**

Both use hardcoded lists. Adding a new property type or neighbourhood requires modifying the function. For neighbourhoods, this could be a database table or config file instead.

### What's Good

- **GeoProvider interface** — Adding a new provider (e.g., Mapbox) requires only implementing the interface and adding a case to the factory. No existing code changes. This is textbook OCP.
- **PreferredAmenity model** — Users can add custom amenities without code changes. The system is open for extension via data.
- **ChecklistTemplate model** — Users can create custom checklist templates. Open for extension.

---

## L — Liskov Substitution Principle

### Assessment: Clean ✅

The `GeoProvider` interface is the only polymorphic abstraction in the codebase, and it's well-designed:
- `OsmProvider` and `GoogleMapsProvider` both implement `GeoProvider`
- Both return the same `Route`, `Place`, `LatLng` types
- The factory function `getGeoProvider()` returns the interface type
- `neighbourhood.ts` consumes only the interface, never the concrete class
- Swapping providers via env var works transparently

No LSP violations found.

---

## I — Interface Segregation Principle

### Violations

**I1: The House model is a god object with 20 relations**

The House model has relations to: Media, BidHistory, ActionItem, RenovationEstimate, ViewingChecklist, TotalCostEstimate, ConveyancingTracker, ApartmentDetails, DefectiveBlocksAssessment, PPRComparable, BiddingStrategy, CommLog, SurveyFinding, FallThroughRecord, SnagItem, SellerIntel, NewBuildCompliance, JournalEntry, NearbyAmenity, CommuteEstimate.

The `GET /api/houses/[id]` route eagerly loads 14 of these relations in a single query. Any consumer of this endpoint gets a massive payload even if they only need the address and price.

This isn't strictly an ISP violation (there's no interface being forced on clients), but it's the same spirit — clients are forced to receive data they don't need.

**Recommendation:** This is acceptable for a 2-user self-hosted app. If it were a multi-tenant API, you'd want field selection or separate endpoints. For now, the eager loading is fine because SQLite is local and the data volume is tiny.

### What's Good

- **GeoProvider interface** — 3 methods, all needed by every consumer. No fat interface.
- **API routes are granular** — Each sub-resource has its own endpoint (`/bidding-strategy`, `/seller-intel`, `/survey-findings`). Clients can fetch only what they need.

---

## D — Dependency Inversion Principle

### Violations

**D1: Every module imports `prisma` directly from `@/lib/db`**

Every route handler and every lib module that touches the database does:
```typescript
import { prisma } from "@/lib/db";
```

This is a hard dependency on the concrete Prisma client. It works because the test suite mocks the module at the jest level (`jest.mock("@/lib/db")`), but it means:
- You can't swap the database layer without changing every file
- You can't run the same business logic against an in-memory store
- Testing requires module-level mocking rather than constructor injection

**Recommendation:** For this app size, this is pragmatic and fine. The jest mock pattern works. True DI (passing prisma as a parameter or using a service container) would be over-engineering for a 2-user app. Note it as a known trade-off.

**D2: `neighbourhood.ts` calls `getGeoProvider()` internally**

The `refreshNeighbourhood` function creates its own geo provider instance:
```typescript
const geo = getGeoProvider();
```

This means you can't inject a mock provider for testing without mocking the module. The function should accept an optional `GeoProvider` parameter:
```typescript
export async function refreshNeighbourhood(houseId: string, geo?: GeoProvider) {
  const provider = geo ?? getGeoProvider();
  ...
}
```

This is a minor but real DIP improvement that would make testing cleaner.

**D3: `scraper.ts` uses `fetch` and `fs` directly**

The scraper has hard dependencies on global `fetch` and Node.js `fs`. These are mocked at the global level in tests, but injecting them would be cleaner.

Again, pragmatic for this app size.

---

## Database Normalization Review

### Current State: 31 models

The schema is at **3NF (Third Normal Form)** for most tables, with some intentional denormalization for pragmatic reasons.

### 1NF Violations (Atomic Values)

**N1: `pros` and `cons` on House are JSON strings, not normalized**

```prisma
pros String?  // JSON array stored as string: '["garden","quiet"]'
cons String?  // JSON array stored as string: '["small kitchen"]'
```

In strict 1NF, each pro/con should be a row in a separate `HousePro` / `HouseCon` table. However, for a 2-user app where pros/cons are free-text tags that are only ever read/written as a complete list, JSON storage is pragmatic. SQLite doesn't have a native array type, so this is the standard Prisma/SQLite pattern.

**Verdict:** Acceptable denormalization. The trade-off is that you can't query "show me all houses with 'garden' as a pro" without JSON parsing. For 20 houses, this doesn't matter.

**N2: `ViewingChecklist.items` is a JSON blob**

```prisma
items String  // JSON: [{name, checked, notes}, ...]
```

A normalized design would have a `ChecklistItem` model with `checklistId`, `name`, `checked`, `notes`. This would allow querying "how many items are checked across all houses" or "which items are most commonly flagged."

**Verdict:** Acceptable. The checklist is always read/written as a unit. Individual item queries aren't needed. The JSON blob avoids 60 rows per checklist × N houses.

**N3: `ApartmentDetails.omcChecklist` is a JSON blob**

Same pattern as ViewingChecklist. 14 items stored as JSON.

**Verdict:** Acceptable for the same reasons.

**N4: `PPRComparable.comparables` is a JSON blob**

```prisma
comparables String  // JSON array of {address, price, date}
```

This stores up to 20 comparable sales as a JSON array. A normalized design would have a `Comparable` model. But these are cached external data that's refreshed wholesale — never individually edited.

**Verdict:** Acceptable. Cache data that's replaced atomically is fine as JSON.

### 2NF Assessment (No Partial Dependencies)

All tables use UUID primary keys with no composite keys, so 2NF violations are structurally impossible. ✅

### 3NF Violations (Transitive Dependencies)

**N5: `House.currentBid` is a derived value**

`currentBid` on House is the highest bid amount, which can be computed from `MAX(BidHistory.amount WHERE houseId = X)`. Storing it on House is denormalization — it could become stale if a bid is deleted without updating the house.

**Verdict:** Acceptable. It's a performance optimization (avoid joining BidHistory on every house list query) and the bid sync logic keeps it updated. The risk of staleness is low for 2 users.

**N6: `House.daysOnMarket` is a derived value**

`daysOnMarket` can be computed from `publishDate`:
```
daysOnMarket = Math.floor((Date.now() - publishDate) / 86400000)
```

Storing it means it's stale the moment it's written. Tomorrow it'll be wrong by 1.

**Verdict:** This should NOT be stored. It should be computed at read time. Either:
- Compute it in the API response: `{ ...house, daysOnMarket: house.publishDate ? daysSince(house.publishDate) : null }`
- Or compute it in the client

Storing a value that changes every day without any update mechanism is a bug.

**N7: `House.pricePerSqm` is a derived value**

`pricePerSqm = askingPrice / squareMetres`. If either field is updated, `pricePerSqm` becomes stale.

**Verdict:** Same as N6 — should be computed, not stored. If `askingPrice` changes (e.g., price drop), `pricePerSqm` won't update.

**N8: `TotalCostEstimate.deposit` is derivable**

`deposit = purchasePrice * 0.1` (10% LTV). But the user might want to override this (e.g., 15% deposit), so storing it is correct — it's a user-editable default, not a pure derivation.

**Verdict:** Acceptable. The default is computed but the user can override.

### 4NF Assessment (Multi-Valued Dependencies)

**N9: `House` has agent fields that should be a separate entity**

```prisma
agentName   String?
agentBranch String?
agentPhone  String?
```

If the same agent sells multiple properties, their details are duplicated across House records. In 4NF, this would be an `Agent` model with a foreign key.

**Verdict:** Borderline. For a couple tracking ~20 houses, agent deduplication isn't critical. But if you wanted "show me all houses listed by Agent X" or "what's Agent X's average response time" (Module 28: Agent Transparency), a separate Agent entity would be cleaner. Currently, agent response tracking uses CommLog with `professional=agent` and `contactName`, which is a separate denormalized representation of the same agent.

**N10: `CommuteEstimate` denormalizes `workplaceAddress`**

Each CommuteEstimate row stores `workplaceLabel` and `workplaceAddress`, which come from BuyerProfile. If the user updates their workplace address, all existing CommuteEstimate rows become stale (they still reference the old address).

**Verdict:** Acceptable as a cache. The `refreshNeighbourhood` function deletes and recreates all estimates. But there's no mechanism to auto-refresh when the profile changes — the user must manually hit "Refresh" on each house.

### Structural Issues

**N11: `ContractReadiness` is a singleton with no house association**

```prisma
model ContractReadiness {
  id                String   @id @default(uuid())
  idVerified        Boolean  @default(false)
  amlDocsSubmitted  Boolean  @default(false)
  surveyorOnStandby Boolean  @default(false)
  brokerEngaged     Boolean  @default(false)
  updatedAt         DateTime @updatedAt
}
```

This has no `houseId`. It's a global singleton. But contract readiness is conceptually per-purchase-attempt. If you're bidding on 3 houses simultaneously, you might have different surveyors on standby for different properties. The auto-computed fields (AIP valid, solicitor appointed) are also global, not per-house.

**Verdict:** This is a design choice, not a normalization issue. For a couple making one purchase at a time, a singleton is fine. But the spec says "allow multiple houses in bidding or sale_agreed simultaneously" (Module 20), which conflicts with a singleton readiness model.

**N12: `BuyerProfile` is a singleton**

```prisma
model BuyerProfile {
  id String @id @default(uuid())
  // ... no unique constraint, just findFirst()
}
```

The code uses `prisma.buyerProfile.findFirst()` everywhere. There's no constraint preventing multiple profiles. If `create` is called twice, you get two profiles and `findFirst()` returns an arbitrary one.

**Verdict:** Add `@@unique` or use a fixed ID pattern to enforce the singleton. Currently it works because the UI only calls PUT (which does findFirst + update/create), but a direct API call to create could produce duplicates.

**N13: `MortgageTracker` has no `houseId`**

Mortgages are not associated with specific houses. This is intentional (you apply for a mortgage before choosing a house, and the same mortgage can be used for any house), but it means there's no way to track "which mortgage are we using for this house" once sale is agreed.

**Verdict:** This is a valid domain modeling choice. The mortgage is a buyer-level concern, not a house-level concern. But the TotalCostEstimate (which is per-house) doesn't link to a specific MortgageTracker, so the funding stack can't show "AIB mortgage at 3.95%" — it can only show "90% mortgage" generically.

---

## Summary of Recommendations

### Must Fix (bugs or data integrity issues)

| # | Issue | Type | Fix |
|---|-------|------|-----|
| N6 | `daysOnMarket` stored but never updated — stale after day 1 | Normalization | Compute at read time, remove from schema |
| N7 | `pricePerSqm` stored but stale if price/sqm changes | Normalization | Compute at read time, remove from schema |
| S2 | Fall-through route duplicates trigger logic | SRP | Delegate to `handleDropped()` instead of inline side effects |

### Should Fix (code quality)

| # | Issue | Type | Fix |
|---|-------|------|-----|
| S1 | `schemes.ts` has 4 unrelated responsibilities | SRP | Extract constants to separate files |
| S3 | Import route has 7 responsibilities, no transaction | SRP | Extract `handleImport()`, wrap in `$transaction` |
| N12 | BuyerProfile singleton not enforced | Normalization | Add unique constraint or fixed ID |
| D2 | `neighbourhood.ts` creates its own geo provider | DIP | Accept optional `GeoProvider` parameter |

### Consider (trade-offs, not bugs)

| # | Issue | Type | Notes |
|---|-------|------|-------|
| N9 | Agent data duplicated across houses | 4NF | Extract `Agent` model if agent analytics needed |
| N11 | ContractReadiness is global singleton, not per-house | Design | Fine for single-purchase flow, conflicts with parallel pipeline |
| N13 | MortgageTracker not linked to House | Design | Valid domain choice, limits funding stack detail |
| O1 | Status triggers not extensible via registry | OCP | Minor for this app size |
| N1-N4 | JSON blobs for lists (pros, checklists, comparables) | 1NF | Acceptable for 2-user app, would normalize for multi-tenant |
