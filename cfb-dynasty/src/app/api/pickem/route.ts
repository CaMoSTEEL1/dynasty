import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  const db = getDb();
  const dynastyId = request.nextUrl.searchParams.get("dynasty_id");
  const week = request.nextUrl.searchParams.get("week");

  if (!dynastyId) return NextResponse.json({ error: "dynasty_id required" }, { status: 400 });

  let query = `
    SELECT pg.*,
      ht.name as home_team_name, ht.abbreviation as home_team_abbreviation, ht.primary_color as home_team_color, ht.ranking as home_team_ranking,
      at.name as away_team_name, at.abbreviation as away_team_abbreviation, at.primary_color as away_team_color, at.ranking as away_team_ranking
    FROM pickem_games pg
    JOIN teams ht ON pg.home_team_id = ht.id
    JOIN teams at ON pg.away_team_id = at.id
    WHERE pg.dynasty_id = ?
  `;
  const queryParams: unknown[] = [dynastyId];

  if (week) {
    query += " AND pg.week = ?";
    queryParams.push(parseInt(week));
  }

  query += " ORDER BY pg.is_gameday_game DESC, pg.confidence DESC";

  const games = db.prepare(query).all(...queryParams);

  // Also get aggregate stats
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total_picks,
      SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_picks,
      SUM(CASE WHEN is_correct = 0 THEN 1 ELSE 0 END) as incorrect_picks,
      SUM(CASE WHEN is_correct IS NULL THEN 1 ELSE 0 END) as pending_picks
    FROM pickem_games WHERE dynasty_id = ? AND user_pick IS NOT NULL
  `).get(dynastyId);

  return NextResponse.json({ games, stats });
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const id = uuidv4();

  // Random analyst pick for fun
  const analystPick = Math.random() > 0.5 ? body.home_team_id : body.away_team_id;

  db.prepare(`
    INSERT INTO pickem_games (id, dynasty_id, season, week, home_team_id, away_team_id, home_spread, user_pick, confidence, is_gameday_game, analyst_pick)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.dynasty_id,
    body.season || 1,
    body.week || 1,
    body.home_team_id,
    body.away_team_id,
    body.home_spread ?? null,
    body.user_pick || null,
    body.confidence || 1,
    body.is_gameday_game ? 1 : 0,
    analystPick
  );

  const game = db.prepare(`
    SELECT pg.*,
      ht.name as home_team_name, ht.abbreviation as home_team_abbreviation, ht.primary_color as home_team_color,
      at.name as away_team_name, at.abbreviation as away_team_abbreviation, at.primary_color as away_team_color
    FROM pickem_games pg
    JOIN teams ht ON pg.home_team_id = ht.id
    JOIN teams at ON pg.away_team_id = at.id
    WHERE pg.id = ?
  `).get(id);

  return NextResponse.json(game, { status: 201 });
}
