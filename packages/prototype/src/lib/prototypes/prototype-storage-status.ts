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
};

export const PROTOTYPE_STORAGE_STATUS_PATH = "/api/prototypes/storage-status";

export async function fetchPrototypeStorageStatus(): Promise<PrototypeStorageStatus> {
  const response = await fetch(PROTOTYPE_STORAGE_STATUS_PATH);

  if (!response.ok) {
    throw new Error("Failed to check prototype storage status.");
  }

  return (await response.json()) as PrototypeStorageStatus;
}

export function isPrototypeStorageFullyConfigured(
  status: PrototypeStorageStatus,
): boolean {
  return status.comments.configured && status.gallery.storageConfigured;
}
