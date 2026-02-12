"use client";
import { useState, useEffect, useCallback } from "react";
import { useDynasty } from "../../components/DynastyProvider";
import { Team, Game } from "../../lib/types";

export default function ScoreboardPage() {
  const { activeDynasty } = useDynasty();
  const [teams, setTeams] = useState<Team[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [showAddGame, setShowAddGame] = useState(false);
  const [gameForm, setGameForm] = useState({
    home_team_id: "",
    away_team_id: "",
    home_score: "",
    away_score: "",
    is_completed: true,
    is_rivalry: false,
    is_conference_game: false,
    is_bowl_game: false,
    bowl_name: "",
  });

  useEffect(() => {
    if (activeDynasty) setSelectedWeek(activeDynasty.current_week);
  }, [activeDynasty]);

  const loadTeams = useCallback(async () => {
    if (!activeDynasty) return;
    const res = await fetch(`/api/teams?dynasty_id=${activeDynasty.id}`);
    setTeams(await res.json());
  }, [activeDynasty]);

  const loadGames = useCallback(async () => {
    if (!activeDynasty) return;
    const res = await fetch(`/api/games?dynasty_id=${activeDynasty.id}&week=${selectedWeek}&season=${activeDynasty.season}`);
    setGames(await res.json());
  }, [activeDynasty, selectedWeek]);

  useEffect(() => { loadTeams(); }, [loadTeams]);
  useEffect(() => { loadGames(); }, [loadGames]);

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDynasty) return;
    await fetch("/api/games", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...gameForm,
        dynasty_id: activeDynasty.id,
        season: activeDynasty.season,
        week: selectedWeek,
        home_score: gameForm.home_score ? parseInt(gameForm.home_score) : null,
        away_score: gameForm.away_score ? parseInt(gameForm.away_score) : null,
        is_completed: gameForm.is_completed && gameForm.home_score && gameForm.away_score,
      }),
    });
    setGameForm({ home_team_id: "", away_team_id: "", home_score: "", away_score: "", is_completed: true, is_rivalry: false, is_conference_game: false, is_bowl_game: false, bowl_name: "" });
    setShowAddGame(false);
    loadGames();
    loadTeams();
  };

  if (!activeDynasty) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="section-title">Weekly Scoreboard</h1>
        <p style={{ color: "var(--gray-400)" }}>Create a dynasty first to track scores.</p>
        <a href="/dynasty" className="btn-primary inline-block mt-4 no-underline">Go to Dynasty Setup</a>
      </div>
    );
  }

  const weeks = Array.from({ length: Math.max(activeDynasty.current_week + 2, 15) }, (_, i) => i + 1);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title mb-0">Weekly Scoreboard</h1>
        <button className="btn-primary" onClick={() => setShowAddGame(true)}>+ Add Game Result</button>
      </div>

      {/* Week Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {weeks.map((w) => (
          <button
            key={w}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{
              background: w === selectedWeek ? "var(--gold)" : "var(--navy-mid)",
              color: w === selectedWeek ? "var(--navy)" : "var(--gray-400)",
            }}
            onClick={() => setSelectedWeek(w)}
          >
            {w <= 13 ? `WK ${w}` : w === 14 ? "CONF" : "BOWL"}
          </button>
        ))}
      </div>

      {/* Season Banner */}
      <div className="text-center py-3 mb-6 rounded-lg" style={{ background: "var(--navy-light)", border: "1px solid var(--navy-mid)" }}>
        <span className="text-sm font-bold" style={{ color: "var(--gold)" }}>
          SEASON {activeDynasty.season} — {selectedWeek <= 13 ? `WEEK ${selectedWeek}` : selectedWeek === 14 ? "CONFERENCE CHAMPIONSHIPS" : "BOWL SEASON"}
        </span>
      </div>

      {/* Add Game Modal */}
      {showAddGame && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full" style={{ background: "var(--navy-light)" }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--gold)" }}>Add Game Result — Week {selectedWeek}</h2>
            <form onSubmit={handleAddGame} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Home Team</label>
                  <select className="input-field" value={gameForm.home_team_id} onChange={(e) => setGameForm({ ...gameForm, home_team_id: e.target.value })} required>
                    <option value="">Select team...</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.ranking ? `#${t.ranking} ` : ""}{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Away Team</label>
                  <select className="input-field" value={gameForm.away_team_id} onChange={(e) => setGameForm({ ...gameForm, away_team_id: e.target.value })} required>
                    <option value="">Select team...</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.ranking ? `#${t.ranking} ` : ""}{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Home Score</label>
                  <input className="input-field" type="number" min="0" placeholder="--" value={gameForm.home_score} onChange={(e) => setGameForm({ ...gameForm, home_score: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Away Score</label>
                  <input className="input-field" type="number" min="0" placeholder="--" value={gameForm.away_score} onChange={(e) => setGameForm({ ...gameForm, away_score: e.target.value })} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--gray-300)" }}>
                  <input type="checkbox" checked={gameForm.is_conference_game} onChange={(e) => setGameForm({ ...gameForm, is_conference_game: e.target.checked })} /> Conference Game
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--gray-300)" }}>
                  <input type="checkbox" checked={gameForm.is_rivalry} onChange={(e) => setGameForm({ ...gameForm, is_rivalry: e.target.checked })} /> Rivalry Game
                </label>
                <label className="flex items-center gap-2 text-sm" style={{ color: "var(--gray-300)" }}>
                  <input type="checkbox" checked={gameForm.is_bowl_game} onChange={(e) => setGameForm({ ...gameForm, is_bowl_game: e.target.checked })} /> Bowl/Playoff Game
                </label>
              </div>
              {gameForm.is_bowl_game && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Bowl/Game Name</label>
                  <input className="input-field" placeholder="e.g. Rose Bowl, CFP Semifinal" value={gameForm.bowl_name} onChange={(e) => setGameForm({ ...gameForm, bowl_name: e.target.value })} />
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary">Save Game</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddGame(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Games List */}
      {games.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-lg font-semibold" style={{ color: "var(--gray-400)" }}>No games logged for this week yet.</p>
          <p className="text-sm mt-2" style={{ color: "var(--gray-500)" }}>Add game results to generate storylines and news articles.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {games.map((game) => {
            const homeWon = game.is_completed && (game.home_score ?? 0) > (game.away_score ?? 0);
            const awayWon = game.is_completed && (game.away_score ?? 0) > (game.home_score ?? 0);
            return (
              <div key={game.id} className="card">
                {/* Game Tags */}
                <div className="flex gap-2 mb-3">
                  {game.is_completed ? <span className="badge badge-green">FINAL</span> : <span className="badge badge-navy">UPCOMING</span>}
                  {game.is_rivalry ? <span className="badge badge-red">RIVALRY</span> : null}
                  {game.is_conference_game ? <span className="badge badge-navy">CONF</span> : null}
                  {game.is_bowl_game ? <span className="badge badge-gold">{game.bowl_name || "BOWL"}</span> : null}
                </div>

                {/* Matchup */}
                <div className="flex items-center justify-between">
                  {/* Away Team */}
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-8 h-8 rounded" style={{ background: game.away_team_color || "#333" }} />
                    <div>
                      <p
                        className="font-bold text-base"
                        style={{
                          color: awayWon ? "var(--gold)" : "var(--white)",
                          opacity: homeWon ? 0.5 : 1,
                        }}
                      >
                        {game.away_team_ranking ? `#${game.away_team_ranking} ` : ""}
                        {game.away_team_name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--gray-400)" }}>
                        {game.away_team_wins ?? 0}-{game.away_team_losses ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-center px-6">
                    {game.is_completed ? (
                      <div className="flex items-center gap-4">
                        <span
                          className="text-2xl font-black"
                          style={{ color: awayWon ? "var(--gold)" : "var(--gray-400)" }}
                        >
                          {game.away_score}
                        </span>
                        <span className="text-sm font-bold" style={{ color: "var(--gray-500)" }}>—</span>
                        <span
                          className="text-2xl font-black"
                          style={{ color: homeWon ? "var(--gold)" : "var(--gray-400)" }}
                        >
                          {game.home_score}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm font-bold" style={{ color: "var(--gray-400)" }}>VS</span>
                    )}
                  </div>

                  {/* Home Team */}
                  <div className="flex items-center gap-3 flex-1 justify-end text-right">
                    <div>
                      <p
                        className="font-bold text-base"
                        style={{
                          color: homeWon ? "var(--gold)" : "var(--white)",
                          opacity: awayWon ? 0.5 : 1,
                        }}
                      >
                        {game.home_team_ranking ? `#${game.home_team_ranking} ` : ""}
                        {game.home_team_name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--gray-400)" }}>
                        {game.home_team_wins ?? 0}-{game.home_team_losses ?? 0}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded" style={{ background: game.home_team_color || "#333" }} />
                  </div>
                </div>

                {/* Headline */}
                {game.headline && (
                  <p className="mt-3 text-sm italic" style={{ color: "var(--gray-400)" }}>{game.headline}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Standings */}
      {teams.length > 0 && (
        <div className="card mt-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--gold)" }}>Season Standings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--navy-mid)" }}>
                  <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}>RK</th>
                  <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}>Team</th>
                  <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}>Conf</th>
                  <th className="text-center py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}>W</th>
                  <th className="text-center py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}>L</th>
                </tr>
              </thead>
              <tbody>
                {[...teams].sort((a, b) => {
                  if (a.ranking && b.ranking) return a.ranking - b.ranking;
                  if (a.ranking) return -1;
                  if (b.ranking) return 1;
                  return b.wins - a.wins || a.losses - b.losses;
                }).map((t) => (
                  <tr key={t.id} style={{ borderBottom: "1px solid var(--navy-mid)" }}>
                    <td className="py-2 px-3 font-bold" style={{ color: "var(--gold)" }}>{t.ranking ?? "--"}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: t.primary_color }} />
                        <span className="font-semibold" style={{ color: "var(--white)" }}>{t.name}</span>
                        {t.is_user_team ? <span className="badge badge-gold text-xs">YOU</span> : null}
                      </div>
                    </td>
                    <td className="py-2 px-3" style={{ color: "var(--gray-400)" }}>{t.conference}</td>
                    <td className="py-2 px-3 text-center font-bold" style={{ color: "var(--field-green-light)" }}>{t.wins}</td>
                    <td className="py-2 px-3 text-center font-bold" style={{ color: "var(--red-accent)" }}>{t.losses}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
