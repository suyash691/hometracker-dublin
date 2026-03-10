# Module 19: Survey / Engineer Report

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Source: Persona Audit (Buyer)

## Problem

The survey is the most important document in the process. The app has a viewing checklist for eyeballing but nothing for the professional report that drives renegotiation or withdrawal decisions.

## Entity: SurveyFinding

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk | |
| category | enum | cosmetic, functional, structural, deal_breaker |
| location | string | e.g. "rear bedroom", "attic", "exterior south wall" |
| description | string | finding from surveyor |
| estimatedCostLow | number? | |
| estimatedCostHigh | number? | |
| photoPath | string? | evidence photo |
| action | enum | accept, renegotiate, walk_away, monitor |

## Automation Level

| Aspect | Auto/Manual |
|--------|-------------|
| Cost estimate suggestions per category | **Auto** — "rising damp: €5k-€15k", "roof replacement: €15k-€25k" |
| Decision framework | **Auto** — "3 structural findings → consider renegotiating" |
| Summary stats | **Auto** — count by category, total estimated cost range |
| Entering findings | **Manual** — user transcribes from surveyor's report |
| Categorization | **Manual** — user assigns cosmetic/structural/deal-breaker |
| Photos | **Manual** — user uploads from survey visit |

## API

```
GET/POST  /api/houses/:id/survey-findings
PUT/DELETE /api/houses/:id/survey-findings/:findingId
```
