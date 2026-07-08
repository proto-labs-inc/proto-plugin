import { readFileSync, lstatSync } from "fs";
import { join } from "path";

import { NextResponse } from "next/server";

const PACKAGE_NAME = "proto-plugin";
const NPM_LATEST_URL = `https://registry.npmjs.org/${PACKAGE_NAME}/latest`;
const CACHE_TTL_MS = 60 * 60 * 1000;

export type ProtoPluginVersionStatus = {
  installed: string | null;
  latest: string | null;
  updateAvailable: boolean;
  isWorkspaceLink: boolean;
  repositoryUrl?: string;
};

type NpmLatestResponse = {
  version?: string;
  repository?: { url?: string };
};

let cachedLatest: { version: string; repositoryUrl?: string; fetchedAt: number } | null =
  null;

function parseSemver(version: string): [number, number, number] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)/.exec(version.trim());
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function isNewerVersion(latest: string, installed: string): boolean {
  const latestParts = parseSemver(latest);
  const installedParts = parseSemver(installed);
  if (!latestParts || !installedParts) return false;

  for (let index = 0; index < 3; index += 1) {
    if (latestParts[index]! > installedParts[index]!) return true;
    if (latestParts[index]! < installedParts[index]!) return false;
  }

  return false;
}

function readInstalledVersion(cwd: string): {
  installed: string | null;
  isWorkspaceLink: boolean;
} {
  const packagePath = join(cwd, "node_modules", PACKAGE_NAME, "package.json");
  const linkPath = join(cwd, "node_modules", PACKAGE_NAME);

  let isWorkspaceLink = false;

  try {
    isWorkspaceLink = lstatSync(linkPath).isSymbolicLink();
  } catch {
    try {
      const hostPkg = JSON.parse(
        readFileSync(join(cwd, "package.json"), "utf8"),
      ) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const depSpec =
        hostPkg.dependencies?.[PACKAGE_NAME] ??
        hostPkg.devDependencies?.[PACKAGE_NAME];
      isWorkspaceLink = depSpec?.startsWith("workspace:") ?? false;
    } catch {
      // Ignore — treat as non-workspace.
    }
  }

  try {
    const pkg = JSON.parse(readFileSync(packagePath, "utf8")) as { version?: string };
    return { installed: pkg.version ?? null, isWorkspaceLink };
  } catch {
    return { installed: null, isWorkspaceLink };
  }
}

async function fetchLatestFromNpm(): Promise<{
  version: string | null;
  repositoryUrl?: string;
}> {
  const now = Date.now();

  if (cachedLatest && now - cachedLatest.fetchedAt < CACHE_TTL_MS) {
    return {
      version: cachedLatest.version,
      repositoryUrl: cachedLatest.repositoryUrl,
    };
  }

  try {
    const response = await fetch(NPM_LATEST_URL, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { version: null };
    }

    const data = (await response.json()) as NpmLatestResponse;
    const version = data.version ?? null;
    const repositoryUrl = data.repository?.url?.replace(/^git\+/, "").replace(/\.git$/, "");

    if (version) {
      cachedLatest = { version, repositoryUrl, fetchedAt: now };
    }

    return { version, repositoryUrl };
  } catch {
    return { version: null };
  }
}

export async function GET() {
  const cwd = process.cwd();
  const { installed, isWorkspaceLink } = readInstalledVersion(cwd);

  if (isWorkspaceLink) {
    const status: ProtoPluginVersionStatus = {
      installed,
      latest: null,
      updateAvailable: false,
      isWorkspaceLink: true,
    };
    return NextResponse.json(status);
  }

  const { version: latest, repositoryUrl } = await fetchLatestFromNpm();

  const updateAvailable =
    installed != null && latest != null && isNewerVersion(latest, installed);

  const status: ProtoPluginVersionStatus = {
    installed,
    latest,
    updateAvailable,
    isWorkspaceLink: false,
    repositoryUrl,
  };

  return NextResponse.json(status);
}
