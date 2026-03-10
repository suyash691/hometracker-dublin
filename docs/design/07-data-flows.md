# Design 07: Data Flows & Integration

> Parent: [DESIGN.md](../../DESIGN.md)

## Status Change Cascade

```
bidding ──→ Auto-create: SellerIntel stub, BiddingStrategy stub
            Auto-prompt: "Set your hard ceiling for this property"

sale_agreed ──→ Auto-create: ConveyancingTracker + 18 milestones
                Auto-create: TotalCostEstimate (stamp duty auto-calc)
                Auto-create: 4 action items
                If isNewBuild: Auto-create SnagItem checklist + NewBuildCompliance
                Auto-prompt: "Appoint solicitor ASAP"

dropped (from sale_agreed+) ──→ Auto-prompt: FallThroughRecord form
                                 Auto-create: "Review what went wrong" action item
                                 Cron: monitor Daft.ie for re-listing

closed ──→ Auto-create: Post-completion moving checklist (19 items)
           Auto-trigger: "🏠 Congratulations!" milestone celebration

full_approval ──→ Auto-create: Drawdown conditions checklist
                  Auto-show: "Don't change jobs" warnings
```

## Cron Jobs

| Schedule | Job | Endpoint |
|----------|-----|----------|
| */30 9-18 * * 1-5 | Offr.io bid sync | POST /api/cron/offr-sync |
| 0 2 * * * | PPR data refresh | POST /api/cron/ppr-refresh |
| 0 8 * * * | Overdue comms alerts | POST /api/cron/comms-check |
| 0 6 * * * | Dropped house re-listing check | POST /api/cron/relist-check |
