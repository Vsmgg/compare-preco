import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const ROOT = path.resolve(import.meta.dirname, "..");

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

loadEnvLocal();

const connectionString = process.env.DATABASE_URL_UNPOOLED;
if (!connectionString) {
  console.error("DATABASE_URL_UNPOOLED não definido.");
  process.exit(1);
}

const sql = fs.readFileSync(path.join(ROOT, "migrations", "001_init.sql"), "utf8");

const client = new pg.Client({ connectionString });

async function main() {
  await client.connect();
  await client.query(sql);
  console.log("Migração aplicada com sucesso.");
  await client.end();
}

main().catch((err) => {
  console.error("Falha na migração:", err.message);
  process.exit(1);
});
