# HomeTracker — Round 2 Review: Redundancy, Conflicts & Improvements

**Reviewer:** Senior SDE
**Date:** 2026-03-10
**Scope:** Full re-read of all 33 specs, 10 design docs, Prisma schema, all source code, and audit reports

---

## Executive Summary

The codebase has improved significantly since the first review. The `isNewBuild` stamp duty bug is fixed (status-triggers.ts now reads `house.isNewBuild`). The duplicate conveyancing creation logic is resolved — both `PUT /api/houses/[id]` and `POST /api/houses/[id]/conveyancing` now delegate to the shared `handleSaleAgreed()` in `status-triggers.ts`. The geo provider interface has been properly updated to support multi-modal routing.

However, the documentation layer has not kept pace with the code changes. There are now significant inconsistencies between specs, design docs, the audit report, and the actual implementation. Below is every issue I found, categorized by severity.

---

## 🔴 CONFLICTS (specs/design say one thing, code does another)

### C1: AUDIT.md is completely stale

**AUDIT.md** still says:
- "19/19 models" — actual count is **31 models** (schema has 31)
- "38/38 routes" — actual count is **57 route files**
- "8/8 pages" — actual count is **9 pages** (journal page added)
- "39/39 tests" — SPEC.md says **229 tests in 48 suites**
- "Gap 11: Defective blocks not auto-flagged on import" — code now does this
- "Minor 4: No isNewBuild field on House model" — field exists and is used
- "Gap 4: Mortgage comparison table missing" — unclear if fixed
- Lists 11 UI gaps and 5 minor issues that may or may not still apply

**Impact:** Any LLM or developer reading AUDIT.md will get a completely wrong picture of the codebase state.

**Fix:** Either delete AUDIT.md (since SPEC.md now has accurate stats) or regenerate it against current code. The audit was a point-in-time snapshot that's now misleading.

### C2: Design 01 (Architecture) has stale counts

**Design 01** says:
- "39 route handlers" — actual: 57
- "19 models" — actual: 31
- "14 modules" in lib — actual: 25
- "10 suites, 39 tests" — actual: 48 suites, 229 tests
- File structure shows "docs/spec/01-30-*.md" — actual: 01-33
- File structure shows "docs/design/01-08-*.md" — actual: 01-10
- Module dependency graph doesn't include `status-triggers.ts`, `neighbourhood.ts`, `ber-calculator.ts`, `planning.ts`, `default-snags.ts`, `default-post-completion.ts`, `default-amenities.ts`, or `geo/`

**Fix:** Update all counts and the dependency graph in design/01-architecture.md.

### C3: Design 02 (Database) doesn't include neighbourhood models

**Design 02** lists "New Models (from persona audit modules 17-30)" but does NOT include the 3 neighbourhood models (PreferredAmenity, NearbyAmenity, CommuteEstimate) or the `maxWalkingMetres` field on PreferredAmenity, or the `routeSummary` field on CommuteEstimate. These are only documented in Design 09 and Design 10.

**Fix:** Design 02 should be the single source of truth for ALL models. Add the neighbourhood models and the `workplaceAddress1`/`workplaceAddress2` fields on BuyerProfile.

### C4: Design 02 still shows BuyerProfile with `workplaceAddress` (singular)

The actual schema has `workplaceAddress1` and `workplaceAddress2`. Design 02 doesn't show BuyerProfile at all (it's in the "Existing Models" list but not expanded). Spec 13 correctly says `workplaceAddress1`/`workplaceAddress2`. But Design 09 still references `profile.workplaceAddress` (singular) in its refresh flow pseudocode.

**Fix:** Update Design 09's refresh flow to reference `workplaceAddress1`/`workplaceAddress2`.

### C5: Design 03 (API Contract) missing neighbourhood + amenity endpoints

**Design 03** lists endpoints for modules 17-30 but does NOT include:
- `GET/POST /api/amenity-preferences`
- `PUT /api/amenity-preferences/:id`
- `POST /api/seed-amenities`
- `GET/POST /api/houses/:id/neighbourhood`
- `GET /api/houses/:id/commute`

These are documented in Design 09 and Spec 31, but Design 03 is supposed to be the "Complete API contract."

**Fix:** Add neighbourhood endpoints to Design 03, or add a note saying "See Design 09 for neighbourhood endpoints."

### C6: Design 04 (Business Logic) automation triggers table is incomplete

The triggers table says `status → bidding` creates "SellerIntel questionnaire prompt, BiddingStrategy stub." But the actual `status-triggers.ts` code has NO handler for the `bidding` status transition — only `sale_agreed`, `closed`, and `dropped` are handled. The SPEC.md auto-triggers table also doesn't list a `bidding` trigger.

**Conflict:** Design 04 and Design 07 both claim a `bidding` trigger exists. The code and SPEC.md don't implement it.

