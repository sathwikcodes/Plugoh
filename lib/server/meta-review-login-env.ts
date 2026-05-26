import "server-only";
import { existsSync, readFileSync } from "fs";
import { join } from "path";

const META_REVIEW_KEYS = ["META_REVIEW_EMAIL", "META_REVIEW_PASSWORD"] as const;

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

function loadFromEnvLocal() {
  const path = join(process.cwd(), ".env.local");
  if (!existsSync(path)) return {};
  try {
    return parseDotenvKeys(readFileSync(path, "utf8"), META_REVIEW_KEYS);
  } catch {
    return {};
  }
}

export function isMetaReviewLoginEnabled() {
  return process.env.NEXT_PUBLIC_META_REVIEW_ENABLED === "true";
}

export function getMetaReviewLoginSecrets() {
  const file = loadFromEnvLocal();
  const email = (
    process.env.META_REVIEW_EMAIL ??
    file.META_REVIEW_EMAIL ??
    ""
  ).trim();
  const password = (
    process.env.META_REVIEW_PASSWORD ??
    file.META_REVIEW_PASSWORD ??
    ""
  ).trim();
  return { email, password };
}
