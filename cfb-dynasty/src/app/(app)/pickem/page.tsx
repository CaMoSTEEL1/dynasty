"use client";
import { useState, useEffect, useCallback } from "react";
import { useDynasty } from "../../components/DynastyProvider";
import { Team, PickEmGame } from "../../lib/types";

export default function PickEmPage() {
  const { activeDynasty } = useDynasty();
  const [teams, setTeams] = useState<Team[]>([]);
  const [pickemGames, setPickemGames] = useState<PickEmGame[]>([]);
  const [stats, setStats] = useState<{ total_picks: number; correct_picks: number; incorrect_picks: number; pending_picks: number } | null>(null);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [showAddPick, setShowAddPick] = useState(false);
  const [form, setForm] = useState({
    home_team_id: "",
    away_team_id: "",
    home_spread: "",
    user_pick: "",
    confidence: "3",
    is_gameday_game: false,
  });

  useEffect(() => {
    if (activeDynasty) setSelectedWeek(activeDynasty.current_week);
  }, [activeDynasty]);

  const loadTeams = useCallback(async () => {
    if (!activeDynasty) return;
    const res = await fetch(`/api/teams?dynasty_id=${activeDynasty.id}`);
    setTeams(await res.json());
  }, [activeDynasty]);

  const loadPickem = useCallback(async () => {
    if (!activeDynasty) return;
    const res = await fetch(`/api/pickem?dynasty_id=${activeDynasty.id}&week=${selectedWeek}`);
    const data = await res.json();
    setPickemGames(data.games || []);
    setStats(data.stats || null);
  }, [activeDynasty, selectedWeek]);

  useEffect(() => { loadTeams(); }, [loadTeams]);
  useEffect(() => { loadPickem(); }, [loadPickem]);

  const handleAddPick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDynasty) return;
    await fetch("/api/pickem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        dynasty_id: activeDynasty.id,
        season: activeDynasty.season,
        week: selectedWeek,
        home_spread: form.home_spread ? parseFloat(form.home_spread) : null,
        confidence: parseInt(form.confidence),
        user_pick: form.user_pick || null,
      }),
    });
    setForm({ home_team_id: "", away_team_id: "", home_spread: "", user_pick: "", confidence: "3", is_gameday_game: false });
    setShowAddPick(false);
    loadPickem();
  };

  const handleResolve = async (pickId: string, winnerId: string) => {
    await fetch(`/api/pickem/${pickId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actual_winner: winnerId }),
    });
    loadPickem();
  };

  const handleMakePick = async (pickId: string, teamId: string) => {
    await fetch(`/api/pickem/${pickId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_pick: teamId }),
    });
    loadPickem();
  };

  if (!activeDynasty) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="section-title">College GameDay Pick&apos;em</h1>
        <p style={{ color: "var(--gray-400)" }}>Create a dynasty first to make picks.</p>
        <a href="/dynasty" className="btn-primary inline-block mt-4 no-underline">Go to Dynasty Setup</a>
      </div>
    );
  }

  const gamedayGames = pickemGames.filter(g => g.is_gameday_game);
  const otherGames = pickemGames.filter(g => !g.is_gameday_game);
  const weeks = Array.from({ length: Math.max(activeDynasty.current_week + 2, 15) }, (_, i) => i + 1);
  const winPct = stats && stats.total_picks > 0
    ? ((stats.correct_picks / (stats.correct_picks + stats.incorrect_picks)) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-2">
        <h1 className="section-title mb-0">College GameDay Pick&apos;em</h1>
        <button className="btn-primary" onClick={() => setShowAddPick(true)}>+ Add Matchup</button>
      </div>
      <p className="text-sm mb-6" style={{ color: "var(--gray-400)" }}>
        Make your picks each week. Track your record. Compete against the virtual analyst.
      </p>

      {/* Stats Bar */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="card text-center">
            <div className="stat-number">{stats.correct_picks ?? 0}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: "var(--gray-400)" }}>CORRECT</div>
          </div>
          <div className="card text-center">
            <div className="stat-number" style={{ color: "var(--red-accent)" }}>{stats.incorrect_picks ?? 0}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: "var(--gray-400)" }}>INCORRECT</div>
          </div>
          <div className="card text-center">
            <div className="stat-number">{winPct}%</div>
            <div className="text-xs font-semibold mt-1" style={{ color: "var(--gray-400)" }}>WIN %</div>
          </div>
          <div className="card text-center">
            <div className="stat-number" style={{ color: "var(--gray-300)" }}>{stats.pending_picks ?? 0}</div>
            <div className="text-xs font-semibold mt-1" style={{ color: "var(--gray-400)" }}>PENDING</div>
          </div>
        </div>
      )}

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
            WK {w}
          </button>
        ))}
      </div>

      {/* Add Pick Modal */}
      {showAddPick && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full" style={{ background: "var(--navy-light)" }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--gold)" }}>Add Pick&apos;em Matchup — Week {selectedWeek}</h2>
            <form onSubmit={handleAddPick} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Home Team</label>
                  <select className="input-field" value={form.home_team_id} onChange={(e) => setForm({ ...form, home_team_id: e.target.value })} required>
                    <option value="">Select...</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.ranking ? `#${t.ranking} ` : ""}{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Away Team</label>
                  <select className="input-field" value={form.away_team_id} onChange={(e) => setForm({ ...form, away_team_id: e.target.value })} required>
                    <option value="">Select...</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.ranking ? `#${t.ranking} ` : ""}{t.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Spread (Home)</label>
                  <input className="input-field" type="number" step="0.5" placeholder="e.g. -7.5" value={form.home_spread} onChange={(e) => setForm({ ...form, home_spread: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Your Pick</label>
                  <select className="input-field" value={form.user_pick} onChange={(e) => setForm({ ...form, user_pick: e.target.value })}>
                    <option value="">Undecided</option>
                    {form.home_team_id && <option value={form.home_team_id}>{teams.find(t => t.id === form.home_team_id)?.name || "Home"}</option>}
                    {form.away_team_id && <option value={form.away_team_id}>{teams.find(t => t.id === form.away_team_id)?.name || "Away"}</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Confidence (1-5)</label>
                  <select className="input-field" value={form.confidence} onChange={(e) => setForm({ ...form, confidence: e.target.value })}>
                    {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} — {"★".repeat(n)}</option>)}
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm" style={{ color: "var(--gold)" }}>
                <input type="checkbox" checked={form.is_gameday_game} onChange={(e) => setForm({ ...form, is_gameday_game: e.target.checked })} />
                <span className="font-bold">College GameDay Featured Game</span>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">Add Matchup</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddPick(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GameDay Featured */}
      {gamedayGames.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📺</span>
            <h2 className="text-lg font-black" style={{ color: "var(--gold)" }}>COLLEGE GAMEDAY PICKS</h2>
          </div>
          <div className="space-y-4">
            {gamedayGames.map((g) => (
              <PickEmCard key={g.id} game={g} teams={teams} onResolve={handleResolve} onMakePick={handleMakePick} featured />
            ))}
          </div>
        </div>
      )}

      {/* Other Games */}
      {otherGames.length > 0 && (
        <div>
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--white)" }}>All Week {selectedWeek} Picks</h2>
          <div className="space-y-3">
            {otherGames.map((g) => (
              <PickEmCard key={g.id} game={g} teams={teams} onResolve={handleResolve} onMakePick={handleMakePick} />
            ))}
          </div>
        </div>
      )}

      {pickemGames.length === 0 && (
        <div className="card text-center py-16">
          <p className="text-4xl mb-4">🎯</p>
          <p className="text-lg font-semibold" style={{ color: "var(--gray-400)" }}>No picks for this week yet.</p>
          <p className="text-sm mt-2" style={{ color: "var(--gray-500)" }}>Add matchups to make your predictions.</p>
        </div>
      )}
    </div>
  );
}

