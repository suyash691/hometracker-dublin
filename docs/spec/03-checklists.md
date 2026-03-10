# Module 03: Viewing Checklists

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

## Entities

**ViewingChecklist**: houseId, items (JSON array of {name, checked, notes})
**ChecklistTemplate**: name, items (JSON array of strings), isDefault

## Default Template

60-item Dublin-specific composite (realtor + buyer perspectives): structural, interior, utilities, energy, neighbourhood, Dublin-specific (flood risk, pyrite, ePlanning, PPR, management fees, sinking fund, LPT).

## API

```
GET/POST  /api/houses/:id/checklists
PUT       /api/houses/:id/checklists/:checklistId
GET/POST  /api/checklist-templates
POST      /api/seed                    # seeds default template
```
