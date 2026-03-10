# HomeTracker — Design Review

**Reviewer:** Senior SDE
**Date:** 2026-03-10
**Scope:** Full architecture, code, spec, and design review for testability, correctness, and maintainability

---

## Executive Summary

HomeTracker is a well-structured Next.js App Router application with clean separation between business logic (`src/lib/`), API routes (`src/app/api/`), and UI pages. The architecture is fundamentally testable — pure calculation functions are isolated, Prisma is centralized through a single `db.ts` module, and the existing 39 tests demonstrate a working mock pattern. However, there are significant gaps in test coverage (39 tests for 57 API routes + 5 business logic modules + 9 pages + 6 components = ~15% coverage), and several architectural decisions create testing friction that should be addressed.

**Overall testability score: 7/10** — Good bones, but needs structural improvements for comprehensive coverage.

---

## 1. Architecture Testability Assessment

### 1.1 What's Good

**Pure business logic functions** — `stamp-duty.ts`, `central-bank.ts`, `schemes.ts`, `ber-calculator.ts`, and `planning.ts` are all pure functions with no side effects. They take primitive inputs and return structured objects. This is the gold standard for unit testing. No mocking needed.

**Centralized Prisma client** — All database access goes through `@/lib/db` which exports a singleton `prisma`. The existing `prismaMock.ts` helper intercepts this cleanly with `jest.mock("@/lib/db")`. This pattern works well for unit-testing API routes in isolation.

**API routes as plain functions** — Next.js App Router route handlers are just exported async functions (`GET`, `POST`, `PUT`, `DELETE`) that take `NextRequest` and return `NextResponse`. They can be imported and called directly in tests without spinning up a server. The existing tests demonstrate this pattern correctly.

**Consistent response patterns** — All routes return `NextResponse.json()` with consistent status codes (200 for reads, 201 for creates, 400/404/500 for errors). This makes assertion patterns predictable.

### 1.2 What Needs Improvement

**Issue 1: Prisma mock is incomplete** — The `prismaMock.ts` only mocks 8 of 31 Prisma models. Any test touching `conveyancingTracker`, `totalCostEstimate`, `biddingStrategy`, `sellerIntel`, `surveyFinding`, `fallThroughRecord`, `snagItem`, `newBuildCompliance`, `journalEntry`, `commLog`, `contractReadiness`, `buyerProfile`, `schemeTracker`, `apartmentDetails`, `defectiveBlocksAssessment`, `mortgageExemption`, `pPRComparable`, `activityLog`, `preferredAmenity`, `nearbyAmenity`, or `commuteEstimate` will fail. The mock needs to cover all 31 models.

**Issue 2: Sale-agreed trigger has complex side effects that are hard to test** — The `PUT /api/houses/[id]` route handler contains ~60 lines of conditional side-effect logic (create conveyancing, create total cost, create action items, create snag items for new builds, create post-completion checklist on close, create journal entries on drop). This is the most critical business logic in the app and it's embedded directly in the route handler rather than extracted into a testable function. Testing each branch requires mocking 5-8 Prisma calls per scenario.

**Recommendation:** Extract the status-change cascade logic into a dedicated `src/lib/status-triggers.ts` module with functions like `handleSaleAgreed(houseId)`, `handleClosed(houseId)`, `handleDropped(houseId)`. This would allow unit testing the trigger logic independently of the HTTP layer.

