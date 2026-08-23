// Standalone script to populate the `featured_deals` table with real,
// verified discounts. Not bound by Vercel's per-request time limit — meant
// to be run manually (or from a scheduled job with more time budget) rather
// than during a page render.
//
// Usage: npx tsx scripts/refresh-deals.ts

import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].trim().replace(/^"(.*)"$/, "$1");
    }
  }
}

loadEnvLocal();

async function main() {
  const { getFeaturedDeals } = await import("../lib/deals");
  const { saveFeaturedDeals, saveDealsIntro } = await import("../lib/dealsStore");

  const startedAt = Date.now();
  const { deals, intro } = await getFeaturedDeals({
    onProgress: (msg) => console.log(msg),
  });

  console.log(`\n${deals.length} descontos confirmados em ${Math.round((Date.now() - startedAt) / 1000)}s`);
  for (const d of deals) {
    console.log(`  -${d.discountPercent}%  ${d.store.padEnd(16)} ${d.title.slice(0, 60)}`);
  }

  if (deals.length > 0) {
    await saveFeaturedDeals(deals);
    console.log(`Salvos ${deals.length} destaques no banco.`);
  }
  await saveDealsIntro(intro);
  console.log("Resumo salvo.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Falha ao atualizar destaques:", err);
    process.exit(1);
  });
