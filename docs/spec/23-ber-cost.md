# Module 23: BER Cost Impact Calculator

> Parent: [SPEC.md](../../SPEC.md) | Status: 📋 Specified | Source: Persona Audit (Reseller + Buyer)

## Problem

A D1 house costs ~€3,200/yr to heat vs €800 for B2. Buyers don't factor energy costs into purchase decisions. Renovation cost underestimation was primary fall-through reason Q3 2025.

## Fully Automated Calculation

From existing house.ber + house.squareMetres, auto-compute:

| BER | Est. Annual Heating (100sqm) | Retrofit to B2 Cost | SEAI Grants Available |
|-----|------------------------------|---------------------|-----------------------|
| A1-A3 | €400-600 | €0 | €0 |
| B1-B3 | €600-1,200 | €0-5,000 | up to €2,100 (solar) |
| C1-C3 | €1,200-2,000 | €10,000-25,000 | up to €15,000 |
| D1-D2 | €2,000-3,200 | €25,000-45,000 | up to €25,000 |
| E-G | €3,200-5,000 | €40,000-80,000 | up to €30,000+ |

## Display

On house detail page, auto-show:
- "Estimated annual heating: €X" (based on BER + sqm)
- "Retrofit to B2: €X-€Y (after SEAI grants: €A-€B)"
- "10-year energy cost: €X" vs "10-year if retrofitted: €Y"
- "True cost of ownership = purchase price + retrofit + 10yr energy"

## API

```
GET /api/houses/:id/ber-impact    # fully computed, no user input needed
```
