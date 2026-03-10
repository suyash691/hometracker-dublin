# Module 07: Renovation Estimates

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

## Entity: RenovationEstimate

houseId, item, estimatedCostLow, estimatedCostHigh, source (manual/ai_generated), notes

## AI Generation

Sends house notes/pros/cons to Ollama (local) or Claude (fallback). Prompt includes Dublin 2026 market rates, SEAI grant context for BER C or below. Parses JSON array response.

## API

```
GET/POST  /api/houses/:id/estimates
POST      /api/houses/:id/estimates/generate   # AI-powered
```
