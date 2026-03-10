# HomeTracker — Test Coverage Review

**Reviewer:** Senior SDE
**Date:** 2026-03-10
**Current state:** 48 test files, 76 describe blocks, 229 test cases across 6 categories

---

## Coverage Summary

| Category | Files | Tests | Verdict |
|----------|-------|-------|---------|
| Unit — Business Logic | 8 | 82 | ✅ Strong |
| API Routes | 24 | 82 | 🟡 Partial — 24 of 38 unique routes covered |
| Component / Page | 6 | 22 | 🔴 Weak — 6 of 9 pages, 0 of 6 components |
| Accessibility (jest-axe) | 4 | 4 | 🔴 Weak — 4 of 9 pages |
| Responsive | 5 | 34 | 🟡 Decent — 4 pages + pattern checks |
| Integration | 0 | 0 | 🔴 Missing entirely |
| **Total** | **48** | **229** | |

---

## 1. Unit Tests — Business Logic ✅ Strong

### What's covered (8 files, 82 tests)

| File | Tests | Coverage Quality |
|------|-------|-----------------|
| `stamp-duty.test.ts` | 11 | ✅ Excellent — all 3 bands, new build VAT, boundaries, edge cases |
| `central-bank.test.ts` | 8 | ✅ Excellent — FTB/non-FTB, single/couple, zero income, stress test |
| `schemes.test.ts` | 26 | ✅ Excellent — HTB (8), FHS (6), LAHL (6), constants (6) |
| `ber-calculator.test.ts` | 14 | ✅ Excellent — all BER ratings, scaling, grants, true cost, edge cases |
| `planning.test.ts` | 14 | ✅ Excellent — all 4 extension types, boundaries, conditions |
| `auth.test.ts` | 8 | ✅ Good — cookie creation, validation, env var parsing, edge cases |
| `geo/index.test.ts` | 4 | ✅ Good — factory function, all provider selection paths |
| `geo/osm-routing.test.ts` | 7 | ✅ Good — all 4 OSRM profiles, transit estimate, haversine fallback |
| `neighbourhood.test.ts` | 5 | ✅ Good — transit accessibility with all 3 transit types + edge cases |

### What's NOT covered

| Lib Module | Has Tests? | Risk |
|------------|-----------|------|
| `status-triggers.ts` | ❌ No | 🔴 **HIGH** — This is the most critical business logic (sale-agreed cascade, closed, dropped). It's tested indirectly via API route tests but has no dedicated unit tests. |
| `scraper.ts` | ❌ No | 🟡 Medium — Daft.ie HTML parsing. Would need HTML fixtures. |
| `offr-scraper.ts` | ❌ No | 🟡 Medium — Offr.io scraping. Same fixture approach needed. |
| `ppr.ts` | ❌ No | 🟡 Medium — PPR CSV parsing + comparable matching logic. |
| `estimator.ts` | ❌ No | 🟡 Low — AI prompt construction. Hard to unit test meaningfully. |
| `cron.ts` | ❌ No | 🟡 Low — Orchestration only, calls other modules. |
| `activity.ts` | ❌ No | 🟢 Low — 5-line wrapper around prisma.activityLog.create. |
| `api.ts` | ❌ No | 🟢 Low — Client-side fetch wrapper. Tested indirectly via component tests. |
| `geo/google.ts` | ❌ No | 🟡 Medium — Google Maps API calls. Needs fetch mocking like osm.test.ts. |
| `default-checklist.ts` | ❌ No | 🟢 Low — Static constant array. |
| `default-snags.ts` | ❌ No | 🟢 Low — Static constant array. |
| `default-post-completion.ts` | ❌ No | 🟢 Low — Static constant array. |
| `default-amenities.ts` | ❌ No | 🟢 Low — Static constant array. |

**Key gap: `status-triggers.ts` needs dedicated unit tests.** The `handleSaleAgreed` function has 6 conditional branches (existing tracker check, askingPrice check, isNewBuild check) and creates records across 5 tables. The `handleDropped` function has a status-gate check. These are currently only tested through the API layer, which means the mock setup is complex and the tests are fragile.

