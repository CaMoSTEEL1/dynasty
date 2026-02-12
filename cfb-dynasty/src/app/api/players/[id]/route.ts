import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (["name", "position", "number", "year", "overall_rating", "is_key_player"].includes(key)) {
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
    db.prepare(`UPDATE players SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  const player = db.prepare("SELECT * FROM players WHERE id = ?").get(id);
  return NextResponse.json(player);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM players WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
