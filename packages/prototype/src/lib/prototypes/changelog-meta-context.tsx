"use client";

import { createChangelogMetaStorageAdapter } from "@prototype/lib/prototypes/changelog-meta-storage";
import {
  EMPTY_CHANGELOG_META,
  mergeLegacyChangelogMeta,
  type PrototypeChangelogMeta,
} from "@prototype/lib/prototypes/changelog-meta";
import { prototypeReviewPreferenceKey } from "@prototype/lib/prototypes/use-persisted-local-state";
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

type ChangelogMetaStore = {
  slug: string;
  overview: string;
  ready: boolean;
  error: string | null;
  setOverview: (overview: string) => void;
};

const ChangelogMetaContext = createContext<ChangelogMetaStore | null>(null);

const SAVE_DEBOUNCE_MS = 400;

type ChangelogMetaProviderProps = {
  slug: string;
  children: ReactNode;
};

export function ChangelogMetaProvider({
  slug,
  children,
}: ChangelogMetaProviderProps) {
  const [meta, setMeta] = useState<PrototypeChangelogMeta>(EMPTY_CHANGELOG_META);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const skipSaveRef = useRef(true);
  const legacyOverviewKey = prototypeReviewPreferenceKey(
    slug,
    "changelog-overview",
  );

  const storage = useMemo(
    () => createChangelogMetaStorageAdapter(slug),
    [slug],
  );

  useEffect(() => {
    let cancelled = false;
    skipSaveRef.current = true;

    async function load() {
      setReady(false);
      setError(null);

      try {
        const remote = await storage.load();
        if (cancelled) return;

        const merged = mergeLegacyChangelogMeta(
          remote,
          slug,
          legacyOverviewKey,
        );
        setMeta(merged);

        const migratedFromLegacy = merged.overview !== remote.overview;

        if (migratedFromLegacy) {
          await storage.save(merged);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load change log.",
          );
          setMeta(EMPTY_CHANGELOG_META);
        }
      } finally {
        if (!cancelled) {
          setReady(true);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [legacyOverviewKey, slug, storage]);

  useEffect(() => {
    if (!ready) return;

    if (skipSaveRef.current) {
      skipSaveRef.current = false;
      return;
    }

    const timeout = window.setTimeout(() => {
      void storage.save(meta).catch((saveError) => {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Failed to save change log.",
        );
      });
    }, SAVE_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [meta, ready, storage]);

  const setOverview = useCallback((overview: string) => {
    setMeta((current) => ({
      ...current,
      overview,
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const value = useMemo(
    (): ChangelogMetaStore => ({
      slug,
      overview: meta.overview,
      ready,
      error,
      setOverview,
    }),
    [slug, meta.overview, ready, error, setOverview],
  );

  return (
    <ChangelogMetaContext.Provider value={value}>
      {children}
    </ChangelogMetaContext.Provider>
  );
}

export function useChangelogMeta(): ChangelogMetaStore {
  const context = useContext(ChangelogMetaContext);
  if (!context) {
    throw new Error("useChangelogMeta must be used within ChangelogMetaProvider");
  }
  return context;
}

export function useChangelogMetaOptional(): ChangelogMetaStore | null {
  return useContext(ChangelogMetaContext);
}
