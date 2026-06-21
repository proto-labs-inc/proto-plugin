import {
  parseDesignExplorationDefault,
  type DesignExplorationDefaultRecord,
} from "./design-exploration-default";

export class DesignExplorationDefaultStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DesignExplorationDefaultStorageError";
  }
}

export function createDesignExplorationDefaultStorageAdapter(
  slug: string,
  storageKeyPrefix: string,
) {
  const params = new URLSearchParams({ key: storageKeyPrefix });
  const url = `/api/prototypes/${encodeURIComponent(slug)}/design-exploration-default?${params}`;

  return {
    async load(): Promise<DesignExplorationDefaultRecord | null> {
      const response = await fetch(url);

      if (response.status === 503) {
        throw new DesignExplorationDefaultStorageError(
          "Design default storage is not configured. Set Upstash Redis env vars.",
        );
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new DesignExplorationDefaultStorageError(
          body?.error ?? "Failed to load design default variant.",
        );
      }

      const parsed: unknown = await response.json();
      if (parsed == null) return null;

      return parseDesignExplorationDefault(parsed);
    },

    async save(record: DesignExplorationDefaultRecord): Promise<void> {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });

      if (response.status === 503) {
        throw new DesignExplorationDefaultStorageError(
          "Design default storage is not configured. Set Upstash Redis env vars.",
        );
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new DesignExplorationDefaultStorageError(
          body?.error ?? "Failed to save design default variant.",
        );
      }
    },
  };
}
