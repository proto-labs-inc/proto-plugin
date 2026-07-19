#!/usr/bin/env node
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  checkCoverage,
  checkTokenLayer,
  checkTokenRoles,
  readLibrarySources,
  resolveCoverageRoots,
} from "./lib/component-library-coverage.mjs";
import { checkImportResolution } from "./lib/component-library-imports.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

/**
 * Objective component-library gate (CHECKPOINT 4).
 *
 * Static, dependency-free checks the setup agent can loop against:
 *  - Coverage: every synced primitive/composite is previewed or explicitly
 *    skipped (`// skip: <reason>`). Expected set is derived from the sync config,
 *    so it self-calibrates per host and on re-sync.
 *  - Token layer: reject the circular `--color-x: var(--color-x)` mapping that
 *    renders every preview unstyled, and confirm the canonical semantic roles
 *    have swatches.
 *  - Import resolution: walk the module graph reachable from the library page
 *    and assert every bare package the previewed components import resolves from
 *    the host. Catches the "compiles + HTTP 200 but the section won't open on
 *    the client" failure — e.g. a synced component imports `radix-ui` but the
 *    host never installed it.
 *
 * The definitive "tokens resolve to source hues" (computed CSS) check is still
 * runtime — the setup prompt mandates `pnpm build` + a browser pass for that.
 * This script is the fast static half of the loop.
 */

function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);

  const json = process.argv.includes("--json");
  const failures = [];
  const warnings = [];

  const roots = resolveCoverageRoots(hostRoot);
  const librarySources = readLibrarySources(hostRoot);

  // Guardrail: a coverage category resolving to no roots, or a root that
  // enumerates zero components, means the config points at nothing — never a
  // silent pass.
  if (roots.primitive.length === 0) {
    failures.push(
      "no primitive coverage roots resolved — set COMPONENT_LIBRARY_PRIMITIVE_ROOTS or add a ui/shadcn dir to SYNC_DIRS in prototype.sync.config.sh",
    );
  }
  if (roots.composite.length === 0) {
    failures.push(
      "no composite coverage roots resolved — set COMPONENT_LIBRARY_COMPOSITE_ROOTS or add a patterns dir to SYNC_DIRS in prototype.sync.config.sh",
    );
  }

  const primitiveCoverage = checkCoverage(hostRoot, roots.primitive, librarySources);
  const compositeCoverage = checkCoverage(hostRoot, roots.composite, librarySources);

  for (const cov of [primitiveCoverage, compositeCoverage]) {
    for (const root of cov.perRoot) {
      if (root.expected === 0) {
        failures.push(
          `coverage root "${root.rel}" enumerates 0 components — misconfigured root`,
        );
      }
    }
  }

  if (primitiveCoverage.missing.length > 0) {
    failures.push(
      `${primitiveCoverage.missing.length} primitive(s) not previewed or skipped: ${primitiveCoverage.missing.join(", ")}`,
    );
  }
  if (compositeCoverage.missing.length > 0) {
    failures.push(
      `${compositeCoverage.missing.length} composite(s) not previewed or skipped: ${compositeCoverage.missing.join(", ")}`,
    );
  }

  const tokenLayer = checkTokenLayer(hostRoot);
  if (!tokenLayer.globalsFound) {
    failures.push("src/app/globals.css not found");
  } else {
    if (tokenLayer.circularVars.length > 0) {
      failures.push(
        `circular token mapping in globals.css (resolves to nothing): ${[...new Set(tokenLayer.circularVars)].join(", ")}. Map --color-* to the source semantic tokens (e.g. --color-primary: var(--primary)), not to themselves.`,
      );
    }
    if (!tokenLayer.hasTokenImport) {
      warnings.push(
        "globals.css has no @import of source token CSS — confirm the source design tokens are imported so the runtime bridge can re-scope them",
      );
    }
  }

  const tokenRoles = checkTokenRoles(librarySources);
  if (tokenRoles.missingCore.length > 0) {
    failures.push(
      `design tokens section missing core semantic swatches: ${tokenRoles.missingCore.join(", ")}`,
    );
  }
  if (tokenRoles.missingExtended.length > 0) {
    warnings.push(
      `design tokens section missing extended swatches: ${tokenRoles.missingExtended.join(", ")}`,
    );
  }

  // Import-resolution: every package the previewed components import must
  // actually resolve from the host. Catches the "compiles + 200 but section
  // won't open on the client" failure (e.g. a synced component imports
  // `radix-ui` but the host never installed it).
  const importCheck = checkImportResolution(hostRoot);
  for (const missing of importCheck.missingPackages) {
    failures.push(
      `unresolved import "${missing.pkg}" — imported by ${missing.importers.join(", ")}${missing.importers.length >= 3 ? ", …" : ""}. Install it in the host (add to package.json + pnpm install) or the preview will throw on the client even though the page returns 200.`,
    );
  }
  for (const bad of importCheck.unresolvedLocal.slice(0, 10)) {
    failures.push(
      `broken local import "${bad.spec}" in ${bad.from} — path does not resolve to a file.`,
    );
  }

  const report = {
    ok: failures.length === 0,
    roots: {
      primitive: roots.primitive.map((r) => r.rel),
      composite: roots.composite.map((r) => r.rel),
    },
    primitives: {
      expected: primitiveCoverage.expectedTotal,
      missing: primitiveCoverage.missing,
    },
    composites: {
      expected: compositeCoverage.expectedTotal,
      missing: compositeCoverage.missing,
    },
    circularTokenVars: [...new Set(tokenLayer.circularVars ?? [])],
    missingCoreTokenRoles: tokenRoles.missingCore,
    imports: {
      checkedFiles: importCheck.checkedFileCount,
      packages: importCheck.packageCount,
      missing: importCheck.missingPackages.map((m) => m.pkg),
      unresolvedLocal: importCheck.unresolvedLocal,
    },
    failures,
    warnings,
  };

  if (json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(
      `Component library coverage: ${primitiveCoverage.expectedTotal} primitives, ${compositeCoverage.expectedTotal} composites expected.`,
    );
    console.log(
      `Import resolution: ${importCheck.checkedFileCount} reachable file(s), ${importCheck.packageCount} package(s) referenced.`,
    );
    for (const warning of warnings) console.log(`WARN: ${warning}`);
    if (report.ok) {
      console.log(
        "OK: all synced components previewed (or skipped), token layer is sane, and every imported package resolves. Now run the mandated visual pass — `pnpm build` for a definitive render, and a browser pass to confirm each tab opens without console errors + chromatic tokens resolve to source hues.",
      );
    } else {
      console.error("BLOCKED: component library incomplete —");
      for (const failure of failures) console.error(`  - ${failure}`);
    }
  }

  process.exit(report.ok ? 0 : 1);
}

main();
