"use client";

import PageWrapper from "@/components/PageWrapper";
import { useDynastyStore } from "@/lib/store";
import { getWinPercentage, getRecordString } from "@/lib/utils";
import {
  BarChart3,
  Trophy,
  TrendingUp,
  Star,
  Shield,
  Crown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useMemo } from "react";

export default function StandingsPage() {
  const store = useDynastyStore();
  const [viewMode, setViewMode] = useState<"conference" | "overall" | "playoff">(
    "overall"
  );
  const [expandedConf, setExpandedConf] = useState<string | null>(null);

  // Overall rankings
  const rankedTeams = useMemo(() => {
    return [...store.teams]
      .filter((t) => t.wins + t.losses > 0)
      .sort((a, b) => {
        const aWinPct = a.wins / (a.wins + a.losses);
        const bWinPct = b.wins / (b.wins + b.losses);
        if (bWinPct !== aWinPct) return bWinPct - aWinPct;
        return b.overallRating - a.overallRating;
      });
  }, [store.teams]);

  // Conference standings
  const conferenceStandings = useMemo(() => {
    const conferences: Record<string, typeof store.teams> = {};
    for (const team of store.teams) {
      if (!conferences[team.conference]) {
        conferences[team.conference] = [];
      }
      conferences[team.conference].push(team);
    }
    // Sort each conference
    for (const conf of Object.keys(conferences)) {
      conferences[conf].sort((a, b) => {
        const aWinPct =
          a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
        const bWinPct =
          b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;
        if (bWinPct !== aWinPct) return bWinPct - aWinPct;
        return b.overallRating - a.overallRating;
      });
    }
    return conferences;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.teams]);

  // Playoff projection
  const playoffTeams = rankedTeams.slice(0, 12);
  const bubbleTeams = rankedTeams.slice(12, 16);

  return (
    <PageWrapper
      title="Standings & Rankings"
      subtitle={`Season ${store.currentSeason} - Week ${store.currentWeek}`}
    >
      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { key: "overall" as const, label: "Power Rankings", icon: TrendingUp },
          { key: "conference" as const, label: "Conference", icon: Shield },
          { key: "playoff" as const, label: "Playoff Picture", icon: Trophy },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === key
                ? "bg-primary text-primary-foreground"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {store.teams.length === 0 ? (
        <div className="text-center py-16">
          <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
          <p className="text-muted-foreground">
            Add teams on the{" "}
            <a href="/rosters" className="text-primary hover:underline">
              Rosters page
            </a>{" "}
            to see standings.
          </p>
        </div>
      ) : (
        <>
          {/* OVERALL RANKINGS */}
          {viewMode === "overall" && (
            <div className="rounded-xl bg-card border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h2 className="font-semibold flex items-center gap-2">
                  <Crown className="w-5 h-5 text-gold" />
                  Power Rankings
                </h2>
              </div>
              {rankedTeams.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Play some games to generate rankings.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                        <th className="text-left p-3 w-12">Rank</th>
                        <th className="text-left p-3">Team</th>
                        <th className="text-left p-3">Conference</th>
                        <th className="text-center p-3">Record</th>
                        <th className="text-center p-3">Win %</th>
                        <th className="text-center p-3">OVR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankedTeams.map((team, i) => (
                        <tr
                          key={team.id}
                          className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${
                            team.id === store.userTeamId
                              ? "bg-primary/5"
                              : ""
                          }`}
                        >
                          <td className="p-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                i < 4
                                  ? "bg-gold/20 text-gold"
                                  : i < 12
                                  ? "bg-primary/20 text-primary"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {i + 1}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0"
                                style={{
                                  backgroundColor: team.primaryColor,
                                }}
                              >
                                {team.abbreviation.slice(0, 2)}
                              </div>
                              <div>
                                <span className="font-semibold">
                                  {team.name} {team.mascot}
                                </span>
                                {team.id === store.userTeamId && (
                                  <Star className="w-3 h-3 text-gold inline ml-1" />
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-3 text-muted-foreground">
                            {team.conference}
                          </td>
                          <td className="p-3 text-center font-mono font-semibold">
                            {getRecordString(team.wins, team.losses)}
                          </td>
                          <td className="p-3 text-center font-mono">
                            {getWinPercentage(team.wins, team.losses)}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`font-mono font-bold ${
                                team.overallRating >= 90
                                  ? "text-gold"
                                  : team.overallRating >= 80
                                  ? "text-success"
                                  : "text-foreground"
                              }`}
                            >
                              {team.overallRating}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {/* Also show unranked (no games) */}
              {store.teams.filter((t) => t.wins + t.losses === 0).length >
                0 && (
                <div className="p-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">
                    Teams with no games played:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {store.teams
                      .filter((t) => t.wins + t.losses === 0)
                      .map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-1 rounded-md bg-muted text-xs"
                        >
                          {t.name}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CONFERENCE VIEW */}
          {viewMode === "conference" && (
            <div className="space-y-4">
              {Object.entries(conferenceStandings)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([conf, teams]) => {
                  const isExpanded = expandedConf === conf || expandedConf === null;
                  return (
                    <div
                      key={conf}
                      className="rounded-xl bg-card border border-border overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpandedConf(
                            expandedConf === conf ? null : conf
                          )
                        }
                        className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-primary" />
                          <h3 className="font-semibold">{conf}</h3>
                          <span className="text-sm text-muted-foreground">
                            {teams.length} teams
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                                <th className="text-left p-3 w-12">#</th>
                                <th className="text-left p-3">Team</th>
                                <th className="text-center p-3">Record</th>
                                <th className="text-center p-3">Win %</th>
                                <th className="text-center p-3">OVR</th>
                              </tr>
                            </thead>
                            <tbody>
                              {teams.map((team, i) => (
                                <tr
                                  key={team.id}
                                  className={`border-b border-border/50 hover:bg-muted/50 ${
                                    team.id === store.userTeamId
                                      ? "bg-primary/5"
                                      : ""
                                  }`}
                                >
                                  <td className="p-3 text-muted-foreground">
                                    {i + 1}
                                  </td>
                                  <td className="p-3">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-6 h-6 rounded flex items-center justify-center text-white font-bold text-[10px] shrink-0"
                                        style={{
                                          backgroundColor:
                                            team.primaryColor,
                                        }}
                                      >
                                        {team.abbreviation.slice(0, 2)}
                                      </div>
                                      <span className="font-medium">
                                        {team.name}
                                      </span>
                                      {team.id === store.userTeamId && (
                                        <Star className="w-3 h-3 text-gold" />
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3 text-center font-mono font-semibold">
                                    {getRecordString(
                                      team.wins,
                                      team.losses
                                    )}
                                  </td>
                                  <td className="p-3 text-center font-mono">
                                    {getWinPercentage(
                                      team.wins,
                                      team.losses
                                    )}
                                  </td>
                                  <td className="p-3 text-center font-mono">
                                    {team.overallRating}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          )}

          {/* PLAYOFF PICTURE */}
          {viewMode === "playoff" && (
            <div className="space-y-6">
              {playoffTeams.length < 4 ? (
                <div className="text-center py-16">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Not Enough Data
                  </h3>
                  <p className="text-muted-foreground">
                    Play more games to generate a playoff projection.
                  </p>
                </div>
              ) : (
                <>
                  {/* Bye Seeds */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-gold" />
                      First-Round Byes (Seeds 1-4)
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {playoffTeams.slice(0, 4).map((team, i) => (
                        <div
                          key={team.id}
                          className="p-4 rounded-xl bg-card border-2 border-gold/30 card-hover"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-gold/20 text-gold flex items-center justify-center font-bold text-sm">
                              {i + 1}
                            </div>
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                              style={{
                                backgroundColor: team.primaryColor,
                              }}
                            >
                              {team.abbreviation.slice(0, 3)}
                            </div>
                          </div>
                          <h3 className="font-bold">
                            {team.name} {team.mascot}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {team.conference} &middot;{" "}
                            {getRecordString(team.wins, team.losses)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* First Round Matchups */}
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      First-Round Games (Seeds 5-12)
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        [4, 11],
                        [5, 10],
                        [6, 9],
                        [7, 8],
                      ].map(([hi, lo]) => {
                        const hiTeam = playoffTeams[hi];
                        const loTeam = playoffTeams[lo];
                        if (!hiTeam || !loTeam) return null;
                        return (
                          <div
                            key={`${hi}-${lo}`}
                            className="p-4 rounded-xl bg-card border border-border"
                          >
                            <div className="flex items-center gap-3 mb-3">
                              <div className="flex-1 flex items-center gap-2">
                                <span className="text-xs font-mono text-muted-foreground">
                                  ({hi + 1})
                                </span>
                                <div
                                  className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-[10px]"
                                  style={{
                                    backgroundColor: hiTeam.primaryColor,
                                  }}
                                >
                                  {hiTeam.abbreviation.slice(0, 3)}
                                </div>
                                <div>
                                  <p className="font-semibold text-sm">
                                    {hiTeam.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {getRecordString(
                                      hiTeam.wins,
                                      hiTeam.losses
                                    )}
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-bold text-muted-foreground">
                                vs
                              </span>
                              <div className="flex-1 flex items-center gap-2 justify-end">
                                <div className="text-right">
                                  <p className="font-semibold text-sm">
                                    {loTeam.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {getRecordString(
                                      loTeam.wins,
                                      loTeam.losses
                                    )}
                                  </p>
                                </div>
                                <div
                                  className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-[10px]"
                                  style={{
                                    backgroundColor: loTeam.primaryColor,
                                  }}
                                >
                                  {loTeam.abbreviation.slice(0, 3)}
                                </div>
                                <span className="text-xs font-mono text-muted-foreground">
                                  ({lo + 1})
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Bubble Teams */}
                  {bubbleTeams.length > 0 && (
                    <div>
                      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-warning" />
                        On the Bubble
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {bubbleTeams.map((team, i) => (
                          <div
                            key={team.id}
                            className="p-4 rounded-xl bg-card border border-border border-dashed"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-mono text-muted-foreground">
                                #{playoffTeams.length + i + 1}
                              </span>
                              <div
                                className="w-8 h-8 rounded flex items-center justify-center text-white font-bold text-[10px]"
                                style={{
                                  backgroundColor: team.primaryColor,
                                }}
                              >
                                {team.abbreviation.slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-sm">
                                  {team.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {getRecordString(team.wins, team.losses)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
