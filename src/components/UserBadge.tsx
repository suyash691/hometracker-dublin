"use client";
import { useEffect, useState } from "react";

export default function UserBadge() {
  const [user, setUser] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
  }, []);

  const login = async () => {
    if (!name.trim()) return;
    await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), password: "" }) });
    setUser(name.trim());
    setEditing(false);
  };

  if (editing) {
    return (
      <span className="flex items-center gap-1">
        <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && login()} placeholder="Your name" className="border rounded px-2 py-0.5 text-xs w-24" autoFocus />
        <button onClick={login} className="text-xs text-emerald-600">✓</button>
      </span>
    );
  }

  if (!user) {
    return <button onClick={() => setEditing(true)} className="text-xs text-orange-500 hover:underline">Set your name</button>;
  }

  return <button onClick={() => setEditing(true)} className="text-xs text-gray-500 hover:text-emerald-600" title="Click to switch user">👤 {user}</button>;
}
