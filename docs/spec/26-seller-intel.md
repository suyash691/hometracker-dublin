# Module 26: Seller Intelligence

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Source: Persona Audit (Reseller)

## Problem

Most fall-throughs come from the seller side. Buyers have zero visibility into seller's situation.

## Entity: SellerIntel

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk | one per house |
| inChain | boolean? | is seller buying another property? |
| chainLength | int? | how many links |
| isProbate | boolean? | deceased estate |
| solicitorAppointed | boolean? | |
| motivationLevel | enum? | high, medium, low, unknown |
| timelineExpectation | string? | e.g. "wants to close by June" |
| reasonForSelling | string? | |
| notes | text? | |

## Pre-Bid Questionnaire (auto-prompted when status → bidding)

Questions to ask the agent:
1. Is the vendor in a chain? If so, have they found their onward purchase?
2. Is this a probate sale?
3. Has the vendor's solicitor been appointed?
4. What is the vendor's expected timeline?
5. Why are they selling?
6. Are there any known title or planning issues?

## Automation: Semi — app provides the questions, user fills in answers from agent conversations.

## API

```
GET/PUT  /api/houses/:id/seller-intel
```
