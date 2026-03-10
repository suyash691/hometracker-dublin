"use client";
import { useEffect, useState } from "react";
import { api, type ActionItem, type House } from "@/lib/api";
import { ACTION_CATEGORIES } from "@/lib/types";

export default function ActionsPage() {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", houseId: "", dueDate: "", assignedTo: "", category: "other" });

  const load = () => {
    api.actions.list().then(setActions);
    api.houses.list().then(setHouses);
  };
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.actions.create({
      title: form.title,
      description: form.description || undefined,
      houseId: form.houseId || undefined,
      dueDate: form.dueDate || undefined,
      assignedTo: form.assignedTo || undefined,
      category: form.category,
    });
    setForm({ title: "", description: "", houseId: "", dueDate: "", assignedTo: "", category: "other" });
    setShowForm(false);
    load();
  };

  const toggle = async (a: ActionItem) => {
    await api.actions.update(a.id, { status: a.status === "done" ? "todo" : "done" });
    load();
  };

  const todo = actions.filter((a) => a.status !== "done");
  const done = actions.filter((a) => a.status === "done");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Action Items</h1>
        <button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700">+ Add Action</button>
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-white p-4 rounded-lg border space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border rounded px-3 py-2 text-sm">
              {ACTION_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.houseId} onChange={(e) => setForm({ ...form, houseId: e.target.value })} className="border rounded px-3 py-2 text-sm">
              <option value="">General (no house)</option>
              {houses.map((h) => <option key={h.id} value={h.id}>{h.address}</option>)}
            </select>
            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Assigned to" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} className="border rounded px-3 py-2 text-sm" />
            <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border rounded px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded text-sm">Save</button>
        </form>
      )}

      <div className="space-y-2">
        {todo.map((a) => (
          <div key={a.id} className="bg-white rounded-lg p-3 border flex items-center gap-3">
            <input type="checkbox" checked={false} onChange={() => toggle(a)} className="w-4 h-4" />
            <div className="flex-1">
              <div className="font-medium text-sm">{a.title}</div>
              <div className="text-xs text-gray-500">
                {a.category !== "other" && <span className="capitalize">{a.category} · </span>}
                {a.house && <span>{a.house.address} · </span>}
                {a.assignedTo && <span>{a.assignedTo} · </span>}
                {a.dueDate && <span>Due {new Date(a.dueDate).toLocaleDateString("en-IE")}</span>}
              </div>
            </div>
            <button onClick={() => api.actions.delete(a.id).then(load)} className="text-red-400 hover:text-red-600 text-sm">✕</button>
          </div>
        ))}
      </div>

      {done.length > 0 && (
        <details className="text-sm">
          <summary className="text-gray-500 cursor-pointer">Completed ({done.length})</summary>
          <div className="space-y-2 mt-2">
            {done.map((a) => (
              <div key={a.id} className="bg-gray-50 rounded-lg p-3 border flex items-center gap-3 opacity-60">
                <input type="checkbox" checked onChange={() => toggle(a)} className="w-4 h-4" />
                <span className="line-through text-sm">{a.title}</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
