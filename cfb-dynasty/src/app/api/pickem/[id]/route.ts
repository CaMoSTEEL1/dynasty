import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (["user_pick", "actual_winner", "is_correct", "confidence", "home_spread", "is_gameday_game"].includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  // Auto-calculate correctness if both pick and winner are set
  if (body.actual_winner && body.user_pick) {
    fields.push("is_correct = ?");
    values.push(body.actual_winner === body.user_pick ? 1 : 0);
  } else if (body.actual_winner) {
    // Check existing user_pick
    const existing = db.prepare("SELECT user_pick FROM pickem_games WHERE id = ?").get(id) as { user_pick: string } | undefined;
    if (existing?.user_pick) {
      fields.push("is_correct = ?");
      values.push(body.actual_winner === existing.user_pick ? 1 : 0);
    }
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE pickem_games SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  const game = db.prepare(`
    SELECT pg.*,
      ht.name as home_team_name, ht.abbreviation as home_team_abbreviation,
      at.name as away_team_name, at.abbreviation as away_team_abbreviation
    FROM pickem_games pg
    JOIN teams ht ON pg.home_team_id = ht.id
    JOIN teams at ON pg.away_team_id = at.id
    WHERE pg.id = ?
  `).get(id);

  return NextResponse.json(game);
}
