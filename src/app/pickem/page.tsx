"use client";

import PageWrapper from "@/components/PageWrapper";
import { useDynastyStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import type { PickEmEntry } from "@/lib/types";
import {
  Target,
  Check,
  X,
  Trophy,
  TrendingUp,
  Flame,
  ChevronRight,
  BarChart3,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function PickEmPage() {
  const store = useDynastyStore();
  const [selectedWeek, setSelectedWeek] = useState(store.currentWeek);

  const teamMap = new Map(store.teams.map((t) => [t.id, t]));
  const weeks = Array.from(
    { length: Math.max(store.currentWeek, 15) },
    (_, i) => i + 1
  );

  // Games for the selected week that haven't been picked yet
  const weekGames = store.games.filter((g) => g.week === selectedWeek);
  const weekPicks = store.picks.filter((p) => p.week === selectedWeek);
  const pickedGameIds = new Set(weekPicks.map((p) => p.gameId));
  const unpickedGames = weekGames.filter((g) => !pickedGameIds.has(g.id));

  // Season-wide pick stats
  const allPicks = store.picks.filter((p) => p.actualWinnerId);
  const totalResolved = allPicks.length;
  const totalCorrect = allPicks.filter((p) => p.isCorrect).length;
  const winPct =
    totalResolved > 0
      ? ((totalCorrect / totalResolved) * 100).toFixed(1)
      : "0.0";

  // Weekly pick stats
  const weekResolvedPicks = weekPicks.filter((p) => p.actualWinnerId);
  const weekCorrect = weekResolvedPicks.filter((p) => p.isCorrect).length;

  // Streak calculation
  const streak = useMemo(() => {
    const sorted = [...allPicks].sort((a, b) =>
      b.week - a.week
    );
    let count = 0;
    let type: "W" | "L" | null = null;
    for (const pick of sorted) {
      if (type === null) {
        type = pick.isCorrect ? "W" : "L";
        count = 1;
      } else if ((pick.isCorrect && type === "W") || (!pick.isCorrect && type === "L")) {
        count++;
      } else {
        break;
      }
    }
    return { count, type };
  }, [allPicks]);

  const makePick = (gameId: string, homeTeamId: string, awayTeamId: string, pickedTeamId: string) => {
    const game = store.games.find((g) => g.id === gameId);
    if (!game) return;

    const actualWinnerId =
      game.homeScore > game.awayScore ? game.homeTeamId : game.awayTeamId;
    const isCorrect = pickedTeamId === actualWinnerId;

    const pick: PickEmEntry = {
      id: generateId(),
      week: selectedWeek,
      gameId,
      homeTeamId,
      awayTeamId,
      pickedTeamId,
      actualWinnerId,
      isCorrect,
    };
    store.addPick(pick);
  };

  return (
    <PageWrapper
      title="College GameDay Pick'Em"
      subtitle="Make your picks for each game and track your record all season"
    >
      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Season Record
          </p>
          <p className="text-2xl font-bold">
            {totalCorrect}-{totalResolved - totalCorrect}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Win %
          </p>
          <p className="text-2xl font-bold">{winPct}%</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Week {selectedWeek}
          </p>
          <p className="text-2xl font-bold">
            {weekCorrect}/{weekResolvedPicks.length}
          </p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
            Streak
          </p>
          <p
            className={`text-2xl font-bold ${
              streak.type === "W"
                ? "text-success"
                : streak.type === "L"
                ? "text-danger"
                : ""
            }`}
          >
            {streak.count > 0
              ? `${streak.count}${streak.type}`
              : "--"}
          </p>
        </div>
      </div>

      {/* Week Selector */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {weeks.map((w) => {
          const hasGames = store.games.some((g) => g.week === w);
          const wPicks = store.picks.filter((p) => p.week === w);
          const wCorrect = wPicks.filter((p) => p.isCorrect).length;
          return (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 transition-all relative ${
                w === selectedWeek
                  ? "bg-primary text-primary-foreground"
                  : hasGames
                  ? "bg-accent text-foreground hover:bg-accent/80"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Wk {w}
              {wPicks.length > 0 && (
                <span className="ml-1 text-xs opacity-70">
                  ({wCorrect}/{wPicks.length})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Unpicked Games - Make Your Picks */}
      {unpickedGames.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Make Your Picks
          </h2>
          <div className="space-y-3">
            {unpickedGames.map((game) => {
              const home = teamMap.get(game.homeTeamId);
              const away = teamMap.get(game.awayTeamId);
              if (!home || !away) return null;

              return (
                <div
                  key={game.id}
                  className="p-4 rounded-xl bg-card border border-border"
                >
                  <div className="flex items-center gap-2 mb-3">
                    {game.isRivalry && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs font-medium flex items-center gap-1">
                        <Flame className="w-3 h-3" /> Rivalry
                      </span>
                    )}
                    {game.isConferenceGame && (
                      <span className="px-2 py-0.5 rounded-full bg-accent text-foreground text-xs font-medium">
                        Conference
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {/* Away team pick button */}
                    <button
                      onClick={() =>
                        makePick(
                          game.id,
                          game.homeTeamId,
                          game.awayTeamId,
                          game.awayTeamId
                        )
                      }
                      className="flex-1 p-3 rounded-lg border-2 border-border hover:border-primary transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: away.primaryColor }}
                        >
                          {away.abbreviation.slice(0, 3)}
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {away.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {away.wins}-{away.losses} &middot; OVR:{" "}
                            {away.overallRating}
                          </p>
                        </div>
                      </div>
                    </button>

                    <span className="text-sm text-muted-foreground font-medium">
                      @
                    </span>

                    {/* Home team pick button */}
                    <button
                      onClick={() =>
                        makePick(
                          game.id,
                          game.homeTeamId,
                          game.awayTeamId,
                          game.homeTeamId
                        )
                      }
                      className="flex-1 p-3 rounded-lg border-2 border-border hover:border-primary transition-all group"
                    >
                      <div className="flex items-center gap-3 justify-end">
                        <div className="text-right">
                          <p className="font-semibold text-sm group-hover:text-primary transition-colors">
                            {home.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {home.wins}-{home.losses} &middot; OVR:{" "}
                            {home.overallRating}
                          </p>
                        </div>
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                          style={{ backgroundColor: home.primaryColor }}
                        >
                          {home.abbreviation.slice(0, 3)}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Resolved Picks */}
      {weekPicks.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Week {selectedWeek} Results
          </h2>
          <div className="space-y-3">
            {weekPicks.map((pick) => {
              const home = teamMap.get(pick.homeTeamId);
              const away = teamMap.get(pick.awayTeamId);
              const picked = teamMap.get(pick.pickedTeamId);
              const game = store.games.find((g) => g.id === pick.gameId);
              if (!home || !away || !picked || !game) return null;

              return (
                <div
                  key={pick.id}
                  className={`p-4 rounded-xl border ${
                    pick.isCorrect
                      ? "bg-success/5 border-success/30"
                      : "bg-danger/5 border-danger/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        pick.isCorrect
                          ? "bg-success/20 text-success"
                          : "bg-danger/20 text-danger"
                      }`}
                    >
                      {pick.isCorrect ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <X className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span
                          className={
                            game.awayScore > game.homeScore
                              ? "font-bold"
                              : "text-muted-foreground"
                          }
                        >
                          {away.name} {game.awayScore}
                        </span>
                        <span className="text-muted-foreground">@</span>
                        <span
                          className={
                            game.homeScore > game.awayScore
                              ? "font-bold"
                              : "text-muted-foreground"
                          }
                        >
                          {home.name} {game.homeScore}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        You picked:{" "}
                        <span
                          className={
                            pick.isCorrect ? "text-success" : "text-danger"
                          }
                        >
                          {picked.name}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Games */}
      {weekGames.length === 0 && (
        <div className="text-center py-16">
          <Target className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            No Games in Week {selectedWeek}
          </h3>
          <p className="text-muted-foreground">
            Add game results for this week on the{" "}
            <a href="/scores" className="text-primary hover:underline">
              Scores page
            </a>{" "}
            to start making picks.
          </p>
        </div>
      )}
    </PageWrapper>
  );
}
