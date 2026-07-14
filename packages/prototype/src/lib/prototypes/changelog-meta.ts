export type PrototypeChangelogMeta = {
  overview: string;
  updatedAt: string;
};

export function prototypeChangelogMetaRedisKey(slug: string): string {
  return `prototype-changelog-meta:${slug}`;
}

export function parseChangelogMeta(value: unknown): PrototypeChangelogMeta {
  if (!value || typeof value !== "object") {
    return EMPTY_CHANGELOG_META;
  }

  const meta = value as Partial<PrototypeChangelogMeta>;

  if (
    typeof meta.overview !== "string" ||
    typeof meta.updatedAt !== "string" ||
    Number.isNaN(Date.parse(meta.updatedAt))
  ) {
    return EMPTY_CHANGELOG_META;
  }

  return {
    overview: meta.overview,
    updatedAt: meta.updatedAt,
  };
}

export function isValidChangelogMeta(value: unknown): value is PrototypeChangelogMeta {
  if (!value || typeof value !== "object") return false;

  const meta = value as Partial<PrototypeChangelogMeta>;

  if (typeof meta.overview !== "string") return false;
  if (
    typeof meta.updatedAt !== "string" ||
    Number.isNaN(Date.parse(meta.updatedAt))
  ) {
    return false;
  }

  return true;
}

export function normalizeChangelogMetaPayload(
  value: unknown,
): PrototypeChangelogMeta | null {
  if (!isValidChangelogMeta(value)) return null;

  const meta = value as Partial<PrototypeChangelogMeta>;

  return {
    overview: meta.overview ?? "",
    updatedAt: meta.updatedAt ?? new Date().toISOString(),
  };
}

export const EMPTY_CHANGELOG_META: PrototypeChangelogMeta = {
  overview: "",
  updatedAt: new Date(0).toISOString(),
};

/** One-time merge from legacy browser storage when Redis has no saved meta yet. */
export function mergeLegacyChangelogMeta(
  remote: PrototypeChangelogMeta,
  _slug: string,
  legacyOverviewKey: string,
): PrototypeChangelogMeta {
  if (typeof window === "undefined") return remote;

  const hasRemoteContent = remote.overview.trim().length > 0;
  if (hasRemoteContent) return remote;

  let overview = remote.overview;

  try {
    const legacyOverview = localStorage.getItem(legacyOverviewKey);
    if (legacyOverview?.trim()) {
      overview = legacyOverview;
    }
  } catch {
    // ignore
  }

  if (overview === remote.overview) {
    return remote;
  }

  return {
    overview,
    updatedAt: new Date().toISOString(),
  };
}
