/**
 * Fetches full-resolution (1920w) Mobbin screen images for prototype references.
 * MCP short URLs are ~768px — too small for the overview modal grid.
 *
 * Usage:
 *   pnpm download-mobbin-references -- --ids=id1,id2,id3
 *   pnpm download-mobbin-references -- --config=path/to/ids.json
 *
 * Config JSON shape: { "screenIds": ["uuid", ...] }
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  resolveHostRoot,
  resolveToolRoot,
} from "./lib/resolve-host-root.mjs";

const toolRoot = resolveToolRoot(import.meta.url);
const hostRoot = resolveHostRoot(toolRoot);
const OUT_DIR = path.join(hostRoot, "public/prototypes/mobbin-references");

function parseArgs(argv) {
  const idsFlag = argv.find((arg) => arg.startsWith("--ids="));
  if (idsFlag) {
    const ids = idsFlag
      .slice("--ids=".length)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (ids.length === 0) {
      throw new Error("--ids requires at least one screen id");
    }
    return ids;
  }

  const configFlag = argv.find((arg) => arg.startsWith("--config="));
  if (configFlag) {
    return { configPath: configFlag.slice("--config=".length) };
  }

  throw new Error(
    "No screen ids provided. Pass --ids=id1,id2 or --config=path/to/ids.json",
  );
}

async function loadScreenIds(argv) {
  const parsed = parseArgs(argv);
  if (Array.isArray(parsed)) return parsed;

  const raw = await readFile(parsed.configPath, "utf8");
  const config = JSON.parse(raw);
  const ids = config.screenIds ?? config.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    throw new Error("Config must include a non-empty screenIds (or ids) array");
  }
  return ids;
}

function extractLargestSrcSetUrl(html) {
  const srcSetMatch = html.match(/imageSrcSet="([^"]+)"/);
  if (!srcSetMatch) return null;

  const candidates = [];
  const parts = srcSetMatch[1].split(/\s+/);
  for (let i = 0; i < parts.length - 1; i += 2) {
    const url = parts[i];
    const width = parts[i + 1];
    if (url?.startsWith("https://") && width?.endsWith("w")) {
      candidates.push({ url, width: Number.parseInt(width, 10) });
    }
  }

  candidates.sort((a, b) => b.width - a.width);
  return candidates[0]?.url ?? null;
}

function extractOgScreenImageUrl(html) {
  const ogMatch = html.match(/property="og:image"\s+content="([^"]+)"/);
  if (!ogMatch) return null;

  const content = ogMatch[1].replaceAll("&amp;", "&");
  const screenUrlMatch = content.match(/screenUrl=([^&]+)/);
  if (!screenUrlMatch) return null;

  return decodeURIComponent(screenUrlMatch[1]);
}

function extractEncodedWebpUrl(html) {
  const webpMatch = html.match(
    /https:\/\/bytescale\.mobbin\.com\/FW25bBB\/image\/mobbin\.com\/prod\/file\.webp\?enc=[^"'\\]+/,
  );
  return webpMatch?.[0] ?? null;
}

function toFullResolutionWebpUrl(url) {
  if (!url) return null;

  if (url.includes("file.webp?enc=")) {
    return url;
  }

  const parsed = new URL(url);
  parsed.searchParams.set("f", "webp");
  parsed.searchParams.set("w", "1920");
  parsed.searchParams.set("q", "50");
  parsed.searchParams.set("fit", "shrink-cover");
  return parsed.toString();
}

function extractScreenImageUrl(html) {
  return (
    extractLargestSrcSetUrl(html) ??
    extractOgScreenImageUrl(html) ??
    extractEncodedWebpUrl(html)
  );
}

async function downloadScreen(screenId) {
  const pageUrl = `https://mobbin.com/explore/screens/${screenId}`;
  const response = await fetch(pageUrl, {
    headers: { "User-Agent": "prototype-tool/1.0" },
  });
  if (!response.ok) {
    throw new Error(`${screenId}: page fetch failed (${response.status})`);
  }

  const html = await response.text();
  const imageUrl = toFullResolutionWebpUrl(extractScreenImageUrl(html));
  if (!imageUrl) {
    throw new Error(`${screenId}: no screen image found`);
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`${screenId}: image fetch failed (${imageResponse.status})`);
  }

  const buffer = Buffer.from(await imageResponse.arrayBuffer());
  const outPath = path.join(OUT_DIR, `${screenId}.webp`);
  await writeFile(outPath, buffer);
  console.log(`Saved ${outPath} (${buffer.length} bytes)`);
}

const screenIds = await loadScreenIds(process.argv.slice(2));

await mkdir(OUT_DIR, { recursive: true });

for (const screenId of screenIds) {
  await downloadScreen(screenId);
}

console.log("Done.");
