import "server-only";

import { PrototypeGalleryClient } from "@prototype/components/prototype-gallery-client";
import {
  PrototypeGalleryHeader,
  PrototypeGalleryPageLayout,
} from "@prototype/components/shell/prototype-gallery-shell";
import { createPrototypeRegistry } from "@prototype/lib/prototypes/create-prototype-registry";
import type { PrototypeConfig } from "@prototype/lib/prototypes/prototype-config-types";
import { createStarterScreenRegistry } from "@prototype/lib/prototypes/create-starter-screen-registry";
import type { StarterScreenConfig } from "@prototype/lib/prototypes/starter-screen-config-types";

import { readScreenshotManifest } from "../lib/prototypes/screenshot-manifest";
import { sortPrototypesByCreationDate } from "../lib/prototypes/sort-prototypes-by-creation-date";

type PrototypeGalleryPageOptions = {
  title?: string;
  description?: string;
  eyebrow?: string;
  starterScreensConfig?: StarterScreenConfig;
};

export function createPrototypeGalleryPage(
  config: PrototypeConfig,
  options: PrototypeGalleryPageOptions = {},
) {
  const registry = createPrototypeRegistry(config);
  const {
    title = "Prototypes",
    description = "UI experiments and concept explorations. Select a prototype to open it.",
    eyebrow,
    starterScreensConfig,
  } = options;
  const starterScreenRegistry = starterScreensConfig
    ? createStarterScreenRegistry(starterScreensConfig)
    : null;

  async function PrototypeGallery() {
    const [prototypes, screenshotManifest, starterScreens] = await Promise.all([
      Promise.resolve(registry.getAllPrototypes()),
      readScreenshotManifest(),
      Promise.resolve(starterScreenRegistry?.getAllStarterScreens() ?? []),
    ]);
    const sortedPrototypes = await sortPrototypesByCreationDate(prototypes);
    const screenshotVersions =
      process.env.NODE_ENV === "development" ? screenshotManifest : {};

    return (
      <PrototypeGalleryClient
        prototypes={sortedPrototypes}
        screenshotVersions={screenshotVersions}
        starterScreens={starterScreens}
      />
    );
  }

  function HomePage() {
    return (
      <PrototypeGalleryPageLayout
        header={
          <PrototypeGalleryHeader
            eyebrow={eyebrow}
            title={title}
            description={description}
            className="mb-0"
          />
        }
      >
        <PrototypeGallery />
      </PrototypeGalleryPageLayout>
    );
  }

  return HomePage;
}
