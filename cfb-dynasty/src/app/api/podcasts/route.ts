import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET(request: NextRequest) {
  const db = getDb();
  const dynastyId = request.nextUrl.searchParams.get("dynasty_id");
  const week = request.nextUrl.searchParams.get("week");

  if (!dynastyId) return NextResponse.json({ error: "dynasty_id required" }, { status: 400 });

  let query = "SELECT * FROM podcasts WHERE dynasty_id = ?";
  const queryParams: unknown[] = [dynastyId];

  if (week) {
    query += " AND week = ?";
    queryParams.push(parseInt(week));
  }

  query += " ORDER BY week DESC, created_at DESC";

  const podcasts = db.prepare(query).all(...queryParams);
  return NextResponse.json(podcasts);
}
