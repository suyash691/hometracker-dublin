"use client";
import { useState } from "react";
import { api, type SellerIntelRecord } from "@/lib/api";

export default function SellerTab({ houseId, intel, reload }: { houseId: string; intel?: SellerIntelRecord | null; reload: () => void }) {
  const [form, setForm] = useState({ inChain: intel?.inChain ?? false, isProbate: intel?.isProbate ?? false, solicitorAppointed: intel?.solicitorAppointed ?? false, motivationLevel: intel?.motivationLevel || "unknown", timelineExpectation: intel?.timelineExpectation || "", reasonForSelling: intel?.reasonForSelling || "", notes: intel?.notes || "" });
  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <h3 className="font-semibold">Seller Intelligence</h3>
      <p className="text-sm text-gray-500">Ask the agent these questions before committing:</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.inChain} onChange={e => setForm({ ...form, inChain: e.target.checked })} /> Seller is in a chain</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isProbate} onChange={e => setForm({ ...form, isProbate: e.target.checked })} /> Probate sale</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.solicitorAppointed} onChange={e => setForm({ ...form, solicitorAppointed: e.target.checked })} /> Seller&apos;s solicitor appointed</label>
        <select value={form.motivationLevel} onChange={e => setForm({ ...form, motivationLevel: e.target.value })} className="border rounded px-2 py-1.5"><option value="unknown">Motivation: Unknown</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
        <input placeholder="Timeline" value={form.timelineExpectation} onChange={e => setForm({ ...form, timelineExpectation: e.target.value })} className="border rounded px-2 py-1.5" />
        <input placeholder="Reason for selling" value={form.reasonForSelling} onChange={e => setForm({ ...form, reasonForSelling: e.target.value })} className="border rounded px-2 py-1.5" />
      </div>
      <textarea placeholder="Notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" rows={2} />
      <button onClick={async () => { await api.sellerIntel.update(houseId, form); reload(); }} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Save</button>
    </div>
  );
}
