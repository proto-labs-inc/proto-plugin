#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildCatalog } from "./lib/component-library-catalog.mjs";
import { readLibrarySources, resolveCoverageRoots } from "./lib/component-library-coverage.mjs";
import {
  PROFILE_RELATIVE_PATH,
  loadProfile,
  validateProfile,
} from "./lib/design-system-profile.mjs";
import {
  generateContentShell,
  generateGuideMarkdown,
  generateOverridesTemplate,
  generatePreviewMapSection,
  generateTokensSection,
} from "./lib/component-library-scaffold.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

function readSkillUiTokenCount(hostRoot) {
  const colorsPath = path.join(hostRoot, ".skillui", "tokens", "colors.json");
  try {
    const json = JSON.parse(fs.readFileSync(colorsPath, "utf8"));
    return Array.isArray(json) ? json.length : Object.keys(json).length;
  } catch {
    return 0;
  }
}

function writeIfChanged(filePath, content) {
  if (fs.existsSync(filePath)) {
    const existing = fs.readFileSync(filePath, "utf8");
    if (existing === content) return false;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  return true;
}

function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);
  const libraryDir = path.join(hostRoot, "src", "app", "component-library");

  if (!fs.existsSync(libraryDir)) {
    console.error(
      "BLOCKED: src/app/component-library/ missing. Run pnpm setup-host first.",
    );
    process.exit(1);
  }

  // Phase 2 requires the agent-authored profile from Phase 1. No profile → no
  // guessing: block and point back to the scope step (this is the whole hybrid
  // contract — the plugin never concludes structure on its own).
  const profile = loadProfile(hostRoot);
  const validation = validateProfile(profile);
  if (!validation.ok) {
    console.error(
      `BLOCKED: ${PROFILE_RELATIVE_PATH} is missing or invalid. Run Phase 1 first:\n  node node_modules/proto-plugin/scripts/profile-design-system.mjs\nthen author the profile before generating.`,
    );
    for (const err of validation.errors) console.error(`  - ${err}`);
    process.exit(1);
  }

  const roots = resolveCoverageRoots(hostRoot);
  if (roots.primitive.length === 0 && roots.composite.length === 0) {
    console.error(
      `BLOCKED: profile declares no coverage roots that exist on disk. Check roots[].rel in ${PROFILE_RELATIVE_PATH}.`,
    );
    process.exit(1);
  }

  console.log(
    `Building component catalog from profile (${profile.packages.length} package(s), ${roots.primitive.length} primitive + ${roots.composite.length} composite root(s))...`,
  );
  buildCatalog(hostRoot, roots.primitive, roots.composite, profile).then(
    (entries) => {
      const catalogPath = path.join(hostRoot, ".proto", "component-library-catalog.json");
      fs.mkdirSync(path.dirname(catalogPath), { recursive: true });
      fs.writeFileSync(catalogPath, JSON.stringify(entries, null, 2), "utf8");

      const tokenCount = readSkillUiTokenCount(hostRoot);
      const filesWritten = [];

      const generatedFiles = [
        [
          path.join(libraryDir, "component-library-tokens.generated.tsx"),
          generateTokensSection(tokenCount, profile.themes?.roles),
        ],
        [
          path.join(libraryDir, "component-library-primitive-previews.generated.tsx"),
          generatePreviewMapSection(entries, "primitive"),
        ],
        [
          path.join(libraryDir, "component-library-composite-previews.generated.tsx"),
          generatePreviewMapSection(entries, "composite"),
        ],
        [
          path.join(libraryDir, "component-library-guide.md"),
          generateGuideMarkdown(entries),
        ],
      ];

      for (const [filePath, content] of generatedFiles) {
        if (writeIfChanged(filePath, content)) {
          filesWritten.push(path.relative(hostRoot, filePath));
        }
      }

      const overridesPath = path.join(
        libraryDir,
        "component-library-overrides.tsx",
      );
      if (!fs.existsSync(overridesPath)) {
        fs.writeFileSync(
          overridesPath,
          generateOverridesTemplate(entries),
          "utf8",
        );
        filesWritten.push(path.relative(hostRoot, overridesPath));
      }

      const contentPath = path.join(libraryDir, "component-library-content.tsx");
      const shell = generateContentShell();
      if (!fs.existsSync(contentPath)) {
        fs.writeFileSync(contentPath, shell, "utf8");
        filesWritten.push(path.relative(hostRoot, contentPath));
      } else {
        const existing = fs.readFileSync(contentPath, "utf8");
        if (!existing.includes("PrimitivePreviews")) {
          fs.writeFileSync(contentPath, shell, "utf8");
          filesWritten.push(`${path.relative(hostRoot, contentPath)} (migrated to generated shell)`);
        }
      }

      const classifications = entries.reduce((acc, e) => {
        acc[e.classification] = (acc[e.classification] ?? 0) + 1;
        return acc;
      }, {});

      console.log(
        `Catalog: ${entries.length} exports (${entries.filter((e) => e.section === "primitive").length} primitives, ${entries.filter((e) => e.section === "composite").length} composites).`,
      );
      console.log(`Classifications: ${JSON.stringify(classifications)}`);
      if (filesWritten.length) {
        console.log(`Wrote: ${filesWritten.join(", ")}`);
      } else {
        console.log("No generated files changed.");
      }

      const authoredCount = classifications.authored ?? 0;
      console.log(
        `\nNext steps:\n  1. Author previews for ${authoredCount} 'authored' component(s) in component-library-overrides.tsx (see component-library-guide.md)\n  2. Engine already rendered ${classifications.engine ?? 0} component(s); ${classifications.skip ?? 0} skipped\n  3. pnpm verify:component-library (static) then the build + visual gates`,
      );

      const librarySources = readLibrarySources(hostRoot);
      if (!librarySources.text.includes("ComponentLibraryContent")) {
        console.warn(
          "WARN: wire ComponentLibraryContent in page.tsx if not already connected.",
        );
      }
    },
  ).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

main();
