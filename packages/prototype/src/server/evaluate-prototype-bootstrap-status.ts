import fs from "node:fs";
import path from "node:path";

import type { PathExistenceChecker } from "@prototype/lib/prototypes/prototype-bootstrap-status";
import {
  evaluateBootstrapRequirements,
  type PrototypeBootstrapStatus,
} from "@prototype/lib/prototypes/prototype-bootstrap-status";
import type { PrototypeBootstrapConfig } from "@prototype/lib/prototypes/prototype-config-types";

const SOURCE_FILE_EXTENSIONS = new Set([".ts", ".tsx", ".css"]);

function directoryHasSourceFile(dirPath: string, depth = 0): boolean {
  if (depth > 2 || !fs.existsSync(dirPath)) return false;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dirPath, { withFileTypes: true });
  } catch {
    return false;
  }

  for (const entry of entries) {
    const entryPath = path.join(dirPath, entry.name);
    if (entry.isFile()) {
      const extension = path.extname(entry.name).toLowerCase();
      if (SOURCE_FILE_EXTENSIONS.has(extension)) {
        try {
          if (fs.statSync(entryPath).size > 0) return true;
        } catch {
          continue;
        }
      }
      continue;
    }

    if (entry.isDirectory() && directoryHasSourceFile(entryPath, depth + 1)) {
      return true;
    }
  }

  return false;
}

export function createHostPathExistenceChecker(
  hostRoot: string,
): PathExistenceChecker {
  return (relativePath: string) => {
    const normalized = relativePath.replace(/^\/+/, "");
    const fullPath = path.join(hostRoot, normalized);

    try {
      const stats = fs.lstatSync(fullPath);

      if (stats.isSymbolicLink()) {
        const targetStats = fs.statSync(fullPath);
        if (targetStats.isDirectory()) {
          return directoryHasSourceFile(fullPath);
        }
        return targetStats.size > 0;
      }

      if (stats.isDirectory()) {
        return directoryHasSourceFile(fullPath);
      }

      return stats.isFile() && stats.size > 0;
    } catch {
      return false;
    }
  };
}

export function evaluateHostBootstrapStatus(options: {
  hostRoot?: string;
  bootstrap?: PrototypeBootstrapConfig;
  env?: NodeJS.ProcessEnv;
}): PrototypeBootstrapStatus {
  const hostRoot = options.hostRoot ?? process.cwd();
  const checkExists = createHostPathExistenceChecker(hostRoot);

  return evaluateBootstrapRequirements({
    bootstrap: options.bootstrap,
    env: options.env ?? process.env,
    checkExists,
  });
}
