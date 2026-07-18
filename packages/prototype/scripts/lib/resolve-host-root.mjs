import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function resolveHostRoot(toolRootPath) {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, "prototype.config.ts"))) {
    return cwd;
  }

  let dir = path.resolve(toolRootPath, "..");
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "prototype.config.ts"))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return path.resolve(toolRootPath, "..", "..");
}

export function resolveToolRoot(importMetaUrl) {
  return path.resolve(path.dirname(fileURLToPath(importMetaUrl)), "..");
}
