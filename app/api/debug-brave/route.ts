import { braveWebSearch } from "@/lib/brave";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "smart tv 65 polegadas desconto oferta";
  const results = await braveWebSearch(q, 10);
  return NextResponse.json(
    results.map((r) => ({
      title: r.title,
      description: r.description,
      extra_snippets: r.extra_snippets,
      subtype: r.subtype,
      url: r.url,
    })),
  );
}
