export interface Dynasty {
  id: string;
  name: string;
  team_name: string;
  conference: string;
  coach_name: string;
  season: number;
  current_week: number;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  dynasty_id: string;
  name: string;
  abbreviation: string;
  conference: string;
  mascot: string;
  primary_color: string;
  wins: number;
  losses: number;
  ranking: number | null;
  is_user_team: number;
  created_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  dynasty_id: string;
  name: string;
  position: string;
  number: number | null;
  year: string;
  overall_rating: number;
  is_key_player: number;
  stats_json: string;
  created_at: string;
}

export interface PlayerStats {
  passing_yards?: number;
  passing_tds?: number;
  interceptions?: number;
  rushing_yards?: number;
  rushing_tds?: number;
  receiving_yards?: number;
  receiving_tds?: number;
  receptions?: number;
  tackles?: number;
  sacks?: number;
  interceptions_def?: number;
  forced_fumbles?: number;
}

export interface Game {
  id: string;
  dynasty_id: string;
  season: number;
  week: number;
  home_team_id: string;
  away_team_id: string;
  home_score: number | null;
  away_score: number | null;
  is_completed: number;
  is_rivalry: number;
  is_conference_game: number;
  is_bowl_game: number;
  bowl_name: string | null;
  headline: string | null;
  recap: string | null;
  stats_json: string;
  created_at: string;
  // Joined fields
  home_team_name?: string;
  away_team_name?: string;
  home_team_abbreviation?: string;
  away_team_abbreviation?: string;
  home_team_color?: string;
  away_team_color?: string;
  home_team_ranking?: number | null;
  away_team_ranking?: number | null;
  home_team_wins?: number;
  home_team_losses?: number;
  away_team_wins?: number;
  away_team_losses?: number;
}

export interface NewsArticle {
  id: string;
  dynasty_id: string;
  season: number;
  week: number;
  title: string;
  subtitle: string;
  body: string;
  category: string;
  image_url: string | null;
  is_breaking: number;
  related_team_id: string | null;
  related_game_id: string | null;
  related_player_id: string | null;
  created_at: string;
  // Joined
  team_name?: string;
  player_name?: string;
}

export interface PickEmGame {
  id: string;
  dynasty_id: string;
  season: number;
  week: number;
  home_team_id: string;
  away_team_id: string;
  home_spread: number | null;
  user_pick: string | null;
  actual_winner: string | null;
  is_correct: number | null;
  confidence: number;
  is_gameday_game: number;
  analyst_pick: string | null;
  created_at: string;
  // Joined
  home_team_name?: string;
  away_team_name?: string;
  home_team_abbreviation?: string;
  away_team_abbreviation?: string;
  home_team_color?: string;
  away_team_color?: string;
  home_team_ranking?: number | null;
  away_team_ranking?: number | null;
}

export interface Podcast {
  id: string;
  dynasty_id: string;
  season: number;
  week: number;
  title: string;
  description: string;
  show_name: string;
  host: string;
  segments_json: string;
  talking_points_json: string;
  duration_display: string;
  created_at: string;
}

export interface PodcastSegment {
  title: string;
  description: string;
  type: "intro" | "recap" | "preview" | "interview" | "debate" | "picks" | "outro";
}

export const POSITIONS = [
  "QB", "HB", "FB", "WR", "TE", "LT", "LG", "C", "RG", "RT",
  "LE", "RE", "DT", "LOLB", "MLB", "ROLB", "CB", "FS", "SS",
  "K", "P"
] as const;

export const CONFERENCES = [
  "SEC", "Big Ten", "Big 12", "ACC", "Pac-12",
  "AAC", "Mountain West", "Sun Belt", "MAC", "C-USA",
  "Independent"
] as const;

export const YEARS = ["FR", "SO", "JR", "SR"] as const;

export const NEWS_CATEGORIES = [
  "game_recap", "preview", "rankings", "transfer", "injury",
  "milestone", "upset", "rivalry", "playoff", "award", "general"
] as const;
