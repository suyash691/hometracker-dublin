import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = { title: "HomeTracker — Dublin House Buying Companion", description: "Track your Dublin house hunt" };

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/houses", label: "Houses" },
  { href: "/actions", label: "Actions" },
  { href: "/mortgage", label: "Mortgage" },
  { href: "/schemes", label: "Schemes" },
  { href: "/profile", label: "Profile" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <nav className="bg-white border-b px-6 py-3 flex items-center gap-6">
          <span className="font-bold text-lg text-emerald-700">🏠 HomeTracker</span>
          {NAV.map(n => <Link key={n.href} href={n.href} className="text-sm text-gray-600 hover:text-emerald-700">{n.label}</Link>)}
        </nav>
        <main className="max-w-6xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
