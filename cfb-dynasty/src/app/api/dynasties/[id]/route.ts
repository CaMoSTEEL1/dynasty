import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const dynasty = db.prepare("SELECT * FROM dynasties WHERE id = ?").get(id);
  if (!dynasty) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(dynasty);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const body = await request.json();

  const fields: string[] = [];
  const values: unknown[] = [];

  for (const [key, value] of Object.entries(body)) {
    if (["name", "team_name", "conference", "coach_name", "season", "current_week"].includes(key)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  }

  if (fields.length > 0) {
    fields.push("updated_at = datetime('now')");
    values.push(id);
    db.prepare(`UPDATE dynasties SET ${fields.join(", ")} WHERE id = ?`).run(...values);
  }

  const dynasty = db.prepare("SELECT * FROM dynasties WHERE id = ?").get(id);
  return NextResponse.json(dynasty);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  db.prepare("DELETE FROM dynasties WHERE id = ?").run(id);
  return NextResponse.json({ success: true });
}
