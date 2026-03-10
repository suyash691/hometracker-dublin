# Module 05: Action Items

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

## Entity: ActionItem

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk? | nullable for general tasks |
| title | string | |
| description | text? | |
| dueDate | datetime? | |
| assignedTo | string? | which partner |
| status | enum | todo, in_progress, done |
| category | enum | viewing, legal, mortgage, survey, renovation, insurance, other |

## API

```
GET/POST  /api/actions
PUT/DELETE /api/actions/:id
```
