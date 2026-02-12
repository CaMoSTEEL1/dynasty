import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  const db = getDb();
  const dynasties = db.prepare("SELECT * FROM dynasties ORDER BY created_at DESC").all();
  return NextResponse.json(dynasties);
}

export async function POST(request: NextRequest) {
  const db = getDb();
  const body = await request.json();
  const id = uuidv4();

  const stmt = db.prepare(`
    INSERT INTO dynasties (id, name, team_name, conference, coach_name, season, current_week)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id,
    body.name || "My Dynasty",
    body.team_name || "Unknown",
    body.conference || "",
    body.coach_name || "Coach",
    body.season || 1,
    body.current_week || 1
  );

  // If a user team was specified, create it
  if (body.team_name) {
    const teamId = uuidv4();
    db.prepare(`
      INSERT INTO teams (id, dynasty_id, name, abbreviation, conference, mascot, primary_color, is_user_team)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(
      teamId,
      id,
      body.team_name,
      body.team_abbreviation || body.team_name.substring(0, 4).toUpperCase(),
      body.conference || "",
      body.mascot || "",
      body.primary_color || "#c5a952"
    );
  }

  const dynasty = db.prepare("SELECT * FROM dynasties WHERE id = ?").get(id);
  return NextResponse.json(dynasty, { status: 201 });
}
