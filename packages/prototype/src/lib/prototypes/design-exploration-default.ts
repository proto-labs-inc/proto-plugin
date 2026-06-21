export type DesignExplorationDefaultRecord = {
  value: string;
  updatedAt: string;
};

export function prototypeDesignExplorationDefaultRedisKey(
  storageKeyPrefix: string,
): string {
  return `prototype-design-default:${storageKeyPrefix}`;
}

export function parseDesignExplorationDefault(
  value: unknown,
): DesignExplorationDefaultRecord | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Partial<DesignExplorationDefaultRecord>;

  if (typeof record.value !== "string" || !record.value.trim()) return null;
  if (
    typeof record.updatedAt !== "string" ||
    Number.isNaN(Date.parse(record.updatedAt))
  ) {
    return null;
  }

  return {
    value: record.value,
    updatedAt: record.updatedAt,
  };
}

export function isValidDesignExplorationDefaultRecord(
  value: unknown,
): value is DesignExplorationDefaultRecord {
  return parseDesignExplorationDefault(value) != null;
}

export function normalizeDesignExplorationDefaultPayload(
  value: unknown,
  validValues?: readonly string[],
): DesignExplorationDefaultRecord | null {
  const parsed = parseDesignExplorationDefault(value);
  if (!parsed) return null;

  if (validValues && !validValues.includes(parsed.value)) {
    return null;
  }

  return parsed;
}
