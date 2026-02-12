"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/dynasty", label: "Dynasty", icon: "🏟️" },
  { href: "/roster", label: "Rosters", icon: "🏈" },
  { href: "/scoreboard", label: "Scoreboard", icon: "📋" },
  { href: "/news", label: "News", icon: "📰" },
  { href: "/pickem", label: "Pick'em", icon: "🎯" },
  { href: "/podcast", label: "Podcast", icon: "🎙️" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{ background: "var(--navy-light)", borderBottom: "2px solid var(--gold)" }}
      className="sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span
              className="text-xl font-black tracking-tight"
              style={{ color: "var(--gold)" }}
            >
              CFB DYNASTY
            </span>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: "var(--gold)", color: "var(--navy)" }}
            >
              26
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="no-underline px-3 py-2 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    color: isActive ? "var(--gold)" : "var(--gray-300)",
                    background: isActive ? "var(--navy)" : "transparent",
                  }}
                >
                  <span className="mr-1">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
