import fs from "node:fs";
import path from "node:path";

/**
 * Design-system profile — the contract between Phase 1 (agent scoping) and
 * Phase 2 (deterministic structure engine).
 *
 * PHILOSOPHY (hybrid, "thin mechanism / thick agent"):
 *   The plugin ships NO code that *concludes* what a design system looks like.
 *   The agent reads the actual source and *writes* this profile — its reasoning,
 *   made inspectable. Phase 2 only *applies* the agent's declared rules
 *   (deterministically) to wire imports, aliases, and token swatches. Preview
 *   BODIES for context-bound / compositional components are agent-authored in
 *   `component-library-overrides.tsx`. The load-bearing outcome gates
 *   (`verify-component-library*.mjs`) are the sole correctness guarantee.
 *
 * The profile is stored at `.proto/design-system-profile.json` in the host.
 *
 * SCHEMA (version 1):
 * {
 *   "version": 1,
 *   "packages": [
 *     { "name": "@coss/ui", "dir": "packages/coss-ui", "importStyle": "subpath",
 *       "aliasPrefix": "Coss" }
 *   ],
 *   "roots": {
 *     "primitive": [
 *       { "rel": "packages/coss-ui/src/components", "package": "@coss/ui",
 *         "specifierTemplate": "@coss/ui/components/{slug}" }
 *     ],
 *     "composite": [
 *       { "rel": "packages/calcom-ui/components", "package": "@calcom/ui",
 *         "specifierTemplate": "@calcom/ui/components/{slug}" }
 *     ]
 *   },
 *   "themes": { "modes": ["light", "dark"], "roles": ["background", ...] },
 *   "providers": { "needed": true, "importPath": "./design-system-providers",
 *                  "componentName": "PreviewProviders" },
 *   "authored": ["Table", "EmptyScreen"],
 *   "skips": [ { "name": "useFoo", "category": "hook-only", "reason": "..." } ]
 * }
 *
 * Rules the SCHEMA encodes (and nothing else):
 *  - `specifierTemplate` with a `{slug}` token → subpath import; the engine
 *    substitutes the enumerated component's kebab id. No `{slug}` → barrel
 *    import (named export from the package root).
 *  - `aliasPrefix` (optional) is used to de-collide export names shared across
 *    packages (e.g. `Button` in two packages → `CossButton` / `CalcomButton`).
 *    If omitted, the engine derives one from the package name.
 */

export const PROFILE_VERSION = 1;
export const PROFILE_RELATIVE_PATH = path.join(
  ".proto",
  "design-system-profile.json",
);

export const IMPORT_STYLES = ["barrel", "subpath"];

/** Valid `skips[].category` values — must match the coverage oracle. */
export const PROFILE_SKIP_CATEGORIES = [
  "server-only",
  "type-only",
  "hook-only",
  "non-visual",
  "infra-bound",
  "deprecated",
];

export function profileAbsPath(hostRoot) {
  return path.join(hostRoot, PROFILE_RELATIVE_PATH);
}

