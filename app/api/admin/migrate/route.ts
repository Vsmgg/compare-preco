import fs from "node:fs";
import path from "node:path";
import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const migrationsDir = path.join(process.cwd(), "migrations");
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const applied: string[] = [];
  try {
    for (const file of files) {
      const content = fs.readFileSync(path.join(migrationsDir, file), "utf8");
      const withoutComments = content.replace(/^--.*$/gm, "");
      const statements = withoutComments
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      for (const stmt of statements) {
        await sql.query(stmt);
      }
      applied.push(file);
    }
    return NextResponse.json({ ok: true, applied });
  } catch (err) {
    return NextResponse.json({ ok: false, applied, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
