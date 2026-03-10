# HomeTracker — Test Coverage Review (Round 2)

**Date:** 2026-03-10
**State:** 73 test files, 103 describe blocks, 315 test cases across 7 categories
**Delta from last review:** +25 files, +86 tests (229 → 315)

---

## Coverage Summary

| Category | Files | Tests | Previous | Verdict |
|----------|-------|-------|----------|---------|
| Unit — Business Logic | 10 | 100 | 82 | ✅ Strong |
| API Routes | 32 | 100 | 82 | ✅ Good |
| Component / Page | 15 | 56 | 22 | ✅ Good |
| Accessibility (jest-axe) | 9 | 9 | 4 | ✅ Complete (all pages) |
| Responsive | 5 | 34 | 34 | 🟡 Unchanged |
| Integration | 1 | 4 | 0 | 🟡 Started |
| Security | 1 | 3 | 0 | ✅ New |
| **Total** | **73** | **315** | **229** | |

---

## What was fixed since last review

Every P0 gap from the previous review has been addressed:

| Previous Gap | Status | Evidence |
|-------------|--------|----------|
| House detail page — zero tests | ✅ Fixed | `house-detail.test.tsx` — 11 tests covering render, all conditional tabs, pros/cons, bids |
| `status-triggers.ts` — zero tests | ✅ Fixed | `status-triggers.test.ts` — 15 tests covering all 3 handlers, all branches, idempotency |
| `POST /api/houses/import` — zero tests | ✅ Fixed | `import.test.ts` — 4 tests with mocked scraper, apartment auto-create, defective blocks |
| Media path traversal — untested | ✅ Fixed | `media.test.ts` — 3 tests including `../../etc/passwd` traversal prevention |
| 5 missing accessibility tests | ✅ Fixed | All 9 pages now have jest-axe tests |
| Integration tests — zero | ✅ Started | `house-lifecycle.test.ts` — 4 tests covering create→bid→sale_agreed→close flow |
| `GoogleMapsProvider` — zero tests | ✅ Fixed | `google.test.ts` — 6 tests covering geocode, nearbySearch, route, API key |
| All 6 extracted components — zero tests | ✅ Fixed | 6 new test files covering all components |
| Actions page — zero tests | ✅ Fixed | `actions-page.test.tsx` — 4 tests |
| Mortgage page — zero tests | ✅ Fixed | `mortgage-page.test.tsx` — 4 tests |

---

## Detailed Assessment by Category

### 1. Unit Tests — Business Logic ✅ Strong (10 files, 100 tests)

All critical business logic is now tested:

| Module | Tests | All Branches? |
|--------|-------|:------------:|
| stamp-duty.ts | 11 | ✅ Yes — 3 bands, new build, boundaries, edge cases |
| central-bank.ts | 8 | ✅ Yes — FTB/non-FTB, single/couple, zero, stress test |
| schemes.ts | 26 | ✅ Yes — HTB(8), FHS(6), LAHL(6), constants(6) |
| ber-calculator.ts | 14 | ✅ Yes — all ratings, scaling, grants, true cost, unknown BER |
| planning.ts | 14 | ✅ Yes — all 4 types, boundaries, garden check, unknown |
| auth.ts | 8 | ✅ Yes — create/validate cookies, env var modes, malformed input |
| status-triggers.ts | 15 | ✅ Yes — sale_agreed(8), closed(3), dropped(4), all branches |
| geo/index.ts | 4 | ✅ Yes — all provider selection paths |
| geo/osm.ts | 7 | ✅ Yes — all 4 modes, transit estimate, haversine fallback |
| geo/google.ts | 6 | ✅ Yes — geocode, search, route, empty results, API key |
| neighbourhood.ts | 5 | ✅ Yes — transit accessibility with all 3 types + edge cases |

**Remaining untested lib modules:** `scraper.ts`, `offr-scraper.ts`, `ppr.ts`, `estimator.ts`, `cron.ts`, `activity.ts`, `api.ts`. These are all external-integration or thin-wrapper modules. The scrapers would need HTML fixtures, the estimator calls Ollama/Claude. Low risk — they're integration concerns, not logic bugs.

### 2. API Routes ✅ Good (32 files, 100 tests)

| Coverage | Count |
|----------|-------|
| Route groups with tests | 32 of 38 (84%) |
| Route groups without tests | 6 |

**Newly tested routes:** import, apartment, defective-blocks, new-build-compliance, amenity-preferences, seed-amenities, auth/login, auth/me, media (path traversal).

**Still untested (6 route groups):**