**Fix:** Either implement the bidding trigger (create SellerIntel stub + BiddingStrategy stub when status → bidding) or remove it from Design 04 and Design 07.

### C7: Design 07 (Data Flows) post-completion item count mismatch

Design 07 says "Post-completion moving checklist (19 items)." SPEC.md auto-triggers table says "22 items." The actual `default-post-completion.ts` has **22 items**. Spec 24 lists **19 items** (but the code has 22 because some "change of address" items were split out).

**Fix:** Update Design 07 and Spec 24 to say 22 items, matching the code.

### C8: Design 09 GeoProvider interface is stale

Design 09 shows the old interface with `walkingRoute()`:
```typescript
interface GeoProvider {
  geocode(address: string): Promise<LatLng>;
  nearbySearch(center: LatLng, query: string, radiusMetres: number): Promise<Place[]>;
  walkingRoute(from: LatLng, to: LatLng): Promise<Route>;
}
```

The actual code (and Design 10) uses `route(from, to, mode)`. The `walkingRoute` method no longer exists.

**Fix:** Update Design 09 to reference the current `route()` method, or add a note saying "Superseded by Design 10."

---

## 🟡 REDUNDANCY (same information in multiple places)

### R1: Spec 31 + Spec 32 + Spec 33 overlap heavily

These three specs cover the same feature area (neighbourhood intelligence) and have significant overlap:

- **CommuteEstimate entity** is defined in Spec 31 (with `mode` field) AND redefined in Spec 32 (adding `routeSummary`). The Spec 31 version is now outdated.
- **GeoProvider interface** is defined in Spec 31 (with `walkingRoute`) AND redefined in Spec 32 (with `route(from, to, mode)`). The Spec 31 version is now outdated.
- **PreferredAmenity entity** is defined in Spec 31 (without `maxWalkingMetres`) AND extended in Spec 33 (adding `maxWalkingMetres`). The Spec 31 version is incomplete.
- **Neighbourhood Tab UI** wireframe appears in Spec 31 (walking-only commute) AND Spec 32 (multi-modal commute). They show different UIs for the same tab.
- **Environment variables** are listed identically in Spec 31 and Spec 32.

**Recommendation:** Merge Specs 32 and 33 into Spec 31 as subsections. Spec 31 should be the single source of truth for neighbourhood intelligence. Specs 32 and 33 were written as incremental additions but now that they're all implemented, having three separate specs for one feature creates confusion about which version of the entity/interface is current.

### R2: Design 09 + Design 10 overlap heavily

Same issue as R1 but for design docs:
- Design 09 defines the GeoProvider interface (old version with `walkingRoute`)
- Design 10 redefines it (new version with `route(from, to, mode)`)
- Design 09 shows the neighbourhood refresh flow (walking only)
- Design 10 shows the updated flow (all 4 modes)
- Both show the Neighbourhood Tab UI wireframe (different versions)

**Recommendation:** Merge Design 10 into Design 09. Design 09 should show the current (multi-modal) implementation.

### R3: Automation triggers documented in 4 places

