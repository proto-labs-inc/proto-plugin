import { stat } from "fs/promises";
import path from "path";

import type { PrototypeMetadata } from "./prototype-config-types";

async function getPrototypeRecencyMs(
  slug: string,
  screenshotManifest: Record<string, number>,
): Promise<number> {
  let recency = screenshotManifest[slug] ?? 0;

  try {
    const stats = await stat(
      path.join(process.cwd(), "src/prototypes", slug),
    );
    recency = Math.max(recency, stats.mtimeMs);
  } catch {
    // Prototype directory may not exist in some host layouts.
  }

  return recency;
}

export async function sortPrototypesByRecency(
  prototypes: PrototypeMetadata[],
  screenshotManifest: Record<string, number> = {},
): Promise<PrototypeMetadata[]> {
  const recencyBySlug = new Map<string, number>();

  await Promise.all(
    prototypes.map(async (prototype, index) => {
      const recency = await getPrototypeRecencyMs(
        prototype.slug,
        screenshotManifest,
      );
      recencyBySlug.set(prototype.slug, recency || index);
    }),
  );

  return [...prototypes].sort((a, b) => {
    const recencyDiff =
      (recencyBySlug.get(b.slug) ?? 0) - (recencyBySlug.get(a.slug) ?? 0);
    if (recencyDiff !== 0) return recencyDiff;
    return a.title.localeCompare(b.title);
  });
}
