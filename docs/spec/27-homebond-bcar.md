# Module 27: HomeBond & BCAR

> Parent: [SPEC.md](../../SPEC.md) | Status: 📋 Specified | Source: Persona Audit (Builder)

## Problem

Buyers don't understand what HomeBond covers (structural only, 10yr, NOT cosmetic). BCAR Certificate of Compliance on Completion is mandatory but buyers don't check.

## Entity: NewBuildCompliance

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk | |
| warrantyProvider | enum | homebond, blp, global_home, premier, none |
| warrantyRegistrationNo | string? | |
| warrantyExpiry | date? | typically 10 years from completion |
| bcarCommencementNotice | boolean | lodged on BCMS? |
| assignedCertifier | string? | name |
| certOfCompliance | boolean | Certificate of Compliance on Completion |
| certOfComplianceDate | date? | |

## Auto-triggered when isNewBuild=true. Pre-populated checklist:

1. ☐ Confirm warranty provider (HomeBond/BLP/other)
2. ☐ Obtain warranty registration number
3. ☐ Verify Commencement Notice on BCMS
4. ☐ Confirm Assigned Certifier identity
5. ☐ Obtain Certificate of Compliance on Completion
6. ☐ Understand warranty coverage (structural only, not cosmetic)
7. ☐ Note warranty claim process and deadlines

## API

```
GET/PUT  /api/houses/:id/new-build-compliance
```
