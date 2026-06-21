export const COLOR_OPTIONS = [
  { id: "indigo", label: "Indigo", srgb: "#6155F5", p3: "color(display-p3 0.38 0.33 0.96)" },
  { id: "blue", label: "Blue", srgb: "#0088FF", p3: "color(display-p3 0.00 0.53 1.00)" },
  { id: "cyan", label: "Cyan", srgb: "#00C3D0", p3: "color(display-p3 0.00 0.76 0.82)" },
  { id: "green", label: "Green", srgb: "#34C759", p3: "color(display-p3 0.20 0.78 0.35)" },
  { id: "yellow", label: "Yellow", srgb: "#FFCC00", p3: "color(display-p3 1.00 0.80 0.00)" },
  { id: "orange", label: "Orange", srgb: "#FF8D28", p3: "color(display-p3 1.00 0.55 0.16)" },
  { id: "red", label: "Red", srgb: "#FF383C", p3: "color(display-p3 1.00 0.22 0.24)" },
] as const;

export function injectCaptureColorTokens() {
  if (typeof document === "undefined") return;
  if (document.getElementById("prototype-comments-color-tokens")) return;

  const style = document.createElement("style");
  style.id = "prototype-comments-color-tokens";
  style.textContent = [
    ...COLOR_OPTIONS.map(
      (c) => `
      [data-prototype-comment-accent="${c.id}"] {
        --prototype-comment-color-accent: ${c.srgb};
      }

      @supports (color: color(display-p3 0 0 0)) {
        [data-prototype-comment-accent="${c.id}"] {
          --prototype-comment-color-accent: ${c.p3};
        }
      }
    `,
    ),
    `:root {
      ${COLOR_OPTIONS.map((c) => `--prototype-comment-color-${c.id}: ${c.srgb};`).join("\n")}
    }`,
    `@supports (color: color(display-p3 0 0 0)) {
      :root {
        ${COLOR_OPTIONS.map((c) => `--prototype-comment-color-${c.id}: ${c.p3};`).join("\n")}
      }
    }`,
  ].join("\n");
  document.head.appendChild(style);
}
