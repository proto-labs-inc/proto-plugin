export function buildChangelogDescriptionPrompt({
  slug,
  description,
  origin = "http://localhost:3003",
}: {
  slug: string;
  description: string;
  origin?: string;
}): string {
  const prototypeUrl = `${origin}/prototypes/${slug}`;
  const trimmed = description.trim();

  const lines = [
    `Update the "${slug}" prototype to match the following change log overview.`,
    "",
    "## Description",
  ];

  if (trimmed) {
    lines.push(trimmed);
  } else {
    lines.push(
      "Summarize what changed in this prototype and why:",
      "- What changed:",
      "- Why:",
    );
  }

  lines.push(
    "",
    "## Prototype",
    `- Slug: \`${slug}\``,
    `- Preview: ${prototypeUrl}`,
    `- Work in: \`src/prototypes/${slug}/\``,
    "",
    "## Instructions",
    "1. Review the overview and anchored changelog entries in the prototype review sidebar.",
    "2. Apply any missing updates so the prototype matches the described changes.",
    "3. Do not persist this overview in KV — it is prompt-only.",
  );

  return lines.join("\n");
}

export function buildChangelogDescriptionCopyText({
  slug,
  description,
  origin,
}: {
  slug: string;
  description: string;
  origin?: string;
}): string {
  const prompt = buildChangelogDescriptionPrompt({ slug, description, origin });
  const trimmed = description.trim();
  if (!trimmed) return prompt;
  return `${trimmed}\n\n---\n\n${prompt}`;
}
