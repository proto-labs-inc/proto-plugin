import "server-only";

import { PrototypeGalleryClient } from "@prototype/components/prototype-gallery-client";
import { PrototypeGalleryHeader } from "@prototype/components/shell/prototype-gallery-shell";
import { createPrototypeRegistry } from "@prototype/lib/prototypes/create-prototype-registry";
import type { PrototypeConfig } from "@prototype/lib/prototypes/prototype-config-types";

import { readScreenshotManifest } from "../lib/prototypes/screenshot-manifest";

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
    const prototypes = registry.getAllPrototypes();
    const screenshotVersions =
      process.env.NODE_ENV === "development"
        ? await readScreenshotManifest()
        : {};

    return (
      <PrototypeGalleryClient
        prototypes={prototypes}
        screenshotVersions={screenshotVersions}
      />
    );
  }

  function HomePage() {
    return (
      <div className="px-10 lg:px-16">
        <PrototypeGalleryHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />
        <PrototypeGallery />
      </div>
    );
  }

  return HomePage;
}
