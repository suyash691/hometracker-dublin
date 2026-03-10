"use client";
import { useEffect, useState } from "react";
import { api, type BuyerProfile, type BorrowingLimits } from "@/lib/api";

export default function ProfilePage() {
  const [form, setForm] = useState({ name1: "", name2: "", isFirstTimeBuyer: true, grossIncome1: "", grossIncome2: "", existingMonthlyDebt: "", totalSavings: "", taxPaid4Years1: "", taxPaid4Years2: "", workplaceAddress: "" });
  const [limits, setLimits] = useState<BorrowingLimits | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.profile.get().then((p: BuyerProfile | null) => {
      if (p) setForm({ name1: p.name1, name2: p.name2, isFirstTimeBuyer: p.isFirstTimeBuyer, grossIncome1: String(p.grossIncome1 || ""), grossIncome2: String(p.grossIncome2 || ""), existingMonthlyDebt: String(p.existingMonthlyDebt || ""), totalSavings: String(p.totalSavings || ""), taxPaid4Years1: String(p.taxPaid4Years1 || ""), taxPaid4Years2: String(p.taxPaid4Years2 || ""), workplaceAddress: p.workplaceAddress || "" });
    });
  }, []);

  useEffect(() => {
    const i1 = Number(form.grossIncome1) || 0, i2 = Number(form.grossIncome2) || 0;
    if (i1 > 0) api.calculator.borrowing(i1, i2, form.isFirstTimeBuyer).then(setLimits);
  }, [form.grossIncome1, form.grossIncome2, form.isFirstTimeBuyer]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.profile.update({
      name1: form.name1, name2: form.name2, isFirstTimeBuyer: form.isFirstTimeBuyer,
      grossIncome1: Number(form.grossIncome1) || 0, grossIncome2: Number(form.grossIncome2) || 0,
      existingMonthlyDebt: Number(form.existingMonthlyDebt) || 0, totalSavings: Number(form.totalSavings) || 0,
      taxPaid4Years1: Number(form.taxPaid4Years1) || 0, taxPaid4Years2: Number(form.taxPaid4Years2) || 0,
      workplaceAddress: form.workplaceAddress || undefined,
    });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const f = (n: number) => `€${n.toLocaleString()}`;
  const htbEst = Math.round(Math.min(400_000 * 0.1, 30_000, (Number(form.taxPaid4Years1) || 0) + (Number(form.taxPaid4Years2) || 0)));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Buyer Profile</h1>
      <form onSubmit={save} className="bg-white p-6 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block"><span className="text-sm text-gray-500">Partner 1 Name</span><input required value={form.name1} onChange={e => setForm({ ...form, name1: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" /></label>
          <label className="block"><span className="text-sm text-gray-500">Partner 2 Name</span><input required value={form.name2} onChange={e => setForm({ ...form, name2: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" /></label>
          <label className="block"><span className="text-sm text-gray-500">Gross Income 1 (€)</span><input type="number" value={form.grossIncome1} onChange={e => setForm({ ...form, grossIncome1: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" /></label>
          <label className="block"><span className="text-sm text-gray-500">Gross Income 2 (€)</span><input type="number" value={form.grossIncome2} onChange={e => setForm({ ...form, grossIncome2: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" /></label>
          <label className="block"><span className="text-sm text-gray-500">Tax Paid 4yr — Partner 1 (€)</span><input type="number" value={form.taxPaid4Years1} onChange={e => setForm({ ...form, taxPaid4Years1: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" /></label>
          <label className="block"><span className="text-sm text-gray-500">Tax Paid 4yr — Partner 2 (€)</span><input type="number" value={form.taxPaid4Years2} onChange={e => setForm({ ...form, taxPaid4Years2: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" /></label>
          <label className="block"><span className="text-sm text-gray-500">Existing Monthly Debt (€)</span><input type="number" value={form.existingMonthlyDebt} onChange={e => setForm({ ...form, existingMonthlyDebt: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" /></label>
          <label className="block"><span className="text-sm text-gray-500">Total Savings (€)</span><input type="number" value={form.totalSavings} onChange={e => setForm({ ...form, totalSavings: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" /></label>
          <label className="col-span-2 block"><span className="text-sm text-gray-500">Workplace Address</span><input value={form.workplaceAddress} onChange={e => setForm({ ...form, workplaceAddress: e.target.value })} className="w-full border rounded px-3 py-2 text-sm mt-1" placeholder="For commute estimates" /></label>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isFirstTimeBuyer} onChange={e => setForm({ ...form, isFirstTimeBuyer: e.target.checked })} /> First-time buyer</label>
        <div className="flex gap-2 items-center">
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Save Profile</button>
          {saved && <span className="text-emerald-600 text-sm">✓ Saved</span>}
        </div>
      </form>

      {limits && (
        <div className="bg-white p-6 rounded-lg border">
          <h2 className="text-lg font-semibold mb-4">Your Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Stat label="Combined Income" value={f(limits.combinedIncome)} />
            <Stat label={`Max Borrowing (${limits.multiplier}×)`} value={f(limits.maxLTI)} />
            <Stat label="Max Property Price" value={f(limits.maxPropertyPrice)} />
            <Stat label="Min Deposit (10%)" value={f(limits.minDeposit)} />
            <Stat label="HTB Estimate" value={f(htbEst)} color="blue" />
            <Stat label="Effective Deposit" value={f((Number(form.totalSavings) || 0) + htbEst)} color="emerald" />
            <Stat label="Monthly @ 4%" value={f(limits.monthlyAt4pct)} />
            <Stat label="Monthly @ 6% (stress)" value={f(limits.monthlyAt6pct)} color="orange" />
            <Stat label="Affordable Range" value={`€350k – ${f(limits.maxPropertyPrice)}`} />
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  const c = color === "red" ? "text-red-600" : color === "orange" ? "text-orange-600" : color === "blue" ? "text-blue-600" : "text-emerald-700";
  return <div className="bg-gray-50 rounded-lg p-3"><div className="text-xs text-gray-500">{label}</div><div className={`font-semibold ${c}`}>{value}</div></div>;
}
