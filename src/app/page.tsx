"use client";

import PageWrapper from "@/components/PageWrapper";
import { useDynastyStore } from "@/lib/store";
import {
  Users,
  Trophy,
  Newspaper,
  Target,
  Mic,
  BarChart3,
  Settings,
  ChevronRight,
  Star,
  Calendar,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function Dashboard() {
  const store = useDynastyStore();
  const [nameInput, setNameInput] = useState(store.dynastyName);
  const [seasonInput, setSeasonInput] = useState(store.currentSeason);
  const [weekInput, setWeekInput] = useState(store.currentWeek);
  const [showSettings, setShowSettings] = useState(false);

  const userTeam = store.teams.find((t) => t.id === store.userTeamId);
  const latestArticles = [...store.articles]
    .sort((a, b) => b.week - a.week)
    .slice(0, 3);
  const totalGames = store.games.length;
  const totalPicks = store.picks.length;
  const correctPicks = store.picks.filter((p) => p.isCorrect).length;

  // Top performers
  const topPerformers = store.teams
    .flatMap((t) =>
      t.roster
        .filter((p) => p.isKeyPlayer)
        .map((p) => ({
          ...p,
          teamName: t.name,
          teamColor: t.primaryColor,
        }))
    )
    .sort(
      (a, b) =>
        b.stats.passTDs +
        b.stats.rushTDs +
        b.stats.recTDs -
        (a.stats.passTDs + a.stats.rushTDs + a.stats.recTDs)
    )
    .slice(0, 5);

  const quickLinks = [
    {
      href: "/rosters",
      label: "Manage Rosters",
      icon: Users,
      desc: "Add teams and key players",
      color: "bg-blue-500/10 text-blue-400",
    },
    {
      href: "/scores",
      label: "Enter Scores",
      icon: Trophy,
      desc: "Log weekly game results",
      color: "bg-amber-500/10 text-amber-400",
    },
    {
      href: "/news",
      label: "View News",
      icon: Newspaper,
      desc: "Read generated storylines",
      color: "bg-purple-500/10 text-purple-400",
    },
    {
      href: "/pickem",
      label: "GameDay Pick'Em",
      icon: Target,
      desc: "Make your weekly picks",
      color: "bg-green-500/10 text-green-400",
    },
    {
      href: "/podcast",
      label: "Podcast Hub",
      icon: Mic,
      desc: "Listen to weekly recaps",
      color: "bg-red-500/10 text-red-400",
    },
    {
      href: "/standings",
      label: "Standings",
      icon: BarChart3,
      desc: "Conference standings & rankings",
      color: "bg-cyan-500/10 text-cyan-400",
    },
  ];

  const handleSaveSettings = () => {
    store.setDynastyName(nameInput);
    store.setCurrentSeason(seasonInput);
    store.setCurrentWeek(weekInput);
    setShowSettings(false);
  };

  return (
    <PageWrapper
      title="Dynasty Dashboard"
      subtitle="Your CFB 26 dynasty command center"
      actions={
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-sm font-medium transition-colors"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      }
    >
      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Dynasty Settings</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Dynasty Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Current Season
              </label>
              <input
                type="number"
                value={seasonInput}
                onChange={(e) => setSeasonInput(parseInt(e.target.value) || 2026)}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Current Week
              </label>
              <input
                type="number"
                min={1}
                max={17}
                value={weekInput}
                onChange={(e) => setWeekInput(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Save Settings
            </button>
            <button
              onClick={() => {
                if (confirm("Are you sure? This will erase ALL dynasty data.")) {
                  store.resetDynasty();
                }
              }}
              className="px-4 py-2 rounded-lg bg-danger/20 text-danger text-sm font-medium hover:bg-danger/30 transition-colors"
            >
              Reset Dynasty
            </button>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Teams
            </span>
          </div>
          <p className="text-3xl font-bold">{store.teams.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Games
            </span>
          </div>
          <p className="text-3xl font-bold">{totalGames}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Newspaper className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Articles
            </span>
          </div>
          <p className="text-3xl font-bold">{store.articles.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Target className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wider">
              Pick&apos;Em
            </span>
          </div>
          <p className="text-3xl font-bold">
            {totalPicks > 0 ? `${correctPicks}/${totalPicks}` : "0"}
          </p>
        </div>
      </div>

      {/* User Team Spotlight */}
      {userTeam && (
        <div className="mb-8 p-6 rounded-xl bg-card border border-border card-hover">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: userTeam.primaryColor }}
            >
              {userTeam.abbreviation.slice(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {userTeam.name} {userTeam.mascot}
              </h3>
              <p className="text-sm text-muted-foreground">
                {userTeam.conference} &middot; {userTeam.wins}-
                {userTeam.losses} &middot; Overall: {userTeam.overallRating}
              </p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                Your Team
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <span>
              <strong className="text-foreground">{userTeam.roster.length}</strong>{" "}
              players on roster
            </span>
            <span>
              <strong className="text-foreground">
                {userTeam.roster.filter((p) => p.isKeyPlayer).length}
              </strong>{" "}
              key players
            </span>
          </div>
        </div>
      )}

      {/* Quick Links Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group p-4 rounded-xl bg-card border border-border card-hover flex items-center gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${link.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{link.label}</h3>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Two Column: Latest News + Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest Headlines */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-purple-400" />
            Latest Headlines
          </h2>
          {latestArticles.length > 0 ? (
            <div className="space-y-3">
              {latestArticles.map((article) => (
                <Link
                  key={article.id}
                  href="/news"
                  className={`block p-4 rounded-xl bg-card border-l-4 border border-border card-hover cat-${article.category}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      Week {article.week} &middot; {article.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm">{article.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {article.subtitle}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-card border border-border text-center">
              <Newspaper className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No news yet. Add teams, play games, and generate storylines!
              </p>
            </div>
          )}
        </div>

        {/* Top Performers */}
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-gold" />
            Heisman Watch
          </h2>
          {topPerformers.length > 0 ? (
            <div className="space-y-3">
              {topPerformers.map((player, i) => (
                <div
                  key={player.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border card-hover"
                >
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">
                      {player.name}{" "}
                      <span className="text-muted-foreground font-normal">
                        {player.position} &middot; {player.teamName}
                      </span>
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {player.stats.passTDs + player.stats.rushTDs + player.stats.recTDs} total TDs
                      &middot;{" "}
                      {(
                        player.stats.passYards +
                        player.stats.rushYards +
                        player.stats.recYards
                      ).toLocaleString()}{" "}
                      total yards
                    </p>
                  </div>
                  {i === 0 && (
                    <Trophy className="w-5 h-5 text-gold" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-card border border-border text-center">
              <Star className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Mark key players on your rosters to track the Heisman race!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Getting Started Guide */}
      {store.teams.length === 0 && (
        <div className="mt-8 p-6 rounded-xl bg-primary/5 border border-primary/20">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Getting Started with Your Dynasty
          </h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">
                1
              </span>
              <p>
                <strong className="text-foreground">Add your teams</strong> --
                Head to the Rosters page and add the teams in your dynasty.
                Set your user team and add key players you want to track.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">
                2
              </span>
              <p>
                <strong className="text-foreground">Log game results</strong>{" "}
                -- After each week, enter scores on the Scores page. Add
                player stats for standout performances.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">
                3
              </span>
              <p>
                <strong className="text-foreground">
                  Generate storylines
                </strong>{" "}
                -- Visit the News page and generate articles. The engine will
                create immersive news stories based on your results.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shrink-0">
                4
              </span>
              <p>
                <strong className="text-foreground">Make picks & enjoy</strong>{" "}
                -- Use the Pick&apos;Em section before each week, generate
                podcast recaps, and track standings all season long!
              </p>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
