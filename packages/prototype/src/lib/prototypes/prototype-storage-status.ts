export type PrototypeStorageStatusSlice = {
  configured: boolean;
  missing: string[];
};

export type PrototypeStorageStatus = {
  comments: PrototypeStorageStatusSlice;
  gallery: {
    kvConfigured: boolean;
    storageConfigured: boolean;
    missing: string[];
  };
  /** True when the requested prototype uses hardcoded comment storage instead of host env. */
  dedicatedCommentStorage?: boolean;
};

export const PROTOTYPE_STORAGE_STATUS_PATH = "/api/prototypes/storage-status";

export async function fetchPrototypeStorageStatus(
  slug?: string,
): Promise<PrototypeStorageStatus> {
  const url = slug
    ? `${PROTOTYPE_STORAGE_STATUS_PATH}?slug=${encodeURIComponent(slug)}`
    : PROTOTYPE_STORAGE_STATUS_PATH;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to check prototype storage status.");
  }

  return (await response.json()) as PrototypeStorageStatus;
}

export function isPrototypeStorageFullyConfigured(
  status: PrototypeStorageStatus,
): boolean {
  if (status.dedicatedCommentStorage) {
    return status.comments.configured;
  }

  return status.comments.configured && status.gallery.storageConfigured;
}
