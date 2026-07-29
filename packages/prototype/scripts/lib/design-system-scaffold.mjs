import {
  roleDisplayName,
  roleToSourceVar,
} from "./design-system-token-manifest.mjs";
import {
  CORE_TOKEN_ROLES,
  EXTENDED_TOKEN_ROLES,
} from "./component-library-coverage.mjs";

function fallbackSwatches() {
  return [...CORE_TOKEN_ROLES, ...EXTENDED_TOKEN_ROLES].map((role) => ({
    role,
    name: roleDisplayName(role),
    sourceVar: roleToSourceVar(role),
    displayVar: roleToSourceVar(role),
    format: "hsl-components",
    required: CORE_TOKEN_ROLES.includes(role),
  }));
}

/**
 * @param {import("./design-system-token-manifest.mjs").DesignSystemTokenManifest | null | undefined} manifest
 */
export function generateTokensSection(manifest) {
  const swatchList =
    manifest?.swatches?.length > 0 ? manifest.swatches : fallbackSwatches();

  const swatches = swatchList
    .map((swatch) => {
      const requiredProp = swatch.required ? " required" : "";
      return `          <TokenSwatch name="${swatch.name}" sourceVar="${swatch.sourceVar}" format="${swatch.format}" displayVar="${swatch.displayVar}"${requiredProp} />`;
    })
    .join("\n");

  const tokenComment = manifest?.swatches?.length
    ? `\n      {/* ${manifest.swatches.length} semantic tokens from ${manifest.sourceCssFiles?.length ?? 0} CSS source(s) — see .proto/design-system-tokens.json */}`
    : "";

  return `"use client";

import type { ReactNode } from "react";

type TokenValueFormat = "hsl-components" | "color" | "unknown";

function swatchBackgroundExpression(format: TokenValueFormat, sourceVar: string): string {
  if (format === "hsl-components") return \`hsl(var(\${sourceVar}))\`;
  return \`var(\${sourceVar})\`;
}

function TokenSwatch({
  name,
  sourceVar,
  displayVar,
  format,
  required = false,
}: {
  name: string;
  sourceVar: string;
  displayVar: string;
  format: TokenValueFormat;
  required?: boolean;
}): ReactNode {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        data-token-swatch=""
        data-token-name={name}
        data-token-var={sourceVar}
        data-token-format={format}
        data-token-required={required ? "true" : "false"}
        className="h-12 w-full rounded-lg border border-border"
        style={{ backgroundColor: swatchBackgroundExpression(format, sourceVar) }}
      />
      <div className="text-xs font-medium text-center">
        <div>{name}</div>
        <div className="text-muted-foreground">{displayVar}</div>
      </div>
    </div>
  );
}

export function TokensSection() {
  return (
    <div id="tokens" className="space-y-8">${tokenComment}
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

export function generateDesignSystemContentShell() {
  return `"use client";

import { TokensSection } from "./design-system-tokens.generated";

export function DesignSystemContent() {
  return <TokensSection />;
}
`;
}
