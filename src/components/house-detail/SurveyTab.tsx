"use client";
import { useState } from "react";
import { api, type SurveyFindingRecord } from "@/lib/api";

const CATS: Record<string, string> = { cosmetic: "bg-gray-100", functional: "bg-yellow-100", structural: "bg-orange-100", deal_breaker: "bg-red-100" };

export default function SurveyTab({ houseId, findings, reload }: { houseId: string; findings: SurveyFindingRecord[]; reload: () => void }) {
  const [form, setForm] = useState({ category: "functional", location: "", description: "", estimatedCostLow: "", estimatedCostHigh: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.surveyFindings.create(houseId, { ...form, estimatedCostLow: form.estimatedCostLow ? Number(form.estimatedCostLow) : undefined, estimatedCostHigh: form.estimatedCostHigh ? Number(form.estimatedCostHigh) : undefined });
    setForm({ category: "functional", location: "", description: "", estimatedCostLow: "", estimatedCostHigh: "" });
    reload();
  };
  const structural = findings.filter(f => f.category === "structural" || f.category === "deal_breaker").length;
  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="flex gap-2 flex-wrap items-end">
        <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="border rounded px-2 py-2 text-sm">
          <option value="cosmetic">Cosmetic</option><option value="functional">Functional</option><option value="structural">Structural</option><option value="deal_breaker">Deal Breaker</option>
        </select>
        <input required placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="border rounded px-3 py-2 text-sm" />
        <input required placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border rounded px-3 py-2 text-sm flex-1" />
        <input type="number" placeholder="Low €" value={form.estimatedCostLow} onChange={e => setForm({ ...form, estimatedCostLow: e.target.value })} className="border rounded px-2 py-2 text-sm w-24" />
        <input type="number" placeholder="High €" value={form.estimatedCostHigh} onChange={e => setForm({ ...form, estimatedCostHigh: e.target.value })} className="border rounded px-2 py-2 text-sm w-24" />
        <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Add</button>
      </form>
      {findings.map(f => (
        <div key={f.id} className={`p-3 rounded-lg border text-sm ${CATS[f.category] || ""}`}>
          <div className="flex justify-between"><span className="font-medium">{f.description}</span><span className="text-xs capitalize">{f.category}</span></div>
          <div className="text-xs text-gray-500">{f.location}{f.estimatedCostLow ? ` · €${f.estimatedCostLow.toLocaleString()}–€${(f.estimatedCostHigh || 0).toLocaleString()}` : ""}</div>
        </div>
      ))}
      {structural > 0 && <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠ {structural} structural/deal-breaker finding{structural > 1 ? "s" : ""} — consider renegotiating or walking away.</div>}
    </div>
  );
}
