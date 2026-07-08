export type ProtoPluginVersionStatus = {
  installed: string | null;
  latest: string | null;
  updateAvailable: boolean;
  isWorkspaceLink: boolean;
  repositoryUrl?: string;
};

export const PROTOTYPE_PLUGIN_VERSION_PATH = "/api/proto-plugin/version";

export async function fetchProtoPluginVersionStatus(): Promise<ProtoPluginVersionStatus> {
  const response = await fetch(PROTOTYPE_PLUGIN_VERSION_PATH);

  if (!response.ok) {
    throw new Error("Failed to check proto-plugin version.");
  }

  return (await response.json()) as ProtoPluginVersionStatus;
}
