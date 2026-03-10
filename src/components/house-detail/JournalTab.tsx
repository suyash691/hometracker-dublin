"use client";
import { useEffect, useState } from "react";
import { api, type JournalRecord } from "@/lib/api";

export default function JournalTab({ houseId, address }: { houseId: string; address: string }) {
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