| Route | Risk | Why it's OK for now |
|-------|------|-------------------|
| `PUT /api/houses/[id]/conveyancing/milestones/[milestoneId]` | 🟡 | Simple Prisma update, no logic |
| `PUT /api/houses/[id]/survey-findings/[findingId]` | 🟢 | Simple Prisma update |
| `PUT /api/houses/[id]/snags/[snagId]` | 🟢 | Simple Prisma update |
| `PUT /api/comms/[commId]` | 🟢 | Simple Prisma update |
| `POST /api/cron/offr-sync` + `POST /api/cron/ppr-refresh` | 🟡 | External integration, would need scraper mocks |
| `POST /api/houses/[id]/bids/sync` | 🟡 | Offr.io scraping |

These are all either trivial single-field updates or external integration endpoints. The remaining risk is low.

### 3. Component / Page Tests ✅ Good (15 files, 56 tests)

| Page/Component | Tests | Quality |
|----------------|-------|---------|
| Dashboard | 5 | ✅ Stats, kanban, overdue, viewings |
| Houses List | 3 | ✅ Cards, metadata, empty state |
| **House Detail** | **11** | ✅ **Render, all conditional tabs (legal, snagging, compliance, apartment, seller), pros/cons, bids** |
| **Actions** | **4** | ✅ Items, add button, completed section, categories |
| **Mortgage** | **4** | ✅ Lender cards, comparison table, add button |
| Schemes | 3 | ✅ Eligibility, SEAI, ineligible |
| Profile | 3 | ✅ Form, limits, FTB |
| Login | 2 | 🟡 Render only |
| Journal | 3 | ✅ Entries, house link, textarea |
| **NeighbourhoodTab** | **4** | ✅ Amenities, walkable indicator, commute, refresh |
| **SurveyTab** | **3** | ✅ Findings, structural warning, add form |
| **SnaggingTab** | **3** | ✅ Seed button, room grouping, progress bar |
| **SellerTab** | **2** | 🟡 Questionnaire, save button |
| **JournalTab** | **3** | ✅ Entries, star rating, gut feeling input |
| **ComplianceTab** | **2** | 🟡 HomeBond form, warranty warning |

**All 9 pages and all 6 extracted components now have tests.** The house detail test is particularly well done — it verifies all 6 conditional tab visibility rules (legal only after sale_agreed, snagging/compliance only for new builds, apartment only for apartments, seller only when bidding+).

**What's still thin:**
- No `userEvent.click()` interaction tests anywhere — all tests verify render state, none simulate user actions (clicking tabs, submitting forms, toggling checkboxes)
- Login page only tests render, not form submission or error handling
- SellerTab and ComplianceTab have only 2 tests each

### 4. Accessibility ✅ Complete — All 9 Pages (9 files, 9 tests)

| Page | jest-axe test? |
|------|:-----------:|
| Dashboard | ✅ |
| Houses List | ✅ |
| House Detail | ✅ |
| Actions | ✅ |
| Mortgage | ✅ |
| Schemes | ✅ |
| Profile | ✅ |
| Login | ✅ |
| Journal | ✅ |

**Every page now has a `toHaveNoViolations()` check.** This catches:
- Missing alt text on images
- Missing form labels
- Invalid ARIA attributes
- Color contrast violations (at the computed style level)
- Heading hierarchy issues
- Missing landmark regions

