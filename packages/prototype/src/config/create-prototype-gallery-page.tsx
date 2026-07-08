import "server-only";

import { PrototypeGalleryClient } from "@prototype/components/prototype-gallery-client";
import {
  PrototypeGalleryHeader,
  PrototypeGalleryPageLayout,
} from "@prototype/components/shell/prototype-gallery-shell";
import { createPrototypeRegistry } from "@prototype/lib/prototypes/create-prototype-registry";
import type { PrototypeConfig } from "@prototype/lib/prototypes/prototype-config-types";

import { readScreenshotManifest } from "../lib/prototypes/screenshot-manifest";
import { sortPrototypesByCreationDate } from "../lib/prototypes/sort-prototypes-by-creation-date";

type PrototypeGalleryPageOptions = {
  title?: string;
  description?: string;
  eyebrow?: string;
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
  } = options;

  async function PrototypeGallery() {
    const [prototypes, screenshotManifest] = await Promise.all([
      Promise.resolve(registry.getAllPrototypes()),
      readScreenshotManifest(),
    ]);
    const sortedPrototypes = await sortPrototypesByCreationDate(prototypes);
    const screenshotVersions =
      process.env.NODE_ENV === "development" ? screenshotManifest : {};

    return (
      <PrototypeGalleryClient
        prototypes={sortedPrototypes}
        screenshotVersions={screenshotVersions}
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
        <div className="px-10 pt-8 pb-16 lg:px-16">
          <PrototypeGallery />
        </div>
      </PrototypeGalleryPageLayout>
    );
  }

  return HomePage;
}
