"use client";
import { useState } from "react";
import { useDynasty } from "../../components/DynastyProvider";
import { CONFERENCES } from "../../lib/types";

export default function DynastyPage() {
  const { dynasties, activeDynasty, setActiveDynastyId, refreshDynasties } = useDynasty();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: "",
    team_name: "",
    conference: "SEC",
    coach_name: "",
    mascot: "",
    team_abbreviation: "",
    primary_color: "#c5a952",
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/dynasties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const dynasty = await res.json();
      await refreshDynasties();
      setActiveDynastyId(dynasty.id);
      setForm({ name: "", team_name: "", conference: "SEC", coach_name: "", mascot: "", team_abbreviation: "", primary_color: "#c5a952" });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dynasty? All data will be lost.")) return;
    await fetch(`/api/dynasties/${id}`, { method: "DELETE" });
    await refreshDynasties();
  };

  const handleAdvanceWeek = async () => {
    if (!activeDynasty) return;
    await fetch(`/api/dynasties/${activeDynasty.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_week: activeDynasty.current_week + 1 }),
    });
    await refreshDynasties();
  };

  const handleAdvanceSeason = async () => {
    if (!activeDynasty) return;
    if (!confirm("Advance to the next season? This will reset the week counter.")) return;
    await fetch(`/api/dynasties/${activeDynasty.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season: activeDynasty.season + 1, current_week: 1 }),
    });
    await refreshDynasties();
  };

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Dynasty Management</h1>

      {/* Active Dynasty Selector */}
      {dynasties.length > 0 && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: "var(--white)" }}>Your Dynasties</h2>
            {activeDynasty && (
              <span className="badge badge-gold">ACTIVE</span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dynasties.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-lg cursor-pointer transition-all"
                style={{
                  background: d.id === activeDynasty?.id ? "var(--navy)" : "var(--navy-mid)",
                  border: d.id === activeDynasty?.id ? "2px solid var(--gold)" : "2px solid transparent",
                }}
                onClick={() => setActiveDynastyId(d.id)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base" style={{ color: "var(--white)" }}>{d.name}</h3>
                    <p className="text-sm" style={{ color: "var(--gray-400)" }}>
                      {d.team_name} • {d.conference}
                    </p>
                    <p className="text-sm" style={{ color: "var(--gray-400)" }}>
                      Coach {d.coach_name}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <span className="badge badge-navy">Season {d.season}</span>
                      <span className="badge badge-navy">Week {d.current_week}</span>
                    </div>
                  </div>
                  <button
                    className="btn-danger text-xs"
                    onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Dynasty Controls */}
      {activeDynasty && (
        <div className="card mb-8">
          <h2 className="text-lg font-bold mb-4" style={{ color: "var(--white)" }}>
            Season Controls — {activeDynasty.name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="stat-number">{activeDynasty.season}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: "var(--gray-400)" }}>SEASON</div>
            </div>
            <div className="text-center">
              <div className="stat-number">{activeDynasty.current_week}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: "var(--gray-400)" }}>CURRENT WEEK</div>
            </div>
            <div className="text-center">
              <div className="stat-number" style={{ fontSize: "1.2rem" }}>{activeDynasty.team_name}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: "var(--gray-400)" }}>YOUR TEAM</div>
            </div>
            <div className="text-center">
              <div className="stat-number" style={{ fontSize: "1.2rem" }}>{activeDynasty.conference}</div>
              <div className="text-xs font-semibold mt-1" style={{ color: "var(--gray-400)" }}>CONFERENCE</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn-primary" onClick={handleAdvanceWeek}>
              Advance to Week {activeDynasty.current_week + 1}
            </button>
            <button className="btn-secondary" onClick={handleAdvanceSeason}>
              Start New Season
            </button>
          </div>
        </div>
      )}

      {/* Create New Dynasty */}
      <div className="card">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--white)" }}>
          Create New Dynasty
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "var(--gray-300)" }}>
                Dynasty Name
              </label>
              <input
                className="input-field"
                placeholder="e.g. Road to the Natty"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "var(--gray-300)" }}>
                Coach Name
              </label>
              <input
                className="input-field"
                placeholder="e.g. Coach Smith"
                value={form.coach_name}
                onChange={(e) => setForm({ ...form, coach_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "var(--gray-300)" }}>
                Your Team
              </label>
              <input
                className="input-field"
                placeholder="e.g. Alabama Crimson Tide"
                value={form.team_name}
                onChange={(e) => setForm({ ...form, team_name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "var(--gray-300)" }}>
                Conference
              </label>
              <select
                className="input-field"
                value={form.conference}
                onChange={(e) => setForm({ ...form, conference: e.target.value })}
              >
                {CONFERENCES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "var(--gray-300)" }}>
                Team Abbreviation
              </label>
              <input
                className="input-field"
                placeholder="e.g. BAMA"
                value={form.team_abbreviation}
                onChange={(e) => setForm({ ...form, team_abbreviation: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1" style={{ color: "var(--gray-300)" }}>
                Mascot
              </label>
              <input
                className="input-field"
                placeholder="e.g. Crimson Tide"
                value={form.mascot}
                onChange={(e) => setForm({ ...form, mascot: e.target.value })}
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={creating}>
            {creating ? "Creating..." : "Create Dynasty"}
          </button>
        </form>
      </div>
    </div>
  );
}
