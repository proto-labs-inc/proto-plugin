import { mkdir, readdir, readFile, stat, writeFile } from "fs/promises";
import path from "path";

type ScreenshotManifest = Record<string, number>;

const SCREENSHOTS_DIR = path.join(
  process.cwd(),
  "public/prototypes/screenshots",
);
const MANIFEST_PATH = path.join(SCREENSHOTS_DIR, "manifest.json");

let manifestWriteQueue: Promise<unknown> = Promise.resolve();

async function writeManifest(manifest: ScreenshotManifest): Promise<void> {
  await mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function mergeManifestFromDisk(
  manifest: ScreenshotManifest,
): Promise<ScreenshotManifest> {
  const merged = { ...manifest };

  try {
    const entries = await readdir(SCREENSHOTS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith(".png")) {
        const slug = entry.name.replace(/\.png$/, "");
        const filePath = path.join(SCREENSHOTS_DIR, entry.name);
        const fileStat = await stat(filePath);
        const mtime = Math.round(fileStat.mtimeMs);
        const existing = merged[slug];
        if (existing == null || existing < mtime) {
          merged[slug] = mtime;
        }
        continue;
      }

      if (!entry.isDirectory() || entry.name === "manifest.json") continue;

      const slug = entry.name;
      const statesDir = path.join(SCREENSHOTS_DIR, slug, "states");

      let stateFiles: string[];
      try {
        stateFiles = await readdir(statesDir);
      } catch {
        continue;
      }

      for (const stateFile of stateFiles) {
        if (!stateFile.endsWith(".png")) continue;

        const key = `${slug}/states/${stateFile.replace(/\.png$/, "")}`;
        const filePath = path.join(statesDir, stateFile);
        const fileStat = await stat(filePath);
        const mtime = Math.round(fileStat.mtimeMs);
        const existing = merged[key];
        if (existing == null || existing < mtime) {
          merged[key] = mtime;
        }
      }
    }
  } catch {
    return manifest;
  }

  return merged;
}

export async function syncScreenshotManifestFromDisk(): Promise<ScreenshotManifest> {
  const manifest = await readScreenshotManifest();
  const merged = await mergeManifestFromDisk(manifest);

  if (JSON.stringify(merged) !== JSON.stringify(manifest)) {
    await writeManifest(merged);
  }

  return merged;
}

export async function readScreenshotManifest(): Promise<ScreenshotManifest> {
  try {
    const raw = await readFile(MANIFEST_PATH, "utf-8");
    return JSON.parse(raw) as ScreenshotManifest;
  } catch {
    return {};
  }
}

export async function touchScreenshotManifestKey(key: string): Promise<number> {
  const run = async () => {
    const synced = await syncScreenshotManifestFromDisk();
    const version = Date.now();
    synced[key] = version;
    await writeManifest(synced);
    return version;
  };

  const result = (manifestWriteQueue = manifestWriteQueue.then(run, run));
  return result as Promise<number>;
}

export async function touchScreenshotManifest(slug: string): Promise<number> {
  return touchScreenshotManifestKey(slug);
}