/** Load the profile if present; returns null when absent or unparseable. */
export function loadProfile(hostRoot) {
  const abs = profileAbsPath(hostRoot);
  try {
    const raw = fs.readFileSync(abs, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Derive a PascalCase alias prefix from a package name when the profile does
 * not declare one. `@coss/ui` -> `Coss`, `@calcom/ui` -> `Calcom`,
 * `ui-patterns` -> `UiPatterns`, `ui` -> `Ui`.
 */
export function deriveAliasPrefix(packageName) {
  const scope = packageName.startsWith("@")
    ? packageName.slice(1).split("/")[0]
    : packageName.split("/")[0];
  return scope
    .split(/[-_.@/]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

/** Look up a package descriptor by name. */
export function findPackage(profile, name) {
  return (profile.packages ?? []).find((p) => p.name === name) ?? null;
}

/**
 * Expand a root's `specifierTemplate` for a given component kebab id.
 * Returns { specifier, isBarrel }.
 *  - subpath template ("@coss/ui/components/{slug}") -> substitutes {slug}.
 *  - barrel template (no {slug}, e.g. "@plane/ui") -> returns it verbatim.
 */
export function expandSpecifier(specifierTemplate, slug) {
  if (typeof specifierTemplate !== "string" || specifierTemplate.length === 0) {
    return { specifier: null, isBarrel: false };
  }
  if (specifierTemplate.includes("{slug}")) {
    return {
      specifier: specifierTemplate.replace(/\{slug\}/g, slug),
      isBarrel: false,
    };
  }
  return { specifier: specifierTemplate, isBarrel: true };
}

/**
 * Resolve import info for one enumerated component from the profile.
 * Returns { specifier, named, alias, local } or null if the root/section is
 * not described by the profile.
 *
 *  - `named`  = the export name to import (PascalCase component name).
 *  - `alias`  = de-collision alias when set (else null).
 *  - `local`  = the identifier used in JSX (alias ?? named).
 */
export function resolveImportInfoFromProfile({
  profile,
  section,
  rootRel,
  record,
  aliasName = null,
}) {
  const roots = profile?.roots?.[section] ?? [];
  const root = roots.find((r) => r.rel === rootRel);
  if (!root) return null;

  const { specifier } = expandSpecifier(root.specifierTemplate, record.kebab);
  if (!specifier) return null;

  const named = record.name;
  const alias = aliasName ?? null;
  return { specifier, named, alias, local: alias ?? named };
}

/**
 * Coverage roots in the shape the coverage oracle expects, derived from the
 * profile. Returns { primitive: [{rel, abs, package, specifierTemplate}], ... }
 * filtered to roots that exist on disk.
 */
export function coverageRootsFromProfile(hostRoot, profile) {
  const mapRoots = (list) =>
    (list ?? [])
      .map((r) => ({
        rel: r.rel,
        abs: path.join(hostRoot, r.rel),
        package: r.package ?? null,
        specifierTemplate: r.specifierTemplate ?? null,
      }))
      .filter((r) => fs.existsSync(r.abs));

  return {
    primitive: mapRoots(profile?.roots?.primitive),
    composite: mapRoots(profile?.roots?.composite),
  };
}

/**
 * Validate a profile object against the schema. Returns { ok, errors: [] }.
 * This is a load-bearing check: with structural detectors deleted, a malformed
 * or absent profile must block Phase 2 rather than silently guess.
 */
export function validateProfile(profile) {
  const errors = [];
  if (!profile || typeof profile !== "object") {
    return { ok: false, errors: ["profile is missing or not an object"] };
  }
  if (profile.version !== PROFILE_VERSION) {
    errors.push(
      `version must be ${PROFILE_VERSION} (got ${JSON.stringify(profile.version)})`,
    );
  }

  const packages = profile.packages;
  if (!Array.isArray(packages) || packages.length === 0) {
    errors.push("packages must be a non-empty array");
  } else {
    packages.forEach((pkg, i) => {
      if (!pkg || typeof pkg.name !== "string" || !pkg.name) {
        errors.push(`packages[${i}].name is required`);
      }
      if (typeof pkg.dir !== "string" || !pkg.dir) {
        errors.push(`packages[${i}].dir is required`);
      }
      if (pkg.importStyle && !IMPORT_STYLES.includes(pkg.importStyle)) {
        errors.push(
          `packages[${i}].importStyle must be one of ${IMPORT_STYLES.join("|")}`,
        );
      }
    });
  }

  const roots = profile.roots;
  if (!roots || typeof roots !== "object") {
    errors.push("roots must be an object with primitive[] and composite[]");
  } else {
    for (const section of ["primitive", "composite"]) {
      const list = roots[section];
      if (!Array.isArray(list) || list.length === 0) {
        errors.push(`roots.${section} must be a non-empty array`);
        continue;
      }
      list.forEach((r, i) => {
        if (!r || typeof r.rel !== "string" || !r.rel) {
          errors.push(`roots.${section}[${i}].rel is required`);
        }
        if (typeof r.specifierTemplate !== "string" || !r.specifierTemplate) {
          errors.push(
            `roots.${section}[${i}].specifierTemplate is required (use "{slug}" for subpath imports, or a bare package name for barrel imports)`,
          );
        }
      });
    }
  }

  const themes = profile.themes;
  if (!themes || typeof themes !== "object") {
    errors.push("themes must be an object with modes[] and roles[]");
  } else {
    if (!Array.isArray(themes.modes) || themes.modes.length === 0) {
      errors.push("themes.modes must be a non-empty array (e.g. [\"light\"])");
    }
    if (!Array.isArray(themes.roles) || themes.roles.length === 0) {
      errors.push("themes.roles must be a non-empty array of semantic roles");
    }
  }

  if (profile.skips != null) {
    if (!Array.isArray(profile.skips)) {
      errors.push("skips must be an array when present");
    } else {
      profile.skips.forEach((s, i) => {
        if (!s || typeof s.name !== "string") {
          errors.push(`skips[${i}].name is required`);
        }
        if (!PROFILE_SKIP_CATEGORIES.includes(s?.category)) {
          errors.push(
            `skips[${i}].category must be one of ${PROFILE_SKIP_CATEGORIES.join(", ")}`,
          );
        }
      });
    }
  }

  if (profile.authored != null && !Array.isArray(profile.authored)) {
    errors.push("authored must be an array of component names when present");
  }

  return { ok: errors.length === 0, errors };
}
