import fs from "node:fs";
import path from "node:path";

import {
  CORE_TOKEN_ROLES,
  EXTENDED_TOKEN_ROLES,
} from "./component-library-coverage.mjs";

export const MANIFEST_PATH = ".proto/design-system-tokens.json";
export const MANIFEST_VERSION = 1;

const SEMANTIC_COLOR_VARS = new Set(
  [...CORE_TOKEN_ROLES, ...EXTENDED_TOKEN_ROLES].map((role) => `--color-${role}`),
);

/** Map canonical swatch roles to source CSS custom property names. */
export const SOURCE_VAR_OVERRIDES = {
  tertiary: "--background-tertiary",
};

const BLOCK_RE =
  /(?::root|\.dark)\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
const CUSTOM_PROP_RE = /(--[\w-]+)\s*:\s*([^;]+);/g;

const FULL_COLOR_RE =
  /^(?:#|hsl\(|hsla\(|oklch\(|oklab\(|lab\(|lch\(|color\(|rgb\(|rgba\(|var\()/i;

/**
 * @typedef {"hsl-components" | "color" | "unknown"} TokenValueFormat
 * @typedef {{
 *   role: string;
 *   name: string;
 *   sourceVar: string;
 *   displayVar: string;
 *   format: TokenValueFormat;
 *   required: boolean;
 * }} DesignSystemSwatchManifest
 * @typedef {{
 *   version: number;
 *   extractedAt: string;
 *   sourceCssFiles: string[];
 *   productThemes: ("light" | "dark")[];
 *   swatches: DesignSystemSwatchManifest[];
 * }} DesignSystemTokenManifest
 */

export function roleToSourceVar(role) {
  if (role in SOURCE_VAR_OVERRIDES) return SOURCE_VAR_OVERRIDES[role];
  return `--${role}`;
}

export function roleDisplayName(role) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function detectValueFormat(rawValue) {
  const value = rawValue.trim();
  if (!value) return "unknown";
  if (FULL_COLOR_RE.test(value)) return "color";
  // HSL components: "0 0% 100%" or "344 100% 66%"
  if (/^\d+(?:\.\d+)?(?:\s+\d+(?:\.\d+)?%){1,2}(?:\s*\/\s*[\d.]+%)?$/.test(value)) {
    return "hsl-components";
  }
  return "unknown";
}

export function swatchBackgroundExpression(format, sourceVar) {
  if (format === "hsl-components") {
    return `hsl(var(${sourceVar}))`;
  }
  if (format === "color") {
    return `var(${sourceVar})`;
  }
  return `var(${sourceVar})`;
}

function parseCustomPropertiesFromBlock(blockBody) {
  const map = new Map();
  let match;
  while ((match = CUSTOM_PROP_RE.exec(blockBody)) !== null) {
    map.set(match[1], match[2].trim());
  }
  return map;
}

/** Parse :root and .dark custom-property declarations from CSS text. */
export function parseThemeTokenMaps(css) {
  const light = new Map();
  const dark = new Map();

  let blockMatch;
  while ((blockMatch = BLOCK_RE.exec(css)) !== null) {
    const selector = blockMatch[0].slice(0, blockMatch[0].indexOf("{")).trim();
    const body = blockMatch[1];
    const props = parseCustomPropertiesFromBlock(body);
    const target = selector.includes(".dark") ? dark : light;
    for (const [key, value] of props) {
      target.set(key, value);
    }
  }

  return { light, dark };
}

function resolveImportedCssPaths(hostRoot, globalsCss, seen = new Set()) {
  const imports = [];
  const importRe = /@import\s+["']([^"']+\.css)["']/g;
  let match;
  while ((match = importRe.exec(globalsCss)) !== null) {
    const rel = match[1];
    const abs = path.resolve(path.dirname(path.join(hostRoot, "src/app/globals.css")), rel);
    if (seen.has(abs)) continue;
    seen.add(abs);
    imports.push(abs);
    if (fs.existsSync(abs)) {
      try {
        const nested = fs.readFileSync(abs, "utf8");
        imports.push(...resolveImportedCssPaths(hostRoot, nested, seen));
      } catch {
        // skip unreadable nested imports
      }
    }
  }
  return imports;
}

/** Collect host token CSS files (globals + @import chain), excluding proto-plugin tool CSS. */
export function collectHostTokenCssFiles(hostRoot) {
  const globalsPath = path.join(hostRoot, "src", "app", "globals.css");
  if (!fs.existsSync(globalsPath)) return [];

  let globalsCss = "";
  try {
    globalsCss = fs.readFileSync(globalsPath, "utf8");
  } catch {
    return [];
  }

  const files = [globalsPath];
  for (const imported of resolveImportedCssPaths(hostRoot, globalsCss)) {
    if (!files.includes(imported)) files.push(imported);
  }

  return files.filter((file) => {
    const normalized = file.replace(/\\/g, "/");
    return (
      !normalized.includes("/node_modules/proto-plugin/") &&
      !normalized.includes("/packages/prototype/")
    );
  });
}

function readCssUnion(hostRoot, files) {
  const light = new Map();
  const dark = new Map();
  const readFiles = [];

  for (const file of files) {
    let css = "";
    try {
      css = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    readFiles.push(path.relative(hostRoot, file));
    const parsed = parseThemeTokenMaps(css);
    for (const [key, value] of parsed.light) light.set(key, value);
    for (const [key, value] of parsed.dark) dark.set(key, value);
  }

  return { light, dark, readFiles };
}

export function buildDesignSystemTokenManifest(hostRoot) {
  const cssFiles = collectHostTokenCssFiles(hostRoot);
  const { light, dark, readFiles } = readCssUnion(hostRoot, cssFiles);
  const roles = [...CORE_TOKEN_ROLES, ...EXTENDED_TOKEN_ROLES];

  /** @type {DesignSystemSwatchManifest[]} */
  const swatches = [];

  for (const role of roles) {
    const sourceVar = roleToSourceVar(role);
    const raw = light.get(sourceVar) ?? dark.get(sourceVar);
    if (!raw) continue;

    const format = detectValueFormat(raw);
    swatches.push({
      role,
      name: roleDisplayName(role),
      sourceVar,
      displayVar: sourceVar,
      format,
      required: CORE_TOKEN_ROLES.includes(role),
    });
  }

  const productThemes =
    dark.size > 0 ? (["light", "dark"]) : (["light"]);

  return {
    version: MANIFEST_VERSION,
    extractedAt: new Date().toISOString(),
    sourceCssFiles: readFiles,
    productThemes,
    swatches,
  };
}

export function readDesignSystemTokenManifest(hostRoot) {
  const manifestPath = path.join(hostRoot, MANIFEST_PATH);
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return null;
  }
}

export function writeDesignSystemTokenManifest(hostRoot, manifest) {
  const manifestPath = path.join(hostRoot, MANIFEST_PATH);
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  return manifestPath;
}

export function validateManifestForScaffold(manifest) {
  const errors = [];
  if (!manifest?.swatches?.length) {
    errors.push("manifest has no swatches — sync source token CSS and re-run extract");
  }
  const required = manifest?.swatches?.filter((s) => s.required) ?? [];
  if (required.length < CORE_TOKEN_ROLES.length / 2) {
    errors.push(
      `manifest missing core semantic tokens (found ${required.length} required swatches; need background, foreground, primary, …)`,
    );
  }
  return errors;
}

/** Scan token CSS for self-referential semantic --color-* mappings (not palette scales). */
export function checkDesignSystemTokenLayer(hostRoot) {
  const cssFiles = collectHostTokenCssFiles(hostRoot);
  const circularVars = [];
  const selfRefRe = /(--[\w-]+)\s*:\s*var\(\s*\1\s*\)/g;

  for (const file of cssFiles) {
    let css = "";
    try {
      css = fs.readFileSync(file, "utf8");
    } catch {
      continue;
    }
    let match;
    while ((match = selfRefRe.exec(css)) !== null) {
      const varName = match[1];
      if (!SEMANTIC_COLOR_VARS.has(varName)) continue;
      if (!circularVars.includes(varName)) circularVars.push(varName);
    }
  }

  return {
    globalsFound: cssFiles.length > 0,
    circularVars,
    cssFiles: cssFiles.map((f) => path.relative(hostRoot, f)),
  };
}
