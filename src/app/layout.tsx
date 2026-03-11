import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import UserBadge from "@/components/UserBadge";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HomeTracker — Dublin House Buying Companion",
  description: "Track your Dublin house hunt",
  viewport: "width=device-width, initial-scale=1",
};

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/houses", label: "Houses" },
  { href: "/actions", label: "Actions" },
  { href: "/mortgage", label: "Mortgage" },
  { href: "/schemes", label: "Schemes" },
  { href: "/profile", label: "Profile" },
  { href: "/journal", label: "Journal" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <nav className="bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg text-emerald-700">🏠 HomeTracker</span>
            <UserBadge />
          </div>
          </div>
          <div className="flex gap-3 mt-2 overflow-x-auto pb-1 -mx-1 px-1">
            {NAV.map(n => (
              <Link key={n.href} href={n.href} className="text-sm text-gray-600 hover:text-emerald-700 whitespace-nowrap min-h-[44px] flex items-center">
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
        <main className="max-w-6xl mx-auto p-4 md:p-6">{children}</main>
      </body>
    </html>
  );
}
