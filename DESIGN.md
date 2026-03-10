# HomeTracker — Design Document Index

> **For LLMs:** This is the master design index. Each `[→ docs/design/*.md]` link is a separate file. Read the relevant sub-design for implementation details.

## Design Documents

| Document | Description |
|----------|-------------|
| [→ docs/design/01-architecture.md](docs/design/01-architecture.md) | System architecture, module dependencies, request lifecycle, file structure |
| [→ docs/design/02-database.md](docs/design/02-database.md) | Full ER diagram, all Prisma models (existing + new) |
| [→ docs/design/03-api.md](docs/design/03-api.md) | Complete API contract with response shapes |
| [→ docs/design/04-business-logic.md](docs/design/04-business-logic.md) | Calculation engines, rules, automation triggers |
| [→ docs/design/05-ui.md](docs/design/05-ui.md) | UI/UX principles, colour palette, component library |
| [→ docs/design/06-pages.md](docs/design/06-pages.md) | Page wireframes and layouts for all pages |
| [→ docs/design/07-data-flows.md](docs/design/07-data-flows.md) | Integration flows, cron jobs, automation triggers |
| [→ docs/design/08-deployment.md](docs/design/08-deployment.md) | Docker, backup, first-run setup, env vars |

## Design Principles

1. **Mobile-first** — most viewing notes happen on phones
2. **Glanceable** — key numbers visible without scrolling
3. **Progressive disclosure** — simple by default, detail on demand
4. **Colour semantics** — emerald=positive, orange=warnings, red=overdue, purple=AI, blue=schemes
5. **Automation-first** — compute everything possible, ask user only for external knowledge
