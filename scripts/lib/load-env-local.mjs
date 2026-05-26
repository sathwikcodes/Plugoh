import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export function loadEnvLocal(keys) {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return {};
  const want = new Set(keys);
  const out = {};
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    if (!want.has(key)) continue;
    let val = t.slice(eq + 1).trim();
    const q = val[0];
    if ((q === '"' && val.endsWith('"')) || (q === "'" && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

export function envOrLocal(key) {
  const file = loadEnvLocal([key]);
  return (process.env[key] ?? file[key] ?? "").trim();
}
