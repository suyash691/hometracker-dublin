"use client";
import { useEffect, useState } from "react";
import { api, type Mortgage, type MortgageDoc, type BorrowingLimits } from "@/lib/api";
import { MORTGAGE_STATUSES } from "@/lib/types";

export default function MortgagePage() {
  const [mortgages, setMortgages] = useState<Mortgage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [expandedDocs, setExpandedDocs] = useState<string | null>(null);
  const [limits, setLimits] = useState<BorrowingLimits | null>(null);
  const [form, setForm] = useState({ lender: "", approvalAmount: "", interestRate: "", term: "", fixedPeriod: "", status: "researching" });

  const load = () => {
    api.mortgage.list().then(setMortgages);
    api.profile.get().then(p => { if (p) api.calculator.borrowing(p.grossIncome1, p.grossIncome2, p.isFirstTimeBuyer).then(setLimits); }).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const m = await api.mortgage.create({
      lender: form.lender,
      approvalAmount: form.approvalAmount ? Number(form.approvalAmount) : undefined,
      interestRate: form.interestRate ? Number(form.interestRate) : undefined,
      term: form.term ? Number(form.term) : undefined,
      fixedPeriod: form.fixedPeriod ? Number(form.fixedPeriod) : undefined,
      status: form.status,
    });
    // Auto-seed default Irish mortgage docs
    await api.mortgage.seedDocs(m.id);
    setForm({ lender: "", approvalAmount: "", interestRate: "", term: "", fixedPeriod: "", status: "researching" });
    setShowForm(false);
    load();
  };

  const updateStatus = async (id: string, status: string) => {
    await api.mortgage.update(id, { status });
    load();
  };

  const toggleDoc = async (mortgageId: string, doc: MortgageDoc) => {
    await api.mortgage.updateDoc(mortgageId, doc.id, { uploaded: !doc.uploaded });
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mortgage Tracker</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">+ Add Lender</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Lender (e.g. AIB) *" value={form.lender} onChange={(e) => setForm({ ...form, lender: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Approval Amount (€)" type="number" value={form.approvalAmount} onChange={(e) => setForm({ ...form, approvalAmount: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Interest Rate (%)" type="number" step="0.01" value={form.interestRate} onChange={(e) => setForm({ ...form, interestRate: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Term (years)" type="number" value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Fixed Period (years)" type="number" value={form.fixedPeriod} onChange={(e) => setForm({ ...form, fixedPeriod: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="border rounded px-3 py-2 text-sm">
              {MORTGAGE_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
            </select>
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Save</button>
        </form>
      )}

      <div className="space-y-4">
        {mortgages.map((m) => {
          const daysLeft = m.approvalExpiry ? Math.ceil((new Date(m.approvalExpiry).getTime() - Date.now()) / 86400000) : null;
          const docs = m.documents || [];
          const uploaded = docs.filter((d) => d.uploaded).length;
          const required = docs.filter((d) => d.required).length;
          const requiredUploaded = docs.filter((d) => d.required && d.uploaded).length;
          const isExpanded = expandedDocs === m.id;

          return (
            <div key={m.id} className="bg-white rounded-lg p-4 border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{m.lender}</h3>
                  {m.approvalAmount && <p className="text-emerald-700 font-semibold">€{m.approvalAmount.toLocaleString()}</p>}
                </div>
                <select value={m.status} onChange={(e) => updateStatus(m.id, e.target.value)} className="border rounded px-2 py-1 text-sm">
                  {MORTGAGE_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                {m.interestRate != null && <div><span className="text-gray-500">Rate:</span> {m.interestRate}%</div>}
                {m.term != null && <div><span className="text-gray-500">Term:</span> {m.term} years</div>}
                {m.fixedPeriod != null && <div><span className="text-gray-500">Fixed:</span> {m.fixedPeriod} years</div>}
                {m.monthlyRepayment != null && <div><span className="text-gray-500">Monthly:</span> €{m.monthlyRepayment.toLocaleString()}</div>}
                {daysLeft !== null && (
                  <div className={daysLeft < 30 ? "text-red-600 font-semibold" : ""}>
                    <span className="text-gray-500">Expires:</span> {daysLeft > 0 ? `${daysLeft} days` : "EXPIRED"}
                  </div>
                )}
              </div>

              {/* Central Bank Compliance (Gap 5) */}
              {limits && m.approvalAmount && (
                <div className="flex gap-3 text-xs mb-3">
                  <span className={m.approvalAmount <= limits.maxLTI ? "text-emerald-600" : "text-red-600"}>
                    {m.approvalAmount <= limits.maxLTI ? "✓" : "✗"} LTI ({limits.multiplier}×)
                  </span>
                  <span className="text-emerald-600">✓ LTV (90%)</span>
                  {m.approvalAmount > limits.maxLTI && <span className="text-orange-600">⚠ Exemption needed: €{(m.approvalAmount - limits.maxLTI).toLocaleString()} over limit</span>}
                </div>
              )}

              {/* Document Checklist */}
              {docs.length > 0 && (
                <div>
                  <button onClick={() => setExpandedDocs(isExpanded ? null : m.id)} className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-700">
                    <span>{isExpanded ? "▼" : "▶"}</span>
                    <span>Documents: {uploaded}/{docs.length} uploaded ({requiredUploaded}/{required} required)</span>
                    <div className="w-24 bg-gray-200 rounded-full h-1.5 ml-2">
                      <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(requiredUploaded / Math.max(required, 1)) * 100}%` }} />
                    </div>
                  </button>
                  {isExpanded && (
                    <div className="mt-3 space-y-1.5 pl-4">
                      {docs.map((d: MortgageDoc) => (
                        <label key={d.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <input type="checkbox" checked={d.uploaded} onChange={() => toggleDoc(m.id, d)} />
                          <span className={d.uploaded ? "line-through text-gray-400" : ""}>
                            {d.name}
                            {d.required && <span className="text-red-400 ml-1">*</span>}
                            {d.perPerson && <span className="text-gray-400 ml-1">(each person)</span>}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {mortgages.length === 0 && <p className="text-gray-500 text-sm">No mortgage applications tracked yet.</p>}
      </div>

      {/* Lender Comparison Table (Gap 4) */}
      {mortgages.length >= 2 && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <h3 className="font-semibold p-4 pb-2">Lender Comparison</h3>
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left p-3">Lender</th><th className="text-right p-3">Rate</th><th className="text-right p-3">Fixed</th><th className="text-right p-3">Monthly</th><th className="text-right p-3">Total Cost</th><th className="text-center p-3">LTI</th></tr></thead>
            <tbody>
              {mortgages.filter(m => m.approvalAmount && m.interestRate).map(m => {
                const monthly = m.monthlyRepayment || (m.approvalAmount && m.interestRate && m.term ? Math.round((m.approvalAmount * (m.interestRate / 100 / 12)) / (1 - Math.pow(1 + m.interestRate / 100 / 12, -(m.term * 12)))) : null);
                const totalCost = monthly && m.term ? monthly * m.term * 12 : null;
                const withinLTI = limits ? (m.approvalAmount || 0) <= limits.maxLTI : true;
                return (
                  <tr key={m.id} className="border-t">
                    <td className="p-3 font-medium">{m.lender}</td>
                    <td className="p-3 text-right">{m.interestRate}%</td>
                    <td className="p-3 text-right">{m.fixedPeriod ? `${m.fixedPeriod}yr` : "—"}</td>
                    <td className="p-3 text-right">{monthly ? `€${monthly.toLocaleString()}` : "—"}</td>
                    <td className="p-3 text-right">{totalCost ? `€${totalCost.toLocaleString()}` : "—"}</td>
                    <td className="p-3 text-center">{withinLTI ? <span className="text-emerald-600">✓</span> : <span className="text-red-600">✗</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
