import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "cfb-dynasty.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS dynasties (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      team_name TEXT NOT NULL,
      conference TEXT NOT NULL DEFAULT '',
      coach_name TEXT NOT NULL DEFAULT '',
      season INTEGER NOT NULL DEFAULT 1,
      current_week INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      dynasty_id TEXT NOT NULL,
      name TEXT NOT NULL,
      abbreviation TEXT NOT NULL DEFAULT '',
      conference TEXT NOT NULL DEFAULT '',
      mascot TEXT NOT NULL DEFAULT '',
      primary_color TEXT NOT NULL DEFAULT '#333333',
      wins INTEGER NOT NULL DEFAULT 0,
      losses INTEGER NOT NULL DEFAULT 0,
      ranking INTEGER,
      is_user_team INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (dynasty_id) REFERENCES dynasties(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS players (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      dynasty_id TEXT NOT NULL,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      number INTEGER,
      year TEXT NOT NULL DEFAULT 'FR',
      overall_rating INTEGER NOT NULL DEFAULT 70,
      is_key_player INTEGER NOT NULL DEFAULT 0,
      stats_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (dynasty_id) REFERENCES dynasties(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS games (
      id TEXT PRIMARY KEY,
      dynasty_id TEXT NOT NULL,
      season INTEGER NOT NULL DEFAULT 1,
      week INTEGER NOT NULL,
      home_team_id TEXT NOT NULL,
      away_team_id TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      is_completed INTEGER NOT NULL DEFAULT 0,
      is_rivalry INTEGER NOT NULL DEFAULT 0,
      is_conference_game INTEGER NOT NULL DEFAULT 0,
      is_bowl_game INTEGER NOT NULL DEFAULT 0,
      bowl_name TEXT,
      headline TEXT,
      recap TEXT,
      stats_json TEXT NOT NULL DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (dynasty_id) REFERENCES dynasties(id) ON DELETE CASCADE,
      FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS news_articles (
      id TEXT PRIMARY KEY,
      dynasty_id TEXT NOT NULL,
      season INTEGER NOT NULL DEFAULT 1,
      week INTEGER NOT NULL,
      title TEXT NOT NULL,
      subtitle TEXT NOT NULL DEFAULT '',
      body TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      image_url TEXT,
      is_breaking INTEGER NOT NULL DEFAULT 0,
      related_team_id TEXT,
      related_game_id TEXT,
      related_player_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (dynasty_id) REFERENCES dynasties(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pickem_games (
      id TEXT PRIMARY KEY,
      dynasty_id TEXT NOT NULL,
      season INTEGER NOT NULL DEFAULT 1,
      week INTEGER NOT NULL,
      home_team_id TEXT NOT NULL,
      away_team_id TEXT NOT NULL,
      home_spread REAL,
      user_pick TEXT,
      actual_winner TEXT,
      is_correct INTEGER,
      confidence INTEGER NOT NULL DEFAULT 1,
      is_gameday_game INTEGER NOT NULL DEFAULT 0,
      analyst_pick TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (dynasty_id) REFERENCES dynasties(id) ON DELETE CASCADE,
      FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS podcasts (
      id TEXT PRIMARY KEY,
      dynasty_id TEXT NOT NULL,
      season INTEGER NOT NULL DEFAULT 1,
      week INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      show_name TEXT NOT NULL DEFAULT 'Dynasty Central',
      host TEXT NOT NULL DEFAULT 'AI Analyst',
      segments_json TEXT NOT NULL DEFAULT '[]',
      talking_points_json TEXT NOT NULL DEFAULT '[]',
      duration_display TEXT NOT NULL DEFAULT '00:00',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (dynasty_id) REFERENCES dynasties(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_teams_dynasty ON teams(dynasty_id);
    CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
    CREATE INDEX IF NOT EXISTS idx_players_dynasty ON players(dynasty_id);
    CREATE INDEX IF NOT EXISTS idx_games_dynasty_week ON games(dynasty_id, week);
    CREATE INDEX IF NOT EXISTS idx_news_dynasty_week ON news_articles(dynasty_id, week);
    CREATE INDEX IF NOT EXISTS idx_pickem_dynasty_week ON pickem_games(dynasty_id, week);
    CREATE INDEX IF NOT EXISTS idx_podcasts_dynasty_week ON podcasts(dynasty_id, week);
  `);
}
