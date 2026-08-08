"use client";

import type { ReactNode } from "react";

type TokenValueFormat = "hsl-components" | "color" | "unknown";

function swatchBackgroundExpression(format: TokenValueFormat, sourceVar: string): string {
  if (format === "hsl-components") return `hsl(var(${sourceVar}))`;
  return `var(${sourceVar})`;
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
    <div id="tokens" className="space-y-8">
      {/* 14 semantic tokens from 6 CSS source(s) — see .proto/design-system-tokens.json */}
      <div>
        <h3 className="font-semibold mb-4">Semantic Colors</h3>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <TokenSwatch name="Background" sourceVar="--background" format="color" displayVar="--background" required />
          <TokenSwatch name="Foreground" sourceVar="--foreground" format="color" displayVar="--foreground" required />
          <TokenSwatch name="Primary" sourceVar="--primary" format="color" displayVar="--primary" required />
          <TokenSwatch name="Secondary" sourceVar="--secondary" format="color" displayVar="--secondary" required />
          <TokenSwatch name="Border" sourceVar="--border" format="color" displayVar="--border" required />
          <TokenSwatch name="Destructive" sourceVar="--destructive" format="color" displayVar="--destructive" required />
          <TokenSwatch name="Muted" sourceVar="--muted" format="color" displayVar="--muted" required />
          <TokenSwatch name="Accent" sourceVar="--accent" format="color" displayVar="--accent" required />
          <TokenSwatch name="Card" sourceVar="--card" format="color" displayVar="--card" />
          <TokenSwatch name="Popover" sourceVar="--popover" format="color" displayVar="--popover" />
          <TokenSwatch name="Warning" sourceVar="--warning" format="color" displayVar="--warning" />
          <TokenSwatch name="Info" sourceVar="--info" format="color" displayVar="--info" />
          <TokenSwatch name="Input" sourceVar="--input" format="color" displayVar="--input" />
          <TokenSwatch name="Ring" sourceVar="--ring" format="color" displayVar="--ring" />
        </div>
      </div>
    </div>
  );
}
