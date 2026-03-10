# Module 06: Mortgage Tracker

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

## Entities

**MortgageTracker**: lender, approvalAmount, approvalExpiry, interestRate, fixedPeriod, term, monthlyRepayment, status (researching→documents_gathering→submitted→approval_in_principle→full_approval→drawdown)

**MortgageDocument**: 16-item Irish checklist (Employment Detail Summary, salary certs, bank statements, photo ID, proof of address, statement of affairs, gift letter, etc.). Per-person tracking.

**MortgageExemption**: type (lti/ltv), standardLimit, requestedAmount, excessAmount, status

## Features

- Multi-lender comparison table (rate, fixed, monthly, total cost, LTI status)
- Central Bank compliance badges per lender (LTI 4×/3.5×, LTV 90%)
- Exemption warnings when over limit
- Document progress bar with required/uploaded counts
- AIP expiry countdown

## API

```
GET/POST  /api/mortgage
PUT       /api/mortgage/:id
GET/POST  /api/mortgage/:id/documents
PUT       /api/mortgage/:id/documents/:docId
GET/POST  /api/mortgage/:id/exemptions
PUT       /api/mortgage/:id/exemptions/:exId
```
