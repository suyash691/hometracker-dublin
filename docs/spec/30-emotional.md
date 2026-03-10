# Module 30: Emotional Support & Decision Journal

> Parent: [SPEC.md](../../SPEC.md) | Status: 📋 Specified | Source: Persona Audit (Reseller + Buyer)

## Problem

Buying in Dublin described as "soul-destroying," "manic," "nightmare." ESRI confirmed auction-style bidding causes buyers to exceed budgets. No emotional support in the process.

## Entity: JournalEntry

| Field | Type | Notes |
|-------|------|-------|
| id | uuid | |
| houseId | fk? | nullable for general entries |
| type | enum | viewing_reaction, bid_reflection, milestone, freeform |
| gutRating | int? | 1-5 stars, immediate reaction |
| content | text | |
| createdAt | datetime | |

## Features

### Gut Check After Viewings (Semi-Auto)
Auto-prompted after viewing date passes: "How did you feel about [address]? Rate 1-5 before looking at the spreadsheet."

### Milestone Celebrations (Auto)
Triggered on status changes: "🎉 First viewing completed!", "💪 You survived your first bidding war", "🏠 Sale agreed — you're nearly there!"

### "You Are Not Alone" Stats (Auto)
Contextual encouragement: "The average Dublin buyer bids on 6 properties before going sale agreed. You're on property #3."

### Burnout Detection (Auto)
If user hasn't logged in for 14+ days after a dropped property: gentle notification via activity feed.

## API

```
GET/POST  /api/journal?houseId=X
```
