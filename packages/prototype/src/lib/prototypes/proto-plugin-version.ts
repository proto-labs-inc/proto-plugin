import { isNewerProtoPluginVersion } from "@prototype/lib/prototypes/proto-plugin-semver";

export type ProtoPluginVersionStatus = {
  installed: string | null;
  latest: string | null;
  updateAvailable: boolean;
  isWorkspaceLink: boolean;
  repositoryUrl?: string;
};

export const PROTOTYPE_PLUGIN_VERSION_PATH = "/api/proto-plugin/version";

const NPM_LATEST_URL = "https://registry.npmjs.org/proto-plugin/latest";

type NpmLatestResponse = {
  version?: string;
  repository?: { url?: string };
};

function normalizeRepositoryUrl(url: string | undefined): string | undefined {
  return url?.replace(/^git\+/, "").replace(/\.git$/, "");
}

async function fetchLatestFromNpmRegistry(): Promise<{
  latest: string | null;
  repositoryUrl?: string;
}> {
  try {
    const response = await fetch(NPM_LATEST_URL, { cache: "no-store" });
    if (!response.ok) {
      return { latest: null };
    }

    const data = (await response.json()) as NpmLatestResponse;
    return {
      latest: data.version ?? null,
      repositoryUrl: normalizeRepositoryUrl(data.repository?.url),
    };
  } catch {
    return { latest: null };
  }
}

/** Client-side npm check when the server route is stale (older plugin releases cached npm for 1h). */
async function reconcileWithNpmRegistry(
  status: ProtoPluginVersionStatus,
): Promise<ProtoPluginVersionStatus> {
  if (status.isWorkspaceLink || !status.installed) {
    return status;
  }

  if (
    status.updateAvailable &&
    status.latest &&
    isNewerProtoPluginVersion(status.latest, status.installed)
  ) {
    return status;
  }

  const { latest, repositoryUrl } = await fetchLatestFromNpmRegistry();
  if (!latest || !isNewerProtoPluginVersion(latest, status.installed)) {
    return status;
  }

  return {
    ...status,
    latest,
    updateAvailable: true,
    repositoryUrl: repositoryUrl ?? status.repositoryUrl,
  };
}

export async function fetchProtoPluginVersionStatus(): Promise<ProtoPluginVersionStatus> {
  const response = await fetch(PROTOTYPE_PLUGIN_VERSION_PATH, { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Failed to check proto-plugin version.");
  }

  const status = (await response.json()) as ProtoPluginVersionStatus;
  return reconcileWithNpmRegistry(status);
}
