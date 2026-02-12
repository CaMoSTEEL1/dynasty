"use client";

import PageWrapper from "@/components/PageWrapper";
import { useDynastyStore } from "@/lib/store";
import { generateId, getEmptyPlayerStats } from "@/lib/utils";
import { CONFERENCES, POSITIONS, YEARS, type Team, type Player } from "@/lib/types";
import {
  Plus,
  Trash2,
  Edit3,
  Star,
  StarOff,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Shield,
  Save,
  X,
} from "lucide-react";
import { useState } from "react";

export default function RostersPage() {
  const store = useDynastyStore();
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [addingPlayerTo, setAddingPlayerTo] = useState<string | null>(null);

  // Team form state
  const [teamForm, setTeamForm] = useState({
    name: "",
    mascot: "",
    abbreviation: "",
    conference: "SEC",
    primaryColor: "#1a1a8e",
    secondaryColor: "#ffffff",
    overallRating: 85,
  });

  // Player form state
  const [playerForm, setPlayerForm] = useState({
    name: "",
    position: "QB",
    number: 1,
    year: "FR" as Player["year"],
    overall: 80,
    isKeyPlayer: false,
  });

  const resetTeamForm = () => {
    setTeamForm({
      name: "",
      mascot: "",
      abbreviation: "",
      conference: "SEC",
      primaryColor: "#1a1a8e",
      secondaryColor: "#ffffff",
      overallRating: 85,
    });
  };

  const resetPlayerForm = () => {
    setPlayerForm({
      name: "",
      position: "QB",
      number: 1,
      year: "FR",
      overall: 80,
      isKeyPlayer: false,
    });
  };

  const handleAddTeam = () => {
    if (!teamForm.name || !teamForm.mascot || !teamForm.abbreviation) return;
    const newTeam: Team = {
      id: generateId(),
      ...teamForm,
      wins: 0,
      losses: 0,
      roster: [],
      isUserTeam: false,
    };
    store.addTeam(newTeam);
    resetTeamForm();
    setShowAddTeam(false);
  };

  const handleUpdateTeam = (teamId: string) => {
    const team = store.teams.find((t) => t.id === teamId);
    if (!team) return;
    store.updateTeam({
      ...team,
      ...teamForm,
    });
    setEditingTeam(null);
    resetTeamForm();
  };

  const handleAddPlayer = (teamId: string) => {
    if (!playerForm.name) return;
    const newPlayer: Player = {
      id: generateId(),
      ...playerForm,
      stats: getEmptyPlayerStats(),
    };
    store.addPlayer(teamId, newPlayer);
    resetPlayerForm();
    setAddingPlayerTo(null);
  };

  const startEditTeam = (team: Team) => {
    setTeamForm({
      name: team.name,
      mascot: team.mascot,
      abbreviation: team.abbreviation,
      conference: team.conference,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
      overallRating: team.overallRating,
    });
    setEditingTeam(team.id);
  };

  const setAsUserTeam = (teamId: string) => {
    store.setUserTeam(teamId);
    // Update isUserTeam flags
    store.teams.forEach((t) => {
      store.updateTeam({ ...t, isUserTeam: t.id === teamId });
    });
  };

  return (
    <PageWrapper
      title="Roster Management"
      subtitle="Add and manage teams and key players for your dynasty"
      actions={
        <button
          onClick={() => {
            resetTeamForm();
            setShowAddTeam(!showAddTeam);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Add Team
        </button>
      }
    >
      {/* Add Team Form */}
      {showAddTeam && (
        <div className="mb-8 p-6 rounded-xl bg-card border border-border animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Add New Team</h3>
          <TeamForm
            form={teamForm}
            setForm={setTeamForm}
            onSubmit={handleAddTeam}
            onCancel={() => {
              setShowAddTeam(false);
              resetTeamForm();
            }}
            submitLabel="Add Team"
          />
        </div>
      )}

      {/* Teams List */}
      {store.teams.length === 0 ? (
        <div className="text-center py-16">
          <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Teams Yet</h3>
          <p className="text-muted-foreground mb-4">
            Add teams from your dynasty to get started. Include the teams you
            play against and want to track storylines for.
          </p>
          <button
            onClick={() => setShowAddTeam(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Your First Team
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {store.teams.map((team) => (
            <div
              key={team.id}
              className="rounded-xl bg-card border border-border overflow-hidden"
            >
              {/* Team Header */}
              <div className="p-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: team.primaryColor }}
                >
                  {team.abbreviation.slice(0, 3)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base truncate">
                      {team.name} {team.mascot}
                    </h3>
                    {team.id === store.userTeamId && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium shrink-0">
                        Your Team
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {team.conference} &middot; OVR: {team.overallRating} &middot;{" "}
                    {team.wins}-{team.losses} &middot; {team.roster.length} players
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {team.id !== store.userTeamId && (
                    <button
                      onClick={() => setAsUserTeam(team.id)}
                      title="Set as your team"
                      className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-gold"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (editingTeam === team.id) {
                        setEditingTeam(null);
                      } else {
                        startEditTeam(team);
                      }
                    }}
                    title="Edit team"
                    className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-primary"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${team.name}?`)) {
                        store.removeTeam(team.id);
                      }
                    }}
                    title="Remove team"
                    className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground hover:text-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      setExpandedTeam(
                        expandedTeam === team.id ? null : team.id
                      )
                    }
                    className="p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                  >
                    {expandedTeam === team.id ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Edit Team Form */}
              {editingTeam === team.id && (
                <div className="px-4 pb-4 border-t border-border pt-4">
                  <TeamForm
                    form={teamForm}
                    setForm={setTeamForm}
                    onSubmit={() => handleUpdateTeam(team.id)}
                    onCancel={() => {
                      setEditingTeam(null);
                      resetTeamForm();
                    }}
                    submitLabel="Save Changes"
                  />
                </div>
              )}

              {/* Expanded: Roster */}
              {expandedTeam === team.id && (
                <div className="border-t border-border">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-sm">
                        Roster ({team.roster.length} players)
                      </h4>
                      <button
                        onClick={() => {
                          resetPlayerForm();
                          setAddingPlayerTo(
                            addingPlayerTo === team.id ? null : team.id
                          );
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/20 text-primary text-xs font-medium hover:bg-primary/30 transition-colors"
                      >
                        <UserPlus className="w-3 h-3" />
                        Add Player
                      </button>
                    </div>

                    {/* Add Player Form */}
                    {addingPlayerTo === team.id && (
                      <div className="mb-4 p-4 rounded-lg bg-muted border border-border animate-fade-in">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs text-muted-foreground mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={playerForm.name}
                              onChange={(e) =>
                                setPlayerForm({
                                  ...playerForm,
                                  name: e.target.value,
                                })
                              }
                              placeholder="Player name"
                              className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              Position
                            </label>
                            <select
                              value={playerForm.position}
                              onChange={(e) =>
                                setPlayerForm({
                                  ...playerForm,
                                  position: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              {POSITIONS.map((p) => (
                                <option key={p} value={p}>
                                  {p}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              #
                            </label>
                            <input
                              type="number"
                              min={0}
                              max={99}
                              value={playerForm.number}
                              onChange={(e) =>
                                setPlayerForm({
                                  ...playerForm,
                                  number: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              Year
                            </label>
                            <select
                              value={playerForm.year}
                              onChange={(e) =>
                                setPlayerForm({
                                  ...playerForm,
                                  year: e.target.value as Player["year"],
                                })
                              }
                              className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                              {YEARS.map((y) => (
                                <option key={y} value={y}>
                                  {y}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-muted-foreground mb-1">
                              OVR
                            </label>
                            <input
                              type="number"
                              min={40}
                              max={99}
                              value={playerForm.overall}
                              onChange={(e) =>
                                setPlayerForm({
                                  ...playerForm,
                                  overall: parseInt(e.target.value) || 40,
                                })
                              }
                              className="w-full px-2 py-1.5 rounded-md bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={playerForm.isKeyPlayer}
                              onChange={(e) =>
                                setPlayerForm({
                                  ...playerForm,
                                  isKeyPlayer: e.target.checked,
                                })
                              }
                              className="rounded"
                            />
                            <Star className="w-3 h-3 text-gold" />
                            Key Player (tracked in Heisman Watch & storylines)
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setAddingPlayerTo(null)}
                              className="px-3 py-1.5 rounded-md text-xs text-muted-foreground hover:text-foreground transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleAddPlayer(team.id)}
                              className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90 transition-opacity"
                            >
                              Add Player
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Player List */}
                    {team.roster.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-xs text-muted-foreground uppercase tracking-wider border-b border-border">
                              <th className="text-left py-2 pr-2">#</th>
                              <th className="text-left py-2 pr-2">Name</th>
                              <th className="text-left py-2 pr-2">Pos</th>
                              <th className="text-left py-2 pr-2">Year</th>
                              <th className="text-left py-2 pr-2">OVR</th>
                              <th className="text-left py-2 pr-2">Key</th>
                              <th className="text-right py-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {team.roster
                              .sort((a, b) => {
                                if (a.isKeyPlayer && !b.isKeyPlayer) return -1;
                                if (!a.isKeyPlayer && b.isKeyPlayer) return 1;
                                return b.overall - a.overall;
                              })
                              .map((player) => (
                                <tr
                                  key={player.id}
                                  className="border-b border-border/50 hover:bg-muted/50"
                                >
                                  <td className="py-2 pr-2 text-muted-foreground">
                                    {player.number}
                                  </td>
                                  <td className="py-2 pr-2 font-medium">
                                    {player.name}
                                  </td>
                                  <td className="py-2 pr-2">
                                    <span className="px-1.5 py-0.5 rounded bg-accent text-xs">
                                      {player.position}
                                    </span>
                                  </td>
                                  <td className="py-2 pr-2 text-muted-foreground">
                                    {player.year}
                                  </td>
                                  <td className="py-2 pr-2">
                                    <span
                                      className={`font-mono font-bold ${
                                        player.overall >= 90
                                          ? "text-gold"
                                          : player.overall >= 80
                                          ? "text-success"
                                          : player.overall >= 70
                                          ? "text-foreground"
                                          : "text-muted-foreground"
                                      }`}
                                    >
                                      {player.overall}
                                    </span>
                                  </td>
                                  <td className="py-2 pr-2">
                                    <button
                                      onClick={() => {
                                        store.updatePlayer(team.id, {
                                          ...player,
                                          isKeyPlayer: !player.isKeyPlayer,
                                        });
                                      }}
                                      className="text-muted-foreground hover:text-gold transition-colors"
                                    >
                                      {player.isKeyPlayer ? (
                                        <Star className="w-4 h-4 fill-gold text-gold" />
                                      ) : (
                                        <StarOff className="w-4 h-4" />
                                      )}
                                    </button>
                                  </td>
                                  <td className="py-2 text-right">
                                    <button
                                      onClick={() => {
                                        if (
                                          confirm(
                                            `Remove ${player.name}?`
                                          )
                                        ) {
                                          store.removePlayer(
                                            team.id,
                                            player.id
                                          );
                                        }
                                      }}
                                      className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-danger transition-colors"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No players on roster yet. Add key players to track their
                        stats and generate storylines.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageWrapper>
  );
}

// ---- Reusable Team Form Component ----

function TeamForm({
  form,
  setForm,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  form: {
    name: string;
    mascot: string;
    abbreviation: string;
    conference: string;
    primaryColor: string;
    secondaryColor: string;
    overallRating: number;
  };
  setForm: (f: typeof form) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            School Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Alabama"
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Mascot
          </label>
          <input
            type="text"
            value={form.mascot}
            onChange={(e) => setForm({ ...form, mascot: e.target.value })}
            placeholder="e.g. Crimson Tide"
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Abbreviation
          </label>
          <input
            type="text"
            maxLength={4}
            value={form.abbreviation}
            onChange={(e) =>
              setForm({ ...form, abbreviation: e.target.value.toUpperCase() })
            }
            placeholder="e.g. BAMA"
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Conference
          </label>
          <select
            value={form.conference}
            onChange={(e) => setForm({ ...form, conference: e.target.value })}
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {CONFERENCES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Overall Rating
          </label>
          <input
            type="number"
            min={40}
            max={99}
            value={form.overallRating}
            onChange={(e) =>
              setForm({
                ...form,
                overallRating: parseInt(e.target.value) || 85,
              })
            }
            className="w-full px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Primary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.primaryColor}
              onChange={(e) =>
                setForm({ ...form, primaryColor: e.target.value })
              }
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={form.primaryColor}
              onChange={(e) =>
                setForm({ ...form, primaryColor: e.target.value })
              }
              className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-muted-foreground mb-1">
            Secondary Color
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.secondaryColor}
              onChange={(e) =>
                setForm({ ...form, secondaryColor: e.target.value })
              }
              className="w-10 h-10 rounded cursor-pointer border-0"
            />
            <input
              type="text"
              value={form.secondaryColor}
              onChange={(e) =>
                setForm({ ...form, secondaryColor: e.target.value })
              }
              className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button
          onClick={onSubmit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Save className="w-4 h-4" />
          {submitLabel}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </>
  );
}
