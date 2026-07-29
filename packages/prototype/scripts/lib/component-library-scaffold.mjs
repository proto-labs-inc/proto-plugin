import {
  CORE_TOKEN_ROLES,
  EXTENDED_TOKEN_ROLES,
} from "./component-library-coverage.mjs";

/**
 * Scaffold generator (HYBRID structure engine).
 *
 * The engine emits ONLY the structural + safe-preview half:
 *  - collision-aware, per-specifier imports (aliasing `Button as CossButton`
 *    when the same name exists in two packages),
 *  - real previews for `engine`-classified components (cva variants / enum props /
 *    mined stories / prop-free),
 *  - valid `// skip:` lines for profile-declared non-visual exports,
 *  - a pointer (NOT a coverage-passing skip) for `authored` components so the
 *    coverage gate keeps flagging them until the agent writes the body in
 *    component-library-overrides.tsx.
 *
 * Preview BODIES for authored components are the agent's job. The engine never
 * fakes a degenerate preview — that was the silent-failure hazard we removed.
 */

function escapeJsxString(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** JSX tag identifier for an entry (alias when de-collided, else the name). */
function tagOf(entry) {
  return entry.importInfo?.local ?? entry.name;
}

/** PreviewBlock title — disambiguated by package when aliased. */
function titleOf(entry) {
  if (entry.importInfo?.alias && entry.package) {
    return `${entry.name} (${entry.package})`;
  }
  return entry.name;
}

function defaultPropValue(prop) {
  const typeName = (prop.type?.name ?? "").toLowerCase();
  if (prop.enumValues?.length) return prop.enumValues[0];
  if (typeName.includes("boolean")) return "true";
  if (typeName.includes("number")) return "0";
  if (typeName.includes("string")) return `"${prop.name}"`;
  if (typeName.includes("reactnode") || typeName.includes("node")) {
    return `"${prop.name}"`;
  }
  return null;
}

function buildVariantPreviews(entry) {
  const tag = tagOf(entry);
  const lines = [];
  const variantGroup =
    entry.cvaVariants.variant ??
    entry.cvaVariants.appearance ??
    Object.values(entry.cvaVariants)[0];
  if (Array.isArray(variantGroup) && variantGroup.length) {
    for (const variant of variantGroup.slice(0, 6)) {
      lines.push(
        `<${tag} variant="${escapeJsxString(variant)}">${escapeJsxString(variant)}</${tag}>`,
      );
    }
    return lines;
  }
  return null;
}

function buildEnumPreviews(entry) {
  const tag = tagOf(entry);
  const lines = [];
  for (const prop of entry.props ?? []) {
    if (!prop.enumValues?.length) continue;
    for (const value of prop.enumValues.slice(0, 4)) {
      lines.push(
        `<${tag} ${prop.name}="${escapeJsxString(value)}">${escapeJsxString(value)}</${tag}>`,
      );
    }
    if (lines.length) return lines;
  }
  return null;
}

function buildMinedPreview(entry) {
  // Mined snippets reference the original component name; skip when aliased to
  // avoid emitting an undefined identifier.
  if (entry.importInfo?.alias) return null;
  if (!entry.minedUsage?.snippet) return null;
  return [`{/* mined from ${entry.minedUsage.source} */}`, entry.minedUsage.snippet];
}

function buildDefaultPreview(entry) {
  const tag = tagOf(entry);
  const required = (entry.props ?? []).filter((p) => p.required);
  const attrs = required
    .map((p) => {
      const val = defaultPropValue(p);
      if (val == null) return null;
      return `${p.name}={${val}}`;
    })
    .filter(Boolean)
    .join(" ");
  const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;
  return [`${open}Preview</${tag}>`];
}

function buildStatefulWrapper(entry, innerLines) {
  const pair = entry.statefulPairs?.[0];
  if (!pair) return innerLines;
  const [stateProp] = pair;
  const stateName = `${stateProp.charAt(0).toLowerCase()}${stateProp.slice(1)}State`;
  return [
    `{(() => {`,
    `  const [${stateName}, set${stateProp.charAt(0).toUpperCase()}${stateProp.slice(1)}] = useState(false);`,
    `  return (`,
    ...innerLines.map((l) => `    ${l}`),
    `  );`,
    `})()}`,
  ];
}

function isNonVisualExport(entry) {
  if (/^use[A-Z]/.test(entry.name)) return "hook-only";
  if (/^(Hooks|Types|Shadcn)$/.test(entry.name)) return "non-visual";
  if (entry.kebab === "types") return "type-only";
  return null;
}

export function generatePreviewBlockJsx(entry) {
  // Profile-declared / detected non-visual exports → valid skip.
  const nonVisual = isNonVisualExport(entry);
  if (entry.classification === "skip" || nonVisual) {
    const category = entry.profileSkip?.category ?? nonVisual ?? "non-visual";
    const reason = entry.profileSkip?.reason ?? "no standalone visual preview";
    return [`{/* skip: ${entry.name} - ${category}: ${reason} */}`];
  }

  // Authored components: the engine does NOT render or skip them — it leaves a
  // pointer so the coverage gate keeps flagging them until the agent writes the
  // body in component-library-overrides.tsx.
  if (entry.classification === "authored") {
    return [
      `{/* authored: ${entry.name} — add a preview in component-library-overrides.tsx (${entry.contextBound ? "context-bound" : "needs composition"}). Not counted until authored. */}`,
    ];
  }

  const inner =
    buildVariantPreviews(entry) ??
    buildEnumPreviews(entry) ??
    buildMinedPreview(entry) ??
    buildDefaultPreview(entry);

  const needsUseState =
    entry.statefulPairs?.length > 0 && !entry.minedUsage?.snippet;
  const body = needsUseState ? buildStatefulWrapper(entry, inner) : inner;

  return [
    `<PreviewBlock title="${escapeJsxString(titleOf(entry))}">`,
    ...body.map((line) => `  ${line}`),
    `</PreviewBlock>`,
  ];
}

/** Build the import section grouped by specifier, with de-collision aliases. */
function buildImportSection(entries) {
  const bySpecifier = new Map(); // specifier -> Set(importClause)
  for (const entry of entries) {
    if (entry.classification !== "engine") continue;
    const info = entry.importInfo;
    if (!info?.specifier) continue;
    const clause = info.alias ? `${info.named} as ${info.alias}` : info.named;
    if (!bySpecifier.has(info.specifier)) bySpecifier.set(info.specifier, new Set());
    bySpecifier.get(info.specifier).add(clause);
  }

  return [...bySpecifier.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([spec, clauses]) => {
      const lines = [...clauses].sort().map((c) => `  ${c},`).join("\n");
      return `import {\n${lines}\n} from "${spec}";`;
    })
    .join("\n");
}

export function generatePreviewMapSection(entries, section) {
  const filtered = entries.filter((e) => e.section === section);
  const importSection = buildImportSection(filtered);

  const blocks = filtered
    .map((entry) => generatePreviewBlockJsx(entry).join("\n"))
    .join("\n\n          ");

  const needsUseState = filtered.some(
    (e) =>
      e.classification === "engine" &&
      e.statefulPairs?.length &&
      !e.minedUsage?.snippet,
  );
  const useStateImport = needsUseState
    ? `\nimport { useState } from "react";`
    : "";

  return `"use client";

import { PreviewGrid, PreviewBlock } from "proto-plugin";
${useStateImport}
${importSection}

export function ${section === "primitive" ? "PrimitivePreviews" : "CompositePreviews"}() {
  return (
    <PreviewGrid>
          ${blocks}
    </PreviewGrid>
  );
}
`;
}

export function generateTokensSection(tokenColors, roles) {
  const roleList =
    Array.isArray(roles) && roles.length
      ? roles
      : [...CORE_TOKEN_ROLES, ...EXTENDED_TOKEN_ROLES];
  const swatches = roleList
    .map(
      (role) =>
        `              <TokenSwatch name="${role.charAt(0).toUpperCase()}${role.slice(1)}" variable="--color-${role}" />`,
    )
    .join("\n");

  const tokenComment = tokenColors?.length
    ? `\n        {/* ${tokenColors.length} color tokens extracted via SkillUI */}`
    : "";

  return `"use client";

import type { ReactNode } from "react";

function TokenSwatch({
  name,
  variable,
}: {
  name: string;
  variable: string;
}): ReactNode {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="h-12 w-full rounded-lg border"
        style={{ backgroundColor: \`var(\${variable})\` as any }}
      />
      <div className="text-xs font-medium text-center">
        <div>{name}</div>
        <div className="text-muted-foreground">{variable}</div>
      </div>
    </div>
  );
}

export function TokensSection() {
  return (
    <div className="space-y-8">${tokenComment}
      <div>
        <h3 className="font-semibold mb-4">Semantic Colors</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
${swatches}
        </div>
      </div>
    </div>
  );
}
`;
}

export function generateContentShell() {
  return `"use client";

import {
  ComponentLibraryAccordion,
  LibraryAccordionSection,
} from "proto-plugin";

import { CompositePreviews } from "./design-system-composite-previews.generated";
import { PrimitivePreviews } from "./design-system-primitive-previews.generated";
import { TokensSection } from "./design-system-tokens.generated";
import { previewOverrides } from "./design-system-overrides";

export function DesignSystemContent() {
  return (
    <ComponentLibraryAccordion type="multiple" defaultValue={[]}>
      <LibraryAccordionSection id="ui-primitives" title="UI primitives" isFirst>
        {previewOverrides.primitives ?? <PrimitivePreviews />}
      </LibraryAccordionSection>

      <LibraryAccordionSection id="composite-components" title="Composite components">
        {previewOverrides.composites ?? <CompositePreviews />}
      </LibraryAccordionSection>

      <LibraryAccordionSection id="tokens" title="Design tokens">
        <TokensSection />
      </LibraryAccordionSection>
    </ComponentLibraryAccordion>
  );
}
`;
}

export function generateOverridesTemplate(entries) {
  const authored = entries.filter((e) => e.classification === "authored");

  const byImport = new Map(); // specifier -> Set(importClause)
  for (const e of authored) {
    const info = e.importInfo;
    if (!info?.specifier) continue;
    const clause = info.alias ? `${info.named} as ${info.alias}` : info.named;
    if (!byImport.has(info.specifier)) byImport.set(info.specifier, new Set());
    byImport.get(info.specifier).add(clause);
  }
  const importHints = [...byImport.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([spec, clauses]) => ` *   import { ${[...clauses].sort().join(", ")} } from "${spec}";`)
    .join("\n");

  const authoredList = authored
    .map(
      (e) =>
        ` * - ${e.name} (${e.section}) — ${e.contextBound ? "context-bound (wrap in providers)" : "needs composition/mock data"}`,
    )
    .join("\n");

  return `"use client";

import type { ReactNode } from "react";

/**
 * Agent-authored previews (HYBRID: the engine wires structure; you write the
 * bodies the engine cannot safely fake). Regeneration-safe — never overwritten.
 *
 * Set \`primitives\` / \`composites\` to a ReactNode to REPLACE the entire
 * generated section, or (recommended) compose the generated previews with your
 * authored ones.
 *
 * Components the engine flagged as AUTHORED (write these):
${authoredList || " * (none — engine covered everything)"}
 *
 * Suggested imports:
${importHints || " *   (none)"}
 */
export const previewOverrides: {
  primitives?: ReactNode;
  composites?: ReactNode;
} = {};
`;
}

export function generateGuideMarkdown(entries) {
  const header = `# Component library guide

Seeded from the design-system profile (\`.proto/design-system-profile.json\`) +
enumerated source exports. Each row is \`engine\` (auto-previewed), \`authored\`
(write a preview in \`component-library-overrides.tsx\`), or \`skip\`.

| Status | Section | Export | Class | Import | Notes |
| ------ | ------- | ------ | ----- | ------ | ----- |
`;

  const rows = entries
    .map((entry) => {
      const info = entry.importInfo;
      const importPath = info
        ? `{ ${info.alias ? `${info.named} as ${info.alias}` : info.named} } from "${info.specifier}"`
        : "(no import)";
      const notes =
        entry.classification === "authored"
          ? entry.contextBound
            ? "context-bound"
            : "needs composition"
          : entry.minedUsage
            ? `mined:${entry.minedUsage.kind}`
            : entry.requiredProps?.length
              ? `required:${entry.requiredProps.join(",")}`
              : "";
      const done = entry.classification === "engine" ? "x" : " ";
      return `| [${done}] | ${entry.section} | ${entry.name} | ${entry.classification} | \`${importPath}\` | ${notes} |`;
    })
    .join("\n");

  return `${header}${rows}\n`;
}
