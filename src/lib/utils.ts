// ============================================================
// CFB Dynasty Storyline Platform - Utility Functions
// ============================================================

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function getEmptyPlayerStats() {
  return {
    gamesPlayed: 0,
    passYards: 0,
    passTDs: 0,
    interceptions: 0,
    completions: 0,
    attempts: 0,
    rushYards: 0,
    rushTDs: 0,
    carries: 0,
    recYards: 0,
    recTDs: 0,
    receptions: 0,
    targets: 0,
    tackles: 0,
    sacks: 0,
    intDef: 0,
    forcedFumbles: 0,
  };
}

export function getWinPercentage(wins: number, losses: number): string {
  if (wins + losses === 0) return ".000";
  return (wins / (wins + losses)).toFixed(3);
}

export function getRecordString(wins: number, losses: number): string {
  return `${wins}-${losses}`;
}

export function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function formatStatLine(stats: {
  passYards?: number;
  passTDs?: number;
  interceptions?: number;
  rushYards?: number;
  rushTDs?: number;
  recYards?: number;
  recTDs?: number;
  receptions?: number;
  tackles?: number;
  sacks?: number;
}): string {
  const parts: string[] = [];
  if (stats.passYards && stats.passYards > 0) {
    parts.push(`${stats.passYards} pass yds, ${stats.passTDs} TD, ${stats.interceptions} INT`);
  }
  if (stats.rushYards && stats.rushYards > 0) {
    parts.push(`${stats.rushYards} rush yds, ${stats.rushTDs} rush TD`);
  }
  if (stats.receptions && stats.receptions > 0) {
    parts.push(`${stats.receptions} rec, ${stats.recYards} rec yds, ${stats.recTDs} rec TD`);
  }
  if (stats.tackles && stats.tackles > 0) {
    parts.push(`${stats.tackles} tackles`);
  }
  if (stats.sacks && stats.sacks > 0) {
    parts.push(`${stats.sacks} sacks`);
  }
  return parts.join(" | ");
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export const teamColors: Record<string, { primary: string; secondary: string }> = {
  default: { primary: "#1a1a2e", secondary: "#e94560" },
};
