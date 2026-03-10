"use client";
import { useState } from "react";
import { api, type NewBuildComplianceRecord } from "@/lib/api";

export default function ComplianceTab({ houseId, data, reload }: { houseId: string; data?: NewBuildComplianceRecord | null; reload: () => void }) {
  const [form, setForm] = useState({ warrantyProvider: data?.warrantyProvider || "", warrantyRegistrationNo: data?.warrantyRegistrationNo || "", bcarCommencementNotice: data?.bcarCommencementNotice ?? false, assignedCertifier: data?.assignedCertifier || "", certOfCompliance: data?.certOfCompliance ?? false });
  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <h3 className="font-semibold">HomeBond / BCAR Compliance</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        <div><label className="text-xs text-gray-500">Warranty Provider</label><select value={form.warrantyProvider} onChange={e => setForm({ ...form, warrantyProvider: e.target.value })} className="w-full border rounded px-2 py-1.5 mt-1"><option value="">Select...</option><option value="homebond">HomeBond</option><option value="blp">BLP Insurance</option><option value="premier">Premier Guarantee</option><option value="none">None</option></select></div>
        <div><label className="text-xs text-gray-500">Registration No.</label><input value={form.warrantyRegistrationNo} onChange={e => setForm({ ...form, warrantyRegistrationNo: e.target.value })} className="w-full border rounded px-2 py-1.5 mt-1" /></div>
        <div><label className="text-xs text-gray-500">Assigned Certifier</label><input value={form.assignedCertifier} onChange={e => setForm({ ...form, assignedCertifier: e.target.value })} className="w-full border rounded px-2 py-1.5 mt-1" /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.bcarCommencementNotice} onChange={e => setForm({ ...form, bcarCommencementNotice: e.target.checked })} /> BCAR Commencement Notice lodged</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.certOfCompliance} onChange={e => setForm({ ...form, certOfCompliance: e.target.checked })} /> Certificate of Compliance on Completion</label>
      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">⚠ HomeBond covers structural defects only (10 years). Cosmetic snags are NOT covered.</div>
      <button onClick={async () => { await api.newBuildCompliance.update(houseId, form); reload(); }} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Save</button>
    </div>
  );
}
