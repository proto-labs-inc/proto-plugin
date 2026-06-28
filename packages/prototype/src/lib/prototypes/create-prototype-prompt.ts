export function suggestPrototypeSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildCreatePrototypePrompt({
  title,
  description,
  existingPrototypes = [],
  origin = "http://localhost:3003",
}: {
  title: string;
  description: string;
  existingPrototypes?: Array<{ slug: string; title: string }>;
  origin?: string;
}): string {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const suggestedSlug = suggestPrototypeSlug(trimmedTitle);
  const galleryUrl = `${origin}/`;

  const lines = [
    `Create a new prototype: "${trimmedTitle}".`,
    "",
    "## Brief",
    `- Title: ${trimmedTitle}`,
    `- Description: ${trimmedDescription}`,
    `- Suggested slug: \`${suggestedSlug || "my-prototype"}\` (pick a unique kebab-case slug if taken)`,
    "",
    "## Gallery",
    galleryUrl,
  ];

  if (existingPrototypes.length > 0) {
    lines.push("", "## Existing prototypes");
    for (const prototype of existingPrototypes) {
      lines.push(`- ${prototype.title} (\`${prototype.slug}\`)`);
    }
  }

  lines.push(
    "",
    "## Instructions",
    "Follow AGENTS.md → New prototype checklist.",
    "",
    "1. Identify the source page/feature and confirm visual parity.",
    "2. Create `src/prototypes/<slug>/` with a default export page component.",
    "3. Add `component-ids.ts` — exhaustive static id list + `dynamicPrefixes`.",
    "4. Register in `prototype.config.ts` with `componentRegistry`.",
    "5. Wrap every UI component in `PrototypeComponent` / `PrototypeControl`.",
    "6. Call `usePrototypeComments(liveState, onRestore)` on the page.",
    "7. Run `pnpm verify:prototype-ids`.",
    "8. Capture a screenshot under `public/prototypes/screenshots/`; share via `pnpm share-prototype <slug>`.",
    "",
    "Reference: `src/prototypes/example-feature/`.",
  );

  return lines.join("\n");
}

export function buildCreatePrototypeCopyText({
  title,
  description,
  existingPrototypes = [],
  origin = "http://localhost:3003",
}: {
  title: string;
  description: string;
  existingPrototypes?: Array<{ slug: string; title: string }>;
  origin?: string;
}): string {
  const trimmedTitle = title.trim();
  const trimmedDescription = description.trim();
  const brief = [`Title: ${trimmedTitle}`, `Description: ${trimmedDescription}`].join(
    "\n",
  );
  const prompt = buildCreatePrototypePrompt({
    title: trimmedTitle,
    description: trimmedDescription,
    existingPrototypes,
    origin,
  });

  return `${brief}\n\n---\n\n${prompt}`;
}
