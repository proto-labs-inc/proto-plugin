import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

type ScreenshotManifest = Record<string, number>;

const MANIFEST_PATH = path.join(
  process.cwd(),
  "public/prototypes/screenshots/manifest.json",
);

export async function readScreenshotManifest(): Promise<ScreenshotManifest> {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf-8");
    return JSON.parse(raw) as ScreenshotManifest;
  } catch {
    return {};
  }
}

export async function touchScreenshotManifestKey(key: string): Promise<number> {
  const manifest = await readScreenshotManifest();
  const version = Date.now();
  manifest[key] = version;

  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);

  return version;
}

export async function touchScreenshotManifest(slug: string): Promise<number> {
  return touchScreenshotManifestKey(slug);
}
