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

### Core Modules (existing, implemented)

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

### New Modules (from persona audit)

| Module | Spec | Status |
|--------|------|--------|
| Bidding Strategy | [→ docs/spec/17-bidding-strategy.md](docs/spec/17-bidding-strategy.md) | 📋 Specified |
| Professional Comms Tracker | [→ docs/spec/18-comms-tracker.md](docs/spec/18-comms-tracker.md) | 📋 Specified |
| Survey Report Module | [→ docs/spec/19-survey-report.md](docs/spec/19-survey-report.md) | 📋 Specified |
| Fall-Through Recovery | [→ docs/spec/20-fall-through.md](docs/spec/20-fall-through.md) | 📋 Specified |
| Contract Readiness | [→ docs/spec/21-contract-readiness.md](docs/spec/21-contract-readiness.md) | 📋 Specified |
| Snagging Module | [→ docs/spec/22-snagging.md](docs/spec/22-snagging.md) | 📋 Specified |
| BER Cost Impact | [→ docs/spec/23-ber-cost.md](docs/spec/23-ber-cost.md) | 📋 Specified |
| Post-Completion | [→ docs/spec/24-post-completion.md](docs/spec/24-post-completion.md) | 📋 Specified |
| Drawdown Conditions | [→ docs/spec/25-drawdown.md](docs/spec/25-drawdown.md) | 📋 Specified |
| Seller Intelligence | [→ docs/spec/26-seller-intel.md](docs/spec/26-seller-intel.md) | 📋 Specified |
| HomeBond & BCAR | [→ docs/spec/27-homebond-bcar.md](docs/spec/27-homebond-bcar.md) | 📋 Specified |
| Agent Transparency | [→ docs/spec/28-agent-tools.md](docs/spec/28-agent-tools.md) | 📋 Specified |
| Planning Permission | [→ docs/spec/29-planning.md](docs/spec/29-planning.md) | 📋 Specified |
| Emotional Support | [→ docs/spec/30-emotional.md](docs/spec/30-emotional.md) | 📋 Specified |
| Neighbourhood Intelligence | [→ docs/spec/31-neighbourhood.md](docs/spec/31-neighbourhood.md) | 📋 Specified |
| Multi-Modal Commute | [→ docs/spec/32-multi-modal-commute.md](docs/spec/32-multi-modal-commute.md) | 📋 Specified |
| Amenity Transport Modes | [→ docs/spec/33-amenity-transport.md](docs/spec/33-amenity-transport.md) | 📋 Specified |

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Next.js 16 (React 19, App Router, Tailwind CSS) |
| Backend | Next.js API Routes |
| Database | SQLite via Prisma 5 |
| File Storage | Local filesystem `/data/media/` |
| AI | Ollama (local) → Claude API (fallback) |
| Scraping | Cheerio + fetch |
| Deployment | Docker Compose (app + Ollama + cron) |
| Networking | Tailscale |

## Status Flow

```
wishlist → viewing_scheduled → viewed → bidding → sale_agreed → conveyancing → closing → closed
                                                                     ↓
                                                                  dropped
```

## File Structure

See [→ docs/design/01-architecture.md](docs/design/01-architecture.md) for full file tree.
