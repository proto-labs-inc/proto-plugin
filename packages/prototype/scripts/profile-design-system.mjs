#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { gatherDesignSystemEvidence } from "./lib/design-system-evidence.mjs";
import {
  PROFILE_RELATIVE_PATH,
  loadProfile,
  validateProfile,
} from "./lib/design-system-profile.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

/**
 * PHASE 1 — scope the design system (agent-driven).
 *
 * This script does NOT decide anything structural. It writes an evidence bundle
 * (`.proto/design-system-evidence.json`) of raw facts — candidate packages,
 * their exports maps, component dir listings, story counts, context-token hits —
 * and prints the instruction telling the agent to REASON about that evidence and
 * WRITE `.proto/design-system-profile.json`. Phase 2 (`scaffold-component-library`)
 * consumes the profile deterministically.
 */

const EVIDENCE_RELATIVE_PATH = path.join(
  ".proto",
  "design-system-evidence.json",
);

function scopeInstruction(hostRoot, evidence) {
  const pkgLines = evidence.packages.map((p) => {
    const styleHint = p.exports
      ? p.exports
          .map((e) => `${e.key} → ${e.target}`)
          .slice(0, 6)
          .join("; ")
      : p.main
        ? `main: ${p.main}`
        : "(no exports/main)";
    const dirHint = p.componentDirs
      .map((d) => `${d.rel} (${d.topLevelFiles} files, ${d.topLevelDirs} dirs)`)
      .join(", ");
    return [
      `- ${p.name ?? "(unnamed)"} @ ${p.dir}`,
      `    exports: ${styleHint}`,
      `    component dirs: ${dirHint || "(none found)"}`,
      `    stories: ${p.stories}, context hits: ${Object.keys(p.contextHits).join(", ") || "none"}`,
    ].join("\n");
  });

  return [
    "================ PHASE 1: SCOPE THE DESIGN SYSTEM ================",
    "",
    "Assume you can predict NOTHING about this design system. Read the source —",
    "package.json `exports`, a sample of component files, stories, theme CSS — and",
    "reason out the structure yourself. The facts below are a starting point, not",
    "conclusions.",
    "",
    `Evidence written to: ${EVIDENCE_RELATIVE_PATH}`,
    "",
    "Candidate packages (facts only):",
    ...pkgLines,
    "",
    "Now WRITE the profile to `" + PROFILE_RELATIVE_PATH + "` (schema in",
    "node_modules/proto-plugin/scripts/lib/design-system-profile.mjs). It must declare:",
    "",
    "  • packages[]  — { name, dir, importStyle: \"barrel\"|\"subpath\", aliasPrefix? }",
    "  • roots.primitive[] / roots.composite[] — { rel, package, specifierTemplate }",
    "        specifierTemplate uses \"{slug}\" for subpath imports, e.g.",
    "          \"@coss/ui/components/{slug}\"  (subpath, {slug}=kebab file/dir id)",
    "          \"@calcom/ui/components/{slug}\" (subpath, dir-index components)",
    "          \"@onlook/ui/{slug}\"           (wildcard root subpath)",
    "          \"@plane/ui\"                    (BARREL — no {slug}, named import)",
    "  • themes.modes[] (e.g. [\"light\"] or [\"light\",\"dark\"] — only what the source ships)",
    "  • themes.roles[] — semantic token roles to swatch (background, foreground, primary, …)",
    "  • providers — { needed, importPath, componentName } if any component needs app",
    "        context (i18n/form/router). Author that wrapper in component-library-providers.tsx.",
    "  • authored[] — components whose previews you will hand-author (context-bound / needs",
    "        composition like tables). The engine will not fake these.",
    "  • skips[] — { name, category, reason } for genuinely non-visual exports.",
    "",
    "Pick import styles from each package's ACTUAL `exports` map (above), not from",
    "its name. When the same export name exists in two packages, they collide — set",
    "an aliasPrefix per package so the engine can de-collide (CossButton / CalcomButton).",
    "",
    "Then run Phase 2:",
    "  node node_modules/proto-plugin/scripts/generate-design-system.mjs",
    "================================================================",
  ].join("\n");
}

function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);

  const evidence = gatherDesignSystemEvidence(hostRoot);
  const evidencePath = path.join(hostRoot, EVIDENCE_RELATIVE_PATH);
  fs.mkdirSync(path.dirname(evidencePath), { recursive: true });
  fs.writeFileSync(evidencePath, JSON.stringify(evidence, null, 2), "utf8");

  console.log(
    `Gathered evidence for ${evidence.packages.length} candidate package(s) → ${EVIDENCE_RELATIVE_PATH}`,
  );
  if (evidence.sourceRoot) {
    console.log(`Linked source: ${evidence.sourceRoot}`);
  } else {
    console.log("WARN: no source/ symlink — run pnpm link-source for full evidence.");
  }
  console.log("");
  console.log(scopeInstruction(hostRoot, evidence));

  // If a profile already exists, report its validity so re-runs are informative.
  const existing = loadProfile(hostRoot);
  if (existing) {
    const { ok, errors } = validateProfile(existing);
    console.log("");
    if (ok) {
      console.log(
        `A valid ${PROFILE_RELATIVE_PATH} already exists — run Phase 2 to generate.`,
      );
    } else {
      console.log(`Existing ${PROFILE_RELATIVE_PATH} is INVALID:`);
      for (const e of errors) console.log(`  - ${e}`);
    }
  }
}

main();
