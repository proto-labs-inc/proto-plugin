export type PrototypeReferenceDoc = {
  name: string;
  link: string;
  content: string;
};

export function defaultReferenceDocsConfigPath(slug: string): string {
  return `src/prototypes/${slug}/reference-docs.ts`;
}

export function isValidReferenceDoc(value: unknown): value is PrototypeReferenceDoc {
  if (!value || typeof value !== "object") return false;

  const doc = value as Partial<PrototypeReferenceDoc>;

  if (typeof doc.name !== "string" || !doc.name.trim()) return false;
  if (typeof doc.link !== "string" || !doc.link.trim()) return false;
  if (typeof doc.content !== "string") return false;

  try {
    const url = new URL(normalizeReferenceDocLink(doc.link));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function normalizeReferenceDocLink(link: string): string {
  const trimmed = link.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function isValidReferenceDocInput(
  name: string,
  link: string,
  content: string,
): boolean {
  if (!name.trim() || !link.trim() || !content.trim()) return false;

  try {
    const url = new URL(normalizeReferenceDocLink(link));
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function buildAddReferenceDocPrompt({
  slug,
  name,
  link,
  content,
  existingDocs = [],
  configFilePath,
  origin = "http://localhost:3003",
}: {
  slug: string;
  name: string;
  link: string;
  content: string;
  existingDocs?: PrototypeReferenceDoc[];
  configFilePath?: string;
  origin?: string;
}): string {
  const target = configFilePath ?? defaultReferenceDocsConfigPath(slug);
  const prototypeUrl = `${origin}/prototypes/${slug}`;
  const trimmedName = name.trim();
  const trimmedLink = normalizeReferenceDocLink(link);
  const trimmedContent = content.trim();

  const lines = [
    `Add a reference doc to the "${slug}" prototype.`,
    "",
    "## Doc",
    `Name: ${trimmedName}`,
    `Link: ${trimmedLink}`,
    "",
    "Content:",
    trimmedContent,
  ];

  if (existingDocs.length > 0) {
    lines.push("", "## Existing reference docs");
    for (const doc of existingDocs) {
      lines.push(`- ${doc.name} (${doc.link})`);
    }
  }

  lines.push(
    "",
    "## Prototype",
    `- Slug: \`${slug}\``,
    `- Preview: ${prototypeUrl}`,
    "",
    "## Instructions",
    `1. Create or update \`${target}\` and export \`REFERENCE_DOCS\` as a \`PrototypeReferenceDoc[]\` array.`,
    "2. Prepend the new doc to the top of the array so the newest reference appears first.",
    "3. Each entry must include `name`, `link`, and `content`.",
    "4. Wire the docs on the prototype page with `useRegisterPrototypeReferenceDocs(REFERENCE_DOCS)` from `prototype`.",
    "5. Do not store reference docs in KV or localStorage.",
  );

  return lines.join("\n");
}

export function buildAddReferenceDocCopyText({
  slug,
  name,
  link,
  content,
  existingDocs = [],
  configFilePath,
  origin = "http://localhost:3003",
}: {
  slug: string;
  name: string;
  link: string;
  content: string;
  existingDocs?: PrototypeReferenceDoc[];
  configFilePath?: string;
  origin?: string;
}): string {
  const prompt = buildAddReferenceDocPrompt({
    slug,
    name,
    link,
    content,
    existingDocs,
    configFilePath,
    origin,
  });

  return `${content.trim()}\n\n---\n\n${prompt}`;
}