---

## 2. API Route Tests 🟡 Partial

### What's covered (24 files, 82 tests)

| Route | Test File | Tests | Quality |
|-------|-----------|-------|---------|
| `GET/POST /api/houses` | houses.test.ts | 5 | ✅ Good — list, filter, create, pros/cons |
| `GET/PUT/DELETE /api/houses/[id]` | houses-id.test.ts | 5 | ✅ Good — CRUD + 404 |
| `GET/POST /api/houses/[id]/bids` | bids.test.ts | 2 | 🟡 Minimal — happy paths only |
| `GET/POST /api/houses/[id]/checklists` | checklists.test.ts | 5 | ✅ Good — template, default, 404 |
| `GET/POST /api/houses/[id]/estimates` | estimates.test.ts | 2 | 🟡 Minimal |
| `GET/POST /api/checklist-templates` | checklist-templates.test.ts | 2 | 🟡 Minimal |
| `GET/POST/PUT /api/mortgage` | mortgage.test.ts | 4 | ✅ Good |
| `GET/POST /api/actions` + `PUT/DELETE` | actions.test.ts | 5 | ✅ Good — CRUD + filters |
| `GET/PUT /api/houses/[id]/conveyancing` | conveyancing.test.ts | 3 | ✅ Good — mocks status-triggers |
| `GET/PUT /api/houses/[id]/total-cost` | total-cost.test.ts | 4 | ✅ Good — auto-calc, isNewBuild |
| `GET /api/stamp-duty` | stamp-duty-api.test.ts | 4 | ✅ Good — validation, newBuild param |
| `GET /api/calculator/borrowing` | borrowing.test.ts | 3 | ✅ Good |
| `GET /api/calculator/planning` | planning-api.test.ts | 3 | ✅ Good |
| `GET /api/houses/[id]/ber-impact` | ber-impact.test.ts | 3 | ✅ Good — null BER, null sqm |
| `GET/PUT /api/profile` | profile.test.ts | 4 | ✅ Good — create vs update |
| `GET /api/schemes/eligibility` | schemes-api.test.ts | 4 | ✅ Good — FTB, non-FTB, no profile, price param |
| `GET/PUT /api/houses/[id]/bidding-strategy` | bidding-strategy.test.ts | 3 | ✅ Good |
| `GET/PUT /api/houses/[id]/seller-intel` | seller-intel.test.ts | 2 | 🟡 Minimal |
| `GET/POST /api/houses/[id]/survey-findings` | survey-findings.test.ts | 2 | 🟡 Minimal |
| `GET/POST /api/houses/[id]/fall-through` | fall-through.test.ts | 2 | ✅ Good — verifies side effects |
| `GET/POST /api/houses/[id]/snags` | snags.test.ts | 3 | ✅ Good — seedDefaults path |
| `GET/POST /api/comms` | comms.test.ts | 3 | ✅ Good — filter by houseId |
| `GET/PUT /api/contract-readiness` | contract-readiness.test.ts | 2 | ✅ Good — auto-aggregation |
| `GET/POST /api/journal` | journal.test.ts | 3 | ✅ Good |

### API routes with NO tests (14 route files)

