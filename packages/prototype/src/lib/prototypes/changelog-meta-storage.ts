import {
  parseChangelogMeta,
  type PrototypeChangelogMeta,
} from "./changelog-meta";

export class ChangelogMetaStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ChangelogMetaStorageError";
  }
}

export function createChangelogMetaStorageAdapter(slug: string) {
  const url = `/api/prototypes/${encodeURIComponent(slug)}/changelog-meta`;

  return {
    async load(): Promise<PrototypeChangelogMeta> {
      const response = await fetch(url);

      if (response.status === 503) {
        throw new ChangelogMetaStorageError(
          "Change log storage is not configured. Set Upstash Redis env vars.",
        );
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new ChangelogMetaStorageError(
          body?.error ?? "Failed to load change log overview.",
        );
      }

      const parsed: unknown = await response.json();
      return parseChangelogMeta(parsed);
    },

    async save(meta: PrototypeChangelogMeta): Promise<void> {
      const response = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meta),
      });

      if (response.status === 503) {
        throw new ChangelogMetaStorageError(
          "Change log storage is not configured. Set Upstash Redis env vars.",
        );
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new ChangelogMetaStorageError(
          body?.error ?? "Failed to save change log overview.",
        );
      }
    },
  };
}
