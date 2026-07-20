import fs from "node:fs";
import path from "node:path";

import { resolveImportInfoFromProfile } from "./design-system-profile.mjs";

/**
 * Component-file location + import resolution for the scaffolder.
 *
 * NOTE: the old `detectDesignSystemPackages()` (which *guessed* the primitive /
 * composite package by grepping dependency names) has been DELETED. Under the
 * hybrid two-phase design the agent declares packages, roots, and import styles
 * in `design-system-profile.json`; the engine only *applies* those declarations
 * via `resolveImportInfoFromProfile`. This file no longer concludes structure —
 * it just locates source files (evidence) and re-exports the profile resolver.
 */

export { resolveImportInfoFromProfile };

export function readHostPackageJson(hostRoot) {
  const packageJsonPath = path.join(hostRoot, "package.json");
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch {
    return {};
  }
}

/** Evidence utility: export names declared by a barrel index file. */
export function readBarrelExportNames(barrelPath) {
  if (!fs.existsSync(barrelPath)) return new Set();
  const text = fs.readFileSync(barrelPath, "utf8");
  const names = new Set();
  const re =
    /export\s+(?:\{([^}]+)\}|(?:type\s+)?(?:const|function|class)\s+(\w+)|(?:type\s+)?(\w+)\s+as\s+(\w+))/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    if (match[1]) {
      for (const part of match[1].split(",")) {
        const trimmed = part.trim();
        const asMatch = trimmed.match(/(\w+)\s+as\s+(\w+)/);
        names.add(asMatch ? asMatch[2] : trimmed.split(/\s+/)[0]);
      }
    } else if (match[2]) names.add(match[2]);
    else if (match[4]) names.add(match[4]);
    else if (match[3]) names.add(match[3]);
  }
  return names;
}

/** Locate the source file for an enumerated component within a root. */
export function findComponentSourceFile(rootAbs, record) {
  const candidates = [
    path.join(rootAbs, `${record.kebab}.tsx`),
    path.join(rootAbs, `${record.kebab}.jsx`),
    path.join(rootAbs, record.kebab, "index.tsx"),
    path.join(rootAbs, record.kebab, "index.jsx"),
    path.join(rootAbs, record.kebab, "index.ts"),
    path.join(rootAbs, record.name, "index.tsx"),
    path.join(rootAbs, record.name, `${record.name}.tsx`),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  try {
    const entries = fs.readdirSync(rootAbs, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.toLowerCase() !== record.kebab.toLowerCase()) continue;
      for (const idxName of ["index.tsx", "index.ts", "index.jsx"]) {
        const idx = path.join(rootAbs, entry.name, idxName);
        if (fs.existsSync(idx)) return idx;
      }
    }
  } catch {
    // ignore
  }

  return null;
}
