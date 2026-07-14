import { COMMENT_STORAGE_NOT_CONFIGURED_MESSAGE } from "@prototype/lib/prototypes/comment-storage-setup-prompt";
import { isValidAnnotation } from "./validation";

export interface CommentStorageAdapter<T extends { id: string }> {
  load(): T[] | Promise<T[]>;
  upsert(annotation: T): Promise<void>;
}

export class CommentStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CommentStorageError";
  }
}

export function createRemoteStorageAdapter<T extends { id: string }>(
  slug: string,
  validate: (value: unknown) => boolean = isValidAnnotation,
  onError?: (message: string) => void,
): CommentStorageAdapter<T> {
  const listUrl = `/api/prototypes/${encodeURIComponent(slug)}/comments`;

  async function requestUpsert(annotation: T): Promise<void> {
    const response = await fetch(
      `${listUrl}/${encodeURIComponent(annotation.id)}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(annotation),
      },
    );

    if (response.status === 503) {
      throw new CommentStorageError(COMMENT_STORAGE_NOT_CONFIGURED_MESSAGE);
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new CommentStorageError(body?.error ?? "Failed to save comment.");
    }
  }

  return {
    async load(): Promise<T[]> {
      const response = await fetch(listUrl);

      if (response.status === 503) {
        throw new CommentStorageError(COMMENT_STORAGE_NOT_CONFIGURED_MESSAGE);
      }

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new CommentStorageError(body?.error ?? "Failed to load comments.");
      }

      const parsed: unknown = await response.json();
      if (!Array.isArray(parsed)) return [];
      return (parsed as unknown[]).filter(validate) as T[];
    },

    async upsert(annotation: T): Promise<void> {
      try {
        await requestUpsert(annotation);
      } catch (error) {
        console.error(
          "[prototype-comments] Failed to save comment:",
          error instanceof Error ? error.message : error,
        );
        throw error;
      }
    },
  };
}
