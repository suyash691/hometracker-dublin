# Persona-Based Audit: Three Perspectives on HomeTracker

**Date:** 2026-03-10
**Method:** Three parallel web-research subagents (estate agent, builder, experienced buyer) each did 6-8 web searches into Dublin property forums, market data, regulations, and buyer experiences, then audited the app.

---

## Cross-Persona Gap Summary

| # | Gap | Reseller | Builder | Buyer | Priority |
|---|-----|:--------:|:-------:|:-----:|----------|
| 1 | Bidding strategy / emotional guardrails | ✓ | | ✓ | 🔴 Critical |
| 2 | Sale fall-through recovery & pipeline | ✓ | | ✓ | 🔴 Critical |
| 3 | Solicitor/professional communication tracker | ✓ | | ✓ | 🔴 Critical |
| 4 | Seller situation intelligence | ✓ | | | 🔴 Critical |
| 5 | Contract readiness dashboard | ✓ | | | 🔴 Critical |
| 6 | Survey/engineer report management | | | ✓ | 🔴 Critical |
| 7 | Snagging module (new builds) | | ✓ | ✓ | 🔴 Critical |
| 8 | BER cost impact calculator | ✓ | | ✓ | 🟡 High |
| 9 | Mortgage drawdown conditions tracker | | | ✓ | 🟡 High |
| 10 | Post-completion moving/utilities checklist | | | ✓ | 🟡 High |
| 11 | HomeBond/structural warranty tracker | | ✓ | | 🟡 High |
| 12 | Construction cost benchmarking (€/sqm) | | ✓ | | 🟡 High |
| 13 | BCAR / Assigned Certifier documentation | | ✓ | | 🟡 High |
| 14 | Builder/developer due diligence | | ✓ | | 🟡 High |
| 15 | nZEB / Part L compliance checker | | ✓ | | 🟡 High |
| 16 | Planning permission calculator | | ✓ | | 🟡 High |
| 17 | Neighbourhood intelligence (beyond price) | ✓ | | | 🟡 High |
| 18 | Agent transparency tools | | | ✓ | 🟡 High |
| 19 | Chain mapping / timeline visualization | ✓ | | | 🟠 Medium |
| 20 | Market speed / competing buyer awareness | ✓ | | | 🟠 Medium |
| 21 | New build stage payment tracker | | ✓ | | 🟠 Medium |
| 22 | Development contributions / hidden costs | | ✓ | | 🟠 Medium |
| 23 | Emotional / mental health support | ✓ | | ✓ | 🟠 Medium |
| 24 | Dodgy practice / split deal detection | | | ✓ | 🟠 Medium |
| 25 | Future regulatory awareness (ZEB) | | ✓ | | 🟡 Low |

---

## RESELLER PERSPECTIVE (Dublin Estate Agent, 15+ years)

### Key Research Findings
- Dublin median price €495k, sub-€500k selling 10% over asking
- 14% fall-through rate (spiked to 25% in Q3 2025)
- 76% of buyers are FTBs, average age 41
- Properties sell in 6.7 weeks average (4.1 weeks in Dublin 6)
- ESRI Feb 2026: open-auction bidding drives systematic overbidding

### Top 10 Gaps
1. **No seller situation intelligence** — zero visibility into seller's chain, probate status, solicitor readiness. Most fall-throughs come from seller side.
2. **No contract readiness dashboard** — agents prioritize buyers who can demonstrate ability to complete, not just highest bid. Need shareable "ready to go" status.
3. **No bidding strategy / auction fever protection** — ESRI proved overbidding is systematic. Need hard ceiling locks, cooling-off timers, PPR alerts during active bidding.
4. **No BER retrofit cost module** — renovation cost underestimation was primary fall-through reason in Q3 2025.
5. **No solicitor performance tracking** — 8-week target, 10-20 week reality. No way to choose or evaluate solicitors.
6. **No title/planning pre-check workflow** — missing deeds add 4-8 weeks, planning non-compliance kills deals.
7. **No chain mapping** — no visualization of full chain with timeline and mortgage expiry overlay.
8. **No neighbourhood intelligence beyond price** — flood risk, radon, schools, transport, crime, planning applications.
9. **No market speed indicators** — days-on-market, price-to-asking ratio by postcode, new stock alerts.
10. **No emotional/decision support** — buying described as "soul-destroying"; need gut-check ratings, decision journal, walk-away prompts.

---

## BUILDER PERSPECTIVE (Dublin Developer, 20 years)

### Key Research Findings
- Dublin construction costs: €3,692/sqm average (most expensive EU city after Zurich/Geneva/London)
- Average new build has 110-160 snags
- HomeBond covers structural defects only (10 years), NOT cosmetic snags
- nZEB requirements: EPC ≤0.3, air tightness ≤5m³/m²/hr, RER ≥20%
- BCAR requires Certificate of Compliance on Completion for all new builds
- Exempted development: rear extensions up to 40sqm without planning

