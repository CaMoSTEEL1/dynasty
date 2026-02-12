// ============================================================
// CFB Dynasty Storyline Platform - Core Type Definitions
// ============================================================

export interface Player {
  id: string;
  name: string;
  position: string;
  number: number;
  year: "FR" | "SO" | "JR" | "SR";
  overall: number;
  isKeyPlayer: boolean;
  stats: PlayerSeasonStats;
}

export interface PlayerSeasonStats {
  gamesPlayed: number;
  // Passing
  passYards: number;
  passTDs: number;
  interceptions: number;
  completions: number;
  attempts: number;
  // Rushing
  rushYards: number;
  rushTDs: number;
  carries: number;
  // Receiving
  recYards: number;
  recTDs: number;
  receptions: number;
  targets: number;
  // Defense
  tackles: number;
  sacks: number;
  intDef: number;
  forcedFumbles: number;
}

export interface Team {
  id: string;
  name: string;
  mascot: string;
  abbreviation: string;
  conference: string;
  primaryColor: string;
  secondaryColor: string;
  overallRating: number;
  wins: number;
  losses: number;
  roster: Player[];
  isUserTeam: boolean;
}

export interface GameResult {
  id: string;
  week: number;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  isConferenceGame: boolean;
  isRivalry: boolean;
  isPlayoff: boolean;
  isBowl: boolean;
  playerOfTheGame?: string;
  highlights: string[];
}

export interface WeeklyPlayerStats {
  playerId: string;
  teamId: string;
  gameId: string;
  week: number;
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
}

export interface PickEmEntry {
  id: string;
  week: number;
  gameId: string;
  homeTeamId: string;
  awayTeamId: string;
  pickedTeamId: string;
  actualWinnerId?: string;
  isCorrect?: boolean;
  confidence?: number; // 1-10
}

export interface NewsArticle {
  id: string;
  week: number;
  title: string;
  subtitle: string;
  body: string;
  category: NewsCategory;
  teamIds: string[];
  playerIds: string[];
  createdAt: string;
  imageType: string;
}

export type NewsCategory =
  | "upset"
  | "blowout"
  | "rivalry"
  | "heisman"
  | "breakout"
  | "playoff"
  | "coaching"
  | "preview"
  | "recap"
  | "ranking"
  | "injury"
  | "transfer"
  | "general";

export interface PodcastEpisode {
  id: string;
  week: number;
  title: string;
  description: string;
  segments: PodcastSegment[];
  duration: string;
  createdAt: string;
}

export interface PodcastSegment {
  title: string;
  content: string;
  type: "hot-take" | "analysis" | "rankings" | "picks" | "recap" | "interview";
}

export interface DynastyState {
  // Core data
  currentSeason: number;
  currentWeek: number;
  teams: Team[];
  games: GameResult[];
  weeklyStats: WeeklyPlayerStats[];
  picks: PickEmEntry[];
  articles: NewsArticle[];
  podcasts: PodcastEpisode[];

  // Settings
  dynastyName: string;
  userTeamId: string | null;

  // Actions
  setDynastyName: (name: string) => void;
  setCurrentSeason: (season: number) => void;
  setCurrentWeek: (week: number) => void;
  setUserTeam: (teamId: string) => void;
  addTeam: (team: Team) => void;
  updateTeam: (team: Team) => void;
  removeTeam: (teamId: string) => void;
  addPlayer: (teamId: string, player: Player) => void;
  updatePlayer: (teamId: string, player: Player) => void;
  removePlayer: (teamId: string, playerId: string) => void;
  addGame: (game: GameResult) => void;
  updateGame: (game: GameResult) => void;
  addWeeklyStats: (stats: WeeklyPlayerStats) => void;
  addPick: (pick: PickEmEntry) => void;
  updatePick: (pick: PickEmEntry) => void;
  addArticle: (article: NewsArticle) => void;
  addPodcast: (podcast: PodcastEpisode) => void;
  generateArticles: (week: number) => void;
  generatePodcast: (week: number) => void;
  resetDynasty: () => void;
}

export const POSITIONS = [
  "QB", "HB", "FB", "WR", "TE", "LT", "LG", "C", "RG", "RT",
  "LE", "RE", "DT", "LOLB", "MLB", "ROLB", "CB", "FS", "SS",
  "K", "P"
] as const;

export const CONFERENCES = [
  "SEC", "Big Ten", "Big 12", "ACC", "Pac-12",
  "American", "Mountain West", "Sun Belt", "MAC", "C-USA",
  "Independent"
] as const;

export const YEARS: Player["year"][] = ["FR", "SO", "JR", "SR"];
