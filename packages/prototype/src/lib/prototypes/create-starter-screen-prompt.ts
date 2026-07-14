import { suggestPrototypeSlug } from "./create-prototype-prompt";

export function buildCreateStarterScreenPrompt({
  title,
  route,
  referenceHtml,
  sourcePath,
  origin = "http://localhost:3003",
  starterScreensPagePath = "src/app/starter-screens/page.tsx",
}: {
  title: string;
  route: string;
  referenceHtml: string;
  sourcePath?: string;
  origin?: string;
  starterScreensPagePath?: string;
}): string {
  const trimmedTitle = title.trim();
  const trimmedRoute = route.trim();
  const trimmedHtml = referenceHtml.trim();
  const suggestedSlug = suggestPrototypeSlug(trimmedTitle);
  const componentLibraryUrl = `${origin}/component-library`;
  const starterScreensUrl = `${origin}/starter-screens`;
  const trimmedSourcePath = sourcePath?.trim();
  const sourceLine = trimmedSourcePath
    ? `- Linked source: \`${trimmedSourcePath}\` (readable via the \`source/\` symlink after \`pnpm link-source\`)`
    : "- Linked source: set `SOURCE_PATH` in `.env.local` and run `pnpm link-source`";

  const lines = [
    `Create a new starter screen: "${trimmedTitle}".`,
    "",
    "## Brief",
    `- Title: ${trimmedTitle}`,
    `- Source route: \`${trimmedRoute}\``,
    `- Suggested slug: \`${suggestedSlug || "my-starter-screen"}\` (pick a unique kebab-case slug if taken)`,
    "",
    "## Source page",
    sourceLine,
    `Find this page in the linked source app at route \`${trimmedRoute}\`. Read the page component and its imports to understand structure and behavior before building the starter screen.`,
    "",
    "## Reference HTML",
    "The user captured this rendered HTML as the visual target. Match layout, spacing, typography, hierarchy, and component structure — rebuild it as a React component using the cached component library below. Do **not** paste or dangerously set this HTML at runtime.",
    "",
    "```html",
    trimmedHtml,
    "```",
    "",
    "## Component library (required)",
    "Build exclusively from the **cached component library** already synced in this host — not from the source app and not from ad-hoc markup.",
    "",
    `- Component library gallery: ${componentLibraryUrl}`,
    "- UI primitives: `@/components/ui/`",
    "- Design tokens and global styles: host `globals.css`",
    "",
    "Before writing UI, open `/component-library` and map each region in the reference HTML to existing synced primitives (buttons, inputs, cards, badges, tables, dialogs, etc.). Reuse them directly; do not re-sync from source or invent parallel primitives when an equivalent already exists.",
    "",
    "## Starter Screens gallery",
    starterScreensUrl,
    "",
    "## Instructions",
    "Follow AGENTS.md for host prototype conventions (semantic tokens, no runtime `source/` imports).",
    "",
    `1. Open the source page at \`${trimmedRoute}\` and read its component tree alongside the reference HTML below.`,
    "2. Inspect `/component-library` and list which synced components you will compose for this screen.",
    "3. Create `src/starter-screens/<slug>/` with a default-export React component that reproduces the reference HTML using `@/components/ui` and host tokens.",
    "4. Capture a screenshot under `public/starter-screens/screenshots/<slug>.png` (or equivalent) for the gallery card.",
    `5. Register the starter screen on \`${starterScreensPagePath}\` so it appears on \`/starter-screens\` alongside existing entries.`,
    "6. Confirm side-by-side visual parity with the reference HTML before finishing.",
  ];

  return lines.join("\n");
}

export function buildCreateStarterScreenCopyText({
  title,
  route,
  referenceHtml,
  sourcePath,
  origin = "http://localhost:3003",
  starterScreensPagePath = "src/app/starter-screens/page.tsx",
}: {
  title: string;
  route: string;
  referenceHtml: string;
  sourcePath?: string;
  origin?: string;
  starterScreensPagePath?: string;
}): string {
  const trimmedTitle = title.trim();
  const trimmedRoute = route.trim();
  const brief = [`Title: ${trimmedTitle}`, `Route: ${trimmedRoute}`].join("\n");
  const prompt = buildCreateStarterScreenPrompt({
    title: trimmedTitle,
    route: trimmedRoute,
    referenceHtml: referenceHtml.trim(),
    sourcePath,
    origin,
    starterScreensPagePath,
  });

  return `${brief}\n\n---\n\n${prompt}`;
}
