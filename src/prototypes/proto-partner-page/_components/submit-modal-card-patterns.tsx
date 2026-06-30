import type { ProtoColorId } from "./proto-shape-content";
import { getProtoColor } from "./proto-shape-content";
import type { SubmitModalCardTheme, SubmitModalVariant } from "./submit-modal-content";

type PatternProps = {
  theme: SubmitModalCardTheme;
};

function VerticalRidgesPattern({ theme }: PatternProps) {
  const heights = [38, 62, 48, 78, 52, 68, 42, 86, 58, 72, 46, 82, 54, 66, 44, 74];

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 320 160"
      preserveAspectRatio="none"
      aria-hidden
    >
      {heights.map((height, index) => {
        const x = 12 + index * 19;
        const y2 = 150;
        const y1 = y2 - height * 1.4;

        return (
          <line
            key={index}
            x1={x}
            y1={y1}
            x2={x}
            y2={y2}
            stroke={theme.patternForeground}
            strokeWidth="1.5"
          />
        );
      })}
    </svg>
  );
}

function MosaicPixelsPattern({ theme }: PatternProps) {
  const tones = [0.25, 0.45, 0.35, 0.55, 0.3, 0.5, 0.4, 0.6, 0.32, 0.48, 0.38, 0.52];

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 320 160"
      preserveAspectRatio="none"
      aria-hidden
    >
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 14 }, (_, column) => {
          const tone = tones[(row + column) % tones.length]!;
          const size = 10 + ((row + column) % 3) * 2;

          return (
            <rect
              key={`${row}-${column}`}
              x={8 + column * 22}
              y={8 + row * 18}
              width={size}
              height={size}
              fill={theme.patternForeground}
              opacity={tone}
              rx="1"
            />
          );
        }),
      )}
    </svg>
  );
}

function FluidWavesPattern({ theme }: PatternProps) {
  const waves = [
    "M0 48 C40 32, 80 64, 120 48 S200 32, 240 48 S320 64, 320 48",
    "M0 72 C50 56, 90 88, 140 72 S220 56, 260 72 S320 88, 320 72",
    "M0 96 C35 80, 85 112, 130 96 S210 80, 250 96 S320 112, 320 96",
    "M0 120 C45 104, 95 136, 145 120 S225 104, 265 120 S320 136, 320 120",
  ];

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 320 160"
      preserveAspectRatio="none"
      aria-hidden
    >
      {waves.map((path, index) => (
        <path
          key={index}
          d={path}
          fill="none"
          stroke={theme.patternForeground}
          strokeWidth="1.25"
        />
      ))}
    </svg>
  );
}

function BlockTexturePattern({ theme }: PatternProps) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 320 160"
      preserveAspectRatio="none"
      aria-hidden
    >
      {Array.from({ length: 10 }, (_, row) =>
        Array.from({ length: 18 }, (_, column) => {
          const width = 8 + ((row + column) % 2) * 3;
          const height = 6 + ((row + column) % 3) * 2;

          return (
            <rect
              key={`${row}-${column}`}
              x={6 + column * 17}
              y={6 + row * 14}
              width={width}
              height={height}
              fill={theme.patternForeground}
              opacity={0.35 + ((row + column) % 4) * 0.12}
              rx="0.5"
            />
          );
        }),
      )}
    </svg>
  );
}

function WireframeGridPattern({ theme }: PatternProps) {
  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 320 160"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <pattern id="submit-modal-wire-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path
            d="M16 0H0V16"
            fill="none"
            stroke={theme.patternForeground}
            strokeWidth="0.75"
            opacity="0.35"
          />
        </pattern>
      </defs>
      <rect width="320" height="160" fill="url(#submit-modal-wire-grid)" />
      <rect
        x="24"
        y="20"
        width="120"
        height="14"
        fill="none"
        stroke={theme.patternForeground}
        strokeWidth="1"
        rx="2"
      />
      <rect
        x="24"
        y="44"
        width="272"
        height="56"
        fill="none"
        stroke={theme.patternForeground}
        strokeWidth="1"
        rx="3"
      />
      <rect
        x="36"
        y="56"
        width="88"
        height="32"
        fill="none"
        stroke={theme.patternForeground}
        strokeWidth="0.75"
        rx="2"
      />
      <rect
        x="132"
        y="56"
        width="56"
        height="32"
        fill="none"
        stroke={theme.patternForeground}
        strokeWidth="0.75"
        rx="2"
      />
      <rect
        x="200"
        y="56"
        width="84"
        height="32"
        fill="none"
        stroke={theme.patternForeground}
        strokeWidth="0.75"
        rx="2"
      />
      <rect
        x="24"
        y="112"
        width="96"
        height="24"
        fill="none"
        stroke={theme.patternForeground}
        strokeWidth="0.75"
        rx="2"
      />
      <rect
        x="128"
        y="112"
        width="168"
        height="24"
        fill="none"
        stroke={theme.patternForeground}
        strokeWidth="0.75"
        rx="2"
      />
    </svg>
  );
}

function ProtoTintPattern({ colorId }: { colorId: ProtoColorId }) {
  const color = getProtoColor(colorId);
  const [r, g, b] = color.rgb;
  const fill = `rgba(${r}, ${g}, ${b}, 0.28)`;
  const stroke = `rgba(${Math.max(r - 40, 0)}, ${Math.max(g - 40, 0)}, ${Math.max(b - 40, 0)}, 0.55)`;

  return (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 320 160"
      preserveAspectRatio="none"
      aria-hidden
    >
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 7 }, (_, column) => (
          <polygon
            key={`${row}-${column}`}
            points={`${24 + column * 42},${18 + row * 28} ${44 + column * 42},${10 + row * 28} ${64 + column * 42},${18 + row * 28} ${54 + column * 42},${34 + row * 28}`}
            fill={fill}
            stroke={stroke}
            strokeWidth="1"
          />
        )),
      )}
    </svg>
  );
}

export function renderSubmitModalCardPattern(
  variant: SubmitModalVariant,
  theme: SubmitModalCardTheme,
  colorId: ProtoColorId,
) {
  switch (variant) {
    case "vertical-ridges":
      return <VerticalRidgesPattern theme={theme} />;
    case "mosaic-pixels":
      return <MosaicPixelsPattern theme={theme} />;
    case "fluid-waves":
      return <FluidWavesPattern theme={theme} />;
    case "block-texture":
      return <BlockTexturePattern theme={theme} />;
    case "wireframe-grid":
      return <WireframeGridPattern theme={theme} />;
    case "proto-tint":
      return <ProtoTintPattern colorId={colorId} />;
    default:
      return null;
  }
}
