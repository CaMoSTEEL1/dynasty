import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  const db = getDb();
  const dynastyId = request.nextUrl.searchParams.get("dynasty_id");
  const week = request.nextUrl.searchParams.get("week");
  const category = request.nextUrl.searchParams.get("category");
  const limit = request.nextUrl.searchParams.get("limit");

  if (!dynastyId) return NextResponse.json({ error: "dynasty_id required" }, { status: 400 });

  let query = `
    SELECT n.*, t.name as team_name, p.name as player_name
    FROM news_articles n
    LEFT JOIN teams t ON n.related_team_id = t.id
    LEFT JOIN players p ON n.related_player_id = p.id
    WHERE n.dynasty_id = ?
  `;
  const queryParams: unknown[] = [dynastyId];

  if (week) {
    query += " AND n.week = ?";
    queryParams.push(parseInt(week));
  }
  if (category) {
    query += " AND n.category = ?";
    queryParams.push(category);
  }

  query += " ORDER BY n.is_breaking DESC, n.created_at DESC";

  if (limit) {
    query += ` LIMIT ${parseInt(limit)}`;
  }

  const articles = db.prepare(query).all(...queryParams);
  return NextResponse.json(articles);
}
