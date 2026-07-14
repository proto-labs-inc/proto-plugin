import { stat } from "fs/promises";
import path from "path";

import type { PrototypeMetadata } from "./prototype-config-types";

async function getPrototypeCreationMs(
  slug: string,
  configIndex: number,
): Promise<number> {
  try {
    const stats = await stat(
      path.join(process.cwd(), "src/prototypes", slug),
    );
    if (stats.birthtimeMs > 0) return stats.birthtimeMs;
  } catch {
    // Prototype directory may not exist in some host layouts.
  }

  // Config order is append-only — use registration index when birthtime is unavailable.
  return configIndex;
}

export async function sortPrototypesByCreationDate(
  prototypes: PrototypeMetadata[],
): Promise<PrototypeMetadata[]> {
  const creationMsBySlug = new Map<string, number>();

  await Promise.all(
    prototypes.map(async (prototype, configIndex) => {
      creationMsBySlug.set(
        prototype.slug,
        await getPrototypeCreationMs(prototype.slug, configIndex),
      );
    }),
  );

  return [...prototypes].sort((a, b) => {
    const creationDiff =
      (creationMsBySlug.get(b.slug) ?? 0) - (creationMsBySlug.get(a.slug) ?? 0);
    if (creationDiff !== 0) return creationDiff;
    return a.title.localeCompare(b.title);
  });
}
