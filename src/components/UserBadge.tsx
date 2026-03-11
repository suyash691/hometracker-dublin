"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserBadge() {
  const [user, setUser] = useState<string | null>(null);
  const [names, setNames] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Get current user from cookie
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
    // Get partner names from profile
    fetch("/api/profile").then(r => r.json()).then(p => {
      if (p?.name1) setNames([p.name1, p.name2].filter(Boolean));
    }).catch(() => {});
  }, []);

  const switchUser = async (name: string) => {
    await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, password: "" }) });
    setUser(name);
    setOpen(false);
  };

  // No profile set up yet — prompt to create one
  if (names.length === 0) {
    return <button onClick={() => router.push("/profile")} className="text-xs text-orange-500 hover:underline">Set up profile →</button>;
  }

  // Profile exists but no user selected
  if (!user || !names.includes(user)) {
    return (
      <span className="flex gap-1">
        {names.map(n => (
          <button key={n} onClick={() => switchUser(n)} className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded hover:bg-emerald-200">{n}</button>
        ))}
      </span>
    );
  }

  // User selected — show name with dropdown to switch
  return (
    <span className="relative">
      <button onClick={() => setOpen(!open)} className="text-xs text-gray-500 hover:text-emerald-600">👤 {user} ▾</button>
      {open && (
        <span className="absolute top-6 left-0 bg-white border rounded shadow-md z-10">
          {names.filter(n => n !== user).map(n => (
            <button key={n} onClick={() => switchUser(n)} className="block px-3 py-1.5 text-xs hover:bg-gray-50 whitespace-nowrap">Switch to {n}</button>
          ))}
        </span>
      )}
    </span>
  );
}
