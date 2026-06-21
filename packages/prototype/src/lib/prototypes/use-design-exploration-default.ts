"use client";

import { createDesignExplorationDefaultStorageAdapter } from "@prototype/lib/prototypes/design-exploration-default-storage";
import { useCallback, useEffect, useMemo, useState } from "react";

type UseDesignExplorationDefaultOptions<TVariant extends string> = {
  slug: string | null;
  storageKeyPrefix: string;
  validValues: readonly TVariant[];
};

export function useDesignExplorationDefault<TVariant extends string>({
  slug,
  storageKeyPrefix,
  validValues,
}: UseDesignExplorationDefaultOptions<TVariant>) {
  const [persistedDefault, setPersistedDefault] = useState<TVariant | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storage = useMemo(() => {
    if (!slug) return null;
    return createDesignExplorationDefaultStorageAdapter(slug, storageKeyPrefix);
  }, [slug, storageKeyPrefix]);

  useEffect(() => {
    if (!storage) {
      setReady(true);
      return;
    }

    let cancelled = false;
    setReady(false);
    setError(null);

    async function load() {
      const activeStorage = storage;
      if (!activeStorage) return;

      try {
        const record = await activeStorage.load();
        if (cancelled) return;

        if (
          record &&
          validValues.includes(record.value as TVariant)
        ) {
          setPersistedDefault(record.value as TVariant);
        } else {
          setPersistedDefault(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load design default variant.",
          );
          setPersistedDefault(null);
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
  }, [storage, validValues]);

  const effectiveDefault = persistedDefault ?? validValues[0];

  const setDefaultVariant = useCallback(
    async (value: TVariant) => {
      if (!validValues.includes(value)) return;

      setPersistedDefault(value);

      if (!storage) return;

      setSaving(true);
      setError(null);

      try {
        await storage.save({
          value,
          updatedAt: new Date().toISOString(),
        });
      } catch (saveError) {
        setError(
          saveError instanceof Error
            ? saveError.message
            : "Failed to save design default variant.",
        );
      } finally {
        setSaving(false);
      }
    },
    [storage, validValues],
  );

  return {
    effectiveDefault,
    setDefaultVariant,
    ready,
    saving,
    error,
  };
}
