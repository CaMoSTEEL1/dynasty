import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(id);
  if (!team) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(team);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (["name", "abbreviation", "conference", "mascot", "primary_color", "wins", "losses", "ranking", "is_user_team"].includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length > 0) {
    values.push(id);
    db.prepare(`UPDATE teams SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(id);
  return NextResponse.json(team);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM teams WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
