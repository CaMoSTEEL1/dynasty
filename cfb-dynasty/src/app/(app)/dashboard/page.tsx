"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useDynasty } from "../../components/DynastyProvider";
import { Team, Game, NewsArticle, Podcast } from "../../lib/types";

export default function DashboardPage() {
  const { activeDynasty, dynasties, setActiveDynastyId } = useDynasty();
  const [teams, setTeams] = useState<Team[]>([]);
  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [latestPodcast, setLatestPodcast] = useState<Podcast | null>(null);
  const [pickemStats, setPickemStats] = useState<{ total_picks: number; correct_picks: number; incorrect_picks: number } | null>(null);

  const loadDashboardData = useCallback(async () => {
    if (!activeDynasty) return;
    const [teamsRes, gamesRes, newsRes, podcastRes, pickemRes] = await Promise.all([
      fetch(`/api/teams?dynasty_id=${activeDynasty.id}`),
      fetch(`/api/games?dynasty_id=${activeDynasty.id}&week=${activeDynasty.current_week}&season=${activeDynasty.season}`),
      fetch(`/api/news?dynasty_id=${activeDynasty.id}&limit=5`),
      fetch(`/api/podcasts?dynasty_id=${activeDynasty.id}`),
      fetch(`/api/pickem?dynasty_id=${activeDynasty.id}`),
    ]);

    setTeams(await teamsRes.json());
    setRecentGames(await gamesRes.json());
    setLatestNews(await newsRes.json());
    const podcasts = await podcastRes.json();
    setLatestPodcast(podcasts.length > 0 ? podcasts[0] : null);
    const pickemData = await pickemRes.json();
    setPickemStats(pickemData.stats || null);
  }, [activeDynasty]);

  useEffect(() => { loadDashboardData(); }, [loadDashboardData]);

  if (!activeDynasty) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="text-3xl font-black mb-4" style={{ color: "var(--gold)" }}>Welcome to CFB Dynasty</h1>
        <p className="text-lg mb-8" style={{ color: "var(--gray-400)" }}>
          Create your first dynasty to get started with storylines, news, and more.
        </p>
        <Link href="/dynasty" className="btn-primary text-lg px-8 py-3 no-underline">
          Create Your Dynasty
        </Link>
      </div>
    );
  }

  const userTeam = teams.find(t => t.is_user_team);
  const rankedTeams = teams.filter(t => t.ranking !== null).sort((a, b) => (a.ranking ?? 99) - (b.ranking ?? 99)).slice(0, 10);
  const completedGames = recentGames.filter(g => g.is_completed);

  return (
    <div className="animate-fade-in">
      {/* Dynasty Selector (if multiple) */}
      {dynasties.length > 1 && (
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-semibold" style={{ color: "var(--gray-400)" }}>Dynasty:</span>
          <select
            className="input-field w-auto"
            value={activeDynasty.id}
            onChange={(e) => setActiveDynastyId(e.target.value)}
          >
            {dynasties.map(d => (
              <option key={d.id} value={d.id}>{d.name} — {d.team_name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Hero Banner */}
      <div
        className="rounded-xl p-6 mb-8"
        style={{
          background: "linear-gradient(135deg, var(--navy-light) 0%, var(--navy-mid) 100%)",
          border: "1px solid var(--navy-mid)",
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "var(--gold)" }}>{activeDynasty.name}</h1>
            <p className="text-sm mt-1" style={{ color: "var(--gray-300)" }}>
              Coach {activeDynasty.coach_name} • {activeDynasty.team_name} • {activeDynasty.conference}
            </p>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="stat-number">{activeDynasty.season}</div>
              <div className="text-xs font-semibold" style={{ color: "var(--gray-400)" }}>SEASON</div>
            </div>
            <div>
              <div className="stat-number">{activeDynasty.current_week}</div>
              <div className="text-xs font-semibold" style={{ color: "var(--gray-400)" }}>WEEK</div>
            </div>
            {userTeam && (
              <div>
                <div className="stat-number">{userTeam.wins}-{userTeam.losses}</div>
                <div className="text-xs font-semibold" style={{ color: "var(--gray-400)" }}>RECORD</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/scoreboard" className="card text-center no-underline hover:border-[var(--gold)]">
              <span className="text-2xl">📋</span>
              <p className="font-bold text-sm mt-2" style={{ color: "var(--white)" }}>Log Scores</p>
            </Link>
            <Link href="/roster" className="card text-center no-underline hover:border-[var(--gold)]">
              <span className="text-2xl">🏈</span>
              <p className="font-bold text-sm mt-2" style={{ color: "var(--white)" }}>Manage Rosters</p>
            </Link>
            <Link href="/pickem" className="card text-center no-underline hover:border-[var(--gold)]">
              <span className="text-2xl">🎯</span>
              <p className="font-bold text-sm mt-2" style={{ color: "var(--white)" }}>Make Picks</p>
            </Link>
            <Link href="/news" className="card text-center no-underline hover:border-[var(--gold)]">
              <span className="text-2xl">📰</span>
              <p className="font-bold text-sm mt-2" style={{ color: "var(--white)" }}>Read News</p>
            </Link>
          </div>

          {/* This Week's Scores */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold" style={{ color: "var(--gold)" }}>
                Week {activeDynasty.current_week} Scoreboard
              </h2>
              <Link href="/scoreboard" className="text-sm no-underline" style={{ color: "var(--gold)" }}>
                View All →
              </Link>
            </div>
            {completedGames.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--gray-500)" }}>No games logged this week yet.</p>
            ) : (
              <div className="space-y-3">
                {completedGames.slice(0, 5).map((g) => {
                  const homeWon = (g.home_score ?? 0) > (g.away_score ?? 0);
                  return (
                    <div key={g.id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--navy-mid)" }}>
                      <div className="flex-1">
                        <span className="text-sm" style={{ color: homeWon ? "var(--gray-400)" : "var(--white)" }}>
                          {g.away_team_ranking ? `#${g.away_team_ranking} ` : ""}{g.away_team_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 px-4">
                        <span className="font-bold" style={{ color: !homeWon ? "var(--gold)" : "var(--gray-400)" }}>{g.away_score}</span>
                        <span className="text-xs" style={{ color: "var(--gray-500)" }}>—</span>
                        <span className="font-bold" style={{ color: homeWon ? "var(--gold)" : "var(--gray-400)" }}>{g.home_score}</span>
                      </div>
                      <div className="flex-1 text-right">
                        <span className="text-sm" style={{ color: !homeWon ? "var(--gray-400)" : "var(--white)" }}>
                          {g.home_team_ranking ? `#${g.home_team_ranking} ` : ""}{g.home_team_name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Latest News */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold" style={{ color: "var(--gold)" }}>Latest Headlines</h2>
              <Link href="/news" className="text-sm no-underline" style={{ color: "var(--gold)" }}>
                All News →
              </Link>
            </div>
            {latestNews.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--gray-500)" }}>No news yet. Log game results to generate stories.</p>
            ) : (
              <div className="space-y-3">
                {latestNews.map((article) => (
                  <div key={article.id} className="py-2" style={{ borderBottom: "1px solid var(--navy-mid)" }}>
                    <div className="flex items-center gap-2 mb-1">
                      {article.is_breaking ? <span className="badge badge-red">BREAKING</span> : null}
                      <span className="text-xs" style={{ color: "var(--gray-500)" }}>Week {article.week}</span>
                    </div>
                    <p className="font-bold text-sm" style={{ color: "var(--white)" }}>{article.title}</p>
                    <p className="text-xs" style={{ color: "var(--gray-400)" }}>{article.subtitle}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top 10 Rankings */}
          <div className="card">
            <h2 className="font-bold mb-4" style={{ color: "var(--gold)" }}>Top 10 Rankings</h2>
            {rankedTeams.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--gray-500)" }}>No ranked teams yet. Set rankings in Rosters.</p>
            ) : (
              <div className="space-y-2">
                {rankedTeams.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 py-1">
                    <span className="w-6 text-right font-bold text-sm" style={{ color: "var(--gold)" }}>{t.ranking}</span>
                    <div className="w-4 h-4 rounded" style={{ background: t.primary_color }} />
                    <span className="font-semibold text-sm flex-1" style={{ color: "var(--white)" }}>{t.name}</span>
                    <span className="text-xs" style={{ color: "var(--gray-400)" }}>{t.wins}-{t.losses}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pick'em Stats */}
          {pickemStats && pickemStats.total_picks > 0 && (
            <div className="card">
              <h2 className="font-bold mb-3" style={{ color: "var(--gold)" }}>Pick&apos;em Record</h2>
              <div className="flex items-center justify-between mb-3">
                <span className="stat-number text-xl">{pickemStats.correct_picks}-{pickemStats.incorrect_picks}</span>
                <span className="text-sm font-bold" style={{ color: "var(--gray-300)" }}>
                  {((pickemStats.correct_picks / (pickemStats.correct_picks + pickemStats.incorrect_picks)) * 100).toFixed(0)}%
                </span>
              </div>
              <Link href="/pickem" className="text-sm no-underline" style={{ color: "var(--gold)" }}>
                Make Picks →
              </Link>
            </div>
          )}

          {/* Latest Podcast */}
          {latestPodcast && (
            <div className="card">
              <h2 className="font-bold mb-3" style={{ color: "var(--gold)" }}>Latest Podcast</h2>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, var(--gold), var(--navy-mid))" }}
                >
                  🎙️
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: "var(--white)" }}>{latestPodcast.title}</p>
                  <p className="text-xs" style={{ color: "var(--gray-400)" }}>~{latestPodcast.duration_display}</p>
                </div>
              </div>
              <Link href="/podcast" className="text-sm no-underline block mt-3" style={{ color: "var(--gold)" }}>
                Listen →
              </Link>
            </div>
          )}

          {/* Season Summary */}
          <div className="card">
            <h2 className="font-bold mb-3" style={{ color: "var(--gold)" }}>Dynasty Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--gray-400)" }}>Teams</span>
                <span className="font-bold" style={{ color: "var(--white)" }}>{teams.length}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--gray-400)" }}>Games This Week</span>
                <span className="font-bold" style={{ color: "var(--white)" }}>{recentGames.length}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--gray-400)" }}>News Articles</span>
                <span className="font-bold" style={{ color: "var(--white)" }}>{latestNews.length}+</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
