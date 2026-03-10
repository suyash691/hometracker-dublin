"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

export default function LoginPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.auth.login(name, password);
      router.push("/");
    } catch {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <form onSubmit={submit} className="bg-white p-8 rounded-lg border shadow-sm w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-center text-emerald-700">🏠 HomeTracker</h1>
        <p className="text-sm text-gray-500 text-center">Sign in to track your Dublin house hunt</p>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        <input type="password" placeholder="Password (if set)" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" />
        <button type="submit" className="w-full bg-emerald-600 text-white py-2 rounded text-sm hover:bg-emerald-700">Sign In</button>
      </form>
    </div>
  );
}
