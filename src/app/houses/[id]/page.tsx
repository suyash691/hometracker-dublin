"use client";
import { useEffect, useState, use } from "react";
import { api, type House, type Bid, type Estimate, type Media, type TotalCost, type Conveyancing, type Milestone, type BorrowingLimits, type BerImpactResult, type SnagRecord, type SurveyFindingRecord, type SellerIntelRecord, type NewBuildComplianceRecord, type JournalRecord } from "@/lib/api";
import { HOUSE_STATUSES } from "@/lib/types";
import type { ChecklistItem } from "@/lib/types";

const TABS_BASE = ["details", "bids", "checklist", "estimates", "media", "costs", "survey", "journal"] as const;
const SALE_AGREED_PLUS = ["sale_agreed", "conveyancing", "closing", "closed"];

export default function HouseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [house, setHouse] = useState<House | null>(null);
  const [tab, setTab] = useState<string>("details");
  const [bidForm, setBidForm] = useState({ amount: "", isOurs: true, notes: "" });
  const [estForm, setEstForm] = useState({ item: "", estimatedCostLow: "", estimatedCostHigh: "" });
  const [generating, setGenerating] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [editNotes, setEditNotes] = useState(false);
  const [notesVal, setNotesVal] = useState("");
  const [prosVal, setProsVal] = useState("");
  const [consVal, setConsVal] = useState("");
  const [totalCost, setTotalCost] = useState<TotalCost | null>(null);
  const [conv, setConv] = useState<Conveyancing | null>(null);
  const [maxBudget, setMaxBudget] = useState<number | null>(null);
  const [berImpact, setBerImpact] = useState<BerImpactResult | null>(null);
  const [solForm, setSolForm] = useState({ solicitorName: "", solicitorFirm: "", solicitorPhone: "", solicitorEmail: "" });
  const [editSol, setEditSol] = useState(false);
  const [aptForm, setAptForm] = useState({ managementCompany: "", annualServiceCharge: "", sinkingFundBalance: "", sinkingFundAdequacy: "healthy", parkingIncluded: false, storageIncluded: false });

  const load = () => {
    api.houses.get(id).then(h => { setHouse(h); setNotesVal(h.notes || ""); setProsVal(h.pros ? JSON.parse(h.pros).join("\n") : ""); setConsVal(h.cons ? JSON.parse(h.cons).join("\n") : ""); if (h.conveyancing) setConv(h.conveyancing); if (h.totalCostEstimate) setTotalCost(h.totalCostEstimate); });
    api.totalCost.get(id).then(setTotalCost).catch(() => {});
    api.conveyancing.get(id).then(setConv).catch(() => {});
    api.profile.get().then(p => { if (p) api.calculator.borrowing(p.grossIncome1, p.grossIncome2, p.isFirstTimeBuyer).then(l => setMaxBudget(l.maxPropertyPrice)); }).catch(() => {});
    api.berImpact.get(id).then(setBerImpact).catch(() => {});
  };
  useEffect(() => { load(); }, [id]);

  if (!house) return <div className="text-gray-500">Loading...</div>;

  const pros: string[] = house.pros ? JSON.parse(house.pros) : [];
  const cons: string[] = house.cons ? JSON.parse(house.cons) : [];
  const showLegal = SALE_AGREED_PLUS.includes(house.status);
  const isApt = house.propertyType === "apartment" || house.propertyType === "duplex";
  const tabs = [...TABS_BASE, ...(showLegal ? ["legal"] as const : []), ...(isApt ? ["apartment"] as const : []), ...(house.isNewBuild ? ["snagging", "compliance"] as const : []), ...(house.status === "bidding" || showLegal ? ["seller"] as const : [])];

  const addBid = async (e: React.FormEvent) => { e.preventDefault(); await api.bids.create(id, { amount: Number(bidForm.amount), isOurs: bidForm.isOurs, notes: bidForm.notes || undefined }); setBidForm({ amount: "", isOurs: true, notes: "" }); load(); };
  const syncBids = async () => { setSyncing(true); try { await api.bids.sync(id); load(); } catch (err) { alert(err instanceof Error ? err.message : "Sync failed"); } finally { setSyncing(false); } };
  const addEstimate = async (e: React.FormEvent) => { e.preventDefault(); await api.estimates.create(id, { item: estForm.item, estimatedCostLow: estForm.estimatedCostLow ? Number(estForm.estimatedCostLow) : undefined, estimatedCostHigh: estForm.estimatedCostHigh ? Number(estForm.estimatedCostHigh) : undefined }); setEstForm({ item: "", estimatedCostLow: "", estimatedCostHigh: "" }); load(); };
  const generateEstimates = async () => { setGenerating(true); try { await api.estimates.generate(id); load(); } catch (err) { alert(err instanceof Error ? err.message : "Failed"); } finally { setGenerating(false); } };
  const updateStatus = async (status: string) => { await api.houses.update(id, { status }); load(); };
  const saveNotes = async () => { await api.houses.update(id, { notes: notesVal, pros: JSON.stringify(prosVal.split("\n").filter(Boolean)), cons: JSON.stringify(consVal.split("\n").filter(Boolean)) }); setEditNotes(false); load(); };
  const createChecklist = async () => { await api.checklists.create(id); load(); };
  const toggleCL = async (cid: string, items: ChecklistItem[], idx: number) => { const u = [...items]; u[idx] = { ...u[idx], checked: !u[idx].checked }; await api.checklists.update(id, cid, { items: u }); load(); };
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { if (!e.target.files) return; for (const f of Array.from(e.target.files)) await api.media.upload(id, f, f.name.toLowerCase().includes("floor") ? "floorplan" : "photo"); load(); e.target.value = ""; };
  const initTotalCost = async () => { if (!house.askingPrice) return; await api.totalCost.update(id, { purchasePrice: house.askingPrice }); load(); };
  const initConv = async () => { await api.conveyancing.create(id); load(); };
  const updateMilestone = async (m: Milestone, status: string) => { await api.conveyancing.updateMilestone(id, m.id, { status }); load(); };

  const f = (n?: number | null) => n != null ? `€${n.toLocaleString()}` : "—";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div><h1 className="text-2xl font-bold">{house.address}</h1><p className="text-gray-500">{house.neighbourhood}{house.eircode && ` · ${house.eircode}`}</p></div>
        <div className="flex gap-2 items-center">
          <select value={house.status} onChange={e => updateStatus(e.target.value)} className="border rounded px-3 py-1.5 text-sm">
            {HOUSE_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
          {house.listingUrl && <a href={house.listingUrl} target="_blank" rel="noopener" className="text-sm text-blue-600 hover:underline">Listing ↗</a>}
          {house.offrUrl && <a href={house.offrUrl} target="_blank" rel="noopener" className="text-sm text-orange-600 hover:underline">Offr ↗</a>}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <SC label="Asking" value={f(house.askingPrice)} /><SC label="Current Bid" value={f(house.currentBid)} /><SC label="Beds/Baths" value={`${house.bedrooms || "?"} / ${house.bathrooms || "?"}`} /><SC label="BER" value={house.ber || "—"} /><SC label="Size" value={house.squareMetres ? `${house.squareMetres}m²` : "—"} />
      </div>

      {/* Affordability Bar (Gap 2) */}
      {maxBudget && house.askingPrice && (() => {
        const pct = Math.min((house.askingPrice / maxBudget) * 100, 100);
        const within = house.askingPrice <= maxBudget;
        return (
          <div className="bg-white rounded-lg p-3 border">
            <div className="flex justify-between text-sm mb-1">
              <span>{f(house.askingPrice)} / {f(maxBudget)} budget</span>
              <span className={within ? "text-emerald-600" : "text-red-600"}>{within ? "✓ Within your borrowing limits" : "✗ Exceeds your borrowing limits"}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${within ? "bg-emerald-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })()}

      <div className="flex gap-4 border-b overflow-x-auto">
        {tabs.map(t => <button key={t} onClick={() => setTab(t)} className={`pb-2 text-sm capitalize whitespace-nowrap ${tab === t ? "border-b-2 border-emerald-600 text-emerald-700 font-semibold" : "text-gray-500"}`}>{t}</button>)}
      </div>

      {/* DETAILS */}
      {tab === "details" && (
        <div className="space-y-4">
          {!editNotes ? (<>
            {(pros.length > 0 || cons.length > 0) && <div className="grid grid-cols-2 gap-4"><div className="bg-green-50 rounded-lg p-3"><h3 className="font-semibold text-green-800 text-sm mb-2">Pros</h3>{pros.map((p, i) => <div key={i} className="text-sm">✓ {p}</div>)}</div><div className="bg-red-50 rounded-lg p-3"><h3 className="font-semibold text-red-800 text-sm mb-2">Cons</h3>{cons.map((c, i) => <div key={i} className="text-sm">✗ {c}</div>)}</div></div>}
            {house.notes && <div className="bg-white rounded-lg p-4 border"><h3 className="font-semibold text-sm mb-2">Notes</h3><p className="text-sm text-gray-700 whitespace-pre-wrap">{house.notes}</p></div>}
            <button onClick={() => setEditNotes(true)} className="text-sm text-emerald-600 hover:underline">Edit notes / pros / cons</button>
          </>) : (
            <div className="space-y-3 bg-white p-4 rounded-lg border">
              <div><label className="text-sm font-semibold">Notes</label><textarea rows={4} value={notesVal} onChange={e => setNotesVal(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mt-1" /></div>
              <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-semibold text-green-700">Pros (one per line)</label><textarea rows={4} value={prosVal} onChange={e => setProsVal(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mt-1" /></div><div><label className="text-sm font-semibold text-red-700">Cons (one per line)</label><textarea rows={4} value={consVal} onChange={e => setConsVal(e.target.value)} className="w-full border rounded px-3 py-2 text-sm mt-1" /></div></div>
              <div className="flex gap-2"><button onClick={saveNotes} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Save</button><button onClick={() => setEditNotes(false)} className="text-sm text-gray-500">Cancel</button></div>
            </div>
          )}
        </div>
      )}

      {/* BIDS */}
      {tab === "bids" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <form onSubmit={addBid} className="flex gap-2 items-end flex-1">
              <input required type="number" placeholder="Amount (€)" value={bidForm.amount} onChange={e => setBidForm({ ...bidForm, amount: e.target.value })} className="border rounded px-3 py-2 text-sm w-32" />
              <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={bidForm.isOurs} onChange={e => setBidForm({ ...bidForm, isOurs: e.target.checked })} /> Ours</label>
              <input placeholder="Notes" value={bidForm.notes} onChange={e => setBidForm({ ...bidForm, notes: e.target.value })} className="border rounded px-3 py-2 text-sm flex-1" />
              <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Add Bid</button>
            </form>
            {house.offrUrl && <button onClick={syncBids} disabled={syncing} className="bg-orange-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50">{syncing ? "Syncing..." : "Sync Offr.io"}</button>}
          </div>
          {house.bids.map((b: Bid) => <div key={b.id} className={`p-3 rounded-lg border ${b.isOurs ? "bg-emerald-50 border-emerald-200" : "bg-white"}`}><div className="flex justify-between"><span className="font-semibold">{f(b.amount)}</span><span className="text-sm text-gray-500">{new Date(b.bidDate).toLocaleDateString("en-IE")}</span></div><div className="text-xs text-gray-500">{b.isOurs ? "Our bid" : "Competing"}{b.source === "offr_sync" && " (Offr.io)"}{b.notes && ` · ${b.notes}`}</div></div>)}
        </div>
      )}

      {/* CHECKLIST */}
      {tab === "checklist" && (
        <div className="space-y-4">
          {house.viewingChecklists.length === 0 ? <button onClick={createChecklist} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Create Viewing Checklist</button> :
            house.viewingChecklists.map(cl => { const items: ChecklistItem[] = JSON.parse(cl.items); const done = items.filter(i => i.checked).length; return (
              <div key={cl.id} className="bg-white rounded-lg border p-4"><div className="flex justify-between mb-3"><span className="text-sm text-gray-500">{done}/{items.length} completed</span><div className="w-32 bg-gray-200 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(done / items.length) * 100}%` }} /></div></div>
              <div className="space-y-2">{items.map((item, idx) => <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={item.checked} onChange={() => toggleCL(cl.id, items, idx)} /><span className={item.checked ? "line-through text-gray-400" : ""}>{item.name}</span></label>)}</div></div>
            ); })}
        </div>
      )}

      {/* ESTIMATES */}
      {tab === "estimates" && (
        <div className="space-y-4">
          <div className="flex gap-2 items-end">
            <form onSubmit={addEstimate} className="flex gap-2 items-end flex-1"><input required placeholder="Item" value={estForm.item} onChange={e => setEstForm({ ...estForm, item: e.target.value })} className="border rounded px-3 py-2 text-sm flex-1" /><input type="number" placeholder="Low (€)" value={estForm.estimatedCostLow} onChange={e => setEstForm({ ...estForm, estimatedCostLow: e.target.value })} className="border rounded px-3 py-2 text-sm w-28" /><input type="number" placeholder="High (€)" value={estForm.estimatedCostHigh} onChange={e => setEstForm({ ...estForm, estimatedCostHigh: e.target.value })} className="border rounded px-3 py-2 text-sm w-28" /><button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Add</button></form>
            <button onClick={generateEstimates} disabled={generating} className="bg-purple-600 text-white px-4 py-2 rounded text-sm disabled:opacity-50">{generating ? "Generating..." : "🤖 AI Estimate"}</button>
          </div>
          {house.renovationEstimates.length > 0 && <div className="bg-white rounded-lg border overflow-hidden"><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left p-3">Item</th><th className="text-right p-3">Low</th><th className="text-right p-3">High</th></tr></thead><tbody>{house.renovationEstimates.map((e: Estimate) => <tr key={e.id} className="border-t"><td className="p-3">{e.item}{e.notes && <div className="text-xs text-gray-400">{e.notes}</div>}</td><td className="p-3 text-right">{f(e.estimatedCostLow)}</td><td className="p-3 text-right">{f(e.estimatedCostHigh)}</td></tr>)}<tr className="border-t font-semibold bg-gray-50"><td className="p-3">Total</td><td className="p-3 text-right">{f(house.renovationEstimates.reduce((s, e) => s + (e.estimatedCostLow || 0), 0))}</td><td className="p-3 text-right">{f(house.renovationEstimates.reduce((s, e) => s + (e.estimatedCostHigh || 0), 0))}</td></tr></tbody></table></div>}
        </div>
      )}

      {/* MEDIA */}
      {tab === "media" && (
        <div className="space-y-4">
          <label className="inline-block bg-emerald-600 text-white px-4 py-2 rounded text-sm cursor-pointer hover:bg-emerald-700">📷 Upload Photos / Floorplans<input type="file" multiple accept="image/*,.pdf" onChange={handleUpload} className="hidden" /></label>
          {house.media.length > 0 ? <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{house.media.map((m: Media) => <div key={m.id} className="relative group">{m.type !== "document" ? <img src={api.media.url(m.filePath)} alt={m.caption || m.type} className="w-full h-40 object-cover rounded-lg border" /> : <div className="w-full h-40 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500">📄</div>}<div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"><button onClick={() => api.media.delete(id, m.id).then(load)} className="bg-red-500 text-white text-xs px-2 py-1 rounded">✕</button></div><div className="text-xs text-gray-400 capitalize mt-1">{m.type}</div></div>)}</div> : <p className="text-gray-500 text-sm">No photos yet.</p>}
        </div>
      )}

      {/* COSTS */}
      {tab === "costs" && (
        <div className="space-y-4">
          {!totalCost ? <button onClick={initTotalCost} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Calculate Total Costs</button> : (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold mb-3">Total Cost of Purchase</h3>
              <div className="space-y-1 text-sm">
                <Row label="Purchase Price" value={f(totalCost.purchasePrice)} bold />
                <div className="border-t my-2" />
                <Row label="Deposit (10%)" value={f(totalCost.deposit)} />
                <Row label="Stamp Duty" value={f(totalCost.stampDuty)} />
                <Row label="Legal Fees" value={f(totalCost.legalFees)} />
                <Row label="Land Registry" value={f(totalCost.landRegistryFees)} />
                <Row label="Survey" value={f(totalCost.surveyFee)} />
                <Row label="Valuation" value={f(totalCost.valuationFee)} />
                <Row label="Mortgage Protection" value={f(totalCost.mortgageProtection)} />
                <Row label="Home Insurance" value={f(totalCost.homeInsurance)} />
                <Row label="Moving Costs" value={f(totalCost.movingCosts)} />
                <div className="border-t my-2" />
                <Row label="Cash Needed at Closing" value={f(totalCost.cashNeededAtClosing || (totalCost.deposit + totalCost.stampDuty + totalCost.legalFees + totalCost.landRegistryFees + totalCost.surveyFee + totalCost.valuationFee))} bold />
              </div>
            </div>
          )}
          {/* Funding Stack (Gap 3) */}
          {totalCost && (() => {
            const mortgage = Math.round(totalCost.purchasePrice * 0.9);
            const deposit = totalCost.deposit;
            const items = [
              { source: "Mortgage (90%)", amount: mortgage, color: "bg-emerald-500" },
              { source: "Deposit (10%)", amount: deposit, color: "bg-blue-500" },
            ];
            return (
              <div className="bg-white rounded-lg border p-4">
                <h3 className="font-semibold mb-3">Funding Stack</h3>
                <div className="w-full h-6 rounded-full overflow-hidden flex">
                  {items.map(i => <div key={i.source} className={`${i.color} h-full`} style={{ width: `${(i.amount / totalCost.purchasePrice) * 100}%` }} />)}
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  {items.map(i => <div key={i.source} className="flex justify-between"><span>{i.source}</span><span>{f(i.amount)}</span></div>)}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* LEGAL / CONVEYANCING */}
      {tab === "legal" && (
        <div className="space-y-4">
          {!conv ? <button onClick={initConv} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Start Conveyancing Tracker</button> : (<>
            {/* Solicitor Details (Gap 7) */}
            {!editSol ? (
              <div className="bg-white rounded-lg border p-3 flex justify-between items-center">
                <div className="text-sm">{conv.solicitorName ? <><span className="font-medium">{conv.solicitorName}</span>{conv.solicitorFirm && `, ${conv.solicitorFirm}`}{conv.solicitorPhone && <span className="text-gray-500 ml-2">📞 {conv.solicitorPhone}</span>}</> : <span className="text-gray-400">No solicitor details yet</span>}</div>
                <button onClick={() => { setSolForm({ solicitorName: conv.solicitorName || "", solicitorFirm: conv.solicitorFirm || "", solicitorPhone: conv.solicitorPhone || "", solicitorEmail: conv.solicitorEmail || "" }); setEditSol(true); }} className="text-sm text-emerald-600 hover:underline">Edit</button>
              </div>
            ) : (
              <div className="bg-white rounded-lg border p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Solicitor Name" value={solForm.solicitorName} onChange={e => setSolForm({ ...solForm, solicitorName: e.target.value })} className="border rounded px-2 py-1.5 text-sm" />
                  <input placeholder="Firm" value={solForm.solicitorFirm} onChange={e => setSolForm({ ...solForm, solicitorFirm: e.target.value })} className="border rounded px-2 py-1.5 text-sm" />
                  <input placeholder="Phone" value={solForm.solicitorPhone} onChange={e => setSolForm({ ...solForm, solicitorPhone: e.target.value })} className="border rounded px-2 py-1.5 text-sm" />
                  <input placeholder="Email" value={solForm.solicitorEmail} onChange={e => setSolForm({ ...solForm, solicitorEmail: e.target.value })} className="border rounded px-2 py-1.5 text-sm" />
                </div>
                <div className="flex gap-2"><button onClick={async () => { await api.conveyancing.update(id, solForm); setEditSol(false); load(); }} className="bg-emerald-600 text-white px-3 py-1 rounded text-sm">Save</button><button onClick={() => setEditSol(false)} className="text-sm text-gray-500">Cancel</button></div>
              </div>
            )}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">{conv.milestones.filter(m => m.status === "completed").length}/{conv.milestones.length} completed</span>
                <div className="w-40 bg-gray-200 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(conv.milestones.filter(m => m.status === "completed").length / conv.milestones.length) * 100}%` }} /></div>
              </div>
              <div className="space-y-2">
                {conv.milestones.map(m => {
                  const icon = m.status === "completed" ? "✅" : m.status === "in_progress" ? "🔄" : m.status === "blocked" ? "🚫" : "⏳";
                  return (
                    <div key={m.id} className="flex items-start gap-2 text-sm">
                      <button onClick={() => updateMilestone(m, m.status === "completed" ? "pending" : m.status === "pending" ? "in_progress" : m.status === "in_progress" ? "completed" : "pending")} className="mt-0.5">{icon}</button>
                      <div className="flex-1">
                        <span className={m.status === "completed" ? "line-through text-gray-400" : ""}>{m.stepOrder}. {m.step}</span>
                        {m.completedDate && <span className="text-xs text-gray-400 ml-2">{new Date(m.completedDate).toLocaleDateString("en-IE")}</span>}
                        {m.blockerReason && <div className="text-xs text-red-500">⚠ {m.blockerReason}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 text-xs text-gray-400">Click status icon to cycle: ⏳ Pending → 🔄 In Progress → ✅ Done</div>
            </div>
          </>)}
        </div>
      )}

      {/* APARTMENT */}
      {tab === "apartment" && (
        <div className="space-y-4">
          {/* Apartment Fields Form (Gap 8) */}
          <div className="bg-white rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold">Apartment / OMC Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Management Company</label><input placeholder="e.g. Willows OMC Ltd" value={aptForm.managementCompany} onChange={e => setAptForm({ ...aptForm, managementCompany: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500">Annual Service Charge (€)</label><input type="number" value={aptForm.annualServiceCharge} onChange={e => setAptForm({ ...aptForm, annualServiceCharge: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500">Sinking Fund Balance (€)</label><input type="number" value={aptForm.sinkingFundBalance} onChange={e => setAptForm({ ...aptForm, sinkingFundBalance: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm mt-1" /></div>
              <div><label className="text-xs text-gray-500">Sinking Fund Health</label><select value={aptForm.sinkingFundAdequacy} onChange={e => setAptForm({ ...aptForm, sinkingFundAdequacy: e.target.value })} className="w-full border rounded px-2 py-1.5 text-sm mt-1"><option value="healthy">Healthy</option><option value="low">Low</option><option value="critical">Critical</option></select></div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={aptForm.parkingIncluded} onChange={e => setAptForm({ ...aptForm, parkingIncluded: e.target.checked })} /> Parking included</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={aptForm.storageIncluded} onChange={e => setAptForm({ ...aptForm, storageIncluded: e.target.checked })} /> Storage included</label>
            </div>
            <button onClick={async () => { await api.apartment.update(id, { managementCompany: aptForm.managementCompany || undefined, annualServiceCharge: aptForm.annualServiceCharge ? Number(aptForm.annualServiceCharge) : undefined, sinkingFundBalance: aptForm.sinkingFundBalance ? Number(aptForm.sinkingFundBalance) : undefined, sinkingFundAdequacy: aptForm.sinkingFundAdequacy, parkingIncluded: aptForm.parkingIncluded, storageIncluded: aptForm.storageIncluded }); load(); }} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Save Details</button>
          </div>
          {/* OMC Checklist */}
          {house.apartmentDetails?.omcChecklist && (() => {
            const items: { name: string; checked: boolean; notes: string }[] = JSON.parse(house.apartmentDetails.omcChecklist);
            return <div className="mt-4 space-y-2">{items.map((item, idx) => <label key={idx} className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={item.checked} onChange={async () => { const u = [...items]; u[idx] = { ...u[idx], checked: !u[idx].checked }; await api.apartment.update(id, { omcChecklist: JSON.stringify(u) }); load(); }} /><span className={item.checked ? "line-through text-gray-400" : ""}>{item.name}</span></label>)}</div>;
          })()}
          {!house.apartmentDetails && <button onClick={() => api.apartment.update(id, {}).then(load)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm">Initialize OMC Checklist</button>}
        </div>
      )}

      {/* SURVEY FINDINGS (Feature 3) */}
      {tab === "survey" && <SurveyTab houseId={id} findings={house.surveyFindings || []} reload={load} />}

      {/* SNAGGING (Feature 6) */}
      {tab === "snagging" && <SnaggingTab houseId={id} snags={house.snagItems || []} reload={load} />}

      {/* SELLER INTEL (Feature 10) */}
      {tab === "seller" && <SellerTab houseId={id} intel={house.sellerIntel} reload={load} />}

      {/* NEW BUILD COMPLIANCE (Feature 11) */}
      {tab === "compliance" && <ComplianceTab houseId={id} data={house.newBuildCompliance} reload={load} />}

      {/* JOURNAL (Feature 15) */}
      {tab === "journal" && <JournalTab houseId={id} address={house.address} />}

      {/* BER IMPACT (Feature 7) — shown on estimates tab */}
      {tab === "estimates" && berImpact && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mt-4">
          <h3 className="font-semibold text-blue-800 mb-2">🌡️ BER Energy Impact ({berImpact.ber})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div><span className="text-gray-500">Annual heating:</span> <span className="font-semibold">€{berImpact.estimatedAnnualHeating.toLocaleString()}</span></div>
            <div><span className="text-gray-500">Retrofit to B2:</span> <span className="font-semibold">€{berImpact.retrofitCostLow.toLocaleString()}–€{berImpact.retrofitCostHigh.toLocaleString()}</span></div>
            <div><span className="text-gray-500">SEAI grants:</span> <span className="font-semibold text-emerald-700">€{berImpact.seaiGrantsAvailable.toLocaleString()}</span></div>
            <div><span className="text-gray-500">10yr saving:</span> <span className="font-semibold text-emerald-700">€{berImpact.tenYearSaving.toLocaleString()}</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components for new tabs ───

function SurveyTab({ houseId, findings, reload }: { houseId: string; findings: SurveyFindingRecord[]; reload: () => void }) {
  const [form, setForm] = useState({ category: "functional", location: "", description: "", estimatedCostLow: "", estimatedCostHigh: "" });
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.surveyFindings.create(houseId, { ...form, estimatedCostLow: form.estimatedCostLow ? Number(form.estimatedCostLow) : undefined, estimatedCostHigh: form.estimatedCostHigh ? Number(form.estimatedCostHigh) : undefined });
    setForm({ category: "functional", location: "", description: "", estimatedCostLow: "", estimatedCostHigh: "" });
    reload();
  };
  const cats = { cosmetic: "bg-gray-100", functional: "bg-yellow-100", structural: "bg-orange-100", deal_breaker: "bg-red-100" };
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
      {findings.length > 0 && <div className="space-y-2">{findings.map(f => (
        <div key={f.id} className={`p-3 rounded-lg border text-sm ${cats[f.category as keyof typeof cats] || ""}`}>
          <div className="flex justify-between"><span className="font-medium">{f.description}</span><span className="text-xs capitalize">{f.category}</span></div>
          <div className="text-xs text-gray-500">{f.location}{f.estimatedCostLow ? ` · €${f.estimatedCostLow.toLocaleString()}–€${(f.estimatedCostHigh || 0).toLocaleString()}` : ""}</div>
        </div>
      ))}</div>}
      {findings.length > 0 && (() => { const structural = findings.filter(f => f.category === "structural" || f.category === "deal_breaker").length; return structural > 0 ? <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">⚠ {structural} structural/deal-breaker finding{structural > 1 ? "s" : ""} — consider renegotiating or walking away.</div> : null; })()}
    </div>
  );
}

function SnaggingTab({ houseId, snags, reload }: { houseId: string; snags: SnagRecord[]; reload: () => void }) {
  if (snags.length === 0) return <button onClick={() => api.snags.seed(houseId).then(reload)} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Load Default Snag List</button>;
  const rooms = [...new Set(snags.map(s => s.room))];
  const done = snags.filter(s => s.status === "fixed" || s.status === "accepted").length;
  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm"><span>{done}/{snags.length} resolved</span><div className="w-40 bg-gray-200 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(done / snags.length) * 100}%` }} /></div></div>
      {rooms.map(room => (
        <div key={room} className="bg-white rounded-lg border p-3">
          <h4 className="font-semibold text-sm mb-2">{room}</h4>
          <div className="space-y-1">{snags.filter(s => s.room === room).map(s => (
            <div key={s.id} className="flex items-center gap-2 text-sm">
              <select value={s.status} onChange={e => api.snags.update(houseId, s.id, { status: e.target.value }).then(reload)} className="border rounded px-1 py-0.5 text-xs w-28">
                <option value="identified">Identified</option><option value="reported_to_builder">Reported</option><option value="fixed">Fixed</option><option value="accepted">Accepted</option>
              </select>
              <span className={s.status === "fixed" || s.status === "accepted" ? "line-through text-gray-400" : ""}>{s.description}</span>
            </div>
          ))}</div>
        </div>
      ))}
    </div>
  );
}

function SellerTab({ houseId, intel, reload }: { houseId: string; intel?: SellerIntelRecord | null; reload: () => void }) {
  const [form, setForm] = useState({ inChain: intel?.inChain ?? false, isProbate: intel?.isProbate ?? false, solicitorAppointed: intel?.solicitorAppointed ?? false, motivationLevel: intel?.motivationLevel || "unknown", timelineExpectation: intel?.timelineExpectation || "", reasonForSelling: intel?.reasonForSelling || "", notes: intel?.notes || "" });
  const save = async () => { await api.sellerIntel.update(houseId, form); reload(); };
  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <h3 className="font-semibold">Seller Intelligence</h3>
      <p className="text-sm text-gray-500">Ask the agent these questions before committing to a bid:</p>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.inChain} onChange={e => setForm({ ...form, inChain: e.target.checked })} /> Seller is in a chain</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.isProbate} onChange={e => setForm({ ...form, isProbate: e.target.checked })} /> Probate sale</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={form.solicitorAppointed} onChange={e => setForm({ ...form, solicitorAppointed: e.target.checked })} /> Seller&apos;s solicitor appointed</label>
        <select value={form.motivationLevel} onChange={e => setForm({ ...form, motivationLevel: e.target.value })} className="border rounded px-2 py-1.5"><option value="unknown">Motivation: Unknown</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
        <input placeholder="Timeline expectation" value={form.timelineExpectation} onChange={e => setForm({ ...form, timelineExpectation: e.target.value })} className="border rounded px-2 py-1.5" />
        <input placeholder="Reason for selling" value={form.reasonForSelling} onChange={e => setForm({ ...form, reasonForSelling: e.target.value })} className="border rounded px-2 py-1.5" />
      </div>
      <textarea placeholder="Additional notes..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full border rounded px-3 py-2 text-sm" rows={2} />
      <button onClick={save} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Save</button>
    </div>
  );
}

function ComplianceTab({ houseId, data, reload }: { houseId: string; data?: NewBuildComplianceRecord | null; reload: () => void }) {
  const [form, setForm] = useState({ warrantyProvider: data?.warrantyProvider || "", warrantyRegistrationNo: data?.warrantyRegistrationNo || "", bcarCommencementNotice: data?.bcarCommencementNotice ?? false, assignedCertifier: data?.assignedCertifier || "", certOfCompliance: data?.certOfCompliance ?? false });
  const save = async () => { await api.newBuildCompliance.update(houseId, form); reload(); };
  return (
    <div className="bg-white rounded-lg border p-4 space-y-3">
      <h3 className="font-semibold">HomeBond / BCAR Compliance</h3>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div><label className="text-xs text-gray-500">Warranty Provider</label><select value={form.warrantyProvider} onChange={e => setForm({ ...form, warrantyProvider: e.target.value })} className="w-full border rounded px-2 py-1.5 mt-1"><option value="">Select...</option><option value="homebond">HomeBond</option><option value="blp">BLP Insurance</option><option value="premier">Premier Guarantee</option><option value="none">None</option></select></div>
        <div><label className="text-xs text-gray-500">Registration No.</label><input value={form.warrantyRegistrationNo} onChange={e => setForm({ ...form, warrantyRegistrationNo: e.target.value })} className="w-full border rounded px-2 py-1.5 mt-1" /></div>
        <div><label className="text-xs text-gray-500">Assigned Certifier</label><input value={form.assignedCertifier} onChange={e => setForm({ ...form, assignedCertifier: e.target.value })} className="w-full border rounded px-2 py-1.5 mt-1" /></div>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.bcarCommencementNotice} onChange={e => setForm({ ...form, bcarCommencementNotice: e.target.checked })} /> BCAR Commencement Notice lodged</label>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.certOfCompliance} onChange={e => setForm({ ...form, certOfCompliance: e.target.checked })} /> Certificate of Compliance on Completion</label>
      <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">⚠ HomeBond covers structural defects only (10 years). Cosmetic snags are NOT covered — use the Snagging tab.</div>
      <button onClick={save} className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Save</button>
    </div>
  );
}

function JournalTab({ houseId, address }: { houseId: string; address: string }) {
  const [entries, setEntries] = useState<JournalRecord[]>([]);
  const [content, setContent] = useState("");
  const [gutRating, setGutRating] = useState(0);
  useEffect(() => { api.journal.list(houseId).then(setEntries); }, [houseId]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.journal.create({ houseId, type: gutRating > 0 ? "viewing_reaction" : "freeform", gutRating: gutRating || undefined, content });
    setContent(""); setGutRating(0);
    api.journal.list(houseId).then(setEntries);
  };
  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="bg-white rounded-lg border p-4 space-y-3">
        <div className="flex gap-2 items-center"><span className="text-sm text-gray-500">Gut feeling:</span>{[1,2,3,4,5].map(n => <button key={n} type="button" onClick={() => setGutRating(n)} className={`text-xl ${n <= gutRating ? "text-amber-500" : "text-gray-300"}`}>★</button>)}</div>
        <textarea required placeholder={`How do you feel about ${address}?`} value={content} onChange={e => setContent(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" rows={3} />
        <button type="submit" className="bg-amber-500 text-white px-4 py-2 rounded text-sm">Save Entry</button>
      </form>
      {entries.map(e => (
        <div key={e.id} className="bg-white rounded-lg border p-3 text-sm">
          {e.gutRating && <div className="text-amber-500 mb-1">{"★".repeat(e.gutRating)}{"☆".repeat(5 - e.gutRating)}</div>}
          <p className="text-gray-700">{e.content}</p>
          <div className="text-xs text-gray-400 mt-1">{new Date(e.createdAt).toLocaleString("en-IE")}</div>
        </div>
      ))}
    </div>
  );
}

function SC({ label, value }: { label: string; value: string }) {
  return <div className="bg-white rounded-lg p-3 border text-center"><div className="text-xs text-gray-500">{label}</div><div className="font-semibold">{value}</div></div>;
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-semibold" : ""}`}><span>{label}</span><span>{value}</span></div>;
}
