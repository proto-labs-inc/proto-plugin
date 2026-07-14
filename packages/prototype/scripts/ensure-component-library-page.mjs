import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { resolveHostRoot } from "./lib/resolve-host-root.mjs";

const PAGE_CONTENT = `import { createPrototypeComponentLibraryPage } from "proto-plugin";

// Scaffolded by proto-plugin — pass \`children\` once you've synced UI from source.
export default createPrototypeComponentLibraryPage();
`;

function resolveAppDir(hostRoot) {
  const srcApp = path.join(hostRoot, "src", "app");
  if (fs.existsSync(srcApp)) {
    return srcApp;
  }

  const app = path.join(hostRoot, "app");
  if (fs.existsSync(app)) {
    return app;
  }

  return null;
}

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

export function ensureComponentLibraryPage(hostRoot) {
  if (!isPrototypeHost(hostRoot)) {
    return { created: false, reason: "not-a-prototype-host" };
  }

  const appDir = resolveAppDir(hostRoot);
  if (!appDir) {
    return { created: false, reason: "missing-app-dir" };
  }

  const pageDir = path.join(appDir, "component-library");
  const pagePath = path.join(pageDir, "page.tsx");

  if (fs.existsSync(pagePath)) {
    return { created: false, reason: "already-exists", pagePath };
  }

  fs.mkdirSync(pageDir, { recursive: true });
  fs.writeFileSync(pagePath, PAGE_CONTENT, "utf8");

  return { created: true, pagePath };
}

function main() {
  const toolRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
  );
  const hostRoot = resolveHostRoot(toolRoot);
  const result = ensureComponentLibraryPage(hostRoot);

  if (result.created) {
    console.log(
      `proto-plugin: created component library route at ${path.relative(hostRoot, result.pagePath)}`,
    );
  }
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  main();
}
