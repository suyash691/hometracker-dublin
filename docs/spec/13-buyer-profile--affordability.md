# Module 13: Buyer Profile & Affordability

> Parent: [SPEC.md](../../SPEC.md) | Status: ✅ Implemented

BuyerProfile (singleton): name1/name2, isFirstTimeBuyer, grossIncome1/2, existingMonthlyDebt, totalSavings, taxPaid4Years1/2, workplaceAddress1 (partner 1), workplaceAddress2 (partner 2). Computed: combinedIncome, maxLTI (4×/3.5×), maxPropertyPrice, minDeposit, HTB estimate, stress test at +2%. Affordability bar on house detail. Neighbourhood tab shows commute to both workplaces. API: GET/PUT /api/profile, GET /api/calculator/borrowing
