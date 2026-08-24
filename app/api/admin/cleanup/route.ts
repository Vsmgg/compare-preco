import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const deleted = await sql`
    DELETE FROM featured_deals
    WHERE title ~ '^[a-zA-Z0-9.-]+\.com(\.br)?\s*:\s*[^:]+:\s*[^:]+$'
    RETURNING title, store
  `;

  return NextResponse.json({ ok: true, deleted });
}
