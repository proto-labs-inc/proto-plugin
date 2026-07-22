#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  checkDesignSystemTokenLayer,
  readDesignSystemTokenManifest,
  validateManifestForScaffold,
} from "./lib/design-system-token-manifest.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

function readDesignSystemGenerated(hostRoot) {
  const generatedPath = path.join(
    hostRoot,
    "src",
    "app",
    "design-system",
    "design-system-tokens.generated.tsx",
  );
  try {
    return fs.readFileSync(generatedPath, "utf8");
  } catch {
    return "";
  }
}

function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);
  const errors = [];

  const manifest = readDesignSystemTokenManifest(hostRoot);
  errors.push(...validateManifestForScaffold(manifest));

  const tokenLayer = checkDesignSystemTokenLayer(hostRoot);
  if (!tokenLayer.globalsFound) {
    errors.push("src/app/globals.css (or imported token CSS) not found");
  }
  if (tokenLayer.circularVars.length) {
    errors.push(
      `circular --color-* mappings in token CSS: ${tokenLayer.circularVars.join(", ")}`,
    );
  }

  const generated = readDesignSystemGenerated(hostRoot);
  if (!generated.includes('id="tokens"')) {
    errors.push('design-system-tokens.generated.tsx missing id="tokens" section');
  }
  if (!generated.includes("data-token-swatch")) {
    errors.push(
      "design-system-tokens.generated.tsx missing data-token-swatch attributes — re-run generate-design-system.mjs",
    );
  }
  if (!generated.includes("hsl(var(") && manifest?.swatches?.some((s) => s.format === "hsl-components")) {
    errors.push(
      "generated swatches missing hsl(var(...)) expressions for HSL-component source tokens",
    );
  }

  const requiredInManifest = manifest?.swatches?.filter((s) => s.required) ?? [];
  for (const swatch of requiredInManifest) {
    if (!generated.includes(`sourceVar="${swatch.sourceVar}"`)) {
      errors.push(`generated page missing required swatch for ${swatch.sourceVar}`);
    }
  }

  if (errors.length) {
    console.error("BLOCKED: design system static verification failed.");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log("OK: design system static checks passed.");
  console.log(
    `- manifest: ${manifest.swatches.length} swatches (${requiredInManifest.length} required)`,
  );
  console.log(`- token CSS scanned: ${tokenLayer.cssFiles.join(", ")}`);
  if (tokenLayer.circularVars.length === 0) {
    console.log("- no circular --color-* mappings");
  }
}

main();
