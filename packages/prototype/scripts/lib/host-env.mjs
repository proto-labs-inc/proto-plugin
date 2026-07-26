import fs from "node:fs";
import path from "node:path";

/**
 * Host env resolution: `process.env` (incl. Vercel) first, then `.env.local`.
 * Use this for every host configuration variable — not only bootstrap keys.
 */

export function readEnvLocalFile(hostRoot) {
  try {
    return fs.readFileSync(path.join(hostRoot, ".env.local"), "utf8");
  } catch {
    return "";
  }
}

function parseEnvLocalValue(fileContents, key) {
  const match = fileContents.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) return undefined;
  return match[1]
    .trim()
    .replace(/^["']|["']$/g, "");
}

export function readEnvLocalValue(hostRoot, key) {
  const value = parseEnvLocalValue(readEnvLocalFile(hostRoot), key);
  if (value == null || value.length === 0) return undefined;
  return value;
}

/** Prefer process.env (Vercel / Next), fall back to `.env.local` on disk. */
export function readHostEnvValue(hostRoot, key, env = process.env) {
  const fromProcess = env[key];
  if (typeof fromProcess === "string" && fromProcess.trim().length > 0) {
    return fromProcess.trim();
  }
  return readEnvLocalValue(hostRoot, key);
}

export function hostEnvHasValue(hostRoot, key, env = process.env) {
  return Boolean(readHostEnvValue(hostRoot, key, env));
}
