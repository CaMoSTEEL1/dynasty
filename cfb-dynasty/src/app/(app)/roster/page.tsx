"use client";
import { useState, useEffect, useCallback } from "react";
import { useDynasty } from "../../components/DynastyProvider";
import { Team, Player, POSITIONS, CONFERENCES, YEARS } from "../../lib/types";

export default function RosterPage() {
  const { activeDynasty } = useDynasty();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", abbreviation: "", conference: "SEC", mascot: "", primary_color: "#333333", ranking: "", wins: "0", losses: "0" });
  const [playerForm, setPlayerForm] = useState({ name: "", position: "QB", number: "", year: "FR", overall_rating: "75", is_key_player: false });

  const loadTeams = useCallback(async () => {
    if (!activeDynasty) return;
    const res = await fetch(`/api/teams?dynasty_id=${activeDynasty.id}`);
    const data = await res.json();
    setTeams(data);
    if (data.length > 0 && !selectedTeamId) {
      setSelectedTeamId(data[0].id);
    }
  }, [activeDynasty, selectedTeamId]);

  const loadPlayers = useCallback(async () => {
    if (!selectedTeamId) return;
    const res = await fetch(`/api/players?team_id=${selectedTeamId}`);
    const data = await res.json();
    setPlayers(data);
  }, [selectedTeamId]);

  useEffect(() => { loadTeams(); }, [loadTeams]);
  useEffect(() => { loadPlayers(); }, [loadPlayers]);

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDynasty) return;
    await fetch("/api/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...teamForm,
        dynasty_id: activeDynasty.id,
        ranking: teamForm.ranking ? parseInt(teamForm.ranking) : null,
        wins: parseInt(teamForm.wins) || 0,
        losses: parseInt(teamForm.losses) || 0,
      }),
    });
    setTeamForm({ name: "", abbreviation: "", conference: "SEC", mascot: "", primary_color: "#333333", ranking: "", wins: "0", losses: "0" });
    setShowAddTeam(false);
    loadTeams();
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDynasty || !selectedTeamId) return;
    await fetch("/api/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...playerForm,
        team_id: selectedTeamId,
        dynasty_id: activeDynasty.id,
        number: playerForm.number ? parseInt(playerForm.number) : null,
        overall_rating: parseInt(playerForm.overall_rating) || 75,
        is_key_player: playerForm.is_key_player,
      }),
    });
    setPlayerForm({ name: "", position: "QB", number: "", year: "FR", overall_rating: "75", is_key_player: false });
    setShowAddPlayer(false);
    loadPlayers();
  };

  const handleDeletePlayer = async (id: string) => {
    await fetch(`/api/players/${id}`, { method: "DELETE" });
    loadPlayers();
  };

  const handleDeleteTeam = async (id: string) => {
    if (!confirm("Delete this team and all its players?")) return;
    await fetch(`/api/teams/${id}`, { method: "DELETE" });
    setSelectedTeamId("");
    loadTeams();
  };

  const handleUpdateTeam = async (id: string, updates: Partial<Team>) => {
    await fetch(`/api/teams/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    loadTeams();
  };

  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  if (!activeDynasty) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <h1 className="section-title">Roster Management</h1>
        <p style={{ color: "var(--gray-400)" }}>Create a dynasty first to manage rosters.</p>
        <a href="/dynasty" className="btn-primary inline-block mt-4 no-underline">Go to Dynasty Setup</a>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title mb-0">Roster Management</h1>
        <button className="btn-primary" onClick={() => setShowAddTeam(true)}>+ Add Team</button>
      </div>

      {/* Team Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {teams.map((team) => (
          <button
            key={team.id}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: team.id === selectedTeamId ? team.primary_color : "var(--navy-mid)",
              color: team.id === selectedTeamId ? "#fff" : "var(--gray-300)",
              border: team.id === selectedTeamId ? "none" : "1px solid var(--navy-mid)",
            }}
            onClick={() => setSelectedTeamId(team.id)}
          >
            {team.ranking ? `#${team.ranking} ` : ""}{team.abbreviation || team.name}
            <span className="ml-2 opacity-70">({team.wins}-{team.losses})</span>
          </button>
        ))}
      </div>

      {/* Add Team Modal */}
      {showAddTeam && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full" style={{ background: "var(--navy-light)" }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--gold)" }}>Add New Team</h2>
            <form onSubmit={handleAddTeam} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Team Name</label>
                  <input className="input-field" placeholder="Ohio State Buckeyes" value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Abbreviation</label>
                  <input className="input-field" placeholder="OSU" value={teamForm.abbreviation} onChange={(e) => setTeamForm({ ...teamForm, abbreviation: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Conference</label>
                  <select className="input-field" value={teamForm.conference} onChange={(e) => setTeamForm({ ...teamForm, conference: e.target.value })}>
                    {CONFERENCES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Mascot</label>
                  <input className="input-field" placeholder="Buckeyes" value={teamForm.mascot} onChange={(e) => setTeamForm({ ...teamForm, mascot: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Ranking (optional)</label>
                  <input className="input-field" type="number" min="1" max="25" placeholder="--" value={teamForm.ranking} onChange={(e) => setTeamForm({ ...teamForm, ranking: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Team Color</label>
                  <input type="color" className="w-full h-10 rounded cursor-pointer" value={teamForm.primary_color} onChange={(e) => setTeamForm({ ...teamForm, primary_color: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Wins</label>
                  <input className="input-field" type="number" min="0" value={teamForm.wins} onChange={(e) => setTeamForm({ ...teamForm, wins: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Losses</label>
                  <input className="input-field" type="number" min="0" value={teamForm.losses} onChange={(e) => setTeamForm({ ...teamForm, losses: e.target.value })} />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary">Add Team</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddTeam(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Team Detail */}
      {selectedTeam && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg" style={{ background: selectedTeam.primary_color }} />
              <div>
                <h2 className="font-bold text-lg" style={{ color: "var(--white)" }}>
                  {selectedTeam.ranking ? `#${selectedTeam.ranking} ` : ""}{selectedTeam.name}
                </h2>
                <p className="text-sm" style={{ color: "var(--gray-400)" }}>
                  {selectedTeam.conference} • {selectedTeam.wins}-{selectedTeam.losses}
                  {selectedTeam.is_user_team ? " • YOUR TEAM" : ""}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="btn-primary text-sm" onClick={() => setShowAddPlayer(true)}>+ Add Player</button>
              <button className="btn-danger text-xs" onClick={() => handleDeleteTeam(selectedTeam.id)}>Delete Team</button>
            </div>
          </div>

          {/* Quick Record Update */}
          <div className="flex items-center gap-4 p-3 rounded-lg" style={{ background: "var(--navy)" }}>
            <span className="text-sm font-semibold" style={{ color: "var(--gray-300)" }}>Quick Update:</span>
            <div className="flex items-center gap-2">
              <label className="text-xs" style={{ color: "var(--gray-400)" }}>Ranking</label>
              <input
                className="input-field w-20"
                type="number"
                min="1"
                max="25"
                placeholder="--"
                value={selectedTeam.ranking ?? ""}
                onChange={(e) => handleUpdateTeam(selectedTeam.id, { ranking: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full" style={{ background: "var(--navy-light)" }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: "var(--gold)" }}>
              Add Player to {selectedTeam?.name}
            </h2>
            <form onSubmit={handleAddPlayer} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Player Name</label>
                  <input className="input-field" placeholder="John Smith" value={playerForm.name} onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Position</label>
                  <select className="input-field" value={playerForm.position} onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}>
                    {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Jersey #</label>
                  <input className="input-field" type="number" min="0" max="99" placeholder="--" value={playerForm.number} onChange={(e) => setPlayerForm({ ...playerForm, number: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Class Year</label>
                  <select className="input-field" value={playerForm.year} onChange={(e) => setPlayerForm({ ...playerForm, year: e.target.value })}>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "var(--gray-300)" }}>Overall Rating</label>
                  <input className="input-field" type="number" min="40" max="99" value={playerForm.overall_rating} onChange={(e) => setPlayerForm({ ...playerForm, overall_rating: e.target.value })} />
                </div>
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="key-player"
                    checked={playerForm.is_key_player}
                    onChange={(e) => setPlayerForm({ ...playerForm, is_key_player: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="key-player" className="text-sm font-semibold" style={{ color: "var(--gold)" }}>Key Player / Star</label>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="submit" className="btn-primary">Add Player</button>
                <button type="button" className="btn-secondary" onClick={() => setShowAddPlayer(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Players Table */}
      {selectedTeam && (
        <div className="card">
          <h3 className="font-bold mb-4" style={{ color: "var(--white)" }}>
            Roster ({players.length} players)
          </h3>
          {players.length === 0 ? (
            <p className="text-center py-8" style={{ color: "var(--gray-400)" }}>
              No players yet. Add players to build this team&apos;s roster.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--navy-mid)" }}>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}>#</th>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}>Name</th>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}>POS</th>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}>Year</th>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}>OVR</th>
                    <th className="text-left py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}>Role</th>
                    <th className="text-right py-2 px-3 font-semibold" style={{ color: "var(--gray-400)" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((p) => (
                    <tr key={p.id} className="transition-colors" style={{ borderBottom: "1px solid var(--navy-mid)" }}>
                      <td className="py-2 px-3" style={{ color: "var(--gray-300)" }}>{p.number ?? "--"}</td>
                      <td className="py-2 px-3 font-semibold" style={{ color: "var(--white)" }}>{p.name}</td>
                      <td className="py-2 px-3">
                        <span className="badge badge-navy">{p.position}</span>
                      </td>
                      <td className="py-2 px-3" style={{ color: "var(--gray-300)" }}>{p.year}</td>
                      <td className="py-2 px-3">
                        <span
                          className="font-bold"
                          style={{
                            color: p.overall_rating >= 85 ? "var(--gold)" :
                              p.overall_rating >= 75 ? "var(--field-green-light)" : "var(--gray-300)",
                          }}
                        >
                          {p.overall_rating}
                        </span>
                      </td>
                      <td className="py-2 px-3">
                        {p.is_key_player ? <span className="badge badge-gold">STAR</span> : <span style={{ color: "var(--gray-500)" }}>—</span>}
                      </td>
                      <td className="py-2 px-3 text-right">
                        <button className="btn-danger text-xs" onClick={() => handleDeletePlayer(p.id)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
