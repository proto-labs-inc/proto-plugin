import "server-only";

import fs from "node:fs";
import path from "node:path";

/**
 * Host env resolution: `process.env` (incl. Vercel) first, then `.env.local`.
 * Use this for every host configuration variable — not only bootstrap keys.
 */

export function resolveHostRoot(explicitHostRoot?: string): string {
  if (explicitHostRoot) {
    return explicitHostRoot;
  }

  let dir = process.cwd();
  while (true) {
    if (fs.existsSync(path.join(dir, "prototype.config.ts"))) {
      return dir;
    }

    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  return process.cwd();
}

export function readEnvLocalFile(hostRoot: string): string {
  try {
    return fs.readFileSync(path.join(hostRoot, ".env.local"), "utf8");
  } catch {
    return "";
  }
}

function parseEnvLocalValue(fileContents: string, key: string): string | undefined {
  const match = fileContents.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (!match) return undefined;
  const value = match[1]
    .trim()
    .replace(/^["']|["']$/g, "");
  return value.length > 0 ? value : undefined;
}

export function readEnvLocalValue(
  hostRoot: string,
  key: string,
): string | undefined {
  return parseEnvLocalValue(readEnvLocalFile(hostRoot), key);
}

/** Prefer process.env (Vercel / Next), fall back to `.env.local` on disk. */
export function readHostEnvValue(
  hostRoot: string,
  key: string,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const fromProcess = env[key]?.trim();
  if (fromProcess) return fromProcess;
  return readEnvLocalValue(hostRoot, key);
}

export function hostEnvHasValue(
  hostRoot: string,
  key: string,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return Boolean(readHostEnvValue(hostRoot, key, env));
}
