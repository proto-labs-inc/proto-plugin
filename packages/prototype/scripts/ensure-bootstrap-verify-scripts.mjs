import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

const VERIFY_SCRIPTS = {
  "verify:source-linked":
    "test -L source && test -f .env.local && grep -q '^SOURCE_PATH=' .env.local",
  "verify:workspace-profile":
    "test -f .env.local && grep -q '^PROTOTYPE_USER_NAME=' .env.local",
  "verify:onboarded":
    "node node_modules/proto-plugin/scripts/verify-bootstrap-flag.mjs onboarded",
  "verify:component-library-loaded":
    "node node_modules/proto-plugin/scripts/verify-bootstrap-flag.mjs component-library-loaded",
  "verify:bootstrap-status":
    "node node_modules/proto-plugin/scripts/verify-bootstrap-status.mjs",
};

function isPrototypeHost(hostRoot) {
  if (fs.existsSync(path.join(hostRoot, "prototype.config.ts"))) {
    return true;
  }

  const packageJsonPath = path.join(hostRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return false;
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const deps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };
    return Boolean(deps["proto-plugin"]);
  } catch {
    return false;
  }
}

export function ensureBootstrapVerifyScripts(hostRoot) {
  if (!isPrototypeHost(hostRoot)) {
    return { updated: false, reason: "not-a-prototype-host" };
  }

  const packageJsonPath = path.join(hostRoot, "package.json");
  if (!fs.existsSync(packageJsonPath)) {
    return { updated: false, reason: "missing-package-json" };
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  packageJson.scripts ??= {};

  let added = 0;
  let updated = 0;
  for (const [name, command] of Object.entries(VERIFY_SCRIPTS)) {
    if (packageJson.scripts[name] === command) continue;
    const wasPresent = Boolean(packageJson.scripts[name]);
    packageJson.scripts[name] = command;
    if (wasPresent) updated += 1;
    else added += 1;
  }

  if (added === 0 && updated === 0) {
    return { updated: false, reason: "already-present" };
  }

  fs.writeFileSync(
    packageJsonPath,
    `${JSON.stringify(packageJson, null, 2)}\n`,
    "utf8",
  );

  return { updated: true, added, updated };
}

function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);
  const result = ensureBootstrapVerifyScripts(hostRoot);

  if (result.updated) {
    const parts = [];
    if (result.added) parts.push(`${result.added} added`);
    if (result.updated) parts.push(`${result.updated} updated`);
    console.log(
      `proto-plugin: bootstrap verify script(s) ${parts.join(", ")} in package.json`,
    );
  }
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  main();
}
