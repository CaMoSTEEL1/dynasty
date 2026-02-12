import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { v4 as uuidv4 } from "uuid";
import { Team, Player, Game } from "@/app/lib/types";
import { generateGameRecapArticle, generateWeeklyStorylines, generatePodcastContent } from "@/app/lib/storyline-engine";

export async function GET(request: NextRequest) {
  const db = getDb();
  const dynastyId = request.nextUrl.searchParams.get("dynasty_id");
  const week = request.nextUrl.searchParams.get("week");
  const season = request.nextUrl.searchParams.get("season");

  if (!dynastyId) return NextResponse.json({ error: "dynasty_id required" }, { status: 400 });

  let query = `
    SELECT g.*,
      ht.name as home_team_name, ht.abbreviation as home_team_abbreviation, ht.primary_color as home_team_color,
      ht.ranking as home_team_ranking, ht.wins as home_team_wins, ht.losses as home_team_losses,
      at.name as away_team_name, at.abbreviation as away_team_abbreviation, at.primary_color as away_team_color,
      at.ranking as away_team_ranking, at.wins as away_team_wins, at.losses as away_team_losses
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.id
    JOIN teams at ON g.away_team_id = at.id
    WHERE g.dynasty_id = ?
  `;
  const queryParams: unknown[] = [dynastyId];

  if (week) {
    query += " AND g.week = ?";
    queryParams.push(parseInt(week));
  }
  if (season) {
    query += " AND g.season = ?";
    queryParams.push(parseInt(season));
  }

  query += " ORDER BY g.week ASC, g.created_at ASC";

  const games = db.prepare(query).all(...queryParams);
  return NextResponse.json(games);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO games (id, dynasty_id, season, week, home_team_id, away_team_id, home_score, away_score,
      is_completed, is_rivalry, is_conference_game, is_bowl_game, bowl_name, headline, recap, stats_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.dynasty_id,
    body.season || 1,
    body.week || 1,
    body.home_team_id,
    body.away_team_id,
    body.home_score ?? null,
    body.away_score ?? null,
    body.is_completed ? 1 : 0,
    body.is_rivalry ? 1 : 0,
    body.is_conference_game ? 1 : 0,
    body.is_bowl_game ? 1 : 0,
    body.bowl_name || null,
    body.headline || null,
    body.recap || null,
    JSON.stringify(body.stats || {})
  );

  // If game is completed, auto-generate storylines
  if (body.is_completed && body.home_score !== null && body.away_score !== null) {
    await generateStoryContent(db, id, body.dynasty_id, body.season || 1, body.week || 1);
  }

  const game = db.prepare(`
    SELECT g.*,
      ht.name as home_team_name, ht.abbreviation as home_team_abbreviation, ht.primary_color as home_team_color,
      ht.ranking as home_team_ranking, ht.wins as home_team_wins, ht.losses as home_team_losses,
      at.name as away_team_name, at.abbreviation as away_team_abbreviation, at.primary_color as away_team_color,
      at.ranking as away_team_ranking, at.wins as away_team_wins, at.losses as away_team_losses
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.id
    JOIN teams at ON g.away_team_id = at.id
    WHERE g.id = ?
  `).get(id);

  return NextResponse.json(game, { status: 201 });
}

async function generateStoryContent(db: ReturnType<typeof getDb>, gameId: string, dynastyId: string, season: number, week: number) {
  const game = db.prepare("SELECT * FROM games WHERE id = ?").get(gameId) as Game;
  const homeTeam = db.prepare("SELECT * FROM teams WHERE id = ?").get(game.home_team_id) as Team;
  const awayTeam = db.prepare("SELECT * FROM teams WHERE id = ?").get(game.away_team_id) as Team;
  const homePlayers = db.prepare("SELECT * FROM players WHERE team_id = ?").all(game.home_team_id) as Player[];
  const awayPlayers = db.prepare("SELECT * FROM players WHERE team_id = ?").all(game.away_team_id) as Player[];

  // Update team records
  const homeWon = (game.home_score ?? 0) > (game.away_score ?? 0);
  if (homeWon) {
    db.prepare("UPDATE teams SET wins = wins + 1 WHERE id = ?").run(homeTeam.id);
    db.prepare("UPDATE teams SET losses = losses + 1 WHERE id = ?").run(awayTeam.id);
  } else {
    db.prepare("UPDATE teams SET wins = wins + 1 WHERE id = ?").run(awayTeam.id);
    db.prepare("UPDATE teams SET losses = losses + 1 WHERE id = ?").run(homeTeam.id);
  }

  // Generate game recap article
  const article = generateGameRecapArticle({
    game,
    homeTeam,
    awayTeam,
    homePlayers,
    awayPlayers,
    dynastyId,
    season,
    week,
  });

  db.prepare(`
    INSERT INTO news_articles (id, dynasty_id, season, week, title, subtitle, body, category, image_url, is_breaking, related_team_id, related_game_id, related_player_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    article.id, article.dynasty_id, article.season, article.week,
    article.title, article.subtitle, article.body, article.category,
    article.image_url, article.is_breaking, article.related_team_id,
    article.related_game_id, article.related_player_id
  );

  // Generate weekly storylines
  const allTeams = db.prepare("SELECT * FROM teams WHERE dynasty_id = ?").all(dynastyId) as Team[];
  const weekGames = db.prepare("SELECT * FROM games WHERE dynasty_id = ? AND week = ? AND is_completed = 1").all(dynastyId, week) as Game[];

  const weeklyArticles = generateWeeklyStorylines(dynastyId, season, week, allTeams, weekGames);
  for (const wa of weeklyArticles) {
    // Check if similar article already exists for this week
    const existing = db.prepare(
      "SELECT id FROM news_articles WHERE dynasty_id = ? AND week = ? AND category = ? AND season = ?"
    ).get(dynastyId, week, wa.category, season);

    if (!existing) {
      db.prepare(`
        INSERT INTO news_articles (id, dynasty_id, season, week, title, subtitle, body, category, image_url, is_breaking, related_team_id, related_game_id, related_player_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        wa.id, wa.dynasty_id, wa.season, wa.week,
        wa.title, wa.subtitle, wa.body, wa.category,
        wa.image_url, wa.is_breaking, wa.related_team_id,
        wa.related_game_id, wa.related_player_id
      );
    }
  }

  // Generate/update podcast
  const existingPodcast = db.prepare(
    "SELECT id FROM podcasts WHERE dynasty_id = ? AND week = ? AND season = ?"
  ).get(dynastyId, week, season);

  if (!existingPodcast) {
    const podcast = generatePodcastContent(dynastyId, season, week, allTeams, weekGames);
    db.prepare(`
      INSERT INTO podcasts (id, dynasty_id, season, week, title, description, show_name, host, segments_json, talking_points_json, duration_display)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      podcast.id, podcast.dynasty_id, podcast.season, podcast.week,
      podcast.title, podcast.description, podcast.show_name, podcast.host,
      podcast.segments_json, podcast.talking_points_json, podcast.duration_display
    );
  }
}
