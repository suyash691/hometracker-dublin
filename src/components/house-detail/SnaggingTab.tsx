"use client";
import { api, type SnagRecord } from "@/lib/api";

export default function SnaggingTab({ houseId, snags, reload }: { houseId: string; snags: SnagRecord[]; reload: () => void }) {
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