### Top 10 Gaps
1. **No snagging module** — viewing checklist is for second-hand; new builds need 200+ item snag list with photo capture and room tagging.
2. **No HomeBond/warranty tracker** — buyers don't understand what's covered (structural only, not cosmetic). Need to verify registration.
3. **No construction cost benchmarking** — Dublin is €3,692/sqm. No way to assess if asking price is reasonable vs build cost + land.
4. **No Part L / nZEB compliance checker** — BER tracked but not nZEB specifics (EPC, air tightness test results, RER).
5. **No BCAR documentation checker** — Certificate of Compliance on Completion is mandatory. App ignores it entirely.
6. **No planning permission calculator** — "Does my extension need planning?" with exemption rules.
7. **No development contributions module** — Section 48/49 levies, Uisce Éireann charges can add €10-25k to new build cost.
8. **No builder/developer due diligence** — CIF registration, HomeBond membership, track record, receivership history.
9. **No construction stage payment tracker** — off-plan purchases need milestone tracking with stage payments.
10. **No future regulatory awareness** — EU moving from nZEB to ZEB; buyers need "future-proofing score."

---

## BUYER PERSPECTIVE (Dublin couple, 18 months searching, 40+ viewings)

### Key Research Findings
- 88% of Dublin properties selling over asking (Q2 2025)
- 18% fall-through rate
- 14% of buyers suspect ghost bidding (ESRI)
- Properties going €100k-€150k over asking in Dublin
- Conveyancing takes 8-12 weeks minimum, often 10-20
- "Soul-destroying," "manic," "nightmare" — common descriptions

### Top 10 Gaps
1. **Bidding war guardrails** — hard ceiling lock, cooling-off timer, walk-away prompts, ghost bid logging.
2. **Sale fall-through recovery** — one-click "back to market" reset, parallel pipeline tracking, re-alert when lost property returns.
3. **Solicitor/comms tracker** — communication log with "days since last response," chase templates, escalation prompts.
4. **Post-completion moving checklist** — electricity/gas MPRN, broadband, bins, An Post redirect, water meter, alarm, address changes.
5. **BER cost impact calculator** — D1 costs €3,200/yr to heat vs €800 for B2. "True cost of ownership" over 5-10 years.
6. **Survey report management** — upload findings, categorize (cosmetic/structural/deal-breaker), attach cost estimates, decision framework.
7. **Mortgage drawdown conditions** — pre-drawdown checklist (MPI, home insurance, signed loan pack), "don't change jobs" warnings, valuation gap alerts.
8. **Agent transparency tools** — response time tracking, under-quoting detection, "what to ask" scripts.
9. **Emotional support layer** — journal, milestone celebrations, burnout detection, "you are not alone" stats.
10. **Dodgy practice detection** — split deal alerts, HTB threshold manipulation, PSRA complaints guidance.

---

## CONSOLIDATED TOP 15 RECOMMENDATIONS (by cross-persona priority)

| Rank | Feature | Personas | Effort |
|------|---------|----------|--------|
| 1 | **Bidding strategy module** — hard ceiling, cooling-off, PPR alerts during bidding, walk-away prompts | Reseller + Buyer | Medium |
| 2 | **Solicitor/professional comms tracker** — log, chase templates, days-since-response, escalation | Reseller + Buyer | Medium |
| 3 | **Survey/engineer report module** — upload, categorize findings, cost estimates, decision framework | Buyer | Medium |
| 4 | **Sale fall-through recovery** — pipeline management, parallel tracking, re-alert on return to market | Reseller + Buyer | Medium |
| 5 | **Contract readiness dashboard** — shareable "ready to complete" status for agents | Reseller | Small |
| 6 | **Snagging module** — 200+ item new-build checklist with photo capture, room tagging, export | Builder + Buyer | Medium |
| 7 | **BER cost impact calculator** — retrofit cost to B2, running cost comparison, SEAI grant integration | Reseller + Buyer | Small |
| 8 | **Post-completion moving checklist** — utilities, broadband, bins, An Post, address changes | Buyer | Small |
| 9 | **Mortgage drawdown conditions tracker** — pre-drawdown checklist, MPI reminder, valuation gap alert | Buyer | Small |
| 10 | **Seller situation questionnaire** — chain status, probate, solicitor appointed, motivation | Reseller | Small |
| 11 | **HomeBond/warranty tracker** — verify registration, explain coverage, claim process | Builder | Small |
| 12 | **BCAR documentation checker** — Commencement Notice, Assigned Certifier, Cert of Compliance | Builder | Small |
| 13 | **Agent transparency tools** — response tracking, under-quoting detection, question scripts | Buyer | Medium |
| 14 | **Planning permission calculator** — exempted development rules, extension feasibility | Builder | Medium |
| 15 | **Emotional support / decision journal** — gut-check ratings, milestone celebrations, burnout detection | Reseller + Buyer | Small |
