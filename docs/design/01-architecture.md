# Design 01: System Architecture

> Parent: [DESIGN.md](../../DESIGN.md)

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  CLIENT (Browser / Phone)                                    │
│  Next.js App Router (React 19, Tailwind CSS)                 │
│  Pages: Dashboard, Houses, House Detail, Actions, Mortgage,  │
│         Schemes, Profile, Login                              │
│  ↕ fetch() via lib/api.ts                                    │
├─────────────────────────────────────────────────────────────┤
│  SERVER (Next.js API Routes)                                 │
│  39 route handlers → Business Logic Layer → Prisma ORM       │
├──────────────┬──────────────────────────────┬───────────────┤
│  SQLite DB   │  /data/media/ (filesystem)   │  External     │
│  19 models   │  /data/ppr/ (cache)          │  Ollama :11434│
│              │                              │  daft.ie      │
│              │                              │  offr.io      │
└──────────────┴──────────────────────────────┴───────────────┘
```

## Module Dependency Graph

```
db.ts ← all route handlers
  ├── activity.ts (logging)
  ├── auth.ts (cookie auth)
  ├── stamp-duty.ts (calculation)
  ├── central-bank.ts (LTI/LTV)
  ├── schemes.ts (HTB/FHS/LAHL + milestones + checklists)
  ├── estimator.ts (Ollama/Claude)
  ├── scraper.ts (Daft.ie)
  ├── offr-scraper.ts (Offr.io)
  ├── ppr.ts (PPR lookup)
  └── cron.ts (scheduled jobs)
```

## File Structure

```
housetrackingapp/
├── SPEC.md                         # master spec index
├── DESIGN.md                       # master design index
├── docs/spec/01-30-*.md            # module specs
├── docs/design/01-08-*.md          # design docs
├── docker-compose.yml
├── Dockerfile
├── prisma/schema.prisma
├── src/
│   ├── app/
│   │   ├── page.tsx                # dashboard
│   │   ├── houses/page.tsx         # house list
│   │   ├── houses/[id]/page.tsx    # house detail (8 tabs)
│   │   ├── actions/page.tsx
│   │   ├── mortgage/page.tsx
│   │   ├── schemes/page.tsx
│   │   ├── profile/page.tsx
│   │   ├── login/page.tsx
│   │   └── api/                    # 39 route files
│   └── lib/                        # 14 modules
├── data/
│   ├── hometracker.db
│   ├── media/
│   └── ppr/
└── __tests__/                      # 10 suites, 39 tests
```
