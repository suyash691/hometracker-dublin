# HomeTracker — Specification Index

> **For LLMs:** This is the master index. Each `[→ docs/spec/*.md]` link is a separate file containing the full specification for that module. Read the relevant sub-spec for implementation details.

## Overview

A self-hosted web app for a couple buying a house in Dublin. Track viewings, bids, notes, photos, floorplans, mortgage progress, government schemes, conveyancing, and generate renovation cost estimates — all from your local network.

## Constraints & Assumptions

- **Dublin only** — prices in EUR, BER ratings, Daft.ie/MyHome.ie, Offr.io, Irish mortgage process
- **Self-hosted** — Docker Compose on local server, Tailscale for remote access
- **Two users** — couple, simple cookie auth
- **Privacy first** — all data local, no cloud dependency

## Module Index

### Core Modules

| Module | Spec | Status |
|--------|------|--------|
| Houses & Listings | [→ docs/spec/01-houses.md](docs/spec/01-houses.md) | ✅ Implemented |
| Bids & Offr.io | [→ docs/spec/02-bids.md](docs/spec/02-bids.md) | ✅ Implemented |
| Viewing Checklists | [→ docs/spec/03-checklists.md](docs/spec/03-checklists.md) | ✅ Implemented |
| Media & Photos | [→ docs/spec/04-media.md](docs/spec/04-media.md) | ✅ Implemented |
| Action Items | [→ docs/spec/05-actions.md](docs/spec/05-actions.md) | ✅ Implemented |
| Mortgage Tracker | [→ docs/spec/06-mortgage.md](docs/spec/06-mortgage.md) | ✅ Implemented |
| Renovation Estimates | [→ docs/spec/07-renovation.md](docs/spec/07-renovation.md) | ✅ Implemented |
| Government Schemes | [→ docs/spec/08-schemes.md](docs/spec/08-schemes.md) | ✅ Implemented |
| Stamp Duty & Total Cost | [→ docs/spec/09-costs.md](docs/spec/09-costs.md) | ✅ Implemented |
| Conveyancing Tracker | [→ docs/spec/10-conveyancing.md](docs/spec/10-conveyancing.md) | ✅ Implemented |
| Apartment / OMC Module | [→ docs/spec/11-apartment.md](docs/spec/11-apartment.md) | ✅ Implemented |
| Defective Blocks | [→ docs/spec/12-defective-blocks.md](docs/spec/12-defective-blocks.md) | ✅ Implemented |
| Buyer Profile & Affordability | [→ docs/spec/13-profile.md](docs/spec/13-profile.md) | ✅ Implemented |
| PPR Comparables | [→ docs/spec/14-ppr.md](docs/spec/14-ppr.md) | ✅ Implemented |
| Dashboard & Activity | [→ docs/spec/15-dashboard.md](docs/spec/15-dashboard.md) | ✅ Implemented |
| Auth & Infrastructure | [→ docs/spec/16-infrastructure.md](docs/spec/16-infrastructure.md) | ✅ Implemented |

### Persona Audit Modules

| Module | Spec | Status |
|--------|------|--------|
| Bidding Strategy | [→ docs/spec/17-bidding-strategy.md](docs/spec/17-bidding-strategy.md) | ✅ Implemented |
| Professional Comms Tracker | [→ docs/spec/18-comms-tracker.md](docs/spec/18-comms-tracker.md) | ✅ Implemented |
| Survey Report Module | [→ docs/spec/19-survey-report.md](docs/spec/19-survey-report.md) | ✅ Implemented |
| Fall-Through Recovery | [→ docs/spec/20-fall-through.md](docs/spec/20-fall-through.md) | ✅ Implemented |
| Contract Readiness | [→ docs/spec/21-contract-readiness.md](docs/spec/21-contract-readiness.md) | ✅ Implemented |
| Snagging Module | [→ docs/spec/22-snagging.md](docs/spec/22-snagging.md) | ✅ Implemented |
| BER Cost Impact | [→ docs/spec/23-ber-cost.md](docs/spec/23-ber-cost.md) | ✅ Implemented |
| Post-Completion | [→ docs/spec/24-post-completion.md](docs/spec/24-post-completion.md) | ✅ Implemented |
| Drawdown Conditions | [→ docs/spec/25-drawdown.md](docs/spec/25-drawdown.md) | ⚠️ Partial (backend ready, UI uses generic mortgage docs) |
| Seller Intelligence | [→ docs/spec/26-seller-intel.md](docs/spec/26-seller-intel.md) | ✅ Implemented |
| HomeBond & BCAR | [→ docs/spec/27-homebond-bcar.md](docs/spec/27-homebond-bcar.md) | ✅ Implemented |
| Agent Transparency | [→ docs/spec/28-agent-tools.md](docs/spec/28-agent-tools.md) | ✅ Implemented (via CommLog + PPR) |
| Planning Permission | [→ docs/spec/29-planning.md](docs/spec/29-planning.md) | ✅ Implemented |
| Emotional Support | [→ docs/spec/30-emotional.md](docs/spec/30-emotional.md) | ✅ Implemented |

### Neighbourhood Modules

| Module | Spec | Status |
|--------|------|--------|
| Neighbourhood (commute, amenities, walkability) | [→ docs/spec/31-neighbourhood.md](docs/spec/31-neighbourhood.md) | ✅ Implemented |

## Implementation Stats

| Metric | Count |
|--------|-------|
| Prisma Models | 31 |
| API Routes | 57 |
| Pages | 9 |
| Components | 6 |
| Lib Modules | 28 |
| Test Suites | 83 |
| Tests | 337 |
| Spec Modules | 31 (merged 32+33 into 31) (all implemented) |
| Design Docs | 9 (merged 10 into 09) |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16 (React 19, App Router, Tailwind CSS) |
| Backend | Next.js API Routes |
| Database | SQLite via Prisma 5 |
| File Storage | Local filesystem `/data/media/` |
| AI | Ollama (local, optional) → Claude API (fallback/primary) |
| Geo | OSM (free, default) or Google Maps (user-provided key) |
| Scraping | Cheerio + fetch |
| Deployment | Docker Compose (app + optional Ollama + cron) |
| Networking | Tailscale |

## Status Flow

```
wishlist → viewing_scheduled → viewed → bidding → sale_agreed → conveyancing → closing → closed
                                                                     ↓
                                                                  dropped
```

### Auto-Triggers

| Trigger | Creates |
|---------|---------|
| → `bidding` | Seller intel questionnaire prompt |
| → `sale_agreed` | Conveyancing (18 milestones) + total cost + 4 action items + snag list (if new build) + compliance (if new build) |
| → `closed` | Post-completion checklist (22 items) + celebration journal entry |
| → `dropped` (from sale_agreed+) | Fall-through journal entry |
| Mortgage → `full_approval` | Drawdown conditions checklist |

## File Structure

See [→ docs/design/01-architecture.md](docs/design/01-architecture.md) for full file tree.
