# Design 01: System Architecture

> Parent: [DESIGN.md](../../DESIGN.md)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Browser / Phone)                                    │
│  Next.js App Router (React 19, Tailwind CSS)                 │
│  Pages: Dashboard, Houses, House Detail, Actions, Mortgage,  │
│         Schemes, Profile, Journal, Login                     │
│  ↕ fetch() via lib/api.ts                                    │
├─────────────────────────────────────────────────────────────┤
│  SERVER (Next.js API Routes — 57 route files)                │
│  Route Handlers → Business Logic Layer → Prisma ORM          │
├──────────────┬──────────────────────────────┬───────────────┤
│  SQLite DB   │  /data/media/ (filesystem)   │  External     │
│  31 models   │  /data/ppr/ (cache)          │  Ollama/Claude│
│              │                              │  daft.ie      │
│              │                              │  offr.io      │
│              │                              │  OSM/Google   │
└──────────────┴──────────────────────────────┴───────────────┘
```

## Module Dependency Graph

```
db.ts ← all route handlers
  ├── activity.ts
  ├── auth.ts
  ├── status-triggers.ts (sale_agreed/closed/dropped cascades)
  │     ├── constants/conveyancing.ts (18 milestones)
  │     ├── stamp-duty.ts
  │     ├── default-snags.ts
  │     └── default-post-completion.ts
  ├── stamp-duty.ts
  ├── central-bank.ts
  ├── schemes.ts (HTB/FHS/LAHL only)
  ├── constants/omc.ts (14-item OMC checklist)
  ├── constants/seai.ts (9 SEAI grants)
  ├── ber-calculator.ts
  ├── planning.ts
  ├── estimator.ts (Ollama/Claude)
  ├── scraper.ts (Daft.ie)
  ├── offr-scraper.ts (Offr.io)
  ├── ppr.ts (PPR lookup)
  ├── neighbourhood.ts (orchestrates geo)
  │     └── geo/ (provider abstraction)
  │           ├── types.ts (GeoProvider interface)
  │           ├── osm.ts (Nominatim + Overpass + OSRM)
  │           ├── google.ts (Maps API)
  │           └── index.ts (factory)
  ├── cron.ts
  ├── default-checklist.ts (60 items)
  └── default-amenities.ts (20 items)
```

## File Structure

```
housetrackingapp/
├── SPEC.md                         # master spec index (33 modules)
├── DESIGN.md                       # master design index (10 design docs)
├── docs/spec/01-33-*.md            # module specs
├── docs/design/01-10-*.md          # design docs
├── docker-compose.yml
├── Dockerfile
├── prisma/schema.prisma            # 31 models
├── src/
│   ├── app/
│   │   ├── page.tsx                # dashboard
│   │   ├── houses/page.tsx         # house list
│   │   ├── houses/[id]/page.tsx    # house detail (13 tabs)
│   │   ├── actions/page.tsx
│   │   ├── mortgage/page.tsx
│   │   ├── schemes/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── journal/page.tsx
│   │   ├── login/page.tsx
│   │   └── api/                    # 57 route files
│   ├── components/house-detail/    # 6 extracted components
│   └── lib/                        # 28 modules (including geo/ and constants/)
├── data/
│   ├── hometracker.db
│   ├── media/
│   └── ppr/
└── __tests__/                      # 83 suites, 337 tests
```