**What jest-axe does NOT catch (and you should be aware of):**
- Keyboard navigation flow (tab order, focus trapping in modals)
- Screen reader announcement quality (aria-live regions on status changes)
- Focus management when switching tabs on house detail
- Touch target sizes (covered separately by responsive/patterns.test.ts)
- Dynamic content updates (the tests render once and check — they don't test what happens after a status change)

**Recommendation:** The jest-axe tests use `setTimeout(100)` to wait for async data. This is fragile. Consider switching to `waitFor(() => screen.getByText("something"))` before running axe, to ensure the page is fully rendered.

### 5. Responsive Tests 🟡 Unchanged (5 files, 34 tests)

No new responsive tests were added. Current coverage:

| Page | Mobile | Tablet | Desktop |
|------|:------:|:------:|:-------:|
| Dashboard | ✅ | ✅ | ✅ |
| Houses List | ✅ | — | — |
| Profile | ✅ | — | — |
| Login | ✅ | — | — |
| **House Detail** | ❌ | ❌ | ❌ |
| **Actions** | ❌ | ❌ | ❌ |
| **Mortgage** | ❌ | ❌ | ❌ |
| **Schemes** | ❌ | ❌ | ❌ |
| **Journal** | ❌ | ❌ | ❌ |

The `patterns.test.ts` file (19 tests) does verify that responsive CSS classes exist in source files for house detail, mortgage, actions, seller tab, and compliance tab. But there are no actual render-at-viewport tests for 5 of 9 pages.

**The house detail page is the most critical responsive gap** — it has 12 tabs that need horizontal scrolling on mobile, stat cards that reflow, and forms that need to stack. The `patterns.test.ts` checks that `overflow-x-auto` and `whitespace-nowrap` exist in the source, but doesn't verify the actual mobile rendering.

### 6. Integration Tests 🟡 Started (1 file, 4 tests)

The `house-lifecycle.test.ts` covers:
1. Create → bid → sale_agreed cascade (conveyancing + cost + 4 actions)
2. Sale_agreed → closed (post-completion + celebration)
3. Sale_agreed → dropped (fall-through journal)
4. New build sale_agreed (snags + compliance + correct stamp duty)

**This is good but limited.** It tests the status-trigger cascade through the actual function calls, which is the most critical flow. But it's really a unit test of `status-triggers.ts` called in sequence, not a true integration test that goes through the HTTP layer.

**Still missing integration tests:**
- Mortgage flow (create lender → add documents → AIP → full approval → drawdown conditions)
- Scheme eligibility flow (create profile → check eligibility → per-house calculation)
- Neighbourhood flow (seed amenities → set preferences → refresh → verify cached data)
- Contract readiness aggregation (create profile + mortgage + conveyancing → verify readiness %)

### 7. Security Tests ✅ New (1 file, 3 tests)

The `media.test.ts` file tests path traversal prevention:
- `../../etc/passwd` → stripped to just `passwd`
- `../../../etc/shadow` → no `../` in the resolved path
- Missing file → 404

This was a P0 gap and it's now covered.

---

## Overall Scorecard

| Dimension | Previous | Current | Target | Status |
|-----------|----------|---------|--------|--------|
| Business logic functions | 8/11 (73%) | 11/11 (100%) | 100% | ✅ Met |
| API route groups | 24/38 (63%) | 32/38 (84%) | 90% | 🟡 Close |
| Pages | 6/9 (67%) | 9/9 (100%) | 100% | ✅ Met |
| Extracted components | 0/6 (0%) | 6/6 (100%) | 100% | ✅ Met |
| Accessibility | 4/9 (44%) | 9/9 (100%) | 100% | ✅ Met |
| Responsive | 4/9 (44%) | 4/9 (44%) | 80% | 🔴 Gap |
| Integration flows | 0/5 (0%) | 1/5 (20%) | 100% | 🟡 Started |
| Security (path traversal) | 0/1 (0%) | 1/1 (100%) | 100% | ✅ Met |
| **Overall weighted** | **~55%** | **~80%** | **85%** | 🟡 Close |

---

## Remaining Gaps (Priority Order)

### P1 — Should add

1. **Responsive tests for house detail page** — 12 tabs on mobile is the hardest responsive challenge in the app. Verify tabs scroll horizontally, stat cards reflow to 2-col, forms stack properly.

2. **User interaction tests** — No test anywhere simulates a click, form submission, or keyboard event. Add at least:
   - House detail: click tab → content changes
   - Actions: click "Mark done" → status updates
   - Profile: submit form → API called
   - Login: submit → redirect or error

3. **Remaining 4 integration flows** — Mortgage, schemes, neighbourhood, contract readiness.

4. **Responsive tests for mortgage + schemes pages** — These have data tables and comparison views that need mobile treatment.

### P2 — Nice to add

5. **6 remaining untested API route groups** — Milestone updates, snag updates, comm updates, cron jobs, bid sync.

6. **Error state tests** — What do pages show when API returns 500? When fetch fails? When data is null? Currently no page test verifies error handling.

7. **Accessibility tests for extracted components** — The page-level jest-axe tests catch most issues, but testing components in isolation (especially SurveyTab with its form, SnaggingTab with its checkboxes) would catch component-specific a11y issues.

8. **Replace `setTimeout(100)` in a11y tests** — Use `waitFor` for reliable async rendering before running axe.

---

## Verdict

**The test suite has gone from ~55% to ~80% coverage and now covers all the critical paths.** Every page, every component, every business logic module, and every critical API route has at least basic test coverage. The accessibility suite covers all 9 pages. The security-critical path traversal is tested. The most complex business logic (status triggers) has thorough branch coverage.

The main remaining weakness is **interaction testing** (no clicks/submits anywhere) and **responsive testing** (only 4 of 9 pages). These are real gaps but they're in the "polish" category rather than "will ship bugs" category. The functional correctness and accessibility baselines are solid.
