"use client";
import { useEffect, useState } from "react";
import { api, type JournalRecord } from "@/lib/api";

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalRecord[]>([]);
  const [content, setContent] = useState("");
  useEffect(() => { api.journal.list().then(setEntries); }, []);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.journal.create({ type: "freeform", content });
    setContent("");
    api.journal.list().then(setEntries);
  };
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Journal</h1>
      <form onSubmit={submit} className="bg-white rounded-lg border p-4 space-y-3">
        <textarea required placeholder="How are you feeling about the house hunt?" value={content} onChange={e => setContent(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" rows={3} />
        <button type="submit" className="bg-amber-500 text-white px-4 py-2 rounded text-sm">Save Entry</button>
      </form>
      {entries.map(e => (
        <div key={e.id} className="bg-white rounded-lg border p-3 text-sm">
          {e.gutRating && <div className="text-amber-500 mb-1">{"★".repeat(e.gutRating)}{"☆".repeat(5 - e.gutRating)}</div>}
          <p className="text-gray-700">{e.content}</p>
          <div className="text-xs text-gray-400 mt-1">
            {e.house && <span className="text-emerald-600 mr-2">{e.house.address}</span>}
            {new Date(e.createdAt).toLocaleString("en-IE")}
            {e.type === "milestone" && <span className="ml-2 text-amber-600">🎉 Milestone</span>}
          </div>
        </div>
      ))}
      {entries.length === 0 && <p className="text-gray-500 text-sm">No journal entries yet. Start writing about your house hunt journey!</p>}
    </div>
  );
}
