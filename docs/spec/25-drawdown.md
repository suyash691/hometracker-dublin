# Module 25: Mortgage Drawdown Conditions

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented | Source: Persona Audit (Buyer)

## Problem

The gap between loan offer and drawdown is where deals die. MPI can take 3 weeks with medical disclosures. Buyers don't know what can derail drawdown.

## Pre-Drawdown Checklist

Auto-created when MortgageTracker.status → `full_approval`:

1. ☐ Mortgage protection insurance (MPI) — apply immediately, can take 2-4 weeks
2. ☐ Home insurance — must be in place before drawdown, name lender as interested party
3. ☐ Signed loan acceptance pack returned to lender
4. ☐ Valuation completed and accepted by lender
5. ☐ Direct debit mandate set up for repayments
6. ☐ Solicitor's undertaking letter sent to lender
7. ☐ All loan conditions satisfied (check lender's conditions list)

## Warnings (auto-displayed)

- "Don't change jobs before drawdown"
- "Don't take on new credit (car loan, credit card)"
- "Don't make large unexplained lodgements to your account"
- "Don't let your AIP expire — renewal takes 2-4 weeks"

## Valuation Gap Alert

If lender's valuation < agreed purchase price, auto-show: "Valuation shortfall of €X. Options: (1) renegotiate price, (2) fund gap from savings, (3) appeal valuation."

## API

Uses existing MortgageDocument entity with a new `drawdown_conditions` category.
