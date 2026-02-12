"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Trophy,
  Newspaper,
  Target,
  Mic,
  BarChart3,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useDynastyStore } from "@/lib/store";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/rosters", label: "Rosters", icon: Users },
  { href: "/scores", label: "Scores & Stats", icon: Trophy },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/pickem", label: "Pick'Em", icon: Target },
  { href: "/podcast", label: "Podcast", icon: Mic },
  { href: "/standings", label: "Standings", icon: BarChart3 },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { dynastyName, currentSeason, currentWeek } = useDynastyStore();

  return (
    <>
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo / Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight gradient-text">
                CFB Dynasty
              </h1>
              <p className="text-xs text-muted-foreground -mt-0.5">
                Storyline Platform
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Season Info + Mobile Toggle */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{dynastyName}</p>
              <p className="text-xs text-muted-foreground">
                Season {currentSeason} &middot; Week {currentWeek}
              </p>
            </div>
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <nav className="absolute top-16 right-0 w-64 bg-card border-l border-border h-full animate-slide-in">
            <div className="p-4 space-y-1">
              <div className="pb-3 mb-3 border-b border-border sm:hidden">
                <p className="text-sm font-semibold">{dynastyName}</p>
                <p className="text-xs text-muted-foreground">
                  Season {currentSeason} &middot; Week {currentWeek}
                </p>
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