| Route | Risk | Notes |
|-------|------|-------|
| `POST /api/houses/import` | 🔴 **HIGH** | Scraper integration, creates house + media + apartment + defective blocks. Complex side effects. |
| `GET/PUT /api/houses/[id]/apartment` | 🟡 Medium | OMC checklist auto-creation on upsert |
| `GET/PUT /api/houses/[id]/defective-blocks` | 🟡 Medium | Simple upsert |
| `GET/POST /api/houses/[id]/comparables` | 🟡 Medium | PPR refresh integration |
| `GET/PUT /api/houses/[id]/new-build-compliance` | 🟡 Medium | Simple upsert |
| `GET/POST /api/houses/[id]/neighbourhood` | 🟡 Medium | Geo provider integration |
| `PUT /api/houses/[id]/survey-findings/[findingId]` | 🟢 Low | Simple update |
| `PUT /api/houses/[id]/snags/[snagId]` | 🟢 Low | Simple update |
| `PUT /api/houses/[id]/conveyancing/milestones/[milestoneId]` | 🟡 Medium | Milestone status transitions |
| `PUT /api/comms/[commId]` | 🟢 Low | Simple update |
| `GET/POST /api/amenity-preferences` + `PUT [id]` | 🟡 Medium | Custom amenity creation |
| `POST /api/seed-amenities` | 🟢 Low | Idempotent seed |
| `POST /api/seed` | 🟢 Low | Checklist template seed |
| `POST /api/auth/login` | 🟡 Medium | Cookie setting, 401 handling |
| `GET /api/auth/me` | 🟢 Low | Cookie reading |
| `GET /api/activity` | 🟢 Low | Simple list |
| `POST /api/cron/offr-sync` | 🟡 Medium | External scraping |
| `POST /api/cron/ppr-refresh` | 🟡 Medium | External data fetch |
| `GET/POST /api/houses/[id]/media` | 🟡 Medium | File upload/serve |
| `DELETE /api/houses/[id]/media/[mediaId]` | 🟢 Low | File deletion |
| `GET /api/media/[filename]` | 🟡 Medium | File serving, path traversal prevention |
| `POST /api/houses/[id]/estimates/generate` | 🟡 Medium | AI integration |
| `POST /api/houses/[id]/bids/sync` | 🟡 Medium | Offr.io scraping |
| `GET/PUT /api/schemes/[scheme]` | 🟢 Low | Simple CRUD |
| `GET /api/schemes` | 🟢 Low | Simple list |
| `GET/POST /api/mortgage/[id]/documents` | 🟡 Medium | File handling |
| `PUT /api/mortgage/[id]/documents/[docId]` | 🟢 Low | Simple update |
| `GET/POST /api/mortgage/[id]/exemptions` | 🟡 Medium | Exemption logic |
| `PUT /api/mortgage/[id]/exemptions/[exId]` | 🟢 Low | Simple update |

**Coverage: ~24 of 38 unique route groups tested (63%).** The untested routes are mostly simple CRUD upserts, but the import route and media/file routes are notable gaps.

---

## 3. Component / Page Tests 🔴 Weak

### What's covered (6 files, 22 tests)

| Page | Test File | Tests | Quality |
|------|-----------|-------|---------|
| Dashboard (`/`) | dashboard.test.tsx | 5 | ✅ Good — stats, kanban, overdue, viewings |
| Houses List (`/houses`) | houses-list.test.tsx | 3 | ✅ Good — cards, metadata, empty state |
| Login (`/login`) | login-page.test.tsx | 2 | 🟡 Minimal — render only, no submit test |
| Profile (`/profile`) | profile-page.test.tsx | 3 | 🟡 OK — form, limits, FTB checkbox |
| Journal (`/journal`) | journal-page.test.tsx | 3 | 🟡 OK — entries, house link, textarea |
| Schemes (`/schemes`) | schemes-page.test.tsx | 3 | ✅ Good — eligibility, SEAI, ineligible |

### Pages with NO tests (3 of 9)

| Page | Risk | Notes |
|------|------|-------|
| **House Detail** (`/houses/[id]`) | 🔴 **HIGH** | This is the largest page (30KB). 12 tabs, status changes, bid forms, all extracted components render here. Zero tests. |
| **Actions** (`/actions`) | 🟡 Medium | CRUD page with filters |
| **Mortgage** (`/mortgage`) | 🟡 Medium | Multi-lender cards, document tracking |

### Extracted Components with NO tests (6 of 6)

