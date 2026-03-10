# Module 29: Planning Permission Calculator

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Source: Persona Audit (Builder)

## Problem

Buyers don't know what extensions are exempt from planning. Rules are complex. Getting it wrong is expensive.

## Rules Engine (Fully Automated)

Inputs: extension type, size (sqm), location on property, previous exemptions used.

### Current Exempted Development Rules (2025/2026)

| Extension Type | Max Size | Conditions |
|---------------|----------|------------|
| Rear ground floor | 40sqm | Single storey, doesn't reduce garden below 25sqm |
| Garage/shed | 25sqm | Within curtilage, max 4m height (3m if within 2m of boundary) |
| Porch | 2sqm | Max 2m height if within 2m of road |
| Attic conversion | N/A | No increase in floor area, dormer to rear only |

### 2025 Proposed Changes (flag as "pending")
- Modular homes up to 45sqm in rear gardens
- Easier attic conversions

## API

```
GET /api/calculator/planning?type=rear_extension&size=35&gardenSize=60
→ { exempt: true, reason: "Under 40sqm rear exemption", conditions: [...] }
```
