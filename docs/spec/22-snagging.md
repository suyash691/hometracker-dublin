# Module 22: Snagging Module (New Builds)

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Source: Persona Audit (Builder + Buyer)

## Problem

Average new build has 110-160 snags. The viewing checklist is for second-hand properties. New builds need a dedicated snagging tool.

## Entity: SnagItem

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk | |
| room | string | e.g. "Kitchen", "Master Bedroom", "Bathroom 1" |
| category | enum | cosmetic, functional, structural |
| description | string | |
| photoPath | string? | |
| status | enum | identified, reported_to_builder, fixed, accepted |
| priority | enum | low, medium, high |

## Auto-triggered when isNewBuild=true and status → sale_agreed. Pre-populated with 200+ items grouped by room (kitchen, bathrooms, bedrooms, living areas, hallway, exterior, attic, utilities).

## API

```
GET/POST  /api/houses/:id/snags
PUT       /api/houses/:id/snags/:snagId
# PDF export: future enhancement
```
