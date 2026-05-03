import "server-only";
import { existsSync, readFileSync } from "fs";
import { join } from "path";
import type { AppRole } from "@/lib/auth-routing";

const DEMO_KEYS = [
  "DEMO_ACCOUNT_PASSWORD",
  "DEMO_BRAND_EMAIL",
  "DEMO_CREATOR_EMAIL",
] as const;

function parseDotenvKeys(contents: string, keys: readonly string[]) {
  const want = new Set(keys);
  const out: Record<string, string> = {};
  for (const line of contents.split("\n")) {
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

function loadDemoKeysFromEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return {};
  try {
    return parseDotenvKeys(readFileSync(path, "utf8"), DEMO_KEYS);
  } catch {
    return {};
  }
}

export function getDemoLoginSecrets(role: AppRole) {
  const file = loadDemoKeysFromEnvLocal();

  const password = (
    process.env.DEMO_ACCOUNT_PASSWORD ??
    file.DEMO_ACCOUNT_PASSWORD ??
    ""
  ).trim();

  const email =
    (role === "business"
      ? (process.env.DEMO_BRAND_EMAIL ?? file.DEMO_BRAND_EMAIL)
      : (process.env.DEMO_CREATOR_EMAIL ?? file.DEMO_CREATOR_EMAIL)
    )?.trim() ?? "";

  return { password, email };
}
