"use client";

import PageWrapper from "@/components/PageWrapper";
import { useDynastyStore } from "@/lib/store";
import { generateId } from "@/lib/utils";
import type { GameResult, WeeklyPlayerStats } from "@/lib/types";
import {
  Plus,
  Trophy,
  ChevronDown,
  ChevronUp,
  Flame,
  Swords,
  Star,
  BarChart3,
  Zap,
} from "lucide-react";
import { useState } from "react";

export default function ScoresPage() {
  const store = useDynastyStore();
  const [showAddGame, setShowAddGame] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(store.currentWeek);
  const [showStatsFor, setShowStatsFor] = useState<string | null>(null);

  // Game form
  const [gameForm, setGameForm] = useState({
    week: store.currentWeek,
    homeTeamId: "",
    awayTeamId: "",
    homeScore: 0,
    awayScore: 0,
    isConferenceGame: false,
    isRivalry: false,
    isPlayoff: false,
    isBowl: false,
  });

  // Stats form
  const [statsForm, setStatsForm] = useState<{
    playerId: string;
    passYards: number;
    passTDs: number;
    interceptions: number;
    rushYards: number;
    rushTDs: number;
    recYards: number;
    recTDs: number;
    receptions: number;
    tackles: number;
    sacks: number;
    intDef: number;
  }>({
    playerId: "",
    passYards: 0,
    passTDs: 0,
    interceptions: 0,
    rushYards: 0,
    rushTDs: 0,
    recYards: 0,
    recTDs: 0,
    receptions: 0,
    tackles: 0,
    sacks: 0,
    intDef: 0,
  });

  const teamMap = new Map(store.teams.map((t) => [t.id, t]));
  const weekGames = store.games
    .filter((g) => g.week === selectedWeek)
    .sort((a, b) => {
      const aMargin = Math.abs(a.homeScore - a.awayScore);
      const bMargin = Math.abs(b.homeScore - b.awayScore);
      return aMargin - bMargin;
    });

  const weeks = Array.from(
    { length: Math.max(store.currentWeek, 15) },
    (_, i) => i + 1
  );

  const handleAddGame = () => {
    if (!gameForm.homeTeamId || !gameForm.awayTeamId) return;
    if (gameForm.homeTeamId === gameForm.awayTeamId) return;
    const game: GameResult = {
      id: generateId(),
      ...gameForm,
      highlights: [],
    };
    store.addGame(game);
    setGameForm({
      ...gameForm,
      homeTeamId: "",
      awayTeamId: "",
      homeScore: 0,
      awayScore: 0,
      isConferenceGame: false,
      isRivalry: false,
      isPlayoff: false,
      isBowl: false,
    });
    setShowAddGame(false);
  };

  const handleAddStats = (gameId: string, teamId: string) => {
    if (!statsForm.playerId) return;
    const stat: WeeklyPlayerStats = {
      ...statsForm,
      teamId,
      gameId,
      week: selectedWeek,
    };
    store.addWeeklyStats(stat);

    // Also update the player's season stats
    const team = teamMap.get(teamId);
    if (team) {
      const player = team.roster.find((p) => p.id === statsForm.playerId);
      if (player) {
        store.updatePlayer(teamId, {
          ...player,
          stats: {
            ...player.stats,
            gamesPlayed: player.stats.gamesPlayed + 1,
            passYards: player.stats.passYards + statsForm.passYards,
            passTDs: player.stats.passTDs + statsForm.passTDs,
            interceptions: player.stats.interceptions + statsForm.interceptions,
            rushYards: player.stats.rushYards + statsForm.rushYards,
            rushTDs: player.stats.rushTDs + statsForm.rushTDs,
            recYards: player.stats.recYards + statsForm.recYards,
            recTDs: player.stats.recTDs + statsForm.recTDs,
            receptions: player.stats.receptions + statsForm.receptions,
            tackles: player.stats.tackles + statsForm.tackles,
            sacks: player.stats.sacks + statsForm.sacks,
            intDef: player.stats.intDef + statsForm.intDef,
          },
        });
      }
    }

    setStatsForm({
      playerId: "",
      passYards: 0,
      passTDs: 0,
      interceptions: 0,
      rushYards: 0,
      rushTDs: 0,
      recYards: 0,
      recTDs: 0,
      receptions: 0,
      tackles: 0,
      sacks: 0,
      intDef: 0,
    });
  };

  return (
    <PageWrapper
      title="Scores & Stats"
      subtitle="Log game results and player stats each week"
      actions={
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddGame(!showAddGame)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Game
          </button>
        </div>
      }
    >
      {/* Week Selector */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {weeks.map((w) => {
          const hasGames = store.games.some((g) => g.week === w);
          return (
            <button
              key={w}
              onClick={() => setSelectedWeek(w)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium shrink-0 transition-all ${
                w === selectedWeek
                  ? "bg-primary text-primary-foreground"
                  : hasGames
                  ? "bg-accent text-foreground hover:bg-accent/80"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Wk {w}
            </button>
          );
        })}
      </div>

      {/* Add Game Form */}
      {showAddGame && (
        <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Add Game Result</h3>
          {store.teams.length < 2 ? (
            <p className="text-sm text-muted-foreground">
              You need at least 2 teams to add a game. Go to the{" "}
              <a href="/rosters" className="text-primary hover:underline">
                Rosters page
              </a>{" "}
              to add teams first.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Week
                  </label>
                  <select
                    value={gameForm.week}
                    onChange={(e) =>
                      setGameForm({
                        ...gameForm,
                        week: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {weeks.map((w) => (
                      <option key={w} value={w}>
                        Week {w}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Home Team
                  </label>
                  <select
                    value={gameForm.homeTeamId}
                    onChange={(e) =>
                      setGameForm({ ...gameForm, homeTeamId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select team...</option>
                    {store.teams.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} {t.mascot}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Away Team
                  </label>
                  <select
                    value={gameForm.awayTeamId}
                    onChange={(e) =>
                      setGameForm({ ...gameForm, awayTeamId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select team...</option>
                    {store.teams
                      .filter((t) => t.id !== gameForm.homeTeamId)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} {t.mascot}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Home Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={gameForm.homeScore}
                    onChange={(e) =>
                      setGameForm({
                        ...gameForm,
                        homeScore: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">
                    Away Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={gameForm.awayScore}
                    onChange={(e) =>
                      setGameForm({
                        ...gameForm,
                        awayScore: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameForm.isConferenceGame}
                    onChange={(e) =>
                      setGameForm({
                        ...gameForm,
                        isConferenceGame: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  Conference Game
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameForm.isRivalry}
                    onChange={(e) =>
                      setGameForm({
                        ...gameForm,
                        isRivalry: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Flame className="w-3 h-3 text-secondary" />
                  Rivalry Game
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameForm.isPlayoff}
                    onChange={(e) =>
                      setGameForm({
                        ...gameForm,
                        isPlayoff: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  <Trophy className="w-3 h-3 text-gold" />
                  Playoff Game
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={gameForm.isBowl}
                    onChange={(e) =>
                      setGameForm({
                        ...gameForm,
                        isBowl: e.target.checked,
                      })
                    }
                    className="rounded"
                  />
                  Bowl Game
                </label>
              </div>
              <button
                onClick={handleAddGame}
                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" />
                Save Game Result
              </button>
            </>
          )}
        </div>
      )}

      {/* Games List */}
      <div className="space-y-4">
        {weekGames.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Games in Week {selectedWeek}
            </h3>
            <p className="text-muted-foreground">
              Add game results for this week to start building storylines.
            </p>
          </div>
        ) : (
          weekGames.map((game) => {
            const home = teamMap.get(game.homeTeamId);
            const away = teamMap.get(game.awayTeamId);
            if (!home || !away) return null;

            const homeWon = game.homeScore > game.awayScore;
            const margin = Math.abs(game.homeScore - game.awayScore);
            const isUpset = homeWon
              ? away.overallRating > home.overallRating + 5
              : home.overallRating > away.overallRating + 5;

            return (
              <div
                key={game.id}
                className="rounded-xl bg-card border border-border overflow-hidden"
              >
                <div className="p-4">
                  {/* Game Tags */}
                  <div className="flex items-center gap-2 mb-3">
                    {isUpset && (
                      <span className="px-2 py-0.5 rounded-full bg-danger/20 text-danger text-xs font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" /> UPSET
                      </span>
                    )}
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
                    {game.isPlayoff && (
                      <span className="px-2 py-0.5 rounded-full bg-gold/20 text-gold text-xs font-medium flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Playoff
                      </span>
                    )}
                    {margin <= 3 && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                        Thriller
                      </span>
                    )}
                    {margin >= 28 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                        Blowout
                      </span>
                    )}
                  </div>

                  {/* Scoreboard */}
                  <div className="flex items-center gap-4">
                    {/* Away Team */}
                    <div
                      className={`flex-1 flex items-center gap-3 ${
                        !homeWon ? "" : "opacity-60"
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ backgroundColor: away.primaryColor }}
                      >
                        {away.abbreviation.slice(0, 3)}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`font-semibold text-sm truncate ${
                            !homeWon ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {away.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {away.wins}-{away.losses}
                        </p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-3 px-4">
                      <span
                        className={`text-2xl font-bold font-mono ${
                          !homeWon ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {game.awayScore}
                      </span>
                      <span className="text-muted-foreground text-sm">@</span>
                      <span
                        className={`text-2xl font-bold font-mono ${
                          homeWon ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {game.homeScore}
                      </span>
                    </div>

                    {/* Home Team */}
                    <div
                      className={`flex-1 flex items-center gap-3 justify-end ${
                        homeWon ? "" : "opacity-60"
                      }`}
                    >
                      <div className="min-w-0 text-right">
                        <p
                          className={`font-semibold text-sm truncate ${
                            homeWon ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {home.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {home.wins}-{home.losses}
                        </p>
                      </div>
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ backgroundColor: home.primaryColor }}
                      >
                        {home.abbreviation.slice(0, 3)}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Stats */}
                  <div className="mt-3 flex justify-center">
                    <button
                      onClick={() =>
                        setShowStatsFor(
                          showStatsFor === game.id ? null : game.id
                        )
                      }
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <BarChart3 className="w-3 h-3" />
                      {showStatsFor === game.id
                        ? "Hide Player Stats"
                        : "Add Player Stats"}
                      {showStatsFor === game.id ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Player Stats Section */}
                {showStatsFor === game.id && (
                  <div className="border-t border-border p-4 animate-fade-in">
                    <h4 className="text-sm font-semibold mb-3">
                      Add Player Stats for this Game
                    </h4>

                    {/* Existing stats for this game */}
                    {store.weeklyStats
                      .filter((s) => s.gameId === game.id)
                      .map((s, idx) => {
                        const team = teamMap.get(s.teamId);
                        const player = team?.roster.find(
                          (p) => p.id === s.playerId
                        );
                        return (
                          <div
                            key={idx}
                            className="mb-2 p-2 rounded-lg bg-muted text-xs"
                          >
                            <span className="font-medium">
                              {player?.name || "Unknown"}{" "}
                            </span>
                            <span className="text-muted-foreground">
                              ({team?.abbreviation})
                            </span>
                            {s.passYards > 0 && (
                              <span className="ml-2">
                                {s.passYards} pass yds, {s.passTDs} TD,{" "}
                                {s.interceptions} INT
                              </span>
                            )}
                            {s.rushYards > 0 && (
                              <span className="ml-2">
                                {s.rushYards} rush yds, {s.rushTDs} rush TD
                              </span>
                            )}
                            {s.recYards > 0 && (
                              <span className="ml-2">
                                {s.receptions} rec, {s.recYards} rec yds,{" "}
                                {s.recTDs} rec TD
                              </span>
                            )}
                            {s.tackles > 0 && (
                              <span className="ml-2">{s.tackles} tackles</span>
                            )}
                            {s.sacks > 0 && (
                              <span className="ml-2">{s.sacks} sacks</span>
                            )}
                          </div>
                        );
                      })}

                    {/* Add stats form */}
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">
                            Team
                          </label>
                          <select
                            className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            onChange={(e) => {
                              setStatsForm({
                                ...statsForm,
                                playerId: "",
                              });
                            }}
                            id={`team-select-${game.id}`}
                          >
                            <option value={game.homeTeamId}>
                              {home.name}
                            </option>
                            <option value={game.awayTeamId}>
                              {away.name}
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">
                            Player
                          </label>
                          <select
                            value={statsForm.playerId}
                            onChange={(e) =>
                              setStatsForm({
                                ...statsForm,
                                playerId: e.target.value,
                              })
                            }
                            className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Select player...</option>
                            {[
                              ...(home.roster || []),
                              ...(away.roster || []),
                            ].map((p) => (
                              <option key={p.id} value={p.id}>
                                #{p.number} {p.name} ({p.position})
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {[
                          {
                            label: "Pass Yds",
                            key: "passYards" as const,
                          },
                          { label: "Pass TD", key: "passTDs" as const },
                          { label: "INT", key: "interceptions" as const },
                          {
                            label: "Rush Yds",
                            key: "rushYards" as const,
                          },
                          { label: "Rush TD", key: "rushTDs" as const },
                          {
                            label: "Rec Yds",
                            key: "recYards" as const,
                          },
                          { label: "Rec TD", key: "recTDs" as const },
                          {
                            label: "Rec",
                            key: "receptions" as const,
                          },
                          { label: "Tackles", key: "tackles" as const },
                          { label: "Sacks", key: "sacks" as const },
                          { label: "INT (D)", key: "intDef" as const },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="block text-xs text-muted-foreground mb-1">
                              {field.label}
                            </label>
                            <input
                              type="number"
                              min={0}
                              value={statsForm[field.key]}
                              onChange={(e) =>
                                setStatsForm({
                                  ...statsForm,
                                  [field.key]:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => {
                          const teamSelect = document.getElementById(
                            `team-select-${game.id}`
                          ) as HTMLSelectElement;
                          const teamId = teamSelect?.value || game.homeTeamId;
                          handleAddStats(game.id, teamId);
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                      >
                        <Plus className="w-3 h-3" />
                        Save Player Stats
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </PageWrapper>
  );
}
