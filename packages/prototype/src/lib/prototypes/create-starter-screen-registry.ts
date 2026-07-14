import type {
  StarterScreenConfig,
  StarterScreenDefinition,
  StarterScreenMetadata,
} from "./starter-screen-config-types";

export function createStarterScreenRegistry(config: StarterScreenConfig) {
  const screensBySlug = new Map(
    config.starterScreens.map((screen) => [screen.slug, screen]),
  );

  return {
    getAllStarterScreens(): StarterScreenMetadata[] {
      return config.starterScreens.map(({ slug, title, description, screenshot }) => ({
        slug,
        title,
        description,
        screenshot,
      }));
    },

    getStarterScreen(slug: string): StarterScreenDefinition | undefined {
      return screensBySlug.get(slug);
    },
  };
}
