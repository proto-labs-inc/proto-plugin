import { PrototypeComponent } from "proto-plugin";
import { cn } from "ui";

const NODES = [
  { id: "auth", label: "Auth", x: 18, y: 22 },
  { id: "storage", label: "Storage", x: 82, y: 22 },
  { id: "functions", label: "Functions", x: 18, y: 78 },
  { id: "realtime", label: "Realtime", x: 82, y: 78 },
  { id: "vector", label: "Vector", x: 50, y: 10 },
  { id: "api", label: "Data APIs", x: 50, y: 90 },
] as const;

function DiagramNode({
  x,
  y,
  label,
  tone = "surface",
}: {
  x: number;
  y: number;
  label: string;
  tone?: "surface" | "brand" | "warning";
}) {
  const fill =
    tone === "brand"
      ? "var(--brand-500)"
      : tone === "warning"
        ? "var(--warning-default, var(--warning))"
        : "var(--background)";
  const stroke = tone === "brand" ? "var(--brand-600)" : "var(--border-stronger, var(--border))";
  const text = tone === "brand" ? "var(--foreground)" : "var(--foreground)";

  return (
    <g transform={`translate(${x} ${y})`}>
      <rect
        x="-11"
        y="-6"
        width="22"
        height="12"
        rx="2.2"
        fill={fill}
        stroke={stroke}
        strokeWidth="0.6"
      />
      <text
        textAnchor="middle"
        y="1.2"
        fill={text}
        fontSize="3.4"
        fontFamily="var(--font-sans)"
        fontWeight="600"
      >
        {label}
      </text>
    </g>
  );
}

export function SignalFieldDiagram({ className }: { className?: string }) {
  return (
    <PrototypeComponent
      id="hero-diagrams.signal-field-diagram"
      className={cn("pointer-events-none", className)}
    >
      <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
        <circle
          cx="50"
          cy="50"
          r="28"
          fill="none"
          stroke="color-mix(in oklch, var(--foreground) 18%, transparent)"
          strokeWidth="0.4"
          strokeDasharray="1.4 1.8"
        />
        <circle
          cx="50"
          cy="50"
          r="38"
          fill="none"
          stroke="color-mix(in oklch, var(--foreground) 12%, transparent)"
          strokeWidth="0.35"
        />
        {NODES.map((node) => (
          <line
            key={node.id}
            x1="50"
            y1="50"
            x2={node.x}
            y2={node.y}
            stroke="color-mix(in oklch, var(--foreground) 28%, transparent)"
            strokeWidth="0.45"
          />
        ))}
        <DiagramNode x={50} y={50} label="Postgres" tone="brand" />
        {NODES.map((node) => (
          <DiagramNode key={node.id} x={node.x} y={node.y} label={node.label} />
        ))}
      </svg>
    </PrototypeComponent>
  );
}

export function OrbitCanvasDiagram({ className }: { className?: string }) {
  return (
    <PrototypeComponent
      id="hero-diagrams.orbit-canvas-diagram"
      className={cn("pointer-events-none", className)}
    >
      <svg viewBox="0 0 120 100" className="h-full w-full" aria-hidden="true">
        <ellipse
          cx="60"
          cy="50"
          rx="46"
          ry="28"
          fill="none"
          stroke="color-mix(in oklch, var(--brand-500) 45%, transparent)"
          strokeWidth="0.7"
        />
        <ellipse
          cx="60"
          cy="50"
          rx="32"
          ry="18"
          fill="none"
          stroke="color-mix(in oklch, var(--warning) 50%, transparent)"
          strokeWidth="0.6"
        />
        <ellipse
          cx="60"
          cy="50"
          rx="18"
          ry="10"
          fill="none"
          stroke="color-mix(in oklch, var(--foreground) 18%, transparent)"
          strokeWidth="0.5"
        />
        <circle cx="60" cy="50" r="9" fill="var(--brand-500)" />
        <text
          x="60"
          y="51.4"
          textAnchor="middle"
          fill="var(--foreground)"
          fontSize="3.6"
          fontWeight="700"
          fontFamily="var(--font-sans)"
        >
          PG
        </text>
        <circle cx="106" cy="50" r="4.2" fill="var(--warning)" />
        <circle cx="14" cy="50" r="4.2" fill="var(--brand-400)" />
        <circle cx="82" cy="34" r="3.6" fill="var(--destructive)" />
        <circle cx="38" cy="66" r="3.6" fill="var(--brand-600)" />
        <circle cx="88" cy="68" r="3.2" fill="var(--foreground)" />
        <text x="106" y="58.5" textAnchor="middle" fontSize="3" fill="var(--foreground-light)">
          Auth
        </text>
        <text x="14" y="58.5" textAnchor="middle" fontSize="3" fill="var(--foreground-light)">
          API
        </text>
        <text x="82" y="29" textAnchor="middle" fontSize="3" fill="var(--foreground-light)">
          Storage
        </text>
        <text x="38" y="74" textAnchor="middle" fontSize="3" fill="var(--foreground-light)">
          Realtime
        </text>
        <text x="88" y="76" textAnchor="middle" fontSize="3" fill="var(--foreground-light)">
          Vector
        </text>
      </svg>
    </PrototypeComponent>
  );
}

export function StackCutawayDiagram({ className }: { className?: string }) {
  const layers = [
    { label: "Realtime · Vector · Storage", fill: "var(--warning)" },
    { label: "Auth · Edge Functions", fill: "var(--brand-400)" },
    { label: "Data APIs", fill: "var(--brand-500)" },
    { label: "Postgres", fill: "var(--brand-600)" },
  ];

  return (
    <PrototypeComponent
      id="hero-diagrams.stack-cutaway-diagram"
      className={cn("pointer-events-none", className)}
    >
      <svg viewBox="0 0 140 110" className="h-full w-full" aria-hidden="true">
        {layers.map((layer, index) => {
          const y = 12 + index * 22;
          const inset = index * 4;
          return (
            <g key={layer.label}>
              <polygon
                points={`${20 + inset},${y} ${120 - inset},${y} ${128 - inset},${y + 8} ${12 + inset},${y + 8}`}
                fill={layer.fill}
                opacity={0.92}
              />
              <polygon
                points={`${12 + inset},${y + 8} ${128 - inset},${y + 8} ${128 - inset},${y + 18} ${12 + inset},${y + 18}`}
                fill={layer.fill}
              />
              <text
                x="70"
                y={y + 15}
                textAnchor="middle"
                fill="var(--foreground)"
                fontSize="5.2"
                fontWeight="650"
                fontFamily="var(--font-sans)"
              >
                {layer.label}
              </text>
            </g>
          );
        })}
      </svg>
    </PrototypeComponent>
  );
}
