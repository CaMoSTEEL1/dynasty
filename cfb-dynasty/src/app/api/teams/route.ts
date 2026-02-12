import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET(request: NextRequest) {
  const db = getDb();
  const dynastyId = request.nextUrl.searchParams.get("dynasty_id");
  if (!dynastyId) return NextResponse.json({ error: "dynasty_id required" }, { status: 400 });

  const teams = db.prepare("SELECT * FROM teams WHERE dynasty_id = ? ORDER BY ranking ASC, wins DESC, name ASC").all(dynastyId);
  return NextResponse.json(teams);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const id = uuidv4();

  db.prepare(`
    INSERT INTO teams (id, dynasty_id, name, abbreviation, conference, mascot, primary_color, wins, losses, ranking, is_user_team)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    body.dynasty_id,
    body.name || "New Team",
    body.abbreviation || "TEAM",
    body.conference || "",
    body.mascot || "",
    body.primary_color || "#333333",
    body.wins || 0,
    body.losses || 0,
    body.ranking || null,
    body.is_user_team ? 1 : 0
  );

  const team = db.prepare("SELECT * FROM teams WHERE id = ?").get(id);
  return NextResponse.json(team, { status: 201 });
}