**Issue 3: No input validation layer** — API routes accept `req.json()` and pass the body directly to Prisma. There's no Zod/Yup validation. This means:
- Invalid data can reach the database (Prisma will throw, but with unhelpful errors)
- There are no validation error test cases to write (because validation doesn't exist)
- Edge cases like negative prices, empty strings, or invalid enum values are not caught

**Recommendation:** Add Zod schemas for each entity and validate in route handlers. This creates a clear validation boundary to test.

**Issue 4: Auth middleware is not applied to any route** — `requireAuth()` exists in `src/lib/auth.ts` but is never called in any API route. All routes are completely unprotected. The `AUTH_USERS` env var mechanism exists but is dead code in practice.

**Recommendation:** Either apply auth middleware consistently or remove it. Currently it's untestable in context because it's unused.

**Issue 5: External service calls are not abstracted** — `scraper.ts` calls `fetch()` directly against daft.ie. `offr-scraper.ts` calls offr.io directly. `ppr.ts` reads the filesystem and calls the PPR website. `neighbourhood.ts` calls geo providers. None of these have injectable dependencies — they all use module-level imports and global `fetch`.

**Recommendation:** For integration tests, these need to be mocked at the `fetch` level (using `jest.fn()` on global.fetch) or at the module level. The geo provider abstraction (`GeoProvider` interface) is actually well-designed for this — it just needs a `MockGeoProvider` for tests.

**Issue 6: Client components use `fetch()` directly** — All pages call `fetch("/api/...")` in `useEffect` hooks. The existing dashboard test mocks `global.fetch`, which works but is fragile. There's no API client abstraction that could be mocked more cleanly.

**Note:** `src/lib/api.ts` exists (16KB) but it's unclear if pages use it or call fetch directly. If pages use `api.ts`, that's a better mock target.

### 1.3 Data Flow Concerns

**Concern 1: Duplicate conveyancing creation logic** — The sale-agreed trigger in `PUT /api/houses/[id]` and the `POST /api/houses/[id]/conveyancing` route both create conveyancing trackers with milestones, total cost estimates, and action items. This is duplicated logic that could diverge. Tests need to verify both paths produce identical results.

**Concern 2: `isNewBuild` stamp duty bug** — The sale-agreed trigger in `PUT /api/houses/[id]` hardcodes `calculateStampDuty(house.askingPrice, false)` — it always passes `false` for `isNewBuild`, even though the House model has an `isNewBuild` field. This means new-build stamp duty is always calculated incorrectly via the auto-trigger. The `PUT /api/houses/[id]/total-cost` route correctly reads `house?.isNewBuild ?? false`. This is a real bug that tests should catch.

**Concern 3: Fall-through route has dual status update** — `POST /api/houses/[id]/fall-through` both creates a `FallThroughRecord` AND updates the house status to `dropped`. But `PUT /api/houses/[id]` with `status: "dropped"` also has fall-through logic (creates journal entry). If a client calls the fall-through endpoint, the house gets set to `dropped`, but the journal entry from the PUT handler's drop logic won't fire because the status change happens via a different code path. This is a subtle inconsistency.

---

## 2. Code Quality Observations

### 2.1 Strengths

- **Consistent file structure** — Every API route follows the same pattern: import prisma, import business logic, export HTTP method handlers.
- **TypeScript throughout** — Full type safety with Prisma-generated types.
- **Constants are well-organized** — `CONVEYANCING_MILESTONES`, `OMC_CHECKLIST`, `SEAI_GRANTS`, `DEFAULT_SNAG_ITEMS`, `DEFAULT_CHECKLIST_ITEMS`, `POST_COMPLETION_ITEMS`, `DEFAULT_AMENITIES` are all exported constants that can be tested for correctness.
- **Geo provider abstraction** — The `GeoProvider` interface with `OsmProvider` and `GoogleMapsProvider` implementations is clean and testable. The factory function `getGeoProvider()` reads env vars, which is the right pattern.

### 2.2 Weaknesses

- **No error boundaries in pages** — If an API call fails, pages will likely show a blank screen or crash. No error states are tested.
- **No loading states tested** — Pages fetch data in useEffect but loading states aren't verified in existing tests.
- **JSON serialization of arrays** — `pros`, `cons`, `items` (checklists), and `omcChecklist` are stored as JSON strings in SQLite. This is a common pattern but creates a class of bugs where parsing fails or data is double-serialized. Tests should verify round-trip serialization.
- **No pagination** — All list endpoints return all records. For a couple tracking ~20 houses this is fine, but it means tests don't need to cover pagination edge cases.
- **Haversine fallback in OSM provider** — The `OsmProvider.walkingRoute()` has a try/catch that falls back to haversine distance calculation. This fallback path needs explicit testing.

### 2.3 Security Observations (relevant to test plan)

- **Path traversal in media serving** — `GET /api/media/[filename]` serves files from `/data/media/`. The spec says "path traversal prevented" but I'd need to verify the implementation. Tests should attempt `../../etc/passwd` style filenames.
- **No CSRF protection** — Cookie auth with no CSRF tokens. Not critical for a self-hosted app on Tailscale, but worth noting.
- **No rate limiting** — External API calls (Daft.ie, Offr.io, Nominatim) have no rate limiting beyond the 1.1s sleep in neighbourhood refresh. Tests should verify the sleep exists.

---

## 3. Test Infrastructure Assessment

### 3.1 Current State

- **Framework:** Jest with `@jest-environment node` for API tests, jsdom for component tests
- **React testing:** `@testing-library/react` with `waitFor` for async rendering
- **Prisma mocking:** Manual mock object in `__tests__/helpers/prismaMock.ts`
- **Next.js mocking:** `next/link` mocked as plain `<a>` tag
- **Fetch mocking:** `global.fetch = jest.fn()` in component tests
- **Test count:** 39 tests across 10 suites, all passing

### 3.2 What's Missing

- **No business logic unit tests** — Zero tests for `calculateStampDuty`, `calculateBorrowingLimits`, `calculateHTB`, `calculateFHS`, `calculateLAHL`, `calculateBerImpact`, `checkPlanningExemption`. These are the easiest and most valuable tests to write.
- **No accessibility tests** — No jest-axe, no ARIA assertions, no keyboard navigation tests.
- **No integration tests** — No tests that verify multi-step flows (create house → set sale_agreed → verify conveyancing created → update milestone → verify progress).
- **No error case tests** — Existing tests only cover happy paths. No tests for 404s, 400s, 500s, invalid inputs, or missing data.
- **No component interaction tests** — No `userEvent.click()`, no form submission tests, no tab switching tests.
- **No geo provider tests** — The entire neighbourhood intelligence module (4 files, 2 providers, 1 orchestrator) has zero tests.
- **No scraper tests** — `scraper.ts` and `offr-scraper.ts` have zero tests.
- **No auth tests** — `auth.ts` has zero tests despite having non-trivial logic (base64 encoding, env var parsing, cookie validation).

### 3.3 Recommended Test Infrastructure Additions

1. **jest-axe** — `npm install --save-dev jest-axe @types/jest-axe` for accessibility testing
2. **@testing-library/user-event** — For realistic user interaction simulation (may already be installed)
3. **Expand prismaMock.ts** — Add all 31 models with all methods used in route handlers
4. **Add `__tests__/lib/` directory** — For pure business logic unit tests
5. **Add `__tests__/integration/` directory** — For multi-step flow tests
6. **Add `__tests__/accessibility/` directory** — For jest-axe page tests

---

## 4. Risk Assessment

### High Risk (bugs likely, high impact)

| Risk | Location | Impact |
|------|----------|--------|
| `isNewBuild` stamp duty bug | `PUT /api/houses/[id]` line with `calculateStampDuty(house.askingPrice, false)` | New-build buyers get wrong stamp duty calculation on sale-agreed |
| No input validation | All POST/PUT routes | Invalid data can corrupt database |
| Duplicate conveyancing creation | `PUT /api/houses/[id]` + `POST /api/houses/[id]/conveyancing` | Inconsistent side effects depending on which path creates it |

### Medium Risk (edge cases, moderate impact)

| Risk | Location | Impact |
|------|----------|--------|
| JSON double-serialization | Any route handling pros/cons/items | Data corruption if array is already a string |
| Schemes eligibility hardcoded price | `GET /api/schemes/eligibility` uses €400k | Misleading eligibility results |
| Fall-through dual path | `POST /api/houses/[id]/fall-through` vs `PUT` with status=dropped | Missing journal entries depending on code path |
| OSM rate limiting only via sleep | `neighbourhood.ts` | Could get IP-banned from Nominatim |

### Low Risk (cosmetic, low impact)

| Risk | Location | Impact |
|------|----------|--------|
| Auth middleware unused | `auth.ts` | No security impact (self-hosted on Tailscale) |
| PPR data empty by default | `ppr.ts` returns [] | Comparables feature non-functional until manually populated |
| SEAI_GRANTS imported in client component | `schemes/page.tsx` | Works but could break if schemes.ts adds server imports |

---

## 5. Recommendations Summary

### Must Do (before shipping)
1. Fix `isNewBuild` stamp duty bug in sale-agreed trigger
2. Expand Prisma mock to cover all 31 models
3. Add unit tests for all 5 business logic modules (stamp duty, central bank, schemes, BER, planning)
4. Add tests for sale-agreed trigger cascade (the most critical code path)

### Should Do (for quality)
5. Extract status-change triggers into `src/lib/status-triggers.ts`
6. Add Zod validation schemas for API inputs
7. Add jest-axe accessibility tests for all 9 pages
8. Add error case tests for all API routes (404, 400, 500)
9. Add geo provider unit tests with mock fetch

### Nice to Have (for completeness)
10. Add integration tests for full house lifecycle
11. Add auth module tests
12. Add scraper tests with HTML fixtures
13. Add component interaction tests (form submissions, tab switching)
