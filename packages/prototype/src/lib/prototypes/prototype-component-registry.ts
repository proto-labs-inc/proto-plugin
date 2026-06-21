export type PrototypeComponentRegistry = {
  /** Static segment ids (slug is prefixed at runtime). */
  ids: readonly string[];
  /** Allowed dynamic id prefixes, e.g. `mock-table.row.` */
  dynamicPrefixes?: readonly string[];
};

const registries: Record<string, PrototypeComponentRegistry> = {};

export function registerPrototypeComponentRegistry(
  slug: string,
  registry: PrototypeComponentRegistry,
) {
  registries[slug] = registry;
}

export function getPrototypeComponentRegistry(
  slug: string,
): PrototypeComponentRegistry | undefined {
  return registries[slug];
}

export function isAllowedComponentTargetId(
  segmentId: string,
  registry: PrototypeComponentRegistry,
): boolean {
  if ((registry.ids as readonly string[]).includes(segmentId)) {
    return true;
  }

  const prefixes = registry.dynamicPrefixes ?? [];
  return prefixes.some((prefix) => segmentId.startsWith(prefix));
}

/** Call from each prototype's component-ids module. */
export function definePrototypeComponentRegistry(
  registry: PrototypeComponentRegistry,
): PrototypeComponentRegistry {
  return registry;
}
