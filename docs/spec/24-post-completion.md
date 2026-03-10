# Module 24: Post-Completion Moving Checklist

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Source: Persona Audit (Buyer)

## Problem

App stops at closing. Day 1 in new home: no electricity account, no broadband, no bins, An Post still sending letters to old address.

## Fully Automated

Pre-populated checklist auto-created when house status → `closed`. Static Irish-specific items:

1. Electricity — set up account with provider (MPRN from meter)
2. Gas — set up account (GPRN from meter)
3. Broadband — order 2-3 weeks before closing (line install can take weeks for new builds)
4. Bin collection — sign up (Panda, Greenstar, CityBin — varies by area)
5. An Post mail redirection — €35/month, apply at anpost.com
6. Uisce Éireann — register water meter
7. Home alarm — set up monitoring, change codes
8. Local Property Tax — register with Revenue
9. Home insurance — activate policy (must be in place before drawdown)
10. Mortgage protection — confirm active
11. Change of address: bank, employer, Revenue, GP, dentist, insurance, car reg
12. TV licence — register at anpost.com
13. Electoral register — update at checktheregister.ie
14. Meter readings — photograph all meters on day of key handover
15. Stopcock location — find and test water shutoff
16. Fuse board — label all circuits
17. Boiler service — schedule first service
18. Chimney sweep — if open fires/stoves
19. Locks — consider changing external locks

Uses same ViewingChecklist entity pattern (JSON items array).
