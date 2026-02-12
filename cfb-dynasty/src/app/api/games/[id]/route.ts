import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (["season", "week", "home_team_id", "away_team_id", "home_score", "away_score",
         "is_completed", "is_rivalry", "is_conference_game", "is_bowl_game",
         "bowl_name", "headline", "recap"].includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (body.stats) {
    fields.push("stats_json = ?");
    values.push(JSON.stringify(body.stats));
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE games SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  const game = db.prepare(`
    SELECT g.*,
      ht.name as home_team_name, ht.abbreviation as home_team_abbreviation, ht.primary_color as home_team_color,
      ht.ranking as home_team_ranking,
      at.name as away_team_name, at.abbreviation as away_team_abbreviation, at.primary_color as away_team_color,
      at.ranking as away_team_ranking
    FROM games g
    JOIN teams ht ON g.home_team_id = ht.id
    JOIN teams at ON g.away_team_id = at.id
    WHERE g.id = ?
  `).get(id);
  return NextResponse.json(game);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM games WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
