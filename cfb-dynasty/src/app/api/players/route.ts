import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  const db = getDb();
  const teamId = request.nextUrl.searchParams.get("team_id");
  const dynastyId = request.nextUrl.searchParams.get("dynasty_id");
  const keyOnly = request.nextUrl.searchParams.get("key_only");

  let query = "SELECT p.*, t.name as team_name FROM players p JOIN teams t ON p.team_id = t.id WHERE 1=1";
  const queryParams: unknown[] = [];

  if (teamId) {
    query += " AND p.team_id = ?";
    queryParams.push(teamId);
  }
  if (dynastyId) {
    query += " AND p.dynasty_id = ?";
    queryParams.push(dynastyId);
  }
  if (keyOnly === "true") {
    query += " AND p.is_key_player = 1";
  }

  query += " ORDER BY p.overall_rating DESC, p.name ASC";

  const players = db.prepare(query).all(...queryParams);
  return NextResponse.json(players);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO players (id, team_id, dynasty_id, name, position, number, year, overall_rating, is_key_player, stats_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.team_id,
    body.dynasty_id,
    body.name || "New Player",
    body.position || "QB",
    body.number ?? null,
    body.year || "FR",
    body.overall_rating || 70,
    body.is_key_player ? 1 : 0,
    JSON.stringify(body.stats || {})
  );

  const player = db.prepare("SELECT * FROM players WHERE id = ?").get(id);
  return NextResponse.json(player, { status: 201 });
}
