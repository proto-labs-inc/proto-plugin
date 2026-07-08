import { readFileSync } from "fs";
import { join } from "path";

import { isNewerProtoPluginVersion } from "@prototype/lib/prototypes/proto-plugin-semver";
import { NextResponse } from "next/server";

const PACKAGE_NAME = "proto-plugin";
const NPM_LATEST_URL = `https://registry.npmjs.org/${PACKAGE_NAME}/latest`;

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

function readIsWorkspaceDependency(cwd: string): boolean {
  try {
    const hostPkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const depSpec =
      hostPkg.dependencies?.[PACKAGE_NAME] ??
      hostPkg.devDependencies?.[PACKAGE_NAME];
    return depSpec?.startsWith("workspace:") ?? false;
  } catch {
    return false;
  }
}

function readInstalledVersion(cwd: string): {
  installed: string | null;
  isWorkspaceLink: boolean;
} {
  const packagePath = join(cwd, "node_modules", PACKAGE_NAME, "package.json");
  const isWorkspaceLink = readIsWorkspaceDependency(cwd);

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
  try {
    const response = await fetch(NPM_LATEST_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      return { version: null };
    }

    const data = (await response.json()) as NpmLatestResponse;
    const version = data.version ?? null;
    const repositoryUrl = data.repository?.url?.replace(/^git\+/, "").replace(/\.git$/, "");

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
    return NextResponse.json(status, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }

  const { version: latest, repositoryUrl } = await fetchLatestFromNpm();

  const updateAvailable =
    installed != null &&
    latest != null &&
    isNewerProtoPluginVersion(latest, installed);

  const status: ProtoPluginVersionStatus = {
    installed,
    latest,
    updateAvailable,
    isWorkspaceLink: false,
    repositoryUrl,
  };

  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
