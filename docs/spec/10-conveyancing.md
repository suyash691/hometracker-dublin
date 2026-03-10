# Module 10: Conveyancing Tracker

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

## Entities

**ConveyancingTracker**: solicitorName/Firm/Phone/Email, estimatedClosingDate, status
**ConveyancingMilestone**: step, stepOrder, status (pending/in_progress/completed/blocked), completedDate, notes, blockerReason

## 18 Default Milestones

1. Solicitor appointed → 2. Booking deposit → 3. Contracts received → 4. Title investigation → 5. Requisitions raised → 6. Requisitions replied → 7. Mortgage offer received → 8. Contracts reviewed → 9. Contracts signed → 10. Contracts exchanged → 11. Balance deposit → 12. Closing date agreed → 13. Drawdown → 14. Final searches → 15. Keys received → 16. Stamp duty paid → 17. Deed lodged → 18. LPT updated

## API

```
GET/POST/PUT /api/houses/:id/conveyancing
PUT          /api/houses/:id/conveyancing/milestones/:milestoneId
```