The status-change triggers are documented in:
1. **SPEC.md** — Auto-Triggers table (accurate, concise)
2. **Design 04** — Automation Triggers table (partially stale — includes bidding trigger that doesn't exist)
3. **Design 07** — Status Change Cascade (partially stale — says 19 post-completion items, should be 22)
4. **Spec 01** — Sale-Agreed Trigger section (accurate but brief)

**Recommendation:** SPEC.md should be the canonical source. Design 04 and Design 07 should reference it rather than duplicating. Spec 01 can keep its brief mention since it's the house module spec.

### R4: SEAI grants data in 3 places

SEAI grant amounts appear in:
1. **Spec 08** (Government Schemes) — lists 9 grants with amounts
2. **Spec 23** (BER Cost Impact) — references SEAI grants in the BER table
3. **src/lib/schemes.ts** — `SEAI_GRANTS` constant (source of truth)
4. **src/lib/ber-calculator.ts** — `SEAI_MAX` lookup table (different format, same data)

The `SEAI_MAX` in ber-calculator.ts is a per-BER-rating maximum grant amount, which is a different concept from the per-item grant amounts in schemes.ts. But they're derived from the same underlying data and could diverge.

**Recommendation:** Add a comment in ber-calculator.ts noting that `SEAI_MAX` values are derived from the SEAI grant schedule and should be updated if `SEAI_GRANTS` changes.

### R5: Conveyancing milestones listed in 3 places

The 18 milestones appear in:
1. **Spec 10** — numbered list
2. **src/lib/schemes.ts** — `CONVEYANCING_MILESTONES` array (source of truth)
3. **Design 04** — referenced but not listed

This is fine — the code is the source of truth and the spec documents the intent. No action needed.

---

## 🟢 IMPROVEMENTS (not bugs, but opportunities)

### I1: Spec 31 status still says "📋 Specified" but SPEC.md says "✅ Implemented"

Spec 31's header says `Status: 📋 Specified` but the SPEC.md index marks it as `✅ Implemented`. Same for Specs 32 and 33. Several other specs (17-30) also still say "📋 Specified" in their headers while SPEC.md marks them as "✅ Implemented."

**Fix:** Update the status in each spec file header to match SPEC.md.

### I2: Spec 24 lists 19 items but code has 22

The `default-post-completion.ts` file has 22 items. Spec 24 lists 19. The extra 3 are the split-out "change of address" items (bank, employer, Revenue, GP/dentist, car insurance are listed as separate items in code but as one compound item in the spec).

**Fix:** Update Spec 24 to list all 22 items matching the code.

### I3: Design 02 "Existing Models (19)" vs "New Models" split is outdated

Design 02 still categorizes models as "Existing (19)" and "New (from persona audit)." Now that everything is implemented, this split is confusing. All 31 models are "existing."

**Fix:** Restructure Design 02 to show all 31 models as a single list, grouped by domain (Core, Persona Audit, Neighbourhood) rather than by implementation status.

### I4: Spec 28 (Agent Transparency) has no dedicated implementation

Spec 28 says "Leverages existing CommLog + PPRComparable APIs. No new entities needed." SPEC.md marks it as "✅ Implemented (via CommLog + PPR)." This is accurate — it's a feature that emerges from combining existing modules. But the spec describes specific features (under-quoting detection, agent response time tracking, "what to ask" scripts) that may or may not actually be implemented in the UI.

**Recommendation:** Either verify these UI features exist or change the status to "✅ Backend ready, UI pending" to be precise.

### I5: Spec 25 (Drawdown Conditions) implementation is unclear

Spec 25 says "Uses existing MortgageDocument entity with a new `drawdown_conditions` category." SPEC.md says "✅ Implemented (via mortgage docs)." But there's no `drawdown_conditions` category visible in the MortgageDocument model or any route handler. The spec describes a 7-item checklist and 4 warnings that should auto-appear.

**Recommendation:** Verify this is actually implemented. If it's just using the generic MortgageDocument entity without the specific drawdown checklist items, the status should be "Partially implemented."

### I6: `GET /api/houses/:id/commute` endpoint in Spec 31 may be redundant

Spec 31 lists `GET /api/houses/:id/commute` as a separate endpoint. But `GET /api/houses/:id/neighbourhood` already returns `{ amenities, commute }` which includes all commute estimates. Having a separate `/commute` endpoint is redundant unless there's a use case for fetching commute data without amenities.

**Recommendation:** Check if `/commute` is actually implemented and used. If not, remove it from the spec.

### I7: `GET /api/houses/:id/snags/export` (PDF) not implemented

Spec 22 lists `GET /api/houses/:id/snags/export` for PDF export. This endpoint doesn't appear in the API route files. SPEC.md marks the module as "✅ Implemented" but this specific endpoint is missing.

**Recommendation:** Either implement the PDF export or remove it from the spec and note it as a future enhancement.

---

## Summary of Required Actions

### Must Fix (conflicts that will confuse developers/LLMs)

| # | Issue | Action | Effort |
|---|-------|--------|--------|
| C1 | AUDIT.md completely stale | Delete or regenerate | Small |
| C2 | Design 01 stale counts | Update numbers and dependency graph | Small |
| C6 | Bidding trigger claimed but not implemented | Remove from Design 04 + 07, or implement | Small |
| C7 | Post-completion 19 vs 22 items | Update Design 07 + Spec 24 to say 22 | Tiny |
| C8 | Design 09 stale GeoProvider interface | Update to `route()` or note "see Design 10" | Small |

### Should Fix (redundancy that creates maintenance burden)

| # | Issue | Action | Effort |
|---|-------|--------|--------|
| R1 | Specs 31/32/33 overlap | Merge 32+33 into 31 | Medium |
| R2 | Designs 09/10 overlap | Merge 10 into 09 | Medium |
| R3 | Triggers in 4 places | Make SPEC.md canonical, others reference it | Small |
| C3 | Design 02 missing neighbourhood models | Add 3 models + new fields | Small |
| C4 | Design 09 stale workplace field name | Update to workplaceAddress1/2 | Tiny |
| C5 | Design 03 missing neighbourhood endpoints | Add endpoints or cross-reference | Small |

### Nice to Fix (polish)

| # | Issue | Action | Effort |
|---|-------|--------|--------|
| I1 | Spec headers say "Specified" not "Implemented" | Update 17 spec file headers | Tiny |
| I3 | Design 02 "existing vs new" split outdated | Restructure | Small |
| I5 | Drawdown conditions implementation unclear | Verify and update status | Small |
| I6 | Redundant `/commute` endpoint | Remove from spec if unused | Tiny |
| I7 | Snag PDF export not implemented | Remove from spec or implement | Small |