| Component | Risk | Notes |
|-----------|------|-------|
| `NeighbourhoodTab.tsx` | 🟡 Medium | Commute display, amenity list, refresh button |
| `SurveyTab.tsx` | 🟡 Medium | Finding list, category badges, add form |
| `SnaggingTab.tsx` | 🟡 Medium | Room-grouped snag list, status updates |
| `SellerTab.tsx` | 🟡 Medium | Intel form, questionnaire prompts |
| `JournalTab.tsx` | 🟡 Medium | Gut rating, entry list |
| `ComplianceTab.tsx` | 🟡 Medium | Warranty checkboxes, BCAR fields |

**The house detail page is the single biggest testing gap in the entire app.** It's where users spend most of their time, it has the most complex interactions (tab switching, status changes, form submissions, conditional tab visibility), and it renders all 6 extracted components. Zero test coverage.

---

## 4. Accessibility Tests 🔴 Weak

### What's covered (4 files, 4 tests)

| Page | Has a11y test? | Quality |
|------|:-------------:|---------|
| Dashboard | ✅ | Single `toHaveNoViolations` check |
| Profile | ✅ | Single `toHaveNoViolations` check |
| Login | ✅ | Single `toHaveNoViolations` check |
| Journal | ✅ | Single `toHaveNoViolations` check |
| Houses List | ❌ | — |
| House Detail | ❌ | — |
| Actions | ❌ | — |
| Mortgage | ❌ | — |
| Schemes | ❌ | — |

**Issues with current a11y tests:**
- Each test is a single `toHaveNoViolations()` call — this catches structural violations but doesn't verify specific WCAG requirements
- No tests for keyboard navigation
- No tests for focus management on tab switches (house detail)
- No tests for aria-live regions on status changes
- No tests for form error association (aria-describedby)
- No tests for color contrast (though Tailwind defaults are generally compliant)
- The `await new Promise(r => setTimeout(r, 100))` pattern for waiting on async data is fragile — should use `waitFor`

---

## 5. Responsive Tests 🟡 Decent

### What's covered (5 files, 34 tests)

| File | Tests | Quality |
|------|-------|---------|
| `patterns.test.ts` | 19 | ✅ Good — verifies CSS classes in source files for grids, overflow, touch targets, viewport meta |
| `dashboard.responsive.test.tsx` | 8 | ✅ Good — mobile/tablet/desktop rendering |
| `houses-list.responsive.test.tsx` | 3 | 🟡 OK — mobile only |
| `profile.responsive.test.tsx` | 3 | 🟡 OK — mobile only |
| `login.responsive.test.tsx` | 2 | 🟡 Minimal |

**The `patterns.test.ts` approach is clever** — it reads source files and checks for responsive CSS class patterns. This catches regressions where someone removes `sm:grid-cols-2` from a form. However, it's testing source code strings, not actual rendered behavior.

### What's NOT covered
- House detail page responsive behavior (12 tabs on mobile!)
- Mortgage page responsive behavior
- Schemes page responsive behavior
- Actions page responsive behavior
- Journal page responsive behavior
- No tablet breakpoint tests for most pages
- No component-level responsive tests (NeighbourhoodTab commute cards, SurveyTab findings)

---

## 6. Integration Tests 🔴 Missing Entirely

**Zero integration tests exist.** The TEST_PLAN.md from the previous review specified 20 integration tests across 5 flows:

| Flow | Tests Planned | Tests Written |
|------|:------------:|:------------:|
| House lifecycle (wishlist → closed) | 5 | 0 |
| Mortgage flow (create → drawdown) | 5 | 0 |
| Scheme eligibility (profile → per-house) | 4 | 0 |
| Neighbourhood flow (seed → refresh) | 3 | 0 |
| Conveyancing flow (create → milestones) | 3 | 0 |

This is the most significant structural gap. Individual route tests verify each endpoint in isolation, but nobody is testing that the full user journey works end-to-end. For example:
- Does creating a house, setting it to sale_agreed, then updating a conveyancing milestone actually work through the full chain?
- Does the fall-through flow correctly preserve data and create the right journal entries?
- Does the neighbourhood refresh correctly populate commute estimates for both workplaces across all 4 modes?

---