function PickEmCard({
  game,
  teams,
  onResolve,
  onMakePick,
  featured,
}: {
  game: PickEmGame;
  teams: Team[];
  onResolve: (id: string, winnerId: string) => void;
  onMakePick: (id: string, teamId: string) => void;
  featured?: boolean;
}) {
  const isResolved = game.actual_winner !== null;
  const userCorrect = game.is_correct === 1;
  const userWrong = game.is_correct === 0;

  return (
    <div
      className="card"
      style={featured ? { border: "2px solid var(--gold)" } : {}}
    >
      <div className="flex items-center gap-2 mb-3">
        {featured && <span className="badge badge-gold">GAMEDAY</span>}
        {isResolved && userCorrect && <span className="badge badge-green">CORRECT</span>}
        {isResolved && userWrong && <span className="badge badge-red">WRONG</span>}
        {!isResolved && game.user_pick && <span className="badge badge-navy">PICKED</span>}
        {game.home_spread !== null && (
          <span className="text-xs" style={{ color: "var(--gray-500)" }}>
            Spread: {game.home_spread > 0 ? "+" : ""}{game.home_spread}
          </span>
        )}
        <span className="text-xs ml-auto" style={{ color: "var(--gray-500)" }}>
          Confidence: {"★".repeat(game.confidence)}{"☆".repeat(5 - game.confidence)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {/* Away */}
        <button
          className="flex items-center gap-2 flex-1 p-2 rounded-lg transition-all text-left"
          style={{
            background: game.user_pick === game.away_team_id ? "var(--navy)" : "transparent",
            border: game.user_pick === game.away_team_id ? "2px solid var(--gold)" : "2px solid transparent",
          }}
          onClick={() => !isResolved && onMakePick(game.id, game.away_team_id)}
          disabled={isResolved}
        >
          <div className="w-6 h-6 rounded" style={{ background: game.away_team_color || "#333" }} />
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--white)" }}>
              {game.away_team_ranking ? `#${game.away_team_ranking} ` : ""}{game.away_team_name}
            </p>
          </div>
        </button>

        <div className="px-4 text-center">
          <span className="text-xs font-bold" style={{ color: "var(--gray-500)" }}>VS</span>
        </div>

        {/* Home */}
        <button
          className="flex items-center gap-2 flex-1 p-2 rounded-lg transition-all text-right justify-end"
          style={{
            background: game.user_pick === game.home_team_id ? "var(--navy)" : "transparent",
            border: game.user_pick === game.home_team_id ? "2px solid var(--gold)" : "2px solid transparent",
          }}
          onClick={() => !isResolved && onMakePick(game.id, game.home_team_id)}
          disabled={isResolved}
        >
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--white)" }}>
              {game.home_team_ranking ? `#${game.home_team_ranking} ` : ""}{game.home_team_name}
            </p>
          </div>
          <div className="w-6 h-6 rounded" style={{ background: game.home_team_color || "#333" }} />
        </button>
      </div>

      {/* Analyst Pick */}
      {game.analyst_pick && (
        <div className="mt-3 text-xs" style={{ color: "var(--gray-500)" }}>
          Virtual Analyst picks: <span className="font-bold" style={{ color: "var(--gray-300)" }}>
            {game.analyst_pick === game.home_team_id ? game.home_team_name : game.away_team_name}
          </span>
        </div>
      )}

      {/* Resolve Buttons */}
      {!isResolved && game.user_pick && (
        <div className="mt-3 pt-3 flex gap-2" style={{ borderTop: "1px solid var(--navy-mid)" }}>
          <span className="text-xs self-center mr-2" style={{ color: "var(--gray-500)" }}>Who won?</span>
          <button className="btn-secondary text-xs" onClick={() => onResolve(game.id, game.away_team_id)}>
            {game.away_team_abbreviation || game.away_team_name}
          </button>
          <button className="btn-secondary text-xs" onClick={() => onResolve(game.id, game.home_team_id)}>
            {game.home_team_abbreviation || game.home_team_name}
          </button>
        </div>
      )}
    </div>
  );
}
