"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { restoreAnnotationScrollPosition } from "../core/annotation-target";
import { captureInteractionState } from "../core/capture";
import { getRepliesForParent } from "../core/comment-threads";
import { commentToLiveState } from "../core/restore";
import { normalizeAnnotationViewport } from "../core/normalize-viewport";
import { COMMENT_STORAGE_NOT_CONFIGURED_MESSAGE } from "@prototype/lib/prototypes/comment-storage-setup-prompt";
import { fetchPrototypeStorageStatus, isPrototypeStorageFullyConfigured } from "@prototype/lib/prototypes/prototype-storage-status";
import { createRemoteStorageAdapter } from "../core/storage";
import type { CommentAnnotation, CommentStore } from "../core/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CommentContext = createContext<CommentStore<any> | null>(null);

type CommentProviderProps<TState> = {
  children: ReactNode;
  slug: string;
  getLiveState: () => TState;
  onRestore: (live: TState) => void;
};

export function CommentProvider<TState>({
  children,
  slug,
  getLiveState,
  onRestore,
}: CommentProviderProps<TState>) {
  const [annotations, setAnnotations] = useState<CommentAnnotation<TState>[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [storageConfigured, setStorageConfigured] = useState<boolean | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  const getLiveStateRef = useRef(getLiveState);
  const onRestoreRef = useRef(onRestore);
  useEffect(() => { getLiveStateRef.current = getLiveState; }, [getLiveState]);
  useEffect(() => { onRestoreRef.current = onRestore; }, [onRestore]);

  const handleLoadError = useCallback((message: string) => {
    setStorageError(message);
  }, []);

  const storage = useMemo(
    () =>
      createRemoteStorageAdapter<CommentAnnotation<TState>>(
        slug,
        undefined,
        handleLoadError,
      ),
    [slug, handleLoadError],
  );

  const persistAnnotation = useCallback(
    async (annotation: CommentAnnotation<TState>) => {
      await storage.upsert(annotation);
    },
    [storage],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadAnnotations() {
      setStorageReady(false);
      setStorageError(null);
      setStorageConfigured(null);

      try {
        const status = await fetchPrototypeStorageStatus();
        if (cancelled) return;

        const fullyConfigured = isPrototypeStorageFullyConfigured(status);
        setStorageConfigured(fullyConfigured);

        if (!fullyConfigured) {
          setStorageError(COMMENT_STORAGE_NOT_CONFIGURED_MESSAGE);
          setAnnotations([]);
          return;
        }

        const stored = await storage.load();
        if (cancelled) return;
        setAnnotations(stored);
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load comments.";
        setStorageError(message);
        setAnnotations([]);
        setStorageConfigured((current) => current ?? true);
      } finally {
        if (!cancelled) setStorageReady(true);
      }
    }

    void loadAnnotations();

    const reloadFromRemote = () => {
      if (document.visibilityState !== "visible") return;
      void Promise.resolve(storage.load()).then((stored) => {
        if (!cancelled) setAnnotations(stored);
      }).catch(() => {
        // Keep showing the current comments if a background refresh fails.
      });
    };

    document.addEventListener("visibilitychange", reloadFromRemote);
    window.addEventListener("focus", reloadFromRemote);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", reloadFromRemote);
      window.removeEventListener("focus", reloadFromRemote);
    };
  }, [storage]);

  const addAnnotation = useCallback(
    (fields: Omit<CommentAnnotation<TState>, "interactionState">): CommentAnnotation<TState> => {
      if (!storageReady || storageError) {
        throw new Error(storageError ?? "Comments are still loading.");
      }

      const { captureViewport, viewportBoundingBox } = normalizeAnnotationViewport(fields);
      const fullAnnotation: CommentAnnotation<TState> = {
        ...fields,
        captureViewport,
        viewportBoundingBox,
        interactionState: captureInteractionState(getLiveStateRef.current()),
      };
      setAnnotations((prev) => [...prev, fullAnnotation]);
      void persistAnnotation(fullAnnotation).catch(() => {
        // errors are reported via onError in the remote adapter
      });
      return fullAnnotation;
    },
    [storageReady, storageError, persistAnnotation],
  );

  const addReply = useCallback(
    (parentId: string, comment: string): CommentAnnotation<TState> => {
      if (!storageReady || storageError) {
        throw new Error(storageError ?? "Comments are still loading.");
      }

      const parent = annotations.find((a) => a.id === parentId && !a.deleted);
      if (!parent) {
        throw new Error("Parent comment not found.");
      }

      const trimmed = comment.trim();
      if (!trimmed) {
        throw new Error("Reply cannot be empty.");
      }

      const reply: CommentAnnotation<TState> = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        parentId: parent.id,
        comment: trimmed,
        timestamp: Date.now(),
        x: parent.x,
        y: parent.y,
        element: parent.element,
        elementPath: parent.elementPath,
        targetId: parent.targetId,
        positionAnchor: parent.positionAnchor,
        interactionState: parent.interactionState,
        channel: parent.channel,
      };

      setAnnotations((prev) => [...prev, reply]);
      void persistAnnotation(reply).catch(() => {});
      return reply;
    },
    [annotations, storageReady, storageError, persistAnnotation],
  );

  const updateAnnotation = useCallback(
    (id: string, comment: string) => {
      let nextAnnotation: CommentAnnotation<TState> | undefined;
      setAnnotations((prev) => {
        const current = prev.find((a) => a.id === id);
        if (!current) return prev;
        nextAnnotation = { ...current, comment };
        return prev.map((a) => (a.id === id ? nextAnnotation! : a));
      });
      if (nextAnnotation) {
        void persistAnnotation(nextAnnotation).catch(() => {});
      }
    },
    [persistAnnotation],
  );

  const resolveAnnotation = useCallback(
    (id: string) => {
      let nextAnnotation: CommentAnnotation<TState> | undefined;
      setAnnotations((prev) => {
        const current = prev.find((a) => a.id === id);
        if (!current) return prev;
        nextAnnotation = {
          ...current,
          status: current.status === "resolved" ? "pending" : "resolved",
        };
        return prev.map((a) => (a.id === id ? nextAnnotation! : a));
      });
      if (nextAnnotation) {
        void persistAnnotation(nextAnnotation).catch(() => {});
      }
    },
    [persistAnnotation],
  );

  const deleteAnnotation = useCallback(
    (id: string) => {
      let toDelete: CommentAnnotation<TState>[] = [];
      setAnnotations((prev) => {
        const target = prev.find((a) => a.id === id);
        if (!target) return prev;
        const replyIds = new Set(
          getRepliesForParent(prev, id).map((reply) => reply.id),
        );
        toDelete = [
          target,
          ...prev.filter((a) => replyIds.has(a.id)),
        ];
        const removeIds = new Set([id, ...replyIds]);
        return prev.filter((a) => !removeIds.has(a.id));
      });
      for (const annotation of toDelete) {
        void persistAnnotation({ ...annotation, deleted: true }).catch(() => {});
      }
    },
    [persistAnnotation],
  );

  const clearAllAnnotations = useCallback(() => {
    let visible: CommentAnnotation<TState>[] = [];
    setAnnotations((prev) => {
      visible = prev;
      return [];
    });
    for (const annotation of visible) {
      void persistAnnotation({ ...annotation, deleted: true }).catch(() => {});
    }
  }, [persistAnnotation]);

  const restoreComment = useCallback(
    (id: string): CommentAnnotation<TState> | undefined => {
      const annotation = annotations.find((a) => a.id === id);
      if (!annotation) return undefined;
      const live = commentToLiveState(annotation.interactionState);
      onRestoreRef.current(live);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          restoreAnnotationScrollPosition(annotation.captureViewport, {
            targetId: annotation.targetId,
          });
        });
      });
      return annotation;
    },
    [annotations],
  );

  const value = useMemo(
    (): CommentStore<TState> => ({
      slug,
      annotations,
      storageReady,
      storageConfigured,
      storageError,
      addAnnotation,
      addReply,
      updateAnnotation,
      resolveAnnotation,
      deleteAnnotation,
      clearAllAnnotations,
      restoreComment,
    }),
    [
      slug,
      annotations,
      storageReady,
      storageConfigured,
      storageError,
      addAnnotation,
      addReply,
      updateAnnotation,
      resolveAnnotation,
      deleteAnnotation,
      clearAllAnnotations,
      restoreComment,
    ],
  );

  return (
    <CommentContext.Provider value={value}>
      {children}
    </CommentContext.Provider>
  );
}

export function useCommentStore<TState>(): CommentStore<TState> {
  const context = useContext(CommentContext);
  if (!context) {
    throw new Error("useCommentStore must be used within CommentProvider");
  }
  return context as CommentStore<TState>;
}

export function useCommentStoreOptional<TState>(): CommentStore<TState> | null {
  return useContext(CommentContext) as CommentStore<TState> | null;
}