## 7. Cross-Cutting Gaps

### No `status-triggers.ts` unit tests
This module contains the most critical business logic in the app. It's tested indirectly through `conveyancing.test.ts` (which mocks it) and `fall-through.test.ts` (which tests the API that calls it), but there are no direct unit tests for:
- `handleSaleAgreed` — idempotency check, stamp duty with `isNewBuild`, action item creation, new-build snag seeding
- `handleClosed` — post-completion checklist creation, idempotency, journal entry
- `handleDropped` — status gate (only from sale_agreed/conveyancing/closing)

### No error/edge case tests for most API routes
Most API tests only cover happy paths. Missing:
- What happens when `req.json()` throws (malformed body)?
- What happens when Prisma throws (constraint violation, not found)?
- What happens with empty strings, negative numbers, invalid enum values?

### No `GoogleMapsProvider` tests
The OSM provider has 7 tests covering all 4 routing modes + fallback. The Google provider has zero tests. Since it's a paid API, it's arguably less critical (users who configure it presumably have it working), but the response parsing logic should still be tested with mock fetch.

### No file upload/serve tests
`POST /api/houses/[id]/media` (FormData upload) and `GET /api/media/[filename]` (file serving with path traversal prevention) have zero tests. The path traversal prevention is a security-critical feature that should absolutely be tested.

---

## Priority Recommendations

### P0 — Must add (high risk, high impact)

1. **House detail page tests** — At minimum: renders, tab switching works, status change triggers API call, conditional tabs appear/hide correctly. This is the app's primary interface.

2. **`status-triggers.ts` unit tests** — Direct tests for `handleSaleAgreed`, `handleClosed`, `handleDropped` with all branches. Currently the most critical untested code.

3. **`POST /api/houses/import` test** — The import flow creates records across 4 tables and calls an external scraper. Needs at least a happy path test with mocked scraper.

4. **Media path traversal test** — `GET /api/media/[filename]` with `../../etc/passwd` style inputs. Security-critical.

### P1 — Should add (medium risk)

5. **Remaining 5 page accessibility tests** — Houses list, house detail, actions, mortgage, schemes. Just the basic `toHaveNoViolations` check.

6. **At least 1 integration test** — The house lifecycle flow (create → sale_agreed → verify cascade) would catch the most regressions.

7. **`GoogleMapsProvider` tests** — Mirror the OSM routing tests with mocked fetch.

8. **Actions page + Mortgage page component tests** — These are the other two heavily-used pages with zero coverage.

### P2 — Nice to add (completeness)

9. **Remaining untested API routes** — apartment, defective-blocks, new-build-compliance, amenity-preferences, seed-amenities, auth/login, milestone updates.

10. **Extracted component tests** — NeighbourhoodTab, SurveyTab, SnaggingTab, SellerTab, JournalTab, ComplianceTab.

11. **Error case tests** — Malformed JSON, Prisma errors, missing required fields across all routes.

12. **Responsive tests for remaining pages** — House detail (critical — 12 tabs on mobile), mortgage, actions.

---

## Coverage Scorecard

| Dimension | Score | Target | Gap |
|-----------|-------|--------|-----|
| Business logic functions | 8/11 tested (73%) | 100% | `status-triggers`, `scraper`, `ppr` |
| API route groups | 24/38 tested (63%) | 90% | 14 untested route groups |
| Pages | 6/9 tested (67%) | 100% | House detail, actions, mortgage |
| Extracted components | 0/6 tested (0%) | 100% | All 6 missing |
| Accessibility | 4/9 pages (44%) | 100% | 5 pages missing |
| Responsive | 4/9 pages (44%) | 80% | 5 pages missing |
| Integration flows | 0/5 flows (0%) | 100% | All 5 missing |
| **Overall weighted** | **~55%** | **85%** | |

The test suite has good depth where it exists (business logic tests are excellent, API tests that exist are well-written) but significant breadth gaps. The house detail page, status-triggers module, integration tests, and remaining accessibility tests are the highest-priority additions.
