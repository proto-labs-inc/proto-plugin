#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  generateDesignSystemContentShell,
  generateTokensSection,
} from "./lib/design-system-scaffold.mjs";
import { readDesignSystemTokenManifest } from "./lib/design-system-token-manifest.mjs";
import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

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
  const designSystemDir = path.join(hostRoot, "src", "app", "design-system");

  if (!fs.existsSync(designSystemDir)) {
    console.error(
      "BLOCKED: src/app/design-system/ missing. Run pnpm setup-host first.",
    );
    process.exit(1);
  }

  const manifest = readDesignSystemTokenManifest(hostRoot);
  if (!manifest?.swatches?.length) {
    console.error(
      "BLOCKED: .proto/design-system-tokens.json missing or empty. Run extract-design-system.mjs first.",
    );
    process.exit(1);
  }

  const filesWritten = [];

  const generatedFiles = [
    [
      path.join(designSystemDir, "design-system-tokens.generated.tsx"),
      generateTokensSection(manifest),
    ],
    [
      path.join(designSystemDir, "design-system-content.tsx"),
      generateDesignSystemContentShell(),
    ],
  ];

  for (const [filePath, content] of generatedFiles) {
    if (writeIfChanged(filePath, content)) {
      filesWritten.push(path.relative(hostRoot, filePath));
    }
  }

  if (filesWritten.length) {
    console.log(`Wrote: ${filesWritten.join(", ")}`);
  } else {
    console.log("No generated files changed.");
  }

  console.log(
    `\nNext: pnpm verify:design-system-static, pnpm build, pnpm verify:design-system-visual`,
  );
}

main();
