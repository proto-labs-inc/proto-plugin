import type {
  PrototypeConfig,
  PrototypeMetadata,
} from "./prototype-config-types";
import type { PrototypeComponentRegistry } from "./prototype-component-registry";

let activeConfig: PrototypeConfig | null = null;

export function setPrototypeConfig(config: PrototypeConfig): void {
  activeConfig = config;
}

function requireConfig(): PrototypeConfig {
  if (!activeConfig) {
    throw new Error(
      "Prototype config is not set. Import prototype.config.ts and call setPrototypeConfig() or createPrototypeRegistry() first.",
    );
  }
  return activeConfig;
}

export function createPrototypeRegistry(config: PrototypeConfig) {
  setPrototypeConfig(config);

  return {
    getAllPrototypes(): PrototypeMetadata[] {
      return requireConfig().prototypes.map(
        ({ slug, title, screenshot }) => ({ slug, title, screenshot }),
      );
    },

    getPrototype(slug: string): PrototypeMetadata | undefined {
      const entry = requireConfig().prototypes.find((prototype) => prototype.slug === slug);
      if (!entry) return undefined;
      return { slug: entry.slug, title: entry.title, screenshot: entry.screenshot };
    },

    getPrototypeComponent(slug: string) {
      return requireConfig().prototypes.find((prototype) => prototype.slug === slug)
        ?.component;
    },

    getPrototypeStateMapComponent(slug: string) {
      return requireConfig().prototypes.find((prototype) => prototype.slug === slug)
        ?.stateMapComponent;
    },

    getPrototypeComponentRegistryForSlug(
      slug: string,
    ): PrototypeComponentRegistry | undefined {
      return requireConfig().prototypes.find((prototype) => prototype.slug === slug)
        ?.componentRegistry;
    },
  };
}

export function getPrototypeComponentRegistryForSlug(
  slug: string,
): PrototypeComponentRegistry | undefined {
  return requireConfig().prototypes.find((prototype) => prototype.slug === slug)
    ?.componentRegistry;
}

export function getAllPrototypes(): PrototypeMetadata[] {
  return requireConfig().prototypes.map(({ slug, title, screenshot }) => ({
    slug,
    title,
    screenshot,
  }));
}

export function getPrototype(slug: string): PrototypeMetadata | undefined {
  return getAllPrototypes().find((prototype) => prototype.slug === slug);
}

export function getPrototypeComponent(slug: string) {
  return requireConfig().prototypes.find((prototype) => prototype.slug === slug)
    ?.component;
}
